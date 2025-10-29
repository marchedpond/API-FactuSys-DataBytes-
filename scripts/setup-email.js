#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 FactuSys - Configuración de Correo Electrónico');
console.log('================================================\n');

const questions = [
    {
        key: 'EMAIL_HOST',
        question: 'Servidor SMTP (ej: smtp.gmail.com): ',
        default: 'smtp.gmail.com'
    },
    {
        key: 'EMAIL_PORT',
        question: 'Puerto SMTP (ej: 587): ',
        default: '587'
    },
    {
        key: 'EMAIL_SECURE',
        question: '¿Usar SSL/TLS? (true/false): ',
        default: 'false'
    },
    {
        key: 'EMAIL_USER',
        question: 'Email de envío (ej: tu_email@gmail.com): ',
        default: ''
    },
    {
        key: 'EMAIL_PASS',
        question: 'Contraseña de aplicación: ',
        default: ''
    }
];

const config = {};

function askQuestion(index) {
    if (index >= questions.length) {
        generateEnvFile();
        return;
    }

    const q = questions[index];
    rl.question(q.question, (answer) => {
        config[q.key] = answer.trim() || q.default;
        askQuestion(index + 1);
    });
}

function generateEnvFile() {
    const envPath = path.join(process.cwd(), '.env');

    let envContent = '';

    // Leer archivo .env existente si existe
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    } else {
        // Leer archivo .env.example como base
        const envExamplePath = path.join(process.cwd(), 'env.example');
        if (fs.existsSync(envExamplePath)) {
            envContent = fs.readFileSync(envExamplePath, 'utf8');
        }
    }

    // Agregar o actualizar configuración de correo
    const emailConfig = `
# Configuración de correo electrónico
EMAIL_HOST=${config.EMAIL_HOST}
EMAIL_PORT=${config.EMAIL_PORT}
EMAIL_SECURE=${config.EMAIL_SECURE}
EMAIL_USER=${config.EMAIL_USER}
EMAIL_PASS=${config.EMAIL_PASS}`;

    // Remover configuración de correo existente si existe
    envContent = envContent.replace(/# Configuración de correo electrónico[\s\S]*?(?=\n#|\n$|$)/g, '');

    // Agregar nueva configuración
    envContent += emailConfig;

    // Escribir archivo .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Configuración guardada en .env');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Instalar dependencias: npm install');
    console.log('2. Iniciar servidor: npm run dev');
    console.log('3. Probar configuración: POST /api/email/test');
    console.log('\n🎉 ¡Configuración completada!');

    rl.close();
}

// Verificar si ya existe configuración
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('EMAIL_USER')) {
        console.log('⚠️  Ya existe configuración de correo en .env');
        rl.question('¿Deseas reconfigurar? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
                askQuestion(0);
            } else {
                console.log('Configuración cancelada.');
                rl.close();
            }
        });
    } else {
        askQuestion(0);
    }
} else {
    askQuestion(0);
}
