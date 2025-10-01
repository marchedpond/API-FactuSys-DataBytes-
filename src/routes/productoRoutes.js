const express = require('express');
const router = express.Router();
const { authenticate, checkEmpresa } = require('../middlewares/auth');
const { validateProducto, validateUUID, validatePagination } = require('../middlewares/validation');
const productoController = require('../controllers/productoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     ProductoRequest:
 *       type: object
 *       required:
 *         - nombre
 *         - precio_venta
 *         - categoria_id
 *       properties:
 *         codigo:
 *           type: string
 *           example: PROD001
 *         codigo_barras:
 *           type: string
 *           example: 1234567890123
 *         nombre:
 *           type: string
 *           example: Producto de ejemplo
 *         descripcion:
 *           type: string
 *           example: Descripción del producto
 *         precio_venta:
 *           type: number
 *           format: decimal
 *           example: 25.99
 *         precio_compra:
 *           type: number
 *           format: decimal
 *           example: 15.50
 *         costo_unitario:
 *           type: number
 *           format: decimal
 *           example: 18.00
 *         stock_actual:
 *           type: number
 *           format: decimal
 *           example: 100.00
 *         stock_minimo:
 *           type: number
 *           format: decimal
 *           example: 10.00
 *         unidad_medida:
 *           type: string
 *           enum: [unidad, kg, lb, litro, metro, m2, m3]
 *           example: unidad
 *         tipo_producto:
 *           type: string
 *           enum: [producto, servicio]
 *           example: producto
 *         exento_impuestos:
 *           type: boolean
 *           example: false
 *         imagen_url:
 *           type: string
 *           example: https://example.com/imagen.jpg
 *         categoria_id:
 *           type: string
 *           format: uuid
 *     
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         codigo:
 *           type: string
 *         codigo_barras:
 *           type: string
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         precio_venta:
 *           type: number
 *         precio_compra:
 *           type: number
 *         costo_unitario:
 *           type: number
 *         stock_actual:
 *           type: number
 *         stock_minimo:
 *           type: number
 *         unidad_medida:
 *           type: string
 *         tipo_producto:
 *           type: string
 *         exento_impuestos:
 *           type: boolean
 *         activo:
 *           type: boolean
 *         imagen_url:
 *           type: string
 *         categoria:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             nombre:
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
 * /productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
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
 *         name: categoria_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la categoría
 *       - in: query
 *         name: tipo_producto
 *         schema:
 *           type: string
 *           enum: [producto, servicio]
 *         description: Tipo de producto
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Estado activo/inactivo
 *       - in: query
 *         name: stock_bajo
 *         schema:
 *           type: boolean
 *         description: Solo productos con stock bajo
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
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
 *                     productos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Producto'
 *                     pagination:
 *                       type: object
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authenticate, checkEmpresa, validatePagination, productoController.getProductos);

/**
 * @swagger
 * /productos/search:
 *   get:
 *     summary: Buscar productos para autocompletado
 *     tags: [Productos]
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
 *                     productos:
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
 *                           precio_venta:
 *                             type: number
 *                           stock_actual:
 *                             type: number
 *                           unidad_medida:
 *                             type: string
 *                           categoria:
 *                             type: object
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
router.get('/search', authenticate, checkEmpresa, productoController.searchProductos);

/**
 * @swagger
 * /productos/stock-bajo:
 *   get:
 *     summary: Obtener productos con stock bajo
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productos con stock bajo obtenidos exitosamente
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
 *                     productos:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Producto'
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stock-bajo', authenticate, checkEmpresa, productoController.getProductosStockBajo);

/**
 * @swagger
 * /productos/stats:
 *   get:
 *     summary: Obtener estadísticas de productos
 *     tags: [Productos]
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
 *                         productos:
 *                           type: integer
 *                         servicios:
 *                           type: integer
 *                         stock_bajo:
 *                           type: integer
 *                         stock_total:
 *                           type: number
 *                         valor_inventario:
 *                           type: number
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/stats', authenticate, checkEmpresa, productoController.getProductoStats);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
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
 *                     producto:
 *                       $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
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
router.get('/:id', authenticate, checkEmpresa, validateUUID, productoController.getProductoById);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoRequest'
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
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
 *                   example: Producto creado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     producto:
 *                       $ref: '#/components/schemas/Producto'
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
router.post('/', authenticate, checkEmpresa, validateProducto, productoController.createProducto);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductoRequest'
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
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
 *                   example: Producto actualizado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     producto:
 *                       $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
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
router.put('/:id', authenticate, checkEmpresa, validateUUID, validateProducto, productoController.updateProducto);

/**
 * @swagger
 * /productos/{id}/stock:
 *   put:
 *     summary: Actualizar stock de producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stock_actual
 *             properties:
 *               stock_actual:
 *                 type: number
 *                 format: decimal
 *                 example: 150.00
 *               motivo:
 *                 type: string
 *                 example: Ajuste de inventario
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Producto no encontrado
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
router.put('/:id/stock', authenticate, checkEmpresa, validateUUID, productoController.updateStock);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       404:
 *         description: Producto no encontrado
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
router.delete('/:id', authenticate, checkEmpresa, validateUUID, productoController.deleteProducto);

module.exports = router;
