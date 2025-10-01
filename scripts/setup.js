#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando FactuSys API...\n');

// Función para verificar si un comando existe
function commandExists(command) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

// Función para ejecutar comandos
function runCommand(command, description) {
    console.log(`📦 ${description}...`);
    try {
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ ${description} completado\n`);
    } catch (error) {
        console.error(`❌ Error en ${description}:`, error.message);
        process.exit(1);
    }
}

// Verificar Node.js
console.log('🔍 Verificando requisitos...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 14) {
    console.error('❌ Node.js versión 14 o superior es requerida');
    process.exit(1);
}

console.log(`✅ Node.js ${nodeVersion} detectado`);

// Verificar PostgreSQL
if (!commandExists('psql')) {
    console.warn('⚠️  PostgreSQL no detectado. Asegúrate de tener PostgreSQL instalado y en el PATH');
} else {
    console.log('✅ PostgreSQL detectado');
}

console.log('');

// Crear directorios necesarios
console.log('📁 Creando directorios...');
const directories = ['logs', 'uploads'];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Directorio ${dir} creado`);
    } else {
        console.log(`✅ Directorio ${dir} ya existe`);
    }
});

console.log('');

// Verificar archivo .env
console.log('⚙️  Verificando configuración...');
if (!fs.existsSync('.env')) {
    if (fs.existsSync('env.example')) {
        fs.copyFileSync('env.example', '.env');
        console.log('✅ Archivo .env creado desde env.example');
        console.log('📝 Por favor edita el archivo .env con tus configuraciones');
    } else {
        console.error('❌ Archivo env.example no encontrado');
        process.exit(1);
    }
} else {
    console.log('✅ Archivo .env ya existe');
}

console.log('');

// Instalar dependencias
runCommand('npm install', 'Instalando dependencias');

// Crear archivo de log inicial
const logContent = `[${new Date().toISOString()}] FactuSys API iniciado\n`;
fs.writeFileSync('logs/app.log', logContent);

console.log('🎉 ¡Configuración completada!');
console.log('');
console.log('📋 Próximos pasos:');
console.log('1. Edita el archivo .env con tus configuraciones de base de datos');
console.log('2. Crea la base de datos PostgreSQL:');
console.log('   CREATE DATABASE factusys_db;');
console.log('3. Ejecuta las migraciones:');
console.log('   npm run migrate');
console.log('4. (Opcional) Ejecuta los seeders:');
console.log('   npm run seed');
console.log('5. Inicia el servidor:');
console.log('   npm run dev');
console.log('');
console.log('📚 Documentación disponible en: http://localhost:3000/api/docs');
console.log('🔐 Usuario admin por defecto: admin@miempresa.com / admin123');
console.log('');
