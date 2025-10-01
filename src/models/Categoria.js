const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    empresa_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Empresas',
            key: 'id'
        }
    }
}, {
    tableName: 'categorias'
});

module.exports = Categoria;
