const express = require('express');
const router = express.Router();
const { authenticate, checkEmpresa } = require('../middlewares/auth');
const { validateFactura, validateUUID, validatePagination } = require('../middlewares/validation');
const facturaController = require('../controllers/facturaController');

/**
 * @swagger
 * components:
 *   schemas:
 *     DetalleFacturaRequest:
 *       type: object
 *       required:
 *         - cantidad
 *         - precio_unitario
 *       properties:
 *         producto_id:
 *           type: string
 *           format: uuid
 *         cantidad:
 *           type: number
 *           format: decimal
 *           example: 2.00
 *         precio_unitario:
 *           type: number
 *           format: decimal
 *           example: 25.99
 *         descuento:
 *           type: number
 *           format: decimal
 *           example: 0.00
 *         descripcion_adicional:
 *           type: string
 *           example: Descripción adicional del producto
 *         impuestos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               impuesto_id:
 *                 type: string
 *                 format: uuid
 *     
 *     FacturaRequest:
 *       type: object
 *       required:
 *         - tipo_documento
 *         - metodo_pago
 *         - cliente_id
 *         - detalles
 *       properties:
 *         serie:
 *           type: string
 *           example: A
 *         tipo_documento:
 *           type: string
 *           enum: [factura, credito_fiscal, nota_credito, nota_debito]
 *           example: factura
 *         fecha_emision:
 *           type: string
 *           format: date-time
 *         fecha_vencimiento:
 *           type: string
 *           format: date-time
 *         metodo_pago:
 *           type: string
 *           enum: [efectivo, tarjeta, transferencia, cheque, credito]
 *           example: efectivo
 *         cliente_id:
 *           type: string
 *           format: uuid
 *         observaciones:
 *           type: string
 *           example: Observaciones adicionales
 *         descuento_global:
 *           type: number
 *           format: decimal
 *           example: 0.00
 *         detalles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DetalleFacturaRequest'
 *     
 *     Factura:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         numero_factura:
 *           type: string
 *         serie:
 *           type: string
 *         tipo_documento:
 *           type: string
 *         fecha_emision:
 *           type: string
 *           format: date-time
 *         fecha_vencimiento:
 *           type: string
 *           format: date-time
 *         estado:
 *           type: string
 *           enum: [borrador, emitida, anulada, pagada, vencida]
 *         subtotal:
 *           type: number
 *         total_impuestos:
 *           type: number
 *         descuento_global:
 *           type: number
 *         total:
 *           type: number
 *         metodo_pago:
 *           type: string
 *         observaciones:
 *           type: string
 *         codigo_autorizacion:
 *           type: string
 *         fecha_autorizacion:
 *           type: string
 *           format: date-time
 *         cliente:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *             apellido:
 *               type: string
 *             nit:
 *               type: string
 *             tipo_cliente:
 *               type: string
 *         usuario:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
 *               type: string
 *             apellido:
 *               type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Obtener todas las facturas
 *     tags: [Facturas]
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
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [borrador, emitida, anulada, pagada, vencida]
 *         description: Estado de la factura
 *       - in: query
 *         name: tipo_documento
 *         schema:
 *           type: string
 *           enum: [factura, credito_fiscal, nota_credito, nota_debito]
 *         description: Tipo de documento
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *       - in: query
 *         name: cliente_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de facturas obtenida exitosamente
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
 *                     facturas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Factura'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, checkEmpresa, validatePagination, facturaController.getFacturas);

/**
 * @swagger
 * /facturas/stats:
 *   get:
 *     summary: Obtener estadísticas de facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha_desde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde para las estadísticas
 *       - in: query
 *         name: fecha_hasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta para las estadísticas
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
 *                         emitidas:
 *                           type: integer
 *                         borradores:
 *                           type: integer
 *                         anuladas:
 *                           type: integer
 *                         pagadas:
 *                           type: integer
 *                         total_ventas:
 *                           type: number
 *                         ventas_emitidas:
 *                           type: number
 *                         promedio_venta:
 *                           type: number
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', authenticate, checkEmpresa, facturaController.getFacturaStats);

/**
 * @swagger
 * /facturas/{id}:
 *   get:
 *     summary: Obtener factura por ID con detalles completos
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura obtenida exitosamente
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
 *                     factura:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Factura'
 *                         - type: object
 *                           properties:
 *                             detalles:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   cantidad:
 *                                     type: number
 *                                   precio_unitario:
 *                                     type: number
 *                                   descuento:
 *                                     type: number
 *                                   subtotal:
 *                                     type: number
 *                                   total_impuestos:
 *                                     type: number
 *                                   total:
 *                                     type: number
 *                                   producto:
 *                                     type: object
 *                                   impuestos:
 *                                     type: array
 *       404:
 *         description: Factura no encontrada
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
router.get('/:id', authenticate, checkEmpresa, validateUUID, facturaController.getFacturaById);

/**
 * @swagger
 * /facturas:
 *   post:
 *     summary: Crear nueva factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FacturaRequest'
 *     responses:
 *       201:
 *         description: Factura creada exitosamente
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
 *                   example: Factura creada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     factura:
 *                       $ref: '#/components/schemas/Factura'
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
router.post('/', authenticate, checkEmpresa, validateFactura, facturaController.createFactura);

/**
 * @swagger
 * /facturas/{id}/emitir:
 *   post:
 *     summary: Emitir factura (cambiar estado a emitida y enviar a Hacienda)
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Factura emitida exitosamente
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
 *                   example: Factura emitida exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     factura:
 *                       $ref: '#/components/schemas/Factura'
 *                     respuestaHacienda:
 *                       type: object
 *                       properties:
 *                         codigoRespuesta:
 *                           type: string
 *                         descripcionRespuesta:
 *                           type: string
 *                         codigoAutorizacion:
 *                           type: string
 *                         fechaAutorizacion:
 *                           type: string
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: Solo se pueden emitir facturas en estado borrador
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
router.post('/:id/emitir', authenticate, checkEmpresa, validateUUID, facturaController.emitirFactura);

/**
 * @swagger
 * /facturas/{id}/anular:
 *   post:
 *     summary: Anular factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la factura
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: Error en los datos del cliente
 *                 description: Motivo de la anulación
 *     responses:
 *       200:
 *         description: Factura anulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Factura no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       400:
 *         description: La factura ya está anulada
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
router.post('/:id/anular', authenticate, checkEmpresa, validateUUID, facturaController.anularFactura);

module.exports = router;
