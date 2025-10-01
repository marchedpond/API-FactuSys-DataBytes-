const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    tipo_cliente: {
        type: DataTypes.ENUM('persona_natural', 'persona_juridica'),
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 200]
        }
    },
    apellido: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    nit: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            len: [10, 20]
        }
    },
    dui: {
        type: DataTypes.STRING(15),
        allowNull: true,
        unique: true
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
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    limite_credito: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    saldo_actual: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0.00
    },
    dias_credito: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    exento_impuestos: {
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
    tableName: 'clientes',
    hooks: {
        beforeCreate: async (cliente) => {
            if (!cliente.codigo) {
                const count = await Cliente.count();
                cliente.codigo = `CLI${String(count + 1).padStart(6, '0')}`;
            }
        }
    }
});

module.exports = Cliente;
