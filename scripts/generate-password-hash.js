const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'Admin123';
    const hash = await bcrypt.hash(password, 12);
    console.log('Hash generado:', hash);

    // Verificar que funciona
    const isValid = await bcrypt.compare(password, hash);
    console.log('Verificación:', isValid ? 'OK' : 'FAIL');

    return hash;
}

generateHash().catch(console.error);
