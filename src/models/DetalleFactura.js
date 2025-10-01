const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DetalleFactura = sequelize.define('DetalleFactura', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    cantidad: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    precio_unitario: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    descuento: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    total_impuestos: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    descripcion_adicional: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    factura_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Facturas',
            key: 'id'
        }
    },
    producto_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Productos',
            key: 'id'
        }
    }
}, {
    tableName: 'detalles_factura',
    hooks: {
        beforeCreate: async (detalle) => {
            // Calcular subtotal
            detalle.subtotal = (detalle.cantidad * detalle.precio_unitario) - detalle.descuento;
            detalle.total = detalle.subtotal + detalle.total_impuestos;
        },
        beforeUpdate: async (detalle) => {
            if (detalle.changed(['cantidad', 'precio_unitario', 'descuento', 'total_impuestos'])) {
                detalle.subtotal = (detalle.cantidad * detalle.precio_unitario) - detalle.descuento;
                detalle.total = detalle.subtotal + detalle.total_impuestos;
            }
        }
    }
});

module.exports = DetalleFactura;
