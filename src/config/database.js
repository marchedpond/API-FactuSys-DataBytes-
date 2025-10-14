const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Proveer valores por defecto para evitar que Sequelize lance errores
const DB_NAME = process.env.DB_NAME || 'factusys_db';
const DB_USERNAME = process.env.DB_USERNAME || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || '1234';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;
const DB_DIALECT = process.env.DB_DIALECT || 'postgres';

const sequelize = new Sequelize(
    DB_NAME,
    DB_USERNAME,
    DB_PASSWORD,
    {
        host: DB_HOST,
        port: DB_PORT,
        dialect: DB_DIALECT,
        logging: process.env.NODE_ENV === 'development' ?
            (msg) => logger.debug(msg) : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            paranoid: true // Soft deletes
        }
    }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Conexión a la base de datos establecida correctamente');
    } catch (error) {
        logger.error('Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

module.exports = {
    sequelize,
    testConnection
};
