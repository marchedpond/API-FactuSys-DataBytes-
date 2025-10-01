const { Cliente, Empresa, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Obtener todos los clientes
const getClientes = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, tipo_cliente, activo } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {
            empresa_id: req.user.empresa_id
        };

        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { apellido: { [Op.iLike]: `%${search}%` } },
                { nit: { [Op.iLike]: `%${search}%` } },
                { dui: { [Op.iLike]: `%${search}%` } },
                { codigo: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (tipo_cliente) {
            whereClause.tipo_cliente = tipo_cliente;
        }

        if (activo !== undefined) {
            whereClause.activo = activo === 'true';
        }

        const { count, rows } = await Cliente.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
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
                clientes: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo clientes:', error);
        next(error);
    }
};

// Obtener cliente por ID
const getClienteById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const cliente = await Cliente.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            },
            include: [
                {
                    model: Empresa,
                    as: 'empresa',
                    attributes: ['id', 'nombre', 'nit']
                }
            ]
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: { cliente }
        });
    } catch (error) {
        logger.error('Error obteniendo cliente:', error);
        next(error);
    }
};

// Crear nuevo cliente
const createCliente = async (req, res, next) => {
    try {
        const clienteData = {
            ...req.body,
            empresa_id: req.user.empresa_id
        };

        // Verificar si ya existe un cliente con el mismo NIT o DUI
        if (clienteData.nit || clienteData.dui) {
            const existingCliente = await Cliente.findOne({
                where: {
                    [Op.or]: [
                        { nit: clienteData.nit },
                        { dui: clienteData.dui }
                    ].filter(condition => Object.values(condition)[0]) // Solo incluir condiciones con valores
                }
            });

            if (existingCliente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un cliente con este NIT o DUI'
                });
            }
        }

        const cliente = await Cliente.create(clienteData);

        logger.info(`Cliente ${cliente.nombre} creado exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: { cliente }
        });
    } catch (error) {
        logger.error('Error creando cliente:', error);
        next(error);
    }
};

// Actualizar cliente
const updateCliente = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const cliente = await Cliente.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Si se está cambiando el NIT o DUI, verificar que no exista otro
        if (updateData.nit || updateData.dui) {
            const existingCliente = await Cliente.findOne({
                where: {
                    id: { [Op.ne]: id },
                    [Op.or]: [
                        { nit: updateData.nit },
                        { dui: updateData.dui }
                    ].filter(condition => Object.values(condition)[0])
                }
            });

            if (existingCliente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un cliente con este NIT o DUI'
                });
            }
        }

        await cliente.update(updateData);

        logger.info(`Cliente ${cliente.nombre} actualizado exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: { cliente }
        });
    } catch (error) {
        logger.error('Error actualizando cliente:', error);
        next(error);
    }
};

// Eliminar cliente (soft delete)
const deleteCliente = async (req, res, next) => {
    try {
        const { id } = req.params;

        const cliente = await Cliente.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        await cliente.destroy();

        logger.info(`Cliente ${cliente.nombre} eliminado exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando cliente:', error);
        next(error);
    }
};

// Obtener estadísticas de clientes
const getClienteStats = async (req, res, next) => {
    try {
        const stats = await Cliente.findAll({
            where: { empresa_id: req.user.empresa_id },
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN activo = true THEN 1 END')), 'activos'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN activo = false THEN 1 END')), 'inactivos'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN tipo_cliente = \'persona_natural\' THEN 1 END')), 'personas_naturales'],
                [sequelize.fn('COUNT', sequelize.literal('CASE WHEN tipo_cliente = \'persona_juridica\' THEN 1 END')), 'personas_juridicas'],
                [sequelize.fn('SUM', sequelize.col('saldo_actual')), 'saldo_total']
            ],
            raw: true
        });

        res.status(200).json({
            success: true,
            data: { stats: stats[0] }
        });
    } catch (error) {
        logger.error('Error obteniendo estadísticas de clientes:', error);
        next(error);
    }
};

// Buscar clientes para autocompletado
const searchClientes = async (req, res, next) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'La búsqueda debe tener al menos 2 caracteres'
            });
        }

        const clientes = await Cliente.findAll({
            where: {
                empresa_id: req.user.empresa_id,
                activo: true,
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${q}%` } },
                    { apellido: { [Op.iLike]: `%${q}%` } },
                    { nit: { [Op.iLike]: `%${q}%` } },
                    { codigo: { [Op.iLike]: `%${q}%` } }
                ]
            },
            limit: parseInt(limit),
            order: [['nombre', 'ASC']],
            attributes: ['id', 'codigo', 'nombre', 'apellido', 'nit', 'tipo_cliente']
        });

        res.status(200).json({
            success: true,
            data: { clientes }
        });
    } catch (error) {
        logger.error('Error buscando clientes:', error);
        next(error);
    }
};

module.exports = {
    getClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteStats,
    searchClientes
};
