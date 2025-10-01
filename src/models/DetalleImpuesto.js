const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleImpuesto = sequelize.define('DetalleImpuesto', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    base_imponible: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
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
    monto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    detalle_factura_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'DetalleFacturas',
            key: 'id'
        }
    },
    impuesto_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Impuestos',
            key: 'id'
        }
    }
}, {
    tableName: 'detalles_impuesto',
    hooks: {
        beforeCreate: async (detalle) => {
            detalle.monto = (detalle.base_imponible * detalle.porcentaje) / 100;
        },
        beforeUpdate: async (detalle) => {
            if (detalle.changed(['base_imponible', 'porcentaje'])) {
                detalle.monto = (detalle.base_imponible * detalle.porcentaje) / 100;
            }
        }
    }
});

module.exports = DetalleImpuesto;
