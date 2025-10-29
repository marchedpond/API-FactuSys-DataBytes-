const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
    try {
        console.log('🔧 Actualizando contraseña del usuario administrador...');

        // Buscar usuario admin
        const adminUser = await User.findOne({
            where: { email: 'admin@databytes.sv' }
        });

        if (!adminUser) {
            console.log('❌ No se encontró el usuario admin. Ejecuta: npm run create-admin');
            return;
        }

        // Actualizar contraseña (el hook beforeUpdate hasheará automáticamente)
        await adminUser.update({
            password: 'Admin123', // Sin hashear - el hook lo hará automáticamente
            activo: true // Asegurar que esté activo
        });

        // Recargar para verificar
        await adminUser.reload();

        console.log('✅ Contraseña del usuario administrador actualizada exitosamente!');
        console.log('📧 Email: admin@databytes.sv');
        console.log('🔑 Nueva Contraseña: Admin123');
        console.log('👤 Rol:', adminUser.rol);
        console.log('🏢 Empresa ID:', adminUser.empresa_id);

    } catch (error) {
        console.error('❌ Error actualizando contraseña:', error.message);
        console.error(error);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    resetAdminPassword().then(() => {
        process.exit(0);
    }).catch((error) => {
        console.error('Error fatal:', error);
        process.exit(1);
    });
}

module.exports = resetAdminPassword;
