const express = require('express');
const router = express.Router();
const { authenticate, checkEmpresa } = require('../middlewares/auth');
const { validateUUID, validatePagination } = require('../middlewares/validation');
const { Impuesto } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     ImpuestoRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - codigo
 *         - porcentaje
 *         - tipo_impuesto
 *       properties:
 *         nombre:
 *           type: string
 *           example: IVA
 *         codigo:
 *           type: string
 *           example: 20
 *         porcentaje:
 *           type: number
 *           format: decimal
 *           example: 13.00
 *         tipo_impuesto:
 *           type: string
 *           enum: [iva, isc, consumo, municipal]
 *           example: iva
 *         aplicable_por_defecto:
 *           type: boolean
 *           example: true
 *     
 *     Impuesto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         codigo:
 *           type: string
 *         porcentaje:
 *           type: number
 *         tipo_impuesto:
 *           type: string
 *         aplicable_por_defecto:
 *           type: boolean
 *         activo:
 *           type: boolean
 *         empresa_id:
 *           type: string
 *           format: uuid
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /impuestos:
 *   get:
 *     summary: Obtener todos los impuestos
 *     tags: [Impuestos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda
 *       - in: query
 *         name: tipo_impuesto
 *         schema:
 *           type: string
 *           enum: [iva, isc, consumo, municipal]
 *         description: Tipo de impuesto
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de impuestos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     impuestos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Impuesto'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, checkEmpresa, validatePagination, async (req, res, next) => {
    try {
        const { page = 1, limit = 10, search, tipo_impuesto, activo } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {
            empresa_id: req.user.empresa_id
        };

        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { codigo: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (tipo_impuesto) {
            whereClause.tipo_impuesto = tipo_impuesto;
        }

        if (activo !== undefined) {
            whereClause.activo = activo === 'true';
        }

        const { count, rows } = await Impuesto.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nombre', 'ASC']]
        });

        res.status(200).json({
            success: true,
            data: {
                impuestos: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo impuestos:', error);
        next(error);
    }
});

/**
 * @swagger
 * /impuestos/{id}:
 *   get:
 *     summary: Obtener impuesto por ID
 *     tags: [Impuestos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del impuesto
 *     responses:
 *       200:
 *         description: Impuesto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     impuesto:
 *                       $ref: '#/components/schemas/Impuesto'
 *       404:
 *         description: Impuesto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authenticate, checkEmpresa, validateUUID, async (req, res, next) => {
    try {
        const { id } = req.params;

        const impuesto = await Impuesto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!impuesto) {
            return res.status(404).json({
                success: false,
                message: 'Impuesto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: { impuesto }
        });
    } catch (error) {
        logger.error('Error obteniendo impuesto:', error);
        next(error);
    }
});

/**
 * @swagger
 * /impuestos:
 *   post:
 *     summary: Crear nuevo impuesto
 *     tags: [Impuestos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImpuestoRequest'
 *     responses:
 *       201:
 *         description: Impuesto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Impuesto creado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     impuesto:
 *                       $ref: '#/components/schemas/Impuesto'
 *       400:
 *         description: Error en los datos de entrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', authenticate, checkEmpresa, async (req, res, next) => {
    try {
        const { nombre, codigo, porcentaje, tipo_impuesto, aplicable_por_defecto } = req.body;

        // Validaciones
        if (!nombre || nombre.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del impuesto es requerido y debe tener al menos 2 caracteres'
            });
        }

        if (!codigo || codigo.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: 'El código del impuesto es requerido'
            });
        }

        if (!porcentaje || porcentaje < 0 || porcentaje > 100) {
            return res.status(400).json({
                success: false,
                message: 'El porcentaje debe ser un número entre 0 y 100'
            });
        }

        if (!tipo_impuesto || !['iva', 'isc', 'consumo', 'municipal'].includes(tipo_impuesto)) {
            return res.status(400).json({
                success: false,
                message: 'El tipo de impuesto es requerido y debe ser uno de: iva, isc, consumo, municipal'
            });
        }

        // Verificar si ya existe un impuesto con el mismo código
        const existingImpuesto = await Impuesto.findOne({
            where: {
                codigo: codigo.trim(),
                empresa_id: req.user.empresa_id
            }
        });

        if (existingImpuesto) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un impuesto con este código'
            });
        }

        // Si se marca como aplicable por defecto, desactivar los otros
        if (aplicable_por_defecto) {
            await Impuesto.update(
                { aplicable_por_defecto: false },
                {
                    where: {
                        empresa_id: req.user.empresa_id,
                        tipo_impuesto: tipo_impuesto
                    }
                }
            );
        }

        const impuesto = await Impuesto.create({
            nombre: nombre.trim(),
            codigo: codigo.trim(),
            porcentaje: parseFloat(porcentaje),
            tipo_impuesto,
            aplicable_por_defecto: aplicable_por_defecto || false,
            empresa_id: req.user.empresa_id
        });

        logger.info(`Impuesto ${impuesto.nombre} creado exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Impuesto creado exitosamente',
            data: { impuesto }
        });
    } catch (error) {
        logger.error('Error creando impuesto:', error);
        next(error);
    }
});

/**
 * @swagger
 * /impuestos/{id}:
 *   put:
 *     summary: Actualizar impuesto
 *     tags: [Impuestos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del impuesto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImpuestoRequest'
 *     responses:
 *       200:
 *         description: Impuesto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Impuesto actualizado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     impuesto:
 *                       $ref: '#/components/schemas/Impuesto'
 *       404:
 *         description: Impuesto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Error en los datos de entrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authenticate, checkEmpresa, validateUUID, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, codigo, porcentaje, tipo_impuesto, aplicable_por_defecto, activa } = req.body;

        const impuesto = await Impuesto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!impuesto) {
            return res.status(404).json({
                success: false,
                message: 'Impuesto no encontrado'
            });
        }

        // Validaciones
        if (nombre && nombre.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del impuesto debe tener al menos 2 caracteres'
            });
        }

        if (codigo && codigo.trim().length < 1) {
            return res.status(400).json({
                success: false,
                message: 'El código del impuesto es requerido'
            });
        }

        if (porcentaje !== undefined && (porcentaje < 0 || porcentaje > 100)) {
            return res.status(400).json({
                success: false,
                message: 'El porcentaje debe ser un número entre 0 y 100'
            });
        }

        if (tipo_impuesto && !['iva', 'isc', 'consumo', 'municipal'].includes(tipo_impuesto)) {
            return res.status(400).json({
                success: false,
                message: 'El tipo de impuesto debe ser uno de: iva, isc, consumo, municipal'
            });
        }

        // Si se está cambiando el código, verificar que no exista otro
        if (codigo && codigo.trim() !== impuesto.codigo) {
            const existingImpuesto = await Impuesto.findOne({
                where: {
                    codigo: codigo.trim(),
                    empresa_id: req.user.empresa_id,
                    id: { [Op.ne]: id }
                }
            });

            if (existingImpuesto) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un impuesto con este código'
                });
            }
        }

        // Si se marca como aplicable por defecto, desactivar los otros del mismo tipo
        if (aplicable_por_defecto && !impuesto.aplicable_por_defecto) {
            await Impuesto.update(
                { aplicable_por_defecto: false },
                {
                    where: {
                        empresa_id: req.user.empresa_id,
                        tipo_impuesto: tipo_impuesto || impuesto.tipo_impuesto,
                        id: { [Op.ne]: id }
                    }
                }
            );
        }

        await impuesto.update({
            nombre: nombre ? nombre.trim() : impuesto.nombre,
            codigo: codigo ? codigo.trim() : impuesto.codigo,
            porcentaje: porcentaje !== undefined ? parseFloat(porcentaje) : impuesto.porcentaje,
            tipo_impuesto: tipo_impuesto || impuesto.tipo_impuesto,
            aplicable_por_defecto: aplicable_por_defecto !== undefined ? aplicable_por_defecto : impuesto.aplicable_por_defecto,
            activa: activa !== undefined ? activa : impuesto.activa
        });

        logger.info(`Impuesto ${impuesto.nombre} actualizado exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Impuesto actualizado exitosamente',
            data: { impuesto }
        });
    } catch (error) {
        logger.error('Error actualizando impuesto:', error);
        next(error);
    }
});

/**
 * @swagger
 * /impuestos/{id}:
 *   delete:
 *     summary: Eliminar impuesto
 *     tags: [Impuestos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del impuesto
 *     responses:
 *       200:
 *         description: Impuesto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Impuesto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authenticate, checkEmpresa, validateUUID, async (req, res, next) => {
    try {
        const { id } = req.params;

        const impuesto = await Impuesto.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!impuesto) {
            return res.status(404).json({
                success: false,
                message: 'Impuesto no encontrado'
            });
        }

        await impuesto.destroy();

        logger.info(`Impuesto ${impuesto.nombre} eliminado exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Impuesto eliminado exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando impuesto:', error);
        next(error);
    }
});

module.exports = router;
