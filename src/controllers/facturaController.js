const {
    Factura,
    DetalleFactura,
    DetalleImpuesto,
    Cliente,
    Producto,
    Impuesto,
    User,
    Empresa,
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { generarXMLFactura, enviarAHacienda } = require('../services/haciendaService');

// Obtener todas las facturas
const getFacturas = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            estado,
            tipo_documento,
            fecha_desde,
            fecha_hasta,
            cliente_id
        } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {
            empresa_id: req.user.empresa_id
        };

        if (search) {
            whereClause[Op.or] = [
                { numero_factura: { [Op.iLike]: `%${search}%` } },
                { serie: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (estado) {
            whereClause.estado = estado;
        }

        if (tipo_documento) {
            whereClause.tipo_documento = tipo_documento;
        }

        if (cliente_id) {
            whereClause.cliente_id = cliente_id;
        }

        if (fecha_desde || fecha_hasta) {
            whereClause.fecha_emision = {};
            if (fecha_desde) {
                whereClause.fecha_emision[Op.gte] = new Date(fecha_desde);
            }
            if (fecha_hasta) {
                whereClause.fecha_emision[Op.lte] = new Date(fecha_hasta);
            }
        }

        const { count, rows } = await Factura.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'apellido', 'nit', 'tipo_cliente']
                },
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'apellido', 'email']
                },
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'nit']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: {
                facturas: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo facturas:', error);
        next(error);
    }
};

// Obtener factura por ID con detalles completos
const getFacturaById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            },
            include: [
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'apellido', 'nit', 'dui', 'direccion', 'telefono', 'email', 'tipo_cliente']
                },
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nombre', 'apellido', 'email']
                },
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'nit', 'direccion', 'telefono', 'email', 'representante_legal']
                },
                {
                    model: DetalleFactura,
                    as: 'detalles',
                    include: [
                        {
                            model: Producto,
                            as: 'producto',
                            attributes: ['id', 'codigo', 'nombre', 'descripcion', 'unidad_medida']
                        },
                        {
                            model: DetalleImpuesto,
                            as: 'impuestos',
                            include: [
                                {
                                    model: Impuesto,
                                    as: 'impuesto',
                                    attributes: ['id', 'nombre', 'codigo', 'porcentaje', 'tipo_impuesto']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: { factura }
        });
    } catch (error) {
        logger.error('Error obteniendo factura:', error);
        next(error);
    }
};

// Crear nueva factura
const createFactura = async (req, res, next) => {
    const transaction = await sequelize.transaction();

    try {
        const facturaData = {
            ...req.body,
            usuario_id: req.user.id,
            empresa_id: req.user.empresa_id,
            fecha_emision: new Date(req.body.fecha_emision || new Date())
        };

        // Verificar que el cliente existe
        const cliente = await Cliente.findOne({
            where: {
                id: facturaData.cliente_id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!cliente) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Crear la factura
        const factura = await Factura.create(facturaData, { transaction });

        // Procesar detalles
        let subtotal = 0;
        let totalImpuestos = 0;

        for (const detalleData of facturaData.detalles) {
            // Verificar que el producto existe (si se proporciona)
            let producto = null;
            if (detalleData.producto_id) {
                producto = await Producto.findOne({
                    where: {
                        id: detalleData.producto_id,
                        empresa_id: req.user.empresa_id
                    }
                });

                if (!producto) {
                    await transaction.rollback();
                    return res.status(404).json({
                        success: false,
                        message: `Producto con ID ${detalleData.producto_id} no encontrado`
                    });
                }
            }

            // Crear detalle de factura
            const detalle = await DetalleFactura.create({
                factura_id: factura.id,
                producto_id: detalleData.producto_id,
                cantidad: detalleData.cantidad,
                precio_unitario: detalleData.precio_unitario,
                descuento: detalleData.descuento || 0,
                descripcion_adicional: detalleData.descripcion_adicional
            }, { transaction });

            // Calcular subtotal del detalle
            const subtotalDetalle = (detalle.cantidad * detalle.precio_unitario) - detalle.descuento;
            subtotal += subtotalDetalle;

            // Procesar impuestos del detalle
            let impuestosDetalle = 0;

            if (detalleData.impuestos && detalleData.impuestos.length > 0) {
                for (const impuestoData of detalleData.impuestos) {
                    const impuesto = await Impuesto.findOne({
                        where: {
                            id: impuestoData.impuesto_id,
                            empresa_id: req.user.empresa_id
                        }
                    });

                    if (!impuesto) {
                        await transaction.rollback();
                        return res.status(404).json({
                            success: false,
                            message: `Impuesto con ID ${impuestoData.impuesto_id} no encontrado`
                        });
                    }

                    const detalleImpuesto = await DetalleImpuesto.create({
                        detalle_factura_id: detalle.id,
                        impuesto_id: impuesto.id,
                        base_imponible: subtotalDetalle,
                        porcentaje: impuesto.porcentaje
                    }, { transaction });

                    impuestosDetalle += detalleImpuesto.monto;
                }
            }

            // Actualizar totales del detalle
            await detalle.update({
                subtotal: subtotalDetalle,
                total_impuestos: impuestosDetalle,
                total: subtotalDetalle + impuestosDetalle
            }, { transaction });

            totalImpuestos += impuestosDetalle;
        }

        // Aplicar descuento global si existe
        const descuentoGlobal = facturaData.descuento_global || 0;

        // Actualizar totales de la factura
        await factura.update({
            subtotal: subtotal,
            total_impuestos: totalImpuestos,
            descuento_global: descuentoGlobal,
            total: subtotal + totalImpuestos - descuentoGlobal,
            estado: 'borrador'
        }, { transaction });

        await transaction.commit();

        // Obtener factura completa para respuesta
        const facturaCompleta = await Factura.findByPk(factura.id, {
            include: [
                {
                    model: Cliente,
                    as: 'cliente',
                    attributes: ['id', 'nombre', 'apellido', 'nit', 'tipo_cliente']
                },
                {
                    model: DetalleFactura,
                    as: 'detalles',
                    include: [
                        {
                            model: Producto,
                            as: 'producto',
                            attributes: ['id', 'codigo', 'nombre']
                        },
                        {
                            model: DetalleImpuesto,
                            as: 'impuestos',
                            include: [
                                {
                                    model: Impuesto,
                                    as: 'impuesto',
                                    attributes: ['id', 'nombre', 'codigo', 'porcentaje']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        logger.info(`Factura ${factura.numero_factura} creada exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Factura creada exitosamente',
            data: { factura: facturaCompleta }
        });
    } catch (error) {
        await transaction.rollback();
        logger.error('Error creando factura:', error);
        next(error);
    }
};

// Emitir factura (cambiar estado a emitida)
const emitirFactura = async (req, res, next) => {
    try {
        const { id } = req.params;

        const factura = await Factura.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            },
            include: [
                {
                    model: Cliente,
                    as: 'cliente'
                },
                {
                    model: Empresa,
                    as: 'empresa'
                },
                {
                    model: DetalleFactura,
                    as: 'detalles',
                    include: [
                        {
                            model: Producto,
                            as: 'producto'
                        },
                        {
                            model: DetalleImpuesto,
                            as: 'impuestos',
                            include: [
                                {
                                    model: Impuesto,
                                    as: 'impuesto'
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        if (factura.estado !== 'borrador') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden emitir facturas en estado borrador'
            });
        }

        // Generar XML para Hacienda
        const xmlFactura = await generarXMLFactura(factura);

        // Enviar a Hacienda (simulado)
        const respuestaHacienda = await enviarAHacienda(xmlFactura);

        // Actualizar factura
        await factura.update({
            estado: 'emitida',
            xml_generado: xmlFactura,
            respuesta_hacienda: respuestaHacienda,
            codigo_autorizacion: respuestaHacienda.codigoAutorizacion,
            fecha_autorizacion: respuestaHacienda.fechaAutorizacion ? new Date(respuestaHacienda.fechaAutorizacion) : null
        });

        logger.info(`Factura ${factura.numero_factura} emitida exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Factura emitida exitosamente',
            data: {
                factura,
                respuestaHacienda
            }
        });
    } catch (error) {
        logger.error('Error emitiendo factura:', error);
        next(error);
    }
};

// Anular factura
const anularFactura = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const factura = await Factura.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!factura) {
            return res.status(404).json({
                success: false,
                message: 'Factura no encontrada'
            });
        }

        if (factura.estado === 'anulada') {
            return res.status(400).json({
                success: false,
                message: 'La factura ya está anulada'
            });
        }

        await factura.update({
            estado: 'anulada',
            observaciones: motivo ? `${factura.observaciones || ''}\nAnulada: ${motivo}`.trim() : factura.observaciones
        });

        logger.info(`Factura ${factura.numero_factura} anulada. Motivo: ${motivo}`);

        res.status(200).json({
            success: true,
            message: 'Factura anulada exitosamente'
        });
    } catch (error) {
        logger.error('Error anulando factura:', error);
        next(error);
    }
};

// Obtener estadísticas de facturas
const getFacturaStats = async (req, res, next) => {
    try {
        const { fecha_desde, fecha_hasta } = req.query;

        let whereClause = {
            empresa_id: req.user.empresa_id
        };

        if (fecha_desde || fecha_hasta) {
            whereClause.fecha_emision = {};
            if (fecha_desde) {
                whereClause.fecha_emision[Op.gte] = new Date(fecha_desde);
            }
            if (fecha_hasta) {
                whereClause.fecha_emision[Op.lte] = new Date(fecha_hasta);
            }
        }

        const stats = await Factura.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN estado = \'emitida\' THEN 1 END')), 'emitidas'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN estado = \'borrador\' THEN 1 END')), 'borradores'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN estado = \'anulada\' THEN 1 END')), 'anuladas'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN estado = \'pagada\' THEN 1 END')), 'pagadas'],
                [sequelize.fn('SUM', sequelize.col('total')), 'total_ventas'],
                [sequelize.fn('SUM', sequelize.literal('CASE WHEN estado = \'emitida\' THEN total ELSE 0 END')), 'ventas_emitidas'],
                [sequelize.fn('AVG', sequelize.col('total')), 'promedio_venta']
            ],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: { stats: stats[0] }
        });
    } catch (error) {
        logger.error('Error obteniendo estadísticas de facturas:', error);
        next(error);
    }
};

module.exports = {
    getFacturas,
    getFacturaById,
    createFactura,
    emitirFactura,
    anularFactura,
    getFacturaStats
};
