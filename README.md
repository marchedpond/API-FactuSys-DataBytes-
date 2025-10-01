# FactuSys API

API de facturación con **Express.js** y **PostgreSQL**, con integración **simulada** a Hacienda de El Salvador.

## 🚀 ¿Para qué sirve?

Gestiona **usuarios, empresas, clientes, productos e impuestos**, y permite **crear/emitir/anular facturas** con autenticación **JWT**.

---

## 👤 Usuarios/Roles

* **admin**: acceso total.
* **contador**: finanzas y reportes.
* **vendedor**: facturas y clientes.
* **cliente**: consulta de sus facturas.

---

## 📦 Entidades

1. **Usuarios**
2. **Empresas**
3. **Clientes**
4. **Productos**
5. **Categorías**
6. **Impuestos**
7. **Facturas**

---

## 🛣️ Rutas

### 🔑 Autenticación

* `POST /api/auth/register` – registrar usuario
* `POST /api/auth/login` – iniciar sesión (retorna JWT)
* `GET /api/auth/profile` – perfil del usuario autenticado

### 🏢 Empresas

* `GET /api/empresas` – listar
* `POST /api/empresas` – crear
* `PUT /api/empresas/:id` – actualizar
* `DELETE /api/empresas/:id` – eliminar

### 👥 Clientes

* `GET /api/clientes` – listar
* `POST /api/clientes` – crear
* `PUT /api/clientes/:id` – actualizar
* `DELETE /api/clientes/:id` – eliminar

### 📦 Productos

* `GET /api/productos` – listar
* `POST /api/productos` – crear
* `PUT /api/productos/:id` – actualizar
* `DELETE /api/productos/:id` – eliminar

### 🗂️ Categorías

* `GET /api/categorias` – listar
* `POST /api/categorias` – crear
* `PUT /api/categorias/:id` – actualizar
* `DELETE /api/categorias/:id` – eliminar

### 💰 Impuestos

* `GET /api/impuestos` – listar
* `POST /api/impuestos` – crear
* `PUT /api/impuestos/:id` – actualizar
* `DELETE /api/impuestos/:id` – eliminar

### 🧾 Facturas

* `GET /api/facturas` – listar
* `POST /api/facturas` – crear **(borrador)**
* `POST /api/facturas/:id/emitir` – **emitir** (simula envío a Hacienda)
* `POST /api/facturas/:id/anular` – **anular**

---

## ✅ Qué probar (checklist)

* **JWT**

  * `POST /api/auth/login` devuelve token
  * Acceso a rutas privadas con `Authorization: Bearer <token>`

* **Permisos por rol**

  * Admin puede CRUD en todas las entidades
  * Vendedor limitado a clientes/facturas
  * Cliente solo puede ver sus facturas

* **Empresas/Clientes/Productos/Categorías/Impuestos**

  * CRUD completo y validaciones (campos requeridos, formatos, estados)

* **Facturación**

  * Crear factura en **borrador**
  * **Emitir**: genera XML simulado y código de autorización
  * **Anular**: cambia estado y registra motivo

