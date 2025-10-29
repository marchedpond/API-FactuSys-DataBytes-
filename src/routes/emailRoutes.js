const express = require('express');
const { enviarCorreoPrueba, verificarConfiguracionCorreo } = require('../services/emailService');
const { authenticate, authorize } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @swagger
 * /api/email/test:
 *   post:
 *     summary: Enviar correo de prueba
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: test@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Correo de prueba enviado exitosamente
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
 *                   example: Correo de prueba enviado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       example: <message-id@example.com>
 *       400:
 *         description: Error en la solicitud
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.post('/test', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const resultado = await enviarCorreoPrueba(email);

        res.status(200).json({
            success: true,
            message: 'Correo de prueba enviado exitosamente',
            data: {
                messageId: resultado.messageId,
                destinatario: email
            }
        });

    } catch (error) {
        logger.error('Error enviando correo de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando correo de prueba',
            error: error.message
        });
    }
});

/**
 * @swagger
 * /api/email/verify:
 *   get:
 *     summary: Verificar configuración de correo
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración verificada
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
 *                   example: Configuración de correo válida
 *                 data:
 *                   type: object
 *                   properties:
 *                     configuracionValida:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/verify', authenticate, authorize('admin'), async (req, res) => {
    try {
        const resultado = await verificarConfiguracionCorreo();

        res.status(200).json({
            success: true,
            message: resultado.message,
            data: {
                configuracionValida: resultado.success
            }
        });

    } catch (error) {
        logger.error('Error verificando configuración de correo:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando configuración de correo',
            error: error.message
        });
    }
});

module.exports = router;
