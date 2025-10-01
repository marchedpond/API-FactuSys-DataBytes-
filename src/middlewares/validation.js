const { body, param, query, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: errors.array()
        });
    }
    next();
};

// Validaciones para usuarios
const validateUser = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('apellido')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El apellido debe tener entre 2 y 100 caracteres'),
    body('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('telefono')
        .optional()
        .isMobilePhone()
        .withMessage('Debe ser un número de teléfono válido'),
    body('rol')
        .optional()
        .isIn(['admin', 'contador', 'vendedor', 'cliente'])
        .withMessage('Rol inválido'),
    handleValidationErrors
];

// Validaciones para empresas
const validateEmpresa = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre de la empresa es requerido')
        .isLength({ min: 2, max: 200 })
        .withMessage('El nombre debe tener entre 2 y 200 caracteres'),
    body('nit')
        .trim()
        .notEmpty()
        .withMessage('El NIT es requerido')
        .isLength({ min: 10, max: 20 })
        .withMessage('El NIT debe tener entre 10 y 20 caracteres'),
    body('direccion')
        .trim()
        .notEmpty()
        .withMessage('La dirección es requerida'),
    body('email')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('representante_legal')
        .trim()
        .notEmpty()
        .withMessage('El representante legal es requerido'),
    body('actividad_economica')
        .trim()
        .notEmpty()
        .withMessage('La actividad económica es requerida'),
    body('regimen_tributario')
        .optional()
        .isIn(['general', 'simplificado', 'pequeno_contribuyente'])
        .withMessage('Régimen tributario inválido'),
    handleValidationErrors
];

// Validaciones para clientes
const validateCliente = [
    body('tipo_cliente')
        .isIn(['persona_natural', 'persona_juridica'])
        .withMessage('Tipo de cliente inválido'),
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 200 })
        .withMessage('El nombre debe tener entre 2 y 200 caracteres'),
    body('nit')
        .optional()
        .isLength({ min: 10, max: 20 })
        .withMessage('El NIT debe tener entre 10 y 20 caracteres'),
    body('dui')
        .optional()
        .isLength({ min: 9, max: 15 })
        .withMessage('El DUI debe tener entre 9 y 15 caracteres'),
    body('direccion')
        .trim()
        .notEmpty()
        .withMessage('La dirección es requerida'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    body('limite_credito')
        .optional()
        .isDecimal()
        .withMessage('El límite de crédito debe ser un número decimal'),
    body('dias_credito')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Los días de crédito deben ser un número entero positivo'),
    handleValidationErrors
];

// Validaciones para productos
const validateProducto = [
    body('nombre')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ min: 2, max: 200 })
        .withMessage('El nombre debe tener entre 2 y 200 caracteres'),
    body('precio_venta')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El precio de venta debe ser un número decimal')
        .custom((value) => {
            if (parseFloat(value) < 0) {
                throw new Error('El precio de venta no puede ser negativo');
            }
            return true;
        }),
    body('precio_compra')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El precio de compra debe ser un número decimal'),
    body('stock_actual')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El stock actual debe ser un número decimal'),
    body('stock_minimo')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El stock mínimo debe ser un número decimal'),
    body('unidad_medida')
        .optional()
        .isIn(['unidad', 'kg', 'lb', 'litro', 'metro', 'm2', 'm3'])
        .withMessage('Unidad de medida inválida'),
    body('tipo_producto')
        .optional()
        .isIn(['producto', 'servicio'])
        .withMessage('Tipo de producto inválido'),
    body('categoria_id')
        .isUUID()
        .withMessage('ID de categoría inválido'),
    handleValidationErrors
];

// Validaciones para facturas
const validateFactura = [
    body('tipo_documento')
        .isIn(['factura', 'credito_fiscal', 'nota_credito', 'nota_debito'])
        .withMessage('Tipo de documento inválido'),
    body('fecha_emision')
        .isISO8601()
        .withMessage('Fecha de emisión inválida'),
    body('fecha_vencimiento')
        .optional()
        .isISO8601()
        .withMessage('Fecha de vencimiento inválida'),
    body('metodo_pago')
        .isIn(['efectivo', 'tarjeta', 'transferencia', 'cheque', 'credito'])
        .withMessage('Método de pago inválido'),
    body('cliente_id')
        .isUUID()
        .withMessage('ID de cliente inválido'),
    body('detalles')
        .isArray({ min: 1 })
        .withMessage('Debe incluir al menos un detalle'),
    body('detalles.*.cantidad')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('La cantidad debe ser un número decimal')
        .custom((value) => {
            if (parseFloat(value) <= 0) {
                throw new Error('La cantidad debe ser mayor a 0');
            }
            return true;
        }),
    body('detalles.*.precio_unitario')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('El precio unitario debe ser un número decimal')
        .custom((value) => {
            if (parseFloat(value) < 0) {
                throw new Error('El precio unitario no puede ser negativo');
            }
            return true;
        }),
    handleValidationErrors
];

// Validaciones para parámetros UUID
const validateUUID = [
    param('id')
        .isUUID()
        .withMessage('ID inválido'),
    handleValidationErrors
];

// Validaciones para paginación
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entero entre 1 y 100'),
    query('search')
        .optional()
        .isLength({ max: 100 })
        .withMessage('La búsqueda no puede exceder 100 caracteres'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUser,
    validateEmpresa,
    validateCliente,
    validateProducto,
    validateFactura,
    validateUUID,
    validatePagination
};
