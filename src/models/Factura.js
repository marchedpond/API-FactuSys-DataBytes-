const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize');

const Factura = sequelize.define('Factura', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    numero_factura: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    serie: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    tipo_documento: {
        type: DataTypes.ENUM('factura', 'credito_fiscal', 'nota_credito', 'nota_debito'),
        defaultValue: 'factura'
    },
    fecha_emision: {
        type: DataTypes.DATE,
        allowNull: false
    },
    fecha_vencimiento: {
        type: DataTypes.DATE,
        allowNull: true
    },
    fecha_pago: {
        type: DataTypes.DATE,
        allowNull: true
    },
    estado: {
        type: DataTypes.ENUM('borrador', 'emitida', 'anulada', 'pagada', 'vencida'),
        defaultValue: 'borrador'
    },
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0.00,
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
    descuento_global: {
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
        defaultValue: 0.00,
        validate: {
            min: 0
        }
    },
    metodo_pago: {
        type: DataTypes.ENUM('efectivo', 'tarjeta', 'transferencia', 'cheque', 'credito'),
        allowNull: false
    },
    observaciones: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    xml_generado: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    xml_firmado: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    respuesta_hacienda: {
        type: DataTypes.JSON,
        allowNull: true
    },
    codigo_autorizacion: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    fecha_autorizacion: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cliente_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Clientes',
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
    tableName: 'facturas',
    hooks: {
        beforeValidate: async (factura) => {
            if (!factura.serie || (typeof factura.serie === 'string' && factura.serie.trim() === '')) {
                factura.serie = 'A';
            }
            if (!factura.numero_factura || (typeof factura.numero_factura === 'string' && factura.numero_factura.trim() === '')) {
                const ts = Date.now().toString().slice(-6);
                const count = await Factura.count().catch(() => 0);
                factura.numero_factura = `FAC-${String(count + 1).padStart(6, '0')}-${ts}`;
            }
        }
    }
});

module.exports = Factura;
