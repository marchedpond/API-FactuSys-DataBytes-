const { User, Empresa } = require('../src/models');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
    try {
        console.log('🔧 Creando usuario administrador...');

        // Verificar si ya existe un usuario admin
        const existingAdmin = await User.findOne({
            where: { email: 'admin@databytes.sv' }
        });

        if (existingAdmin) {
            console.log('✅ El usuario admin ya existe');
            console.log('📧 Email: admin@databytes.sv');
            console.log('🔑 Contraseña: Admin123');
            return;
        }

        // Buscar o crear empresa por defecto
        let empresa = await Empresa.findOne({
            where: { nombre: 'DataBytes' }
        });

        if (!empresa) {
            empresa = await Empresa.create({
                nombre: 'DataBytes',
                nit: '0614-123456-001-8',
                direccion: 'San Salvador, El Salvador',
                telefono: '+503 2222-2222',
                email: 'info@databytes.sv',
                representante_legal: 'Administrador Sistema',
                actividad_economica: 'Desarrollo de Software',
                regimen_tributario: 'general',
                codigo_establecimiento: '00000001',
                codigo_punto_venta: '00001',
                codigo_actividad: '62010',
                activa: true
            });
            console.log('🏢 Empresa DataBytes creada');
        }

        // Crear usuario admin (el hook beforeCreate hasheará la contraseña automáticamente)
        const adminUser = await User.create({
            nombre: 'Administrador',
            apellido: 'Sistema',
            email: 'admin@databytes.sv',
            password: 'Admin123', // Sin hashear - el hook lo hará automáticamente
            telefono: '22222222',
            rol: 'admin',
            activo: true,
            empresa_id: empresa.id
        });

        console.log('✅ Usuario administrador creado exitosamente!');
        console.log('📧 Email: admin@databytes.sv');
        console.log('🔑 Contraseña: Admin123');
        console.log('👤 Rol: Administrador');
        console.log('🏢 Empresa: DataBytes');

    } catch (error) {
        console.error('❌ Error creando usuario admin:', error.message);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    createAdminUser().then(() => {
        process.exit(0);
    });
}

module.exports = createAdminUser;
