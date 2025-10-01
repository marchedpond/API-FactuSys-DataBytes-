const { User } = require('../models');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const logger = require('../utils/logger');

// Login de usuario
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Buscar usuario por email
        const user = await User.findOne({
            where: { email },
            include: ['empresa'],
            paranoid: false
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Verificar contraseña
        const isValidPassword = await user.validPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar último acceso
        await user.update({ ultimo_acceso: new Date() });

        // Generar tokens
        const tokenPayload = {
            id: user.id,
            email: user.email,
            rol: user.rol,
            empresa_id: user.empresa_id
        };

        const token = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        logger.info(`Usuario ${user.email} inició sesión exitosamente`);

        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    rol: user.rol,
                    empresa: user.empresa
                },
                token,
                refreshToken
            }
        });
    } catch (error) {
        logger.error('Error en login:', error);
        next(error);
    }
};

// Registro de usuario
const register = async (req, res, next) => {
    try {
        const { nombre, apellido, email, password, telefono, rol, empresa_id } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        // Crear nuevo usuario
        const user = await User.create({
            nombre,
            apellido,
            email,
            password,
            telefono,
            rol: rol || 'vendedor',
            empresa_id
        });

        // Obtener usuario con empresa
        const userWithEmpresa = await User.findByPk(user.id, {
            include: ['empresa']
        });

        // Generar token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            rol: user.rol,
            empresa_id: user.empresa_id
        };

        const token = generateToken(tokenPayload);

        logger.info(`Usuario ${user.email} registrado exitosamente`);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: {
                    id: userWithEmpresa.id,
                    nombre: userWithEmpresa.nombre,
                    apellido: userWithEmpresa.apellido,
                    email: userWithEmpresa.email,
                    rol: userWithEmpresa.rol,
                    empresa: userWithEmpresa.empresa
                },
                token
            }
        });
    } catch (error) {
        logger.error('Error en registro:', error);
        next(error);
    }
};

// Refrescar token
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token requerido'
            });
        }

        // Verificar refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Buscar usuario
        const user = await User.findByPk(decoded.id, {
            include: ['empresa']
        });

        if (!user || !user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido'
            });
        }

        // Generar nuevo token
        const tokenPayload = {
            id: user.id,
            email: user.email,
            rol: user.rol,
            empresa_id: user.empresa_id
        };

        const newToken = generateToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        res.status(200).json({
            success: true,
            message: 'Token refrescado exitosamente',
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        logger.error('Error refrescando token:', error);
        next(error);
    }
};

// Obtener perfil del usuario actual
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: ['empresa'],
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    telefono: user.telefono,
                    rol: user.rol,
                    activo: user.activo,
                    ultimo_acceso: user.ultimo_acceso,
                    empresa: user.empresa
                }
            }
        });
    } catch (error) {
        logger.error('Error obteniendo perfil:', error);
        next(error);
    }
};

// Actualizar perfil del usuario
const updateProfile = async (req, res, next) => {
    try {
        const { nombre, apellido, telefono } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Actualizar campos permitidos
        await user.update({
            nombre: nombre || user.nombre,
            apellido: apellido || user.apellido,
            telefono: telefono || user.telefono
        });

        // Obtener usuario actualizado con empresa
        const updatedUser = await User.findByPk(userId, {
            include: ['empresa'],
            attributes: { exclude: ['password'] }
        });

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                user: {
                    id: updatedUser.id,
                    nombre: updatedUser.nombre,
                    apellido: updatedUser.apellido,
                    email: updatedUser.email,
                    telefono: updatedUser.telefono,
                    rol: updatedUser.rol,
                    empresa: updatedUser.empresa
                }
            }
        });
    } catch (error) {
        logger.error('Error actualizando perfil:', error);
        next(error);
    }
};

// Cambiar contraseña
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isValidPassword = await user.validPassword(currentPassword);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Actualizar contraseña
        await user.update({ password: newPassword });

        logger.info(`Usuario ${user.email} cambió su contraseña`);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        logger.error('Error cambiando contraseña:', error);
        next(error);
    }
};

// Logout (opcional - para invalidar tokens en el lado del cliente)
const logout = async (req, res, next) => {
    try {
        // En un sistema más robusto, aquí podrías invalidar el token en una blacklist
        logger.info(`Usuario ${req.user.email} cerró sesión`);

        res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        logger.error('Error en logout:', error);
        next(error);
    }
};

module.exports = {
    login,
    register,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    logout
};
