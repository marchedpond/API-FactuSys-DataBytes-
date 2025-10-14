const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const db = require('./models'); // Sequelize

const app = express();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.'
});

app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api', routes);

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Solo iniciar el servidor y conectar la BD si no estamos en entorno de test
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, async () => {
        try {
            await db.sequelize.authenticate();

            const [results] = await db.sequelize.query(`
                SELECT COUNT(*) AS total
                FROM information_schema.tables
                WHERE table_schema = 'public'
            `);
            const totalTablas = results[0].total;

            console.log("=======================================");
            console.log("📡 FactuSys API Iniciada");
            console.log(`📍 Puerto:        ${PORT}`);
            console.log(`🌍 Ambiente:      ${process.env.NODE_ENV || 'development'}`);
            console.log(`🕒 Inicio:        ${new Date().toLocaleString()}`);
            console.log("---------------------------------------");
            console.log("📂 Base de datos:");
            console.log(`   Nombre: ${process.env.DB_NAME}`);
            console.log(`   Host:   ${process.env.DB_HOST}`);
            console.log("   ✔ Conectada correctamente");
            console.log(`   Tablas cargadas: ${totalTablas}`);
            console.log("---------------------------------------");
            console.log("📡 Rutas principales:");
            console.log("   /api/auth      → Autenticación");
            console.log("   /api/empresas  → Gestión de empresas");
            console.log("   /api/clientes  → Gestión de clientes");
            console.log("   /api/productos → Gestión de productos");
            console.log("   /api/facturas  → Gestión de facturas");
            console.log("   /api/docs      → Swagger Docs");
            console.log("=======================================");
        } catch (error) {
            console.log("=======================================");
            console.log("❌ Error al conectar la base de datos");
            console.log(error.message);
            console.log("=======================================");
        }
    });
}

module.exports = app;
