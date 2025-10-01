const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Impuesto = sequelize.define('Impuesto', {
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
    codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    porcentaje: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 100
        }
    },
    tipo_impuesto: {
        type: DataTypes.ENUM('iva', 'isc', 'consumo', 'municipal'),
        allowNull: false
    },
    aplicable_por_defecto: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    activo: {
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
    tableName: 'impuestos'
});

module.exports = Impuesto;
