const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

// Generar token JWT
const generateToken = (payload) => {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRE,
            issuer: 'factusys-api',
            audience: 'factusys-client'
        });
    } catch (error) {
        logger.error('Error generando token JWT:', error);
        throw new Error('Error generando token de autenticación');
    }
};

// Verificar token JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'factusys-api',
            audience: 'factusys-client'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        } else {
            logger.error('Error verificando token JWT:', error);
            throw new Error('Error verificando token');
        }
    }
};

// Decodificar token sin verificar (para obtener información básica)
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        logger.error('Error decodificando token JWT:', error);
        return null;
    }
};

// Generar refresh token
const generateRefreshToken = (payload) => {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '7d',
            issuer: 'factusys-api',
            audience: 'factusys-refresh'
        });
    } catch (error) {
        logger.error('Error generando refresh token:', error);
        throw new Error('Error generando refresh token');
    }
};

// Verificar refresh token
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'factusys-api',
            audience: 'factusys-refresh'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Refresh token inválido');
        } else {
            logger.error('Error verificando refresh token:', error);
            throw new Error('Error verificando refresh token');
        }
    }
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken,
    generateRefreshToken,
    verifyRefreshToken
};
