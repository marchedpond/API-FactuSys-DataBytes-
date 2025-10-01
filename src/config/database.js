const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
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
