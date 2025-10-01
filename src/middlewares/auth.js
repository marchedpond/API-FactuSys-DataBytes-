const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const logger = require('../utils/logger');

// Middleware de autenticación
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token de autorización requerido'
            });
        }

        const token = authHeader.substring(7); // Remover 'Bearer '

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        // Verificar el token
        const decoded = verifyToken(token);

        // Buscar el usuario en la base de datos
        const user = await User.findByPk(decoded.id, {
            include: ['empresa'],
            paranoid: false // Incluir usuarios eliminados para verificar estado
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Agregar información del usuario a la request
        req.user = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            rol: user.rol,
            empresa_id: user.empresa_id,
            empresa: user.empresa
        };

        next();
    } catch (error) {
        logger.error('Error en middleware de autenticación:', error);

        if (error.message === 'Token expirado') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }

        if (error.message === 'Token inválido') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Error de autenticación'
        });
    }
};

// Middleware para verificar roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para realizar esta acción'
            });
        }

        next();
    };
};

// Middleware para verificar si el usuario pertenece a la misma empresa
const checkEmpresa = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }

    // Permitir a los admins acceder a cualquier empresa
    if (req.user.rol === 'admin') {
        return next();
    }

    // Verificar que el usuario tenga empresa asignada
    if (!req.user.empresa_id) {
        return res.status(403).json({
            success: false,
            message: 'Usuario sin empresa asignada'
        });
    }

    next();
};

module.exports = {
    authenticate,
    authorize,
    checkEmpresa
};
