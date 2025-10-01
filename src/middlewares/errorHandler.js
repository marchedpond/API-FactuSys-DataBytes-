const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log del error
    logger.error(err);

    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        const message = err.errors.map(error => error.message).join(', ');
        error = {
            message,
            statusCode: 400
        };
    }

    // Error de clave duplicada en Sequelize
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0].path;
        const message = `${field} ya existe`;
        error = {
            message,
            statusCode: 400
        };
    }

    // Error de clave foránea en Sequelize
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Referencia inválida en la base de datos';
        error = {
            message,
            statusCode: 400
        };
    }

    // Error de registro no encontrado en Sequelize
    if (err.name === 'SequelizeEmptyResultError') {
        const message = 'Registro no encontrado';
        error = {
            message,
            statusCode: 404
        };
    }

    // Error de JSON malformado
    if (err.type === 'entity.parse.failed') {
        const message = 'JSON malformado en la solicitud';
        error = {
            message,
            statusCode: 400
        };
    }

    // Error de archivo muy grande
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'Archivo demasiado grande';
        error = {
            message,
            statusCode: 413
        };
    }

    // Error de límite de velocidad
    if (err.status === 429) {
        const message = 'Demasiadas solicitudes';
        error = {
            message,
            statusCode: 429
        };
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = {
            message,
            statusCode: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = {
            message,
            statusCode: 401
        };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
