const express = require('express');
const router = express.Router();
const { authenticate, authorize, checkEmpresa } = require('../middlewares/auth');
const { validateEmpresa, validateUUID, validatePagination } = require('../middlewares/validation');
const empresaController = require('../controllers/empresaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     EmpresaRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - nit
 *         - direccion
 *         - email
 *         - representante_legal
 *         - actividad_economica
 *       properties:
 *         nombre:
 *           type: string
 *           example: Mi Empresa S.A. de C.V.
 *         nit:
 *           type: string
 *           example: 0614-123456-123-4
 *         direccion:
 *           type: string
 *           example: San Salvador, El Salvador
 *         telefono:
 *           type: string
 *           example: +503 2222-2222
 *         email:
 *           type: string
 *           format: email
 *           example: info@miempresa.com
 *         representante_legal:
 *           type: string
 *           example: Juan Pérez
 *         actividad_economica:
 *           type: string
 *           example: Comercio al por menor
 *         regimen_tributario:
 *           type: string
 *           enum: [general, simplificado, pequeno_contribuyente]
 *           example: general
 *         codigo_establecimiento:
 *           type: string
 *           example: 00000001
 *         codigo_punto_venta:
 *           type: string
 *           example: 00001
 *         codigo_actividad:
 *           type: string
 *           example: 47110
 *         logo_url:
 *           type: string
 *           example: https://example.com/logo.png
 */

/**
 * @swagger
 * /empresas:
 *   get:
 *     summary: Obtener todas las empresas
 *     tags: [Empresas]
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
 *     responses:
 *       200:
 *         description: Lista de empresas obtenida exitosamente
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
 *                     empresas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Empresa'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, authorize('admin'), validatePagination, empresaController.getEmpresas);

/**
 * @swagger
 * /empresas/my:
 *   get:
 *     summary: Obtener empresas del usuario actual
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: Empresas del usuario obtenidas exitosamente
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
 *                     empresas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Empresa'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/my', authenticate, checkEmpresa, validatePagination, empresaController.getMyEmpresas);

/**
 * @swagger
 * /empresas/{id}:
 *   get:
 *     summary: Obtener empresa por ID
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Empresa obtenida exitosamente
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
 *                     empresa:
 *                       $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa no encontrada
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
router.get('/:id', authenticate, authorize('admin'), validateUUID, empresaController.getEmpresaById);

/**
 * @swagger
 * /empresas:
 *   post:
 *     summary: Crear nueva empresa
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaRequest'
 *     responses:
 *       201:
 *         description: Empresa creada exitosamente
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
 *                   example: Empresa creada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     empresa:
 *                       $ref: '#/components/schemas/Empresa'
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
router.post('/', authenticate, authorize('admin'), validateEmpresa, empresaController.createEmpresa);

/**
 * @swagger
 * /empresas/{id}:
 *   put:
 *     summary: Actualizar empresa
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpresaRequest'
 *     responses:
 *       200:
 *         description: Empresa actualizada exitosamente
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
 *                   example: Empresa actualizada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     empresa:
 *                       $ref: '#/components/schemas/Empresa'
 *       404:
 *         description: Empresa no encontrada
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
router.put('/:id', authenticate, authorize('admin'), validateUUID, validateEmpresa, empresaController.updateEmpresa);

/**
 * @swagger
 * /empresas/{id}:
 *   delete:
 *     summary: Eliminar empresa
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la empresa
 *     responses:
 *       200:
 *         description: Empresa eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Empresa no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: No se puede eliminar la empresa porque tiene usuarios asociados
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
router.delete('/:id', authenticate, authorize('admin'), validateUUID, empresaController.deleteEmpresa);

module.exports = router;
