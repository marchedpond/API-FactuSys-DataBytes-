const { Builder } = require('xml2js');
const crypto = require('crypto');
const logger = require('../utils/logger');
const moment = require('moment');

// Configuración de Hacienda
const HACIENDA_CONFIG = {
    url: process.env.HACIENDA_URL || 'https://api.hacienda.gob.sv',
    token: process.env.HACIENDA_TOKEN || 'token_simulado_hacienda',
    environment: process.env.HACIENDA_ENVIRONMENT || 'test'
};

/**
 * Generar XML para factura según formato de Hacienda de El Salvador
 */
const generarXMLFactura = async (factura) => {
    try {
        const builder = new Builder({
            rootName: 'DTE',
            xmldec: { version: '1.0', encoding: 'UTF-8' },
            renderOpts: { pretty: true }
        });

        // Estructura XML según formato de Hacienda
        const xmlData = {
            $: {
                'xmlns': 'http://www.sat.gob.sv/face',
                'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                'xsi:schemaLocation': 'http://www.sat.gob.sv/face DTE.xsd'
            },
            'DatosGenerales': {
                $: {
                    'version': '1',
                    'ambiente': HACIENDA_CONFIG.environment,
                    'tipoDte': '01', // Factura
                    'codigoGeneracion': factura.numero_factura,
                    'tipoModelo': '1',
                    'tipoOperacion': '1',
                    'tipoContingencia': null,
                    'motivoContin': null,
                    'fecEmi': moment(factura.fecha_emision).format('YYYY-MM-DD'),
                    'horEmi': moment(factura.fecha_emision).format('HH:mm:ss'),
                    'tipoMoneda': 'USD'
                }
            },
            'DatosEmisor': {
                'nit': factura.empresa.nit,
                'nrc': factura.empresa.codigo_establecimiento || '00000000',
                'nombre': factura.empresa.nombre,
                'codActividad': factura.empresa.codigo_actividad || '00000',
                'descActividad': factura.empresa.actividad_economica,
                'nombreComercial': factura.empresa.nombre,
                'tipoEstablecimiento': '01',
                'direccion': {
                    'departamento': '06', // San Salvador
                    'municipio': '01',
                    'complemento': factura.empresa.direccion
                },
                'telefono': factura.empresa.telefono || '',
                'email': factura.empresa.email
            },
            'DatosReceptor': {
                'nit': factura.cliente.nit || '00000000-0',
                'nrc': factura.cliente.dui || '',
                'nombre': factura.cliente.tipo_cliente === 'persona_juridica'
                    ? factura.cliente.nombre
                    : `${factura.cliente.nombre} ${factura.cliente.apellido || ''}`.trim(),
                'codActividad': '00000',
                'descActividad': '',
                'direccion': {
                    'departamento': '06',
                    'municipio': '01',
                    'complemento': factura.cliente.direccion
                },
                'telefono': factura.cliente.telefono || '',
                'email': factura.cliente.email || ''
            },
            'OtrosDocumentos': null,
            'VentaTercero': null,
            'CuerpoDocumento': {
                'item': factura.detalles.map((detalle, index) => ({
                    $: {
                        'numItem': index + 1
                    },
                    'codigo': detalle.producto?.codigo || 'PROD001',
                    'codTributo': null,
                    'descripcion': detalle.producto?.nombre || 'Producto/Servicio',
                    'cantidad': detalle.cantidad,
                    'uniMedida': detalle.producto?.unidad_medida || 'UNI',
                    'precioUni': detalle.precio_unitario,
                    'montoDescu': detalle.descuento || 0,
                    'ventaNoSuj': 0,
                    'ventaExenta': factura.cliente.exento_impuestos ? (detalle.cantidad * detalle.precio_unitario - detalle.descuento) : 0,
                    'ventaGravada': factura.cliente.exento_impuestos ? 0 : (detalle.cantidad * detalle.precio_unitario - detalle.descuento),
                    'tributos': detalle.impuestos.map(imp => imp.impuesto.codigo).join(',') || '',
                    'psv': 0,
                    'noGravado': 0
                }))
            },
            'Resumen': {
                'totalNoSuj': 0,
                'totalExenta': factura.cliente.exento_impuestos ? factura.subtotal : 0,
                'totalGravada': factura.cliente.exento_impuestos ? 0 : factura.subtotal,
                'subTotalVentas': factura.subtotal,
                'descuNoSuj': 0,
                'descuExenta': 0,
                'descuGravada': factura.descuento_global || 0,
                'porcentajeDescuento': factura.descuento_global > 0 ?
                    ((factura.descuento_global / factura.subtotal) * 100).toFixed(2) : 0,
                'totalDescu': factura.descuento_global || 0,
                'tributos': factura.detalles.flatMap(d => d.impuestos).map(imp => ({
                    'codigo': imp.impuesto.codigo,
                    'descripcion': imp.impuesto.nombre,
                    'valor': imp.monto
                })),
                'subTotal': factura.subtotal,
                'ivaRete1': 0,
                'reteRenta': 0,
                'montoTotalOperacion': factura.total,
                'totalNoGravado': 0,
                'totalPagar': factura.total,
                'totalLetras': numeroALetras(factura.total),
                'totalIva': factura.total_impuestos,
                'saldoFavor': 0,
                'condicionOperacion': factura.metodo_pago === 'credito' ? '2' : '1',
                'pagos': {
                    'pago': [{
                        'codigo': factura.metodo_pago === 'credito' ? '02' : '01',
                        'montoPago': factura.total,
                        'referencia': factura.numero_factura,
                        'plazo': factura.metodo_pago === 'credito' ? '30' : null,
                        'periodo': factura.metodo_pago === 'credito' ? '30' : null
                    }]
                },
                'numPagoElectronico': null
            },
            'Extension': {
                'nombreEntrega': factura.cliente.nombre,
                'docuEntrega': factura.cliente.nit || factura.cliente.dui || '',
                'nomRecibe': factura.empresa.representante_legal,
                'docuRecibe': factura.empresa.nit,
                'observaciones': factura.observaciones || '',
                'placaVehiculo': null
            },
            'InformacionReferencia': null
        };

        const xml = builder.buildObject(xmlData);

        logger.info(`XML generado para factura ${factura.numero_factura}`);
        return xml;

    } catch (error) {
        logger.error('Error generando XML:', error);
        throw new Error('Error generando XML de la factura');
    }
};

/**
 * Firmar XML con certificado digital (simulado)
 */
const firmarXML = (xml) => {
    try {
        // En un entorno real, aquí se usaría un certificado digital
        // Por ahora simulamos la firma
        const hash = crypto.createHash('sha256').update(xml).digest('hex');
        const firma = crypto.createHmac('sha256', 'clave_simulada').update(hash).digest('base64');

        logger.info('XML firmado exitosamente');

        return {
            xmlFirmado: xml,
            firma,
            hash
        };
    } catch (error) {
        logger.error('Error firmando XML:', error);
        throw new Error('Error firmando XML');
    }
};

/**
 * Enviar factura a Hacienda (simulado)
 */
const enviarAHacienda = async (xml, factura) => {
    try {
        // Validar datos antes de enviar
        const erroresValidacion = validarDatosHacienda(factura);
        if (erroresValidacion.length > 0) {
            logger.warn(`Errores de validación para factura ${factura.numero_factura}:`, erroresValidacion);
            return {
                codigoRespuesta: '400',
                descripcionRespuesta: 'Error de validación en los datos',
                codigoAutorizacion: null,
                fechaAutorizacion: null,
                errores: erroresValidacion
            };
        }

        // Simular respuesta de Hacienda con diferentes escenarios
        const respuesta = simularRespuestaHacienda(xml, factura);

        if (respuesta.codigoRespuesta === '200') {
            logger.info(`Factura ${factura.numero_factura} enviada a Hacienda exitosamente. Código: ${respuesta.codigoAutorizacion}`);
        } else {
            logger.warn(`Error al enviar factura ${factura.numero_factura} a Hacienda:`, respuesta);
        }

        return respuesta;
    } catch (error) {
        logger.error('Error enviando a Hacienda:', error);

        // En caso de error, devolver respuesta de error simulada
        return {
            codigoRespuesta: '500',
            descripcionRespuesta: 'Error interno del servidor de Hacienda',
            codigoAutorizacion: null,
            fechaAutorizacion: null,
            error: error.message
        };
    }
};

/**
 * Consultar estado de factura en Hacienda (simulado)
 */
const consultarEstadoFactura = async (codigoAutorizacion) => {
    try {
        // Simular consulta a Hacienda
        const estado = Math.random() > 0.1 ? 'AUTORIZADO' : 'RECHAZADO';

        const respuesta = {
            codigoRespuesta: estado === 'AUTORIZADO' ? '200' : '400',
            descripcionRespuesta: estado === 'AUTORIZADO'
                ? 'Documento autorizado'
                : 'Documento rechazado',
            estado,
            fechaConsulta: new Date().toISOString()
        };

        logger.info(`Estado de factura ${codigoAutorizacion}: ${estado}`);

        return respuesta;
    } catch (error) {
        logger.error('Error consultando estado:', error);
        throw new Error('Error consultando estado de la factura');
    }
};

/**
 * Convertir número a letras (función auxiliar)
 */
const numeroALetras = (numero) => {
    const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];

    const entero = Math.floor(numero);
    const decimal = Math.round((numero - entero) * 100);

    if (entero === 0) return 'cero dólares';
    if (entero === 1) return 'un dólar';
    if (entero < 10) return `${unidades[entero]} dólares`;
    if (entero < 20) return `${especiales[entero - 10]} dólares`;
    if (entero < 100) {
        const decena = Math.floor(entero / 10);
        const unidad = entero % 10;
        return `${decenas[decena]}${unidad > 0 ? ' y ' + unidades[unidad] : ''} dólares`;
    }

    return `${entero} dólares`;
};

/**
 * Validar estructura de datos para Hacienda
 */
const validarDatosHacienda = (factura) => {
    const errores = [];

    // Validaciones de empresa
    if (!factura.empresa) {
        errores.push('Datos de empresa requeridos');
    } else {
        if (!factura.empresa.nit || factura.empresa.nit.length < 10) {
            errores.push('NIT de la empresa inválido (mínimo 10 caracteres)');
        }

        if (!factura.empresa.nombre || factura.empresa.nombre.trim().length < 3) {
            errores.push('Nombre de empresa requerido (mínimo 3 caracteres)');
        }

        if (!factura.empresa.direccion || factura.empresa.direccion.trim().length < 10) {
            errores.push('Dirección de empresa requerida (mínimo 10 caracteres)');
        }

        if (!factura.empresa.email || !validarEmail(factura.empresa.email)) {
            errores.push('Email de empresa inválido');
        }

        if (!factura.empresa.telefono || factura.empresa.telefono.length < 8) {
            errores.push('Teléfono de empresa requerido (mínimo 8 dígitos)');
        }
    }

    // Validaciones de cliente
    if (!factura.cliente) {
        errores.push('Datos de cliente requeridos');
    } else {
        if (!factura.cliente.nit && !factura.cliente.dui) {
            errores.push('Cliente debe tener NIT o DUI');
        }

        if (factura.cliente.nit && factura.cliente.nit.length < 10) {
            errores.push('NIT de cliente inválido (mínimo 10 caracteres)');
        }

        if (factura.cliente.dui && !validarDUI(factura.cliente.dui)) {
            errores.push('DUI de cliente inválido');
        }

        if (!factura.cliente.nombre || factura.cliente.nombre.trim().length < 2) {
            errores.push('Nombre de cliente requerido (mínimo 2 caracteres)');
        }

        if (!factura.cliente.direccion || factura.cliente.direccion.trim().length < 10) {
            errores.push('Dirección de cliente requerida (mínimo 10 caracteres)');
        }

        if (factura.cliente.email && !validarEmail(factura.cliente.email)) {
            errores.push('Email de cliente inválido');
        }
    }

    // Validaciones de factura
    if (!factura.numero_factura || factura.numero_factura.trim().length < 3) {
        errores.push('Número de factura requerido (mínimo 3 caracteres)');
    }

    if (!factura.fecha_emision) {
        errores.push('Fecha de emisión requerida');
    } else {
        const fechaEmision = new Date(factura.fecha_emision);
        const hoy = new Date();
        const haceUnMes = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));

        if (fechaEmision > hoy) {
            errores.push('La fecha de emisión no puede ser futura');
        }

        if (fechaEmision < haceUnMes) {
            errores.push('La fecha de emisión no puede ser anterior a un mes');
        }
    }

    if (!factura.metodo_pago) {
        errores.push('Método de pago requerido');
    }

    // Validaciones de detalles
    if (!factura.detalles || factura.detalles.length === 0) {
        errores.push('La factura debe tener al menos un detalle');
    } else {
        factura.detalles.forEach((detalle, index) => {
            if (!detalle.producto) {
                errores.push(`Detalle ${index + 1}: Producto requerido`);
            } else {
                if (!detalle.producto.codigo || detalle.producto.codigo.trim().length < 2) {
                    errores.push(`Detalle ${index + 1}: Código de producto requerido`);
                }

                if (!detalle.producto.nombre || detalle.producto.nombre.trim().length < 2) {
                    errores.push(`Detalle ${index + 1}: Nombre de producto requerido`);
                }
            }

            if (!detalle.cantidad || detalle.cantidad <= 0) {
                errores.push(`Detalle ${index + 1}: Cantidad debe ser mayor a 0`);
            }

            if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
                errores.push(`Detalle ${index + 1}: Precio unitario debe ser mayor a 0`);
            }

            if (!detalle.impuestos || detalle.impuestos.length === 0) {
                errores.push(`Detalle ${index + 1}: Al menos un impuesto requerido`);
            }
        });
    }

    // Validaciones de totales
    if (!factura.subtotal || factura.subtotal <= 0) {
        errores.push('Subtotal debe ser mayor a 0');
    }

    if (factura.total_impuestos < 0) {
        errores.push('Total de impuestos no puede ser negativo');
    }

    if (!factura.total || factura.total <= 0) {
        errores.push('Total debe ser mayor a 0');
    }

    // Validar que los totales coincidan
    const subtotalCalculado = factura.detalles.reduce((sum, detalle) =>
        sum + (parseFloat(detalle.cantidad) * parseFloat(detalle.precio_unitario)), 0);

    if (Math.abs(parseFloat(factura.subtotal) - subtotalCalculado) > 0.01) {
        errores.push('El subtotal no coincide con la suma de los detalles');
    }

    return errores;
};

/**
 * Validar formato de email
 */
const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validar formato de DUI
 */
const validarDUI = (dui) => {
    const duiRegex = /^\d{8}-\d{1}$/;
    if (!duiRegex.test(dui)) return false;

    const numeros = dui.replace('-', '');
    const digitoVerificador = parseInt(numeros[8]);
    const suma = numeros.slice(0, 8).split('').reduce((sum, num, index) => {
        return sum + (parseInt(num) * (9 - index));
    }, 0);

    const resto = suma % 10;
    const verificadorCalculado = resto === 0 ? 0 : 10 - resto;

    return digitoVerificador === verificadorCalculado;
};

/**
 * Validar formato de NIT
 */
const validarNIT = (nit) => {
    const nitRegex = /^\d{4}-\d{6}-\d{3}-\d{1}$/;
    if (!nitRegex.test(nit)) return false;

    const numeros = nit.replace(/-/g, '');
    const digitoVerificador = parseInt(numeros[13]);
    const suma = numeros.slice(0, 13).split('').reduce((sum, num, index) => {
        return sum + (parseInt(num) * (14 - index));
    }, 0);

    const resto = suma % 11;
    const verificadorCalculado = resto <= 1 ? resto : 11 - resto;

    return digitoVerificador === verificadorCalculado;
};

/**
 * Validar configuración de Hacienda
 */
const validarConfiguracionHacienda = () => {
    const errores = [];

    if (!HACIENDA_CONFIG.url) {
        errores.push('URL de Hacienda no configurada');
    }

    if (!HACIENDA_CONFIG.token) {
        errores.push('Token de Hacienda no configurado');
    }

    if (!HACIENDA_CONFIG.environment) {
        errores.push('Ambiente de Hacienda no configurado');
    }

    if (!['test', 'production'].includes(HACIENDA_CONFIG.environment)) {
        errores.push('Ambiente de Hacienda debe ser "test" o "production"');
    }

    return errores;
};

/**
 * Generar código de autorización simulado
 */
const generarCodigoAutorizacion = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `A${timestamp}${random}`;
};

/**
 * Simular respuesta de Hacienda con diferentes escenarios
 */
const simularRespuestaHacienda = (xml, factura) => {
    const erroresConfiguracion = validarConfiguracionHacienda();
    if (erroresConfiguracion.length > 0) {
        return {
            codigoRespuesta: '500',
            descripcionRespuesta: 'Error de configuración: ' + erroresConfiguracion.join(', '),
            codigoAutorizacion: null,
            fechaAutorizacion: null,
            error: 'Configuración inválida'
        };
    }

    // Simular diferentes tipos de respuesta basado en probabilidades
    const probabilidad = Math.random();

    if (probabilidad < 0.85) {
        // 85% de éxito
        const firmaResult = firmarXML(xml);
        return {
            codigoRespuesta: '200',
            descripcionRespuesta: 'Transacción procesada exitosamente',
            codigoAutorizacion: generarCodigoAutorizacion(),
            fechaAutorizacion: new Date().toISOString(),
            numeroControl: `NC${Date.now()}`,
            ambiente: HACIENDA_CONFIG.environment,
            xmlFirmado: firmaResult.xmlFirmado,
            firma: firmaResult.firma,
            hash: firmaResult.hash,
            detalles: {
                tipoDocumento: '01',
                serie: factura.serie || 'A',
                numero: factura.numero_factura,
                fechaEmision: moment(factura.fecha_emision).format('YYYY-MM-DD'),
                horaEmision: moment(factura.fecha_emision).format('HH:mm:ss'),
                montoTotal: factura.total
            }
        };
    } else if (probabilidad < 0.95) {
        // 10% de error de validación
        return {
            codigoRespuesta: '400',
            descripcionRespuesta: 'Error de validación en los datos enviados',
            codigoAutorizacion: null,
            fechaAutorizacion: null,
            errores: [
                'Formato de NIT inválido',
                'Fecha de emisión fuera del rango permitido'
            ]
        };
    } else {
        // 5% de error del servidor
        return {
            codigoRespuesta: '500',
            descripcionRespuesta: 'Error interno del servidor de Hacienda',
            codigoAutorizacion: null,
            fechaAutorizacion: null,
            error: 'Servicio temporalmente no disponible'
        };
    }
};

module.exports = {
    generarXMLFactura,
    firmarXML,
    enviarAHacienda,
    consultarEstadoFactura,
    validarDatosHacienda,
    validarEmail,
    validarDUI,
    validarNIT,
    validarConfiguracionHacienda,
    generarCodigoAutorizacion,
    simularRespuestaHacienda
};
