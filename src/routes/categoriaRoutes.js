const express = require('express');
const router = express.Router();
const { authenticate, checkEmpresa } = require('../middlewares/auth');
const { validateUUID, validatePagination } = require('../middlewares/validation');
const { Categoria, Producto } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoriaRequest:
 *       type: object
 *       required:
 *         - nombre
 *       properties:
 *         nombre:
 *           type: string
 *           example: Electrónicos
 *         descripcion:
 *           type: string
 *           example: Productos electrónicos y tecnológicos
 *     
 *     Categoria:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         activa:
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
 * /categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     tags: [Categorías]
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
 *         name: activa
 *         schema:
 *           type: boolean
 *         description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
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
 *                     categorias:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Categoria'
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
        const { page = 1, limit = 10, search, activa } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = {
            empresa_id: req.user.empresa_id
        };

        if (search) {
            whereClause[Op.or] = [
                { nombre: { [Op.iLike]: `%${search}%` } },
                { descripcion: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (activa !== undefined) {
            whereClause.activa = activa === 'true';
        }

        const { count, rows } = await Categoria.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['nombre', 'ASC']],
            include: [
                {
                    model: Producto,
                    as: 'productos',
                    attributes: ['id'],
                    where: { activo: true },
                    required: false
                }
            ]
        });

        // Agregar conteo de productos
        const categorias = rows.map(categoria => ({
            ...categoria.toJSON(),
            cantidad_productos: categoria.productos ? categoria.productos.length : 0
        }));

        res.status(200).json({
            success: true,
            data: {
                categorias,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo categorías:', error);
        next(error);
    }
});

/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
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
 *                     categoria:
 *                       $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
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

        const categoria = await Categoria.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            },
            include: [
                {
                    model: Producto,
                    as: 'productos',
                    attributes: ['id', 'codigo', 'nombre', 'precio_venta', 'stock_actual', 'activo'],
                    where: { activo: true },
                    required: false
                }
            ]
        });

        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                categoria: {
                    ...categoria.toJSON(),
                    cantidad_productos: categoria.productos ? categoria.productos.length : 0
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo categoría:', error);
        next(error);
    }
});

/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crear nueva categoría
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaRequest'
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
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
 *                   example: Categoría creada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoria:
 *                       $ref: '#/components/schemas/Categoria'
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
        const { nombre, descripcion } = req.body;

        if (!nombre || nombre.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de la categoría es requerido y debe tener al menos 2 caracteres'
            });
        }

        // Verificar si ya existe una categoría con el mismo nombre
        const existingCategoria = await Categoria.findOne({
            where: {
                nombre: nombre.trim(),
                empresa_id: req.user.empresa_id
            }
        });

        if (existingCategoria) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una categoría con este nombre'
            });
        }

        const categoria = await Categoria.create({
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : null,
            empresa_id: req.user.empresa_id
        });

        logger.info(`Categoría ${categoria.nombre} creada exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Categoría creada exitosamente',
            data: { categoria }
        });
    } catch (error) {
        logger.error('Error creando categoría:', error);
        next(error);
    }
});

/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualizar categoría
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoriaRequest'
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
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
 *                   example: Categoría actualizada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     categoria:
 *                       $ref: '#/components/schemas/Categoria'
 *       404:
 *         description: Categoría no encontrada
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
        const { nombre, descripcion, activa } = req.body;

        const categoria = await Categoria.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Si se está cambiando el nombre, verificar que no exista otro
        if (nombre && nombre.trim() !== categoria.nombre) {
            const existingCategoria = await Categoria.findOne({
                where: {
                    nombre: nombre.trim(),
                    empresa_id: req.user.empresa_id,
                    id: { [Op.ne]: id }
                }
            });

            if (existingCategoria) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una categoría con este nombre'
                });
            }
        }

        await categoria.update({
            nombre: nombre ? nombre.trim() : categoria.nombre,
            descripcion: descripcion !== undefined ? (descripcion ? descripcion.trim() : null) : categoria.descripcion,
            activa: activa !== undefined ? activa : categoria.activa
        });

        logger.info(`Categoría ${categoria.nombre} actualizada exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Categoría actualizada exitosamente',
            data: { categoria }
        });
    } catch (error) {
        logger.error('Error actualizando categoría:', error);
        next(error);
    }
});

/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Eliminar categoría
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Categoría no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: No se puede eliminar la categoría porque tiene productos asociados
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

        const categoria = await Categoria.findOne({
            where: {
                id,
                empresa_id: req.user.empresa_id
            }
        });

        if (!categoria) {
            return res.status(404).json({
                success: false,
                message: 'Categoría no encontrada'
            });
        }

        // Verificar si tiene productos asociados
        const productosCount = await Producto.count({
            where: { categoria_id: id }
        });

        if (productosCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la categoría porque tiene productos asociados'
            });
        }

        await categoria.destroy();

        logger.info(`Categoría ${categoria.nombre} eliminada exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Categoría eliminada exitosamente'
        });
    } catch (error) {
        logger.error('Error eliminando categoría:', error);
        next(error);
    }
});

module.exports = router;
