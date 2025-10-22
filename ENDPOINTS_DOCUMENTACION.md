# API Endpoints - FactuSys

**Base URL:** `http://localhost:3000/api`

**Token válido por:** 24 horas

---

## Autenticación

### Registro
```http
POST /auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Fernando",
  "apellido": "Sandoval",
  "email": "admin@databytes.sv",
  "password": "Admin123",
  "telefono": "77777777",
  "rol": "admin"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "d0b18f4c-2623-4de5-8863-094d19571ccf",
      "nombre": "Fernando",
      "apellido": "Sandoval",
      "email": "admin@databytes.sv",
      "rol": "admin",
      "empresa": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Login
```http
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@databytes.sv",
  "password": "Admin123"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "d0b18f4c-2623-4de5-8863-094d19571ccf",
      "nombre": "Fernando",
      "apellido": "Sandoval",
      "email": "admin@databytes.sv",
      "rol": "admin",
      "empresa": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Obtener Perfil
```http
GET /auth/profile
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "d0b18f4c-2623-4de5-8863-094d19571ccf",
      "nombre": "Fernando",
      "apellido": "Sandoval",
      "email": "admin@databytes.sv",
      "telefono": "77777777",
      "rol": "admin",
      "activo": true,
      "ultimo_acceso": "2025-10-22T00:05:25.930Z",
      "empresa": null
    }
  }
}
```

---

## Empresas

### Crear Empresa
```http
POST /empresas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "DataBytes Solutions S.A. de C.V.",
  "nit": "0614-123456-001-2",
  "direccion": "Colonia Escalón, San Salvador, El Salvador",
  "telefono": "22222222",
  "email": "info@databytes.sv",
  "representante_legal": "Fernando Sandoval",
  "actividad_economica": "Desarrollo de Software y Servicios de TI",
  "regimen_tributario": "general",
  "codigo_establecimiento": "0001",
  "codigo_punto_venta": "001",
  "codigo_actividad": "62010"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Empresa creada exitosamente",
  "data": {
    "empresa": {
      "id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e",
      "activa": true,
      "nombre": "DataBytes Solutions S.A. de C.V.",
      "nit": "0614-123456-001-2",
      "direccion": "Colonia Escalón, San Salvador, El Salvador",
      "telefono": "22222222",
      "email": "info@databytes.sv",
      "representante_legal": "Fernando Sandoval",
      "actividad_economica": "Desarrollo de Software y Servicios de TI",
      "regimen_tributario": "general",
      "codigo_establecimiento": "0001",
      "codigo_punto_venta": "001",
      "codigo_actividad": "62010",
      "createdAt": "2025-10-22T00:36:22.295Z",
      "updatedAt": "2025-10-22T00:36:22.295Z"
    }
  }
}
```

---

### Listar Empresas
```http
GET /empresas?page=1&limit=10&search=
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "empresas": [
      {
        "id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e",
        "nombre": "DataBytes Solutions S.A. de C.V.",
        "nit": "0614-123456-001-2",
        "direccion": "Colonia Escalón, Edificio Torre Futura, San Salvador",
        "telefono": "22223333",
        "email": "contacto@databytes.sv",
        "activa": true,
        "usuarios": []
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### Obtener Empresa por ID
```http
GET /empresas/{id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "empresa": {
      "id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e",
      "nombre": "DataBytes Solutions S.A. de C.V.",
      "nit": "0614-123456-001-2",
      "activa": true,
      "usuarios": []
    }
  }
}
```

---

### Actualizar Empresa
```http
PUT /empresas/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:** (mismos campos que crear)

**Response 200:**
```json
{
  "success": true,
  "message": "Empresa actualizada exitosamente",
  "data": {
    "empresa": { }
  }
}
```

---

### Eliminar Empresa (Soft Delete)
```http
DELETE /empresas/{id}
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Empresa eliminada exitosamente"
}
```

---

## Categorías

### Crear Categoría
```http
POST /categorias
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Software y Licencias",
  "descripcion": "Software, licencias y aplicaciones"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "categoria": {
      "id": "2e0e6c91-d47f-41c4-a23b-797efbc9b6d2",
      "activa": true,
      "nombre": "Software y Licencias",
      "descripcion": "Software, licencias y aplicaciones",
      "empresa_id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e",
      "createdAt": "2025-10-22T06:59:08.763Z",
      "updatedAt": "2025-10-22T06:59:08.763Z"
    }
  }
}
```

---

### Listar Categorías
```http
GET /categorias?page=1&limit=10
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "categorias": [
      {
        "id": "2e0e6c91-d47f-41c4-a23b-797efbc9b6d2",
        "nombre": "Software y Licencias",
        "descripcion": "Software, licencias y aplicaciones",
        "activa": true,
        "productos": [],
        "cantidad_productos": 0
      }
    ],
    "pagination": {
      "total": 4,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

## Productos

### Crear Producto
```http
POST /productos
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "codigo": "SW-WIN-001",
  "nombre": "Licencia Windows 11 Pro",
  "descripcion": "Licencia original de Windows 11 Professional",
  "precio_venta": 199.99,
  "precio_compra": 150.00,
  "stock_actual": 50,
  "stock_minimo": 10,
  "unidad_medida": "unidad",
  "tipo_producto": "producto",
  "exento_impuestos": false,
  "categoria_id": "2e0e6c91-d47f-41c4-a23b-797efbc9b6d2"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "producto": {
      "id": "a2ba09b7-0550-4ad0-a3c0-7e18761aac74",
      "activo": true,
      "codigo": "SW-WIN-001",
      "nombre": "Licencia Windows 11 Pro",
      "descripcion": "Licencia original de Windows 11 Professional",
      "precio_venta": "199.99",
      "precio_compra": "150.00",
      "stock_actual": "50.00",
      "stock_minimo": "10.00",
      "unidad_medida": "unidad",
      "tipo_producto": "producto",
      "exento_impuestos": false,
      "categoria_id": "2e0e6c91-d47f-41c4-a23b-797efbc9b6d2",
      "empresa_id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e"
    }
  }
}
```

---

### Listar Productos
```http
GET /productos?page=1&limit=10&search=&categoria_id=
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id": "a2ba09b7-0550-4ad0-a3c0-7e18761aac74",
        "codigo": "SW-WIN-001",
        "nombre": "Licencia Windows 11 Pro",
        "descripcion": "Licencia original de Windows 11 Professional",
        "precio_venta": "199.99",
        "precio_compra": "150.00",
        "stock_actual": "50.00",
        "stock_minimo": "10.00",
        "unidad_medida": "unidad",
        "tipo_producto": "producto",
        "exento_impuestos": false,
        "activo": true,
        "categoria": {
          "id": "2e0e6c91-d47f-41c4-a23b-797efbc9b6d2",
          "nombre": "Software y Licencias"
        },
        "empresa": {
          "id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e",
          "nombre": "DataBytes Solutions S.A. de C.V."
        }
      }
    ],
    "pagination": {
      "total": 5,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

## Clientes

### Crear Cliente
```http
POST /clientes
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (Persona Jurídica):**
```json
{
  "codigo": "CLI-001",
  "tipo_cliente": "persona_juridica",
  "nombre": "Tecnología Empresarial S.A. de C.V.",
  "nit": "0614-987654-001-5",
  "direccion": "San Salvador, Centro Comercial Plaza",
  "telefono": "22334455",
  "email": "info@tecempresarial.com",
  "limite_credito": 5000.00,
  "dias_credito": 30,
  "exento_impuestos": false
}
```

**Body (Persona Natural):**
```json
{
  "codigo": "CLI-002",
  "tipo_cliente": "persona_natural",
  "nombre": "Juan",
  "apellido": "Pérez Martínez",
  "dui": "12345678-9",
  "direccion": "Santa Tecla, El Salvador",
  "telefono": "77889900",
  "email": "juan.perez@email.com",
  "limite_credito": 1000.00,
  "dias_credito": 15,
  "exento_impuestos": false
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Cliente creado exitosamente",
  "data": {
    "cliente": {
      "id": "461c2d11-f757-4451-a6ce-e12af971b38b",
      "saldo_actual": "0.00",
      "activo": true,
      "codigo": "CLI-001",
      "tipo_cliente": "persona_juridica",
      "nombre": "Tecnología Empresarial S.A. de C.V.",
      "nit": "0614-987654-001-5",
      "direccion": "San Salvador, Centro Comercial Plaza",
      "telefono": "22334455",
      "email": "info@tecempresarial.com",
      "limite_credito": "5000.00",
      "dias_credito": 30,
      "exento_impuestos": false,
      "empresa_id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e"
    }
  }
}
```

---

### Listar Clientes
```http
GET /clientes?page=1&limit=10&search=
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "clientes": [
      {
        "id": "461c2d11-f757-4451-a6ce-e12af971b38b",
        "codigo": "CLI-001",
        "tipo_cliente": "persona_juridica",
        "nombre": "Tecnología Empresarial S.A. de C.V.",
        "nit": "0614-987654-001-5",
        "saldo_actual": "0.00",
        "activo": true,
        "empresa": {
          "id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e",
          "nombre": "DataBytes Solutions S.A. de C.V."
        }
      }
    ],
    "pagination": {
      "total": 3,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

## Impuestos

### Crear Impuesto
```http
POST /impuestos
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "IVA",
  "codigo": "IVA-13",
  "porcentaje": 13.00,
  "tipo_impuesto": "iva",
  "aplicable_por_defecto": true
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Impuesto creado exitosamente",
  "data": {
    "impuesto": {
      "id": "380740ba-1c05-4a5d-99a6-8cc0e816f529",
      "activo": true,
      "nombre": "IVA",
      "codigo": "IVA-13",
      "porcentaje": "13.00",
      "tipo_impuesto": "iva",
      "aplicable_por_defecto": true,
      "empresa_id": "48bf0cd1-ff77-4793-9160-9d802c9c5e9e"
    }
  }
}
```

---

### Listar Impuestos
```http
GET /impuestos?page=1&limit=10
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "impuestos": [
      {
        "id": "380740ba-1c05-4a5d-99a6-8cc0e816f529",
        "nombre": "IVA",
        "codigo": "IVA-13",
        "porcentaje": "13.00",
        "tipo_impuesto": "iva",
        "activo": true
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

## Facturas

### Crear Factura (Borrador)
```http
POST /facturas
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "numero_factura": "FAC-2025-0001",
  "serie": "A",
  "tipo_documento": "factura",
  "fecha_emision": "2025-10-22",
  "metodo_pago": "credito",
  "observaciones": "Venta de equipos para oficina",
  "cliente_id": "461c2d11-f757-4451-a6ce-e12af971b38b",
  "detalles": [
    {
      "producto_id": "5e8c3c64-12d5-46b7-af4d-4eb92da41453",
      "cantidad": 2,
      "precio_unitario": 1299.99,
      "impuestos": [
        {
          "impuesto_id": "380740ba-1c05-4a5d-99a6-8cc0e816f529"
        }
      ]
    },
    {
      "producto_id": "a2ba09b7-0550-4ad0-a3c0-7e18761aac74",
      "cantidad": 2,
      "precio_unitario": 199.99,
      "impuestos": [
        {
          "impuesto_id": "380740ba-1c05-4a5d-99a6-8cc0e816f529"
        }
      ]
    }
  ]
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "data": {
    "factura": {
      "id": "dd8588d1-b925-449f-8429-f203bbb464cf",
      "numero_factura": "FAC-2025-0001",
      "serie": "A",
      "tipo_documento": "factura",
      "estado": "borrador",
      "subtotal": "2999.96",
      "total_impuestos": "390.00",
      "total": "3389.96",
      "metodo_pago": "credito",
      "cliente": {
        "id": "461c2d11-f757-4451-a6ce-e12af971b38b",
        "nombre": "Tecnología Empresarial S.A. de C.V.",
        "nit": "0614-987654-001-5"
      },
      "detalles": [
        {
          "id": "5c9babf5-5128-412e-b48d-6332a4daaac2",
          "cantidad": "2.00",
          "precio_unitario": "1299.99",
          "subtotal": "2599.98",
          "total_impuestos": "338.00",
          "total": "2937.98",
          "producto": {
            "id": "5e8c3c64-12d5-46b7-af4d-4eb92da41453",
            "codigo": "HW-LAP-001",
            "nombre": "Laptop Dell Latitude 5520"
          },
          "impuestos": [
            {
              "base_imponible": "2599.98",
              "porcentaje": "13.00",
              "monto": "338.00",
              "impuesto": {
                "nombre": "IVA",
                "codigo": "IVA-13"
              }
            }
          ]
        }
      ]
    }
  }
}
```

---

### Emitir Factura (Generar XML y Enviar a Hacienda)
```http
POST /facturas/{id}/emitir
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Factura emitida exitosamente",
  "data": {
    "factura": {
      "id": "dd8588d1-b925-449f-8429-f203bbb464cf",
      "numero_factura": "FAC-2025-0001",
      "estado": "emitida",
      "total": "3389.96",
      "xml_generado": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<DTE>...</DTE>",
      "respuesta_hacienda": {
        "codigoRespuesta": "200",
        "descripcionRespuesta": "Transacción procesada exitosamente",
        "codigoAutorizacion": "A1761095866715DIR5EP6W4",
        "fechaAutorizacion": "2025-10-22T01:17:46.715Z",
        "numeroControl": "NC1761095866715",
        "ambiente": "test",
        "firma": "pXlDK7LgwixSyDmV3ewj53qn/NwRYC78DuW2mUIb25A=",
        "hash": "b0c8481debea1b4b541f1f2c16af140f6007434760b36f2154c00406d89271dd"
      },
      "codigo_autorizacion": "A1761095866715DIR5EP6W4",
      "fecha_autorizacion": "2025-10-22T01:17:46.715Z"
    },
    "respuestaHacienda": {
      "codigoRespuesta": "200",
      "codigoAutorizacion": "A1761095866715DIR5EP6W4"
    }
  }
}
```

---

### Listar Facturas
```http
GET /facturas?page=1&limit=10&estado=&cliente_id=
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "facturas": [
      {
        "id": "dd8588d1-b925-449f-8429-f203bbb464cf",
        "numero_factura": "FAC-2025-0001",
        "serie": "A",
        "estado": "emitida",
        "total": "3389.96",
        "cliente": {
          "nombre": "Tecnología Empresarial S.A. de C.V.",
          "nit": "0614-987654-001-5"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

---

### Anular Factura
```http
POST /facturas/{id}/anular
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "motivo_anulacion": "Error en datos del cliente"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Factura anulada exitosamente",
  "data": {
    "factura": {
      "id": "dd8588d1-b925-449f-8429-f203bbb464cf",
      "numero_factura": "FAC-2025-0001",
      "estado": "anulada"
    }
  }
}
```

---

## Enums y Valores Válidos

### Roles de Usuario
- `admin`
- `contador`
- `vendedor`
- `cliente`

### Régimen Tributario
- `general`
- `simplificado`
- `pequeno_contribuyente`

### Unidad de Medida
- `unidad`
- `kg`
- `lb`
- `litro`
- `metro`
- `m2`
- `m3`

### Tipo de Producto
- `producto`
- `servicio`

### Tipo de Cliente
- `persona_natural`
- `persona_juridica`

### Tipo de Impuesto
- `iva`
- `isc`
- `consumo`
- `municipal`

### Tipo de Documento (Factura)
- `factura`
- `credito_fiscal`
- `nota_credito`
- `nota_debito`

### Estado de Factura
- `borrador` - Factura creada pero no emitida
- `emitida` - Factura enviada a Hacienda y autorizada
- `anulada` - Factura anulada
- `pagada` - Factura pagada
- `vencida` - Factura vencida

### Método de Pago
- `efectivo`
- `tarjeta`
- `transferencia`
- `cheque`
- `credito`

---

## Notas

1. **Autenticación:** Todos los endpoints (excepto registro y login) requieren el header `Authorization: Bearer {token}`
2. **Rol Admin:** Los endpoints de empresas requieren rol `admin`
3. **Empresa Requerida:** Categorías, productos, clientes, impuestos y facturas requieren que el usuario tenga `empresa_id` asignado
4. **Paginación:** Por defecto `page=1` y `limit=10`
5. **Soft Delete:** Las eliminaciones son lógicas, no físicas
6. **XML DTE:** Al emitir una factura se genera automáticamente el XML según estándares de Hacienda de El Salvador
7. **Firma Digital:** Las facturas emitidas incluyen firma digital SHA-256 y hash
8. **Código Autorización:** Las facturas emitidas reciben un código de autorización único de Hacienda (simulado en ambiente test)
