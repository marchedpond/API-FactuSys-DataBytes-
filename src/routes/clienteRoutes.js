const express = require('express');
const router = express.Router();
const { authenticate, checkEmpresa } = require('../middlewares/auth');
const { validateCliente, validateUUID, validatePagination } = require('../middlewares/validation');
const clienteController = require('../controllers/clienteController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ClienteRequest:
 *       type: object
 *       required:
 *         - tipo_cliente
 *         - nombre
 *         - direccion
 *       properties:
 *         tipo_cliente:
 *           type: string
 *           enum: [persona_natural, persona_juridica]
 *           example: persona_natural
 *         nombre:
 *           type: string
 *           example: Juan
 *         apellido:
 *           type: string
 *           example: Pérez
 *         nit:
 *           type: string
 *           example: 0614-123456-123-4
 *         dui:
 *           type: string
 *           example: 12345678-9
 *         direccion:
 *           type: string
 *           example: San Salvador, El Salvador
 *         telefono:
 *           type: string
 *           example: +503 2222-2222
 *         email:
 *           type: string
 *           format: email
 *           example: cliente@example.com
 *         limite_credito:
 *           type: number
 *           format: decimal
 *           example: 1000.00
 *         dias_credito:
 *           type: integer
 *           example: 30
 *         exento_impuestos:
 *           type: boolean
 *           example: false
 *     
 *     Cliente:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         codigo:
 *           type: string
 *           example: CLI000001
 *         tipo_cliente:
 *           type: string
 *           enum: [persona_natural, persona_juridica]
 *         nombre:
 *           type: string
 *         apellido:
 *           type: string
 *         nit:
 *           type: string
 *         dui:
 *           type: string
 *         direccion:
 *           type: string
 *         telefono:
 *           type: string
 *         email:
 *           type: string
 *         limite_credito:
 *           type: number
 *         saldo_actual:
 *           type: number
 *         dias_credito:
 *           type: integer
 *         exento_impuestos:
 *           type: boolean
 *         activo:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
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
 *         name: tipo_cliente
 *         schema:
 *           type: string
 *           enum: [persona_natural, persona_juridica]
 *         description: Tipo de cliente
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
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
 *                     clientes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Cliente'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, checkEmpresa, validatePagination, clienteController.getClientes);

/**
 * @swagger
 * /clientes/search:
 *   get:
 *     summary: Buscar clientes para autocompletado
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Término de búsqueda (mínimo 2 caracteres)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 10
 *         description: Cantidad de resultados
 *     responses:
 *       200:
 *         description: Búsqueda realizada exitosamente
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
 *                     clientes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           codigo:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           apellido:
 *                             type: string
 *                           nit:
 *                             type: string
 *                           tipo_cliente:
 *                             type: string
 *       400:
 *         description: Término de búsqueda inválido
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
router.get('/search', authenticate, checkEmpresa, clienteController.searchClientes);

/**
 * @swagger
 * /clientes/stats:
 *   get:
 *     summary: Obtener estadísticas de clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
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
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         activos:
 *                           type: integer
 *                         inactivos:
 *                           type: integer
 *                         personas_naturales:
 *                           type: integer
 *                         personas_juridicas:
 *                           type: integer
 *                         saldo_total:
 *                           type: number
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', authenticate, checkEmpresa, clienteController.getClienteStats);

/**
 * @swagger
 * /clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente obtenido exitosamente
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
 *                     cliente:
 *                       $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
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
router.get('/:id', authenticate, checkEmpresa, validateUUID, clienteController.getClienteById);

/**
 * @swagger
 * /clientes:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteRequest'
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
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
 *                   example: Cliente creado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     cliente:
 *                       $ref: '#/components/schemas/Cliente'
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
router.post('/', authenticate, checkEmpresa, validateCliente, clienteController.createCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClienteRequest'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
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
 *                   example: Cliente actualizado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     cliente:
 *                       $ref: '#/components/schemas/Cliente'
 *       404:
 *         description: Cliente no encontrado
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
router.put('/:id', authenticate, checkEmpresa, validateUUID, validateCliente, clienteController.updateCliente);

/**
 * @swagger
 * /clientes/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Cliente no encontrado
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
router.delete('/:id', authenticate, checkEmpresa, validateUUID, clienteController.deleteCliente);

module.exports = router;
