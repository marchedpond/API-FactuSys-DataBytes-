# 🚀 FactuSys - Mejoras de Integración con Hacienda

## 📧 Configuración de Correo Electrónico

### Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de correo electrónico
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_gmail
```

### Configuración para Gmail

1. **Habilita la verificación en 2 pasos** en tu cuenta de Google
2. **Genera una contraseña de aplicación**:
   - Ve a [Google Account Settings](https://myaccount.google.com/)
   - Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
   - Genera una contraseña para "Mail"
   - Usa esta contraseña en `EMAIL_PASS`

### Configuración para otros proveedores

#### Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

#### Yahoo

```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

## 🆕 Nuevas Funcionalidades

### 1. Generación de PDF

- **Archivo**: `src/services/pdfService.js`
- **Plantilla**: `src/templates/factura-pdf.html`
- Genera PDFs profesionales de facturas con diseño empresarial

### 2. Envío de Correos

- **Archivo**: `src/services/emailService.js`
- **Plantillas**:
  - `src/templates/factura-emitida.html`
  - `src/templates/factura-anulada.html`
- Envía facturas por correo con PDF y XML adjuntos

### 3. Validaciones Mejoradas

- **Archivo**: `src/services/haciendaService.js`
- Validaciones robustas de datos fiscales
- Validación de DUI y NIT
- Validación de emails y fechas

### 4. Nuevos Endpoints

#### Probar Configuración de Correo

```http
POST /api/email/test
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### Verificar Configuración

```http
GET /api/email/verify
Authorization: Bearer {token}
```

## 🔧 Instalación de Dependencias

```bash
npm install nodemailer puppeteer handlebars
```

## 📋 Flujo de Emisión de Factura Mejorado

1. **Crear Factura** → Estado `borrador`
2. **Emitir Factura**:

   - ✅ Validar datos para Hacienda
   - ✅ Generar XML DTE
   - ✅ Enviar a Hacienda (simulado)
   - ✅ Generar PDF profesional
   - ✅ Enviar correo con PDF y XML
   - ✅ Actualizar estado a `emitida`

3. **Anular Factura**:
   - ✅ Cambiar estado a `anulada`
   - ✅ Enviar correo de notificación

## 🎨 Plantillas HTML

### Factura PDF (`factura-pdf.html`)

- Diseño profesional para impresión
- Información completa de empresa y cliente
- Tabla de detalles con impuestos
- Totales calculados
- Información de autorización de Hacienda

### Correo Factura Emitida (`factura-emitida.html`)

- Notificación de emisión exitosa
- Información de autorización
- Lista de archivos adjuntos
- Instrucciones para el cliente

### Correo Factura Anulada (`factura-anulada.html`)

- Notificación de anulación
- Motivo de la anulación
- Instrucciones importantes
- Próximos pasos

## 🔍 Validaciones Implementadas

### Datos de Empresa

- NIT válido (mínimo 10 caracteres)
- Nombre requerido (mínimo 3 caracteres)
- Dirección requerida (mínimo 10 caracteres)
- Email válido
- Teléfono requerido (mínimo 8 dígitos)

### Datos de Cliente

- NIT o DUI requerido
- Validación de formato DUI con dígito verificador
- Validación de formato NIT con dígito verificador
- Nombre requerido (mínimo 2 caracteres)
- Dirección requerida (mínimo 10 caracteres)

### Datos de Factura

- Número de factura requerido (mínimo 3 caracteres)
- Fecha de emisión válida (no futura, no anterior a un mes)
- Método de pago requerido
- Al menos un detalle requerido
- Totales coherentes

### Detalles de Productos

- Código de producto requerido
- Nombre de producto requerido
- Cantidad mayor a 0
- Precio unitario mayor a 0
- Al menos un impuesto requerido

## 🚨 Manejo de Errores

- **Errores de validación**: Se devuelven antes del envío a Hacienda
- **Errores de PDF**: No fallan la emisión, solo se registra en logs
- **Errores de correo**: No fallan la emisión, solo se registra en logs
- **Errores de Hacienda**: Se devuelven con códigos específicos

## 📊 Respuestas de Hacienda Simuladas

- **85% éxito**: Código 200 con autorización
- **10% error validación**: Código 400 con errores específicos
- **5% error servidor**: Código 500 con error interno

## 🔐 Seguridad

- Tokens JWT para autenticación
- Validación de roles (solo admin puede probar correo)
- Validación de empresa (datos aislados por empresa)
- Logs detallados de todas las operaciones

## 📝 Logs

Todos los eventos se registran en los logs:

- Generación de PDF
- Envío de correos
- Errores de validación
- Respuestas de Hacienda
- Errores de configuración

## 🎯 Próximos Pasos

1. Configurar variables de entorno
2. Instalar dependencias
3. Probar configuración de correo
4. Crear una factura de prueba
5. Emitir factura y verificar correo
6. Probar anulación y correo de notificación

¡El sistema está listo para usar con todas las mejoras implementadas! 🎉
