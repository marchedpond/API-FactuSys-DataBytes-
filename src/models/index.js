const { sequelize } = require('../config/database');

// Importar todos los modelos
const User = require('./User');
const Empresa = require('./Empresa');
const Cliente = require('./Cliente');
const Categoria = require('./Categoria');
const Producto = require('./Producto');
const Impuesto = require('./Impuesto');
const Factura = require('./Factura');
const DetalleFactura = require('./DetalleFactura');
const DetalleImpuesto = require('./DetalleImpuesto');
const Pago = require('./Pago');

// Definir las relaciones

// Relaciones de Empresa
Empresa.hasMany(User, { foreignKey: 'empresa_id', as: 'usuarios' });
Empresa.hasMany(Cliente, { foreignKey: 'empresa_id', as: 'clientes' });
Empresa.hasMany(Categoria, { foreignKey: 'empresa_id', as: 'categorias' });
Empresa.hasMany(Producto, { foreignKey: 'empresa_id', as: 'productos' });
Empresa.hasMany(Impuesto, { foreignKey: 'empresa_id', as: 'impuestos' });
Empresa.hasMany(Factura, { foreignKey: 'empresa_id', as: 'facturas' });

User.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Cliente.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Categoria.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Impuesto.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Factura.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });

// Relaciones de Categoria
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// Relaciones de Cliente
Cliente.hasMany(Factura, { foreignKey: 'cliente_id', as: 'facturas' });
Factura.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Relaciones de Usuario
User.hasMany(Factura, { foreignKey: 'usuario_id', as: 'facturas' });
User.hasMany(Pago, { foreignKey: 'usuario_id', as: 'pagos' });
Factura.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
Pago.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Relaciones de Factura
Factura.hasMany(DetalleFactura, { foreignKey: 'factura_id', as: 'detalles' });
Factura.hasMany(Pago, { foreignKey: 'factura_id', as: 'pagos' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'factura_id', as: 'factura' });
Pago.belongsTo(Factura, { foreignKey: 'factura_id', as: 'factura' });

// Relaciones de Producto
Producto.hasMany(DetalleFactura, { foreignKey: 'producto_id', as: 'detalles_factura' });
DetalleFactura.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// Relaciones de Impuesto
Impuesto.hasMany(DetalleImpuesto, { foreignKey: 'impuesto_id', as: 'detalles' });
DetalleImpuesto.belongsTo(Impuesto, { foreignKey: 'impuesto_id', as: 'impuesto' });

// Relaciones de DetalleFactura
DetalleFactura.hasMany(DetalleImpuesto, { foreignKey: 'detalle_factura_id', as: 'impuestos' });
DetalleImpuesto.belongsTo(DetalleFactura, { foreignKey: 'detalle_factura_id', as: 'detalle_factura' });

// Sincronizar la base de datos
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Base de datos sincronizada correctamente');
    } catch (error) {
        console.error('Error al sincronizar la base de datos:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    User,
    Empresa,
    Cliente,
    Categoria,
    Producto,
    Impuesto,
    Factura,
    DetalleFactura,
    DetalleImpuesto,
    Pago,
    syncDatabase
};
