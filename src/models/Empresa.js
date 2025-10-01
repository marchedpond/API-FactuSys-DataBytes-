const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Empresa = sequelize.define('Empresa', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 200]
        }
    },
    nit: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [10, 20]
        }
    },
    direccion: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    telefono: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    representante_legal: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    actividad_economica: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    regimen_tributario: {
        type: DataTypes.ENUM('general', 'simplificado', 'pequeno_contribuyente'),
        defaultValue: 'general'
    },
    codigo_establecimiento: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    codigo_punto_venta: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    codigo_actividad: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    activa: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'empresas'
});

module.exports = Empresa;
