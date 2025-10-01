const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true
        }
    },
    codigo_barras: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 200]
        }
    },
    descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    precio_venta: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    precio_compra: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    costo_unitario: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    stock_actual: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    stock_minimo: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    unidad_medida: {
        type: DataTypes.ENUM('unidad', 'kg', 'lb', 'litro', 'metro', 'm2', 'm3'),
        defaultValue: 'unidad'
    },
    tipo_producto: {
        type: DataTypes.ENUM('producto', 'servicio'),
        defaultValue: 'producto'
    },
    exento_impuestos: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    imagen_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    categoria_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Categorias',
            key: 'id'
        }
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
    tableName: 'productos'
});

module.exports = Producto;
