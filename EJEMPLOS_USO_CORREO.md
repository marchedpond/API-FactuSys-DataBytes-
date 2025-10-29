# 📧 FactuSys - Ejemplos de Uso de Correo Electrónico

## 🔧 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Correo Electrónico

```bash
npm run setup-email
```

O manualmente agregar a `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password_gmail
```

### 3. Iniciar Servidor

```bash
npm run dev
```

## 🧪 Probar Configuración

### Verificar Configuración de Correo

```http
GET /api/email/verify
Authorization: Bearer {token}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Configuración de correo válida",
  "data": {
    "configuracionValida": true
  }
}
```

### Enviar Correo de Prueba

```http
POST /api/email/test
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Correo de prueba enviado exitosamente",
  "data": {
    "messageId": "<message-id@example.com>",
    "destinatario": "test@example.com"
  }
}
```

## 🧾 Flujo Completo de Facturación

### 1. Crear Factura (Borrador)

```http
POST /api/facturas
Authorization: Bearer {token}
Content-Type: application/json

{
  "numero_factura": "FAC-2025-0001",
  "serie": "A",
  "tipo_documento": "factura",
  "fecha_emision": "2025-10-22",
  "metodo_pago": "credito",
  "observaciones": "Venta de productos",
  "cliente_id": "cliente-uuid",
  "detalles": [
    {
      "producto_id": "producto-uuid",
      "cantidad": 2,
      "precio_unitario": 100.00,
      "impuestos": [
        {
          "impuesto_id": "impuesto-uuid"
        }
      ]
    }
  ]
}
```

### 2. Emitir Factura (Genera PDF y Envía Correo)

```http
POST /api/facturas/{id}/emitir
Authorization: Bearer {token}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Factura emitida exitosamente",
  "data": {
    "factura": {
      "id": "factura-uuid",
      "numero_factura": "FAC-2025-0001",
      "estado": "emitida",
      "codigo_autorizacion": "A1761095866715DIR5EP6W4",
      "fecha_autorizacion": "2025-10-22T01:17:46.715Z"
    },
    "respuestaHacienda": {
      "codigoRespuesta": "200",
      "codigoAutorizacion": "A1761095866715DIR5EP6W4"
    },
    "correoEnviado": true,
    "pdfGenerado": true
  }
}
```

**Lo que sucede internamente:**

1. ✅ Validación de datos para Hacienda
2. ✅ Generación de XML DTE
3. ✅ Envío simulado a Hacienda
4. ✅ Generación de PDF profesional
5. ✅ Envío de correo con PDF y XML adjuntos
6. ✅ Actualización de estado a "emitida"

### 3. Anular Factura (Envía Correo de Notificación)

```http
POST /api/facturas/{id}/anular
Authorization: Bearer {token}
Content-Type: application/json

{
  "motivo": "Error en datos del cliente"
}
```

**Respuesta exitosa:**

```json
{
  "success": true,
  "message": "Factura anulada exitosamente",
  "data": {
    "factura": {
      "id": "factura-uuid",
      "numero_factura": "FAC-2025-0001",
      "estado": "anulada"
    },
    "correoEnviado": true
  }
}
```

## 📧 Tipos de Correos Enviados

### 1. Factura Emitida

- **Asunto**: `Factura FAC-2025-0001 - Nombre Empresa`
- **Destinatario**: Email del cliente
- **Copia**: Email de la empresa
- **Adjuntos**:
  - `Factura_FAC-2025-0001.pdf` - Factura en PDF
  - `DTE_FAC-2025-0001.xml` - Documento Tributario Electrónico

### 2. Factura Anulada

- **Asunto**: `Factura FAC-2025-0001 ANULADA - Nombre Empresa`
- **Destinatario**: Email del cliente
- **Copia**: Email de la empresa
- **Contenido**: Notificación de anulación con motivo

### 3. Correo de Prueba

- **Asunto**: `Prueba de Configuración - FactuSys`
- **Destinatario**: Email especificado
- **Contenido**: Confirmación de configuración exitosa

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

## 🚨 Manejo de Errores

### Error de Validación

```json
{
  "success": false,
  "message": "Error al enviar factura a Hacienda",
  "data": {
    "errores": [
      "NIT de la empresa inválido (mínimo 10 caracteres)",
      "Cliente debe tener NIT o DUI"
    ]
  }
}
```

### Error de Configuración de Correo

```json
{
  "success": false,
  "message": "Error enviando correo de prueba",
  "error": "Error al enviar correo: Invalid login: 535-5.7.8 Username and Password not accepted"
}
```

### Error de Generación de PDF

- La emisión continúa sin fallar
- Se registra en logs: `Error generando PDF para factura FAC-2025-0001`
- `pdfGenerado: false` en la respuesta

## 📊 Logs del Sistema

Todos los eventos se registran en los logs:

```
[INFO] PDF generado para factura FAC-2025-0001
[INFO] Correo enviado para factura FAC-2025-0001 {"messageId":"<message-id@example.com>"}
[INFO] Factura FAC-2025-0001 emitida exitosamente
[WARN] Error generando PDF para factura FAC-2025-0001: Error message
[ERROR] Error enviando correo para factura FAC-2025-0001: Error message
```

## 🎯 Casos de Uso

### Caso 1: Emisión Exitosa

1. Crear factura en borrador
2. Emitir factura
3. ✅ PDF generado
4. ✅ Correo enviado
5. ✅ Estado cambiado a "emitida"

### Caso 2: Error de Validación

1. Crear factura con datos inválidos
2. Intentar emitir
3. ❌ Error de validación antes de enviar a Hacienda
4. Estado permanece en "borrador"

### Caso 3: Error de Correo

1. Crear factura válida
2. Emitir factura
3. ✅ PDF generado
4. ❌ Error enviando correo
5. ✅ Estado cambiado a "emitida" (no falla por error de correo)

### Caso 4: Anulación

1. Factura en estado "emitida"
2. Anular con motivo
3. ✅ Estado cambiado a "anulada"
4. ✅ Correo de notificación enviado

## 🔧 Troubleshooting

### Error de Autenticación Gmail

```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solución**: Usar contraseña de aplicación en lugar de contraseña normal

### Error de Conexión SMTP

```
Error: Connection timeout
```

**Solución**: Verificar EMAIL_HOST y EMAIL_PORT

### Error de Generación PDF

```
Error: Failed to launch the browser process
```

**Solución**: Instalar dependencias de Puppeteer: `npm install puppeteer`

## 🎉 ¡Listo para Usar!

El sistema está completamente configurado y listo para:

- ✅ Generar PDFs profesionales
- ✅ Enviar facturas por correo
- ✅ Validar datos fiscales
- ✅ Simular integración con Hacienda
- ✅ Manejar errores graciosamente
- ✅ Registrar todos los eventos
