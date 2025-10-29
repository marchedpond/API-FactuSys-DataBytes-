/**
 * Middleware para permitir que una ruta solo sea accesible directamente desde la API
 * (no desde el frontend mediante navegador)
 * Para entornos de pruebas, permite el registro solo desde llamadas directas a la API
 */
const apiOnly = (req, res, next) => {
    // Permitir si viene con un header especial X-API-Internal
    // o si no viene del frontend (sin Origin o con Origin diferente al frontend esperado)
    const apiInternalHeader = req.headers['x-api-internal'];
    const origin = req.headers.origin;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Si tiene el header especial, permitir (llamada directa a la API)
    if (apiInternalHeader === 'true') {
        return next();
    }

    // Si no tiene origin, es probablemente una llamada directa desde Postman, curl, etc.
    if (!origin) {
        return next();
    }

    // Si tiene origin pero es diferente al frontend esperado (probablemente desde otro servicio o API)
    if (origin && !origin.includes(frontendUrl.replace('http://', '').replace('https://', '').split(':')[0])) {
        return next();
    }

    // Bloquear si viene del frontend
    return res.status(403).json({
        success: false,
        message: 'Esta ruta solo está disponible desde la API directamente. Use herramientas como Postman o curl para acceder.'
    });
};

module.exports = { apiOnly };
