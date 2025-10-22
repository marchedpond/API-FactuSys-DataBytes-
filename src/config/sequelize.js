const { Sequelize } = require('sequelize');
const config = require('./database');

// Obtener el ambiente actual
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Crear instancia de Sequelize
const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig
);

module.exports = { sequelize, Sequelize };
