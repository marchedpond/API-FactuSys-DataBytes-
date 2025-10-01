const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pago = sequelize.define('Pago', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    monto: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },
    fecha_pago: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    metodo_pago: {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque', 'credito'),
        allowNull: false
    },
    referencia: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    banco: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    numero_cheque: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    observaciones: {
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
    usuario_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'pagos'
});

module.exports = Pago;
