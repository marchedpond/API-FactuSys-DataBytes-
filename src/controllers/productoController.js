const { Producto, Categoria, Empresa, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Obtener todos los productos
const getProductos = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            categoria_id,
            tipo_producto,
            activo,
            stock_bajo
        } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {
            empresa_id: req.user.empresa_id
        };

        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { codigo: { [Op.iLike]: `%${search}%` } },
                { codigo_barras: { [Op.iLike]: `%${search}%` } },
                { descripcion: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (categoria_id) {
            whereClause.categoria_id = categoria_id;
        }

        if (tipo_producto) {
            whereClause.tipo_producto = tipo_producto;
        }

        if (activo !== undefined) {
            whereClause.activo = activo === 'true';
        }

        if (stock_bajo === 'true') {
            whereClause[Op.and] = [
                sequelize.literal('stock_actual <= stock_minimo')
            ];
        }

        const { count, rows } = await Producto.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                },
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: {
                productos: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo productos:', error);
        next(error);
    }
};

// Obtener producto por ID
const getProductoById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre', 'descripcion']
                },
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: { producto }
        });
    } catch (error) {
        logger.error('Error obteniendo producto:', error);
        next(error);
    }
};

// Crear nuevo producto
const createProducto = async (req, res, next) => {
    try {
        const productoData = {
            ...req.body,
            empresa_id: req.user.empresa_id
        };

        // Verificar si ya existe un producto con el mismo código
        if (productoData.codigo) {
            const existingProducto = await Producto.findOne({
                where: { codigo: productoData.codigo }
            });

            if (existingProducto) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con este código'
                });
            }
        }

        // Verificar si ya existe un producto con el mismo código de barras
        if (productoData.codigo_barras) {
            const existingProducto = await Producto.findOne({
                where: { codigo_barras: productoData.codigo_barras }
            });

            if (existingProducto) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con este código de barras'
                });
            }
        }

        const producto = await Producto.create(productoData);

        logger.info(`Producto ${producto.nombre} creado exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: { producto }
        });
    } catch (error) {
        logger.error('Error creando producto:', error);
        next(error);
    }
};

// Actualizar producto
const updateProducto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const producto = await Producto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Si se está cambiando el código, verificar que no exista otro
        if (updateData.codigo && updateData.codigo !== producto.codigo) {
            const existingProducto = await Producto.findOne({
                where: {
                    codigo: updateData.codigo,
                    id: { [Op.ne]: id }
                }
            });

            if (existingProducto) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con este código'
                });
            }
        }

        // Si se está cambiando el código de barras, verificar que no exista otro
        if (updateData.codigo_barras && updateData.codigo_barras !== producto.codigo_barras) {
            const existingProducto = await Producto.findOne({
                where: {
                    codigo_barras: updateData.codigo_barras,
                    id: { [Op.ne]: id }
                }
            });

            if (existingProducto) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un producto con este código de barras'
                });
            }
        }

        await producto.update(updateData);

        logger.info(`Producto ${producto.nombre} actualizado exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: { producto }
        });
    } catch (error) {
        logger.error('Error actualizando producto:', error);
        next(error);
    }
};

// Eliminar producto (soft delete)
const deleteProducto = async (req, res, next) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        await producto.destroy();

        logger.info(`Producto ${producto.nombre} eliminado exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando producto:', error);
        next(error);
    }
};

// Actualizar stock de producto
const updateStock = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { stock_actual, motivo } = req.body;

        const producto = await Producto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        await producto.update({ stock_actual });

        logger.info(`Stock del producto ${producto.nombre} actualizado a ${stock_actual}. Motivo: ${motivo}`);

        res.status(200).json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: { producto }
        });
    } catch (error) {
        logger.error('Error actualizando stock:', error);
        next(error);
    }
};

// Obtener productos con stock bajo
const getProductosStockBajo = async (req, res, next) => {
    try {
        const productos = await Producto.findAll({
            where: {
                empresa_id: req.user.empresa_id,
                activo: true,
                [Op.and]: [
                    sequelize.literal('stock_actual <= stock_minimo')
                ]
            },
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ],
            order: [['stock_actual', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: { productos }
        });
    } catch (error) {
        logger.error('Error obteniendo productos con stock bajo:', error);
        next(error);
    }
};

// Buscar productos para autocompletado
const searchProductos = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'La búsqueda debe tener al menos 2 caracteres'
            });
        }

        const productos = await Producto.findAll({
            where: {
                empresa_id: req.user.empresa_id,
                activo: true,
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${q}%` } },
                    { codigo: { [Op.iLike]: `%${q}%` } },
                    { codigo_barras: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: parseInt(limit),
            order: [['nombre', 'ASC']],
            attributes: ['id', 'codigo', 'nombre', 'precio_venta', 'stock_actual', 'unidad_medida'],
            include: [
                {
                    model: Categoria,
                    as: 'categoria',
                    attributes: ['id', 'nombre']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: { productos }
        });
    } catch (error) {
        logger.error('Error buscando productos:', error);
        next(error);
    }
};

// Obtener estadísticas de productos
const getProductoStats = async (req, res, next) => {
    try {
        const stats = await Producto.findAll({
            where: { empresa_id: req.user.empresa_id },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN activo = true THEN 1 END')), 'activos'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN activo = false THEN 1 END')), 'inactivos'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN tipo_producto = \'producto\' THEN 1 END')), 'productos'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN tipo_producto = \'servicio\' THEN 1 END')), 'servicios'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN stock_actual <= stock_minimo THEN 1 END')), 'stock_bajo'],
                [sequelize.fn('SUM', sequelize.col('stock_actual')), 'stock_total'],
                [sequelize.fn('SUM', sequelize.literal('stock_actual * precio_venta')), 'valor_inventario']
            ],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: { stats: stats[0] }
        });
    } catch (error) {
        logger.error('Error obteniendo estadísticas de productos:', error);
        next(error);
    }
};

module.exports = {
    getProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto,
    updateStock,
    getProductosStockBajo,
    searchProductos,
    getProductoStats
};
