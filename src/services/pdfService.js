const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const moment = require('moment');

// Helpers de Handlebars usados en las plantillas
handlebars.registerHelper('eq', function (a, b) { return a === b; });

/**
 * Generar PDF de factura usando Puppeteer
 */
const generarPDFFactura = async (factura) => {
    try {
        // Leer plantilla HTML
        const templatePath = path.join(__dirname, '../templates/factura-pdf.html');
        const htmlTemplate = await fs.readFile(templatePath, 'utf8');

        // Compilar plantilla Handlebars
        const template = handlebars.compile(htmlTemplate);

        // Preparar datos para la plantilla
        const safe = (n, def = 0) => isNaN(parseFloat(n)) ? def : parseFloat(n);
        const templateData = {
            factura: {
                numero_factura: factura.numero_factura,
                serie: factura.serie,
                fecha_emision: moment(factura.fecha_emision).format('DD/MM/YYYY'),
                fecha_vencimiento: factura.fecha_vencimiento ? moment(factura.fecha_vencimiento).format('DD/MM/YYYY') : null,
                tipo_documento: factura.tipo_documento,
                estado: factura.estado,
                metodo_pago: factura.metodo_pago,
                observaciones: factura.observaciones,
                subtotal: safe(factura.subtotal).toFixed(2),
                total_impuestos: safe(factura.total_impuestos).toFixed(2),
                total: safe(factura.total).toFixed(2),
                codigo_autorizacion: factura.codigo_autorizacion,
                fecha_autorizacion: factura.fecha_autorizacion ? moment(factura.fecha_autorizacion).format('DD/MM/YYYY HH:mm:ss') : null
            },
            empresa: {
                nombre: factura.empresa?.nombre,
                nit: factura.empresa?.nit,
                direccion: factura.empresa?.direccion,
                telefono: factura.empresa?.telefono,
                email: factura.empresa?.email,
                representante_legal: factura.empresa.representante_legal,
                actividad_economica: factura.empresa.actividad_economica,
                regimen_tributario: factura.empresa.regimen_tributario,
                codigo_establecimiento: factura.empresa.codigo_establecimiento,
                codigo_punto_venta: factura.empresa.codigo_punto_venta,
                codigo_actividad: factura.empresa.codigo_actividad
            },
            cliente: {
                nombre: factura.cliente?.nombre,
                apellido: factura.cliente?.apellido,
                nit: factura.cliente?.nit,
                dui: factura.cliente?.dui,
                direccion: factura.cliente?.direccion,
                telefono: factura.cliente?.telefono,
                email: factura.cliente?.email,
                tipo_cliente: factura.cliente?.tipo_cliente
            },
            detalles: (factura.detalles || []).map(detalle => ({
                producto: {
                    codigo: detalle.producto?.codigo,
                    nombre: detalle.producto?.nombre,
                    descripcion: detalle.producto?.descripcion
                },
                cantidad: safe(detalle.cantidad, 1).toFixed(2),
                precio_unitario: safe(detalle.precio_unitario).toFixed(2),
                subtotal: safe(detalle.subtotal, (detalle.cantidad || 0) * (detalle.precio_unitario || 0)).toFixed(2),
                total_impuestos: safe(detalle.total_impuestos).toFixed(2),
                total: safe(detalle.total, safe(detalle.subtotal) + safe(detalle.total_impuestos)).toFixed(2),
                impuestos: (detalle.impuestos || []).map(imp => ({
                    nombre: imp.impuesto?.nombre,
                    codigo: imp.impuesto?.codigo,
                    porcentaje: safe(imp.porcentaje).toFixed(2),
                    base_imponible: safe(imp.base_imponible).toFixed(2),
                    monto: safe(imp.monto).toFixed(2)
                }))
            })),
            fecha_generacion: moment().format('DD/MM/YYYY HH:mm:ss')
        };

        // Generar HTML final
        const htmlFinal = template(templateData);

        // Configurar Puppeteer
        const launchOptions = {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-zygote',
                '--single-process',
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-extensions',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--mute-audio',
                '--remote-debugging-port=0'
            ]
        };
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }
        const browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();
        await page.emulateMediaType('screen');
        // Cargar HTML usando data URL (más estable en algunos entornos)
        const dataUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlFinal);
        await page.goto(dataUrl, { waitUntil: 'load' });
        try {
            if (page.evaluateHandle) {
                await page.evaluateHandle('document.fonts.ready');
            }
        } catch (_) { }
        await page.waitForTimeout(300);

        // Generar PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                    <span>FactuSys - Sistema de Facturación</span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
                </div>
            `
        });

        await browser.close();

        logger.info(`PDF generado exitosamente para factura ${factura.numero_factura}`, {
            factura_id: factura.id,
            tamaño_bytes: pdfBuffer.length
        });

        return Buffer.from(pdfBuffer);

    } catch (error) {
        logger.error('Error al generar PDF de factura:', error);
        throw new Error(`Error al generar PDF: ${error.message}`);
    }
};

/**
 * Generar PDF de reporte de facturas
 */
const generarPDFReporteFacturas = async (facturas, filtros = {}) => {
    try {
        // Leer plantilla HTML
        const templatePath = path.join(__dirname, '../templates/reporte-facturas.html');
        const htmlTemplate = await fs.readFile(templatePath, 'utf8');

        // Compilar plantilla Handlebars
        const template = handlebars.compile(htmlTemplate);

        // Preparar datos para la plantilla
        const templateData = {
            facturas: facturas.map(factura => ({
                numero_factura: factura.numero_factura,
                fecha_emision: moment(factura.fecha_emision).format('DD/MM/YYYY'),
                cliente_nombre: factura.cliente.nombre,
                cliente_nit: factura.cliente.nit || factura.cliente.dui || 'N/A',
                estado: factura.estado,
                total: parseFloat(factura.total).toFixed(2),
                metodo_pago: factura.metodo_pago
            })),
            filtros: {
                fecha_desde: filtros.fecha_desde ? moment(filtros.fecha_desde).format('DD/MM/YYYY') : null,
                fecha_hasta: filtros.fecha_hasta ? moment(filtros.fecha_hasta).format('DD/MM/YYYY') : null,
                estado: filtros.estado || null,
                cliente: filtros.cliente || null
            },
            total_facturas: facturas.length,
            total_monto: facturas.reduce((sum, f) => sum + parseFloat(f.total), 0).toFixed(2),
            fecha_generacion: moment().format('DD/MM/YYYY HH:mm:ss'),
            empresa: facturas[0]?.empresa || {}
        };

        // Generar HTML final
        const htmlFinal = template(templateData);

        // Configurar Puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Establecer contenido HTML
        await page.setContent(htmlFinal, {
            waitUntil: 'networkidle0'
        });

        // Generar PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                    <span>FactuSys - Reporte de Facturas</span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; color: #666; text-align: center; width: 100%;">
                    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
                </div>
            `
        });

        await browser.close();

        logger.info(`PDF de reporte generado exitosamente`, {
            total_facturas: facturas.length,
            tamaño_bytes: pdfBuffer.length
        });

        return pdfBuffer;

    } catch (error) {
        logger.error('Error al generar PDF de reporte:', error);
        throw new Error(`Error al generar PDF de reporte: ${error.message}`);
    }
};

module.exports = {
    generarPDFFactura,
    generarPDFReporteFacturas
};
