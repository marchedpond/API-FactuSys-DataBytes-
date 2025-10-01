const { v4: uuidv4 } = require('uuid');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Crear empresa de ejemplo
        const empresaId = uuidv4();
        await queryInterface.bulkInsert('Empresas', [{
            id: empresaId,
            nombre: 'Mi Empresa S.A. de C.V.',
            nit: '0614-123456-123-4',
            direccion: 'San Salvador, El Salvador',
            telefono: '+503 2222-2222',
            email: 'info@miempresa.com',
            representante_legal: 'Juan Pérez',
            actividad_economica: 'Comercio al por menor',
            regimen_tributario: 'general',
            codigo_establecimiento: '00000001',
            codigo_punto_venta: '00001',
            codigo_actividad: '47110',
            activa: true,
            created_at: new Date(),
            updated_at: new Date()
        }]);

        // Crear usuario administrador
        const bcrypt = require('bcryptjs');
        const adminId = uuidv4();
        const hashedPassword = await bcrypt.hash('admin123', 12);

        await queryInterface.bulkInsert('Usuarios', [{
            id: adminId,
            nombre: 'Administrador',
            apellido: 'Sistema',
            email: 'admin@miempresa.com',
            password: hashedPassword,
            telefono: '+503 2222-2222',
            rol: 'admin',
            activo: true,
            empresa_id: empresaId,
            created_at: new Date(),
            updated_at: new Date()
        }]);

        // Crear categorías de ejemplo
        const categorias = [
            { id: uuidv4(), nombre: 'Electrónicos', descripcion: 'Productos electrónicos y tecnológicos', empresa_id: empresaId },
            { id: uuidv4(), nombre: 'Ropa', descripcion: 'Vestimenta y accesorios', empresa_id: empresaId },
            { id: uuidv4(), nombre: 'Hogar', descripcion: 'Artículos para el hogar', empresa_id: empresaId },
            { id: uuidv4(), nombre: 'Servicios', descripcion: 'Servicios profesionales', empresa_id: empresaId }
        ];

        await queryInterface.bulkInsert('Categorias', categorias.map(cat => ({
            ...cat,
            activa: true,
            created_at: new Date(),
            updated_at: new Date()
        })));

        // Crear impuestos de ejemplo
        const impuestos = [
            {
                id: uuidv4(),
                nombre: 'IVA',
                codigo: '20',
                porcentaje: 13.00,
                tipo_impuesto: 'iva',
                aplicable_por_defecto: true,
                activo: true,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                nombre: 'Impuesto Municipal',
                codigo: '21',
                porcentaje: 1.00,
                tipo_impuesto: 'municipal',
                aplicable_por_defecto: false,
                activo: true,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('Impuestos', impuestos);

        // Crear productos de ejemplo
        const productos = [
            {
                id: uuidv4(),
                codigo: 'PROD001',
                codigo_barras: '1234567890123',
                nombre: 'Laptop Dell Inspiron',
                descripcion: 'Laptop Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD',
                precio_venta: 899.99,
                precio_compra: 650.00,
                costo_unitario: 700.00,
                stock_actual: 10.00,
                stock_minimo: 2.00,
                unidad_medida: 'unidad',
                tipo_producto: 'producto',
                exento_impuestos: false,
                activo: true,
                categoria_id: categorias[0].id,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                codigo: 'PROD002',
                codigo_barras: '1234567890124',
                nombre: 'Camisa Polo',
                descripcion: 'Camisa polo de algodón, varios colores',
                precio_venta: 25.99,
                precio_compra: 15.50,
                costo_unitario: 18.00,
                stock_actual: 50.00,
                stock_minimo: 10.00,
                unidad_medida: 'unidad',
                tipo_producto: 'producto',
                exento_impuestos: false,
                activo: true,
                categoria_id: categorias[1].id,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                codigo: 'SERV001',
                nombre: 'Consultoría IT',
                descripcion: 'Servicio de consultoría en tecnología de la información',
                precio_venta: 75.00,
                precio_compra: 0.00,
                costo_unitario: 0.00,
                stock_actual: 0.00,
                stock_minimo: 0.00,
                unidad_medida: 'hora',
                tipo_producto: 'servicio',
                exento_impuestos: false,
                activo: true,
                categoria_id: categorias[3].id,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('Productos', productos);

        // Crear clientes de ejemplo
        const clientes = [
            {
                id: uuidv4(),
                codigo: 'CLI000001',
                tipo_cliente: 'persona_natural',
                nombre: 'María',
                apellido: 'González',
                dui: '12345678-9',
                direccion: 'San Salvador, El Salvador',
                telefono: '+503 7777-7777',
                email: 'maria.gonzalez@email.com',
                limite_credito: 1000.00,
                saldo_actual: 0.00,
                dias_credito: 30,
                exento_impuestos: false,
                activo: true,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                codigo: 'CLI000002',
                tipo_cliente: 'persona_juridica',
                nombre: 'Empresa Cliente S.A. de C.V.',
                apellido: null,
                nit: '0614-987654-321-0',
                direccion: 'Santa Ana, El Salvador',
                telefono: '+503 8888-8888',
                email: 'contacto@empresacliente.com',
                limite_credito: 5000.00,
                saldo_actual: 0.00,
                dias_credito: 45,
                exento_impuestos: false,
                activo: true,
                empresa_id: empresaId,
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await queryInterface.bulkInsert('Clientes', clientes);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('DetalleImpuestos', null, {});
        await queryInterface.bulkDelete('DetalleFacturas', null, {});
        await queryInterface.bulkDelete('Facturas', null, {});
        await queryInterface.bulkDelete('Pagos', null, {});
        await queryInterface.bulkDelete('Productos', null, {});
        await queryInterface.bulkDelete('Clientes', null, {});
        await queryInterface.bulkDelete('Categorias', null, {});
        await queryInterface.bulkDelete('Impuestos', null, {});
        await queryInterface.bulkDelete('Usuarios', null, {});
        await queryInterface.bulkDelete('Empresas', null, {});
    }
};
