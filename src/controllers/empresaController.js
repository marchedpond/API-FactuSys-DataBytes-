const { Empresa, User, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Obtener todas las empresas
const getEmpresas = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};

        if (search) {
            whereClause = {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${search}%` } },
                    { nit: { [Op.iLike]: `%${search}%` } },
                    { representante_legal: { [Op.iLike]: `%${search}%` } }
                ]
            };
        }

        const { count, rows } = await Empresa.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'usuarios',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'rol']
                }
            ]
        });

        res.status(200).json({
            success: true,
            data: {
                empresas: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo empresas:', error);
        next(error);
    }
};

// Obtener empresa por ID
const getEmpresaById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const empresa = await Empresa.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuarios',
                    attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'activo']
                }
            ]
        });

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: { empresa }
        });
    } catch (error) {
        logger.error('Error obteniendo empresa:', error);
        next(error);
    }
};

// Crear nueva empresa
const createEmpresa = async (req, res, next) => {
    try {
        const empresaData = req.body;

        // Verificar si ya existe una empresa con el mismo NIT
        const existingEmpresa = await Empresa.findOne({
            where: { nit: empresaData.nit }
        });

        if (existingEmpresa) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una empresa con este NIT'
            });
        }

        const empresa = await Empresa.create(empresaData);

        logger.info(`Empresa ${empresa.nombre} creada exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Empresa creada exitosamente',
            data: { empresa }
        });
    } catch (error) {
        logger.error('Error creando empresa:', error);
        next(error);
    }
};

// Actualizar empresa
const updateEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const empresa = await Empresa.findByPk(id);

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Si se está cambiando el NIT, verificar que no exista otro con el mismo NIT
        if (updateData.nit && updateData.nit !== empresa.nit) {
            const existingEmpresa = await Empresa.findOne({
                where: { nit: updateData.nit }
            });

            if (existingEmpresa) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una empresa con este NIT'
                });
            }
        }

        await empresa.update(updateData);

        logger.info(`Empresa ${empresa.nombre} actualizada exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Empresa actualizada exitosamente',
            data: { empresa }
        });
    } catch (error) {
        logger.error('Error actualizando empresa:', error);
        next(error);
    }
};

// Eliminar empresa (soft delete)
const deleteEmpresa = async (req, res, next) => {
    try {
        const { id } = req.params;

        const empresa = await Empresa.findByPk(id);

        if (!empresa) {
            return res.status(404).json({
                success: false,
                message: 'Empresa no encontrada'
            });
        }

        // Verificar si tiene usuarios asociados
        const usuariosCount = await User.count({
            where: { empresa_id: id }
        });

        if (usuariosCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la empresa porque tiene usuarios asociados'
            });
        }

        await empresa.destroy();

        logger.info(`Empresa ${empresa.nombre} eliminada exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Empresa eliminada exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando empresa:', error);
        next(error);
    }
};

// Obtener empresas del usuario actual
const getMyEmpresas = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {};

        // Si no es admin, solo mostrar su empresa
        if (req.user.rol !== 'admin') {
            whereClause.id = req.user.empresa_id;
        }

        const { count, rows } = await Empresa.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: {
                empresas: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo mis empresas:', error);
        next(error);
    }
};

module.exports = {
    getEmpresas,
    getEmpresaById,
    createEmpresa,
    updateEmpresa,
    deleteEmpresa,
    getMyEmpresas
};
