const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

// Configuración del servicio de correo
const EMAIL_CONFIG = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

// Crear transporter de nodemailer
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        secure: EMAIL_CONFIG.secure,
        auth: EMAIL_CONFIG.auth,
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Enviar correo de factura emitida
 */
const enviarFacturaEmitida = async (factura, pdfBuffer, xmlContent) => {
    try {
        const transporter = createTransporter();

        // Leer plantilla HTML
        const templatePath = path.join(__dirname, '../templates/factura-emitida.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');

        // Reemplazar variables en la plantilla
        htmlTemplate = htmlTemplate
            .replace(/{{numero_factura}}/g, factura.numero_factura)
            .replace(/{{fecha_emision}}/g, new Date(factura.fecha_emision).toLocaleDateString('es-SV'))
            .replace(/{{cliente_nombre}}/g, factura.cliente.nombre)
            .replace(/{{cliente_nit}}/g, factura.cliente.nit || factura.cliente.dui || 'N/A')
            .replace(/{{total}}/g, parseFloat(factura.total).toFixed(2))
            .replace(/{{empresa_nombre}}/g, factura.empresa.nombre)
            .replace(/{{codigo_autorizacion}}/g, factura.codigo_autorizacion || 'N/A')
            .replace(/{{fecha_autorizacion}}/g, factura.fecha_autorizacion ? new Date(factura.fecha_autorizacion).toLocaleString('es-SV') : 'N/A');

        const mailOptions = {
            from: {
                name: factura.empresa.nombre,
                address: EMAIL_CONFIG.auth.user
            },
            to: factura.cliente.email,
            cc: factura.empresa.email, // Copia a la empresa
            subject: `Factura ${factura.numero_factura} - ${factura.empresa.nombre}`,
            html: htmlTemplate,
            attachments: [
                {
                    filename: `Factura_${factura.numero_factura}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                },
                {
                    filename: `DTE_${factura.numero_factura}.xml`,
                    content: xmlContent,
                    contentType: 'application/xml'
                }
            ]
        };

        const result = await transporter.sendMail(mailOptions);

        logger.info(`Correo enviado exitosamente para factura ${factura.numero_factura}`, {
            messageId: result.messageId,
            to: factura.cliente.email,
            cc: factura.empresa.email
        });

        return {
            success: true,
            messageId: result.messageId,
            message: 'Correo enviado exitosamente'
        };

    } catch (error) {
        logger.error('Error al enviar correo de factura:', error);
        throw new Error(`Error al enviar correo: ${error.message}`);
    }
};

/**
 * Enviar correo de factura anulada
 */
const enviarFacturaAnulada = async (factura, motivoAnulacion) => {
    try {
        const transporter = createTransporter();

        // Leer plantilla HTML
        const templatePath = path.join(__dirname, '../templates/factura-anulada.html');
        let htmlTemplate = await fs.readFile(templatePath, 'utf8');

        // Reemplazar variables en la plantilla
        htmlTemplate = htmlTemplate
            .replace(/{{numero_factura}}/g, factura.numero_factura)
            .replace(/{{fecha_anulacion}}/g, new Date().toLocaleDateString('es-SV'))
            .replace(/{{cliente_nombre}}/g, factura.cliente.nombre)
            .replace(/{{motivo_anulacion}}/g, motivoAnulacion)
            .replace(/{{empresa_nombre}}/g, factura.empresa.nombre);

        const mailOptions = {
            from: {
                name: factura.empresa.nombre,
                address: EMAIL_CONFIG.auth.user
            },
            to: factura.cliente.email,
            cc: factura.empresa.email,
            subject: `Factura ${factura.numero_factura} ANULADA - ${factura.empresa.nombre}`,
            html: htmlTemplate
        };

        const result = await transporter.sendMail(mailOptions);

        logger.info(`Correo de anulación enviado para factura ${factura.numero_factura}`, {
            messageId: result.messageId,
            to: factura.cliente.email
        });

        return {
            success: true,
            messageId: result.messageId,
            message: 'Correo de anulación enviado exitosamente'
        };

    } catch (error) {
        logger.error('Error al enviar correo de anulación:', error);
        throw new Error(`Error al enviar correo de anulación: ${error.message}`);
    }
};

/**
 * Enviar correo de prueba de configuración
 */
const enviarCorreoPrueba = async (emailDestino) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: {
                name: 'FactuSys - Sistema de Facturación',
                address: EMAIL_CONFIG.auth.user
            },
            to: emailDestino,
            subject: 'Prueba de Configuración - FactuSys',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">✅ Configuración de Correo Exitosa</h2>
                    <p>Este es un correo de prueba para verificar que la configuración del servicio de correo electrónico está funcionando correctamente.</p>
                    <p><strong>Sistema:</strong> FactuSys API</p>
                    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-SV')}</p>
                    <hr style="margin: 20px 0;">
                    <p style="color: #7f8c8d; font-size: 12px;">
                        Si recibiste este correo, la configuración del servicio de correo está funcionando correctamente.
                    </p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);

        logger.info('Correo de prueba enviado exitosamente', {
            messageId: result.messageId,
            to: emailDestino
        });

        return {
            success: true,
            messageId: result.messageId,
            message: 'Correo de prueba enviado exitosamente'
        };

    } catch (error) {
        logger.error('Error al enviar correo de prueba:', error);
        throw new Error(`Error al enviar correo de prueba: ${error.message}`);
    }
};

/**
 * Verificar configuración del servicio de correo
 */
const verificarConfiguracionCorreo = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();

        logger.info('Configuración de correo verificada exitosamente');
        return {
            success: true,
            message: 'Configuración de correo válida'
        };
    } catch (error) {
        logger.error('Error en configuración de correo:', error);
        return {
            success: false,
            message: `Error en configuración: ${error.message}`
        };
    }
};

module.exports = {
    enviarFacturaEmitida,
    enviarFacturaAnulada,
    enviarCorreoPrueba,
    verificarConfiguracionCorreo
};
