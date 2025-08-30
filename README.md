# API-FactuSys-DataBytes

# README — Backend API (Node.js + TypeScript + PostgreSQL)
Repositorio: backend de la API para el proyecto de facturación electrónica (FactuSys / DataBytes)

Índice
- Descripción
- Tecnologías y stack
- Requisitos previos
- Instalación y ejecución local
- Variables de entorno (ejemplo)
- Arquitectura y diagramas (alto nivel)
- Autenticación y autorización
- Endpoints (contratos) — listado detallado
- Modelos de datos (esquemas principales)
- Validaciones y reglas de negocio
- Manejo de errores y códigos de respuesta
- Seguridad y cumplimiento
- Logs, auditoría y monitoreo
- Tests
- CI / CD
- Base de datos y migraciones
- Integraciones externas
- Operaciones y despliegue
- Performance y escalabilidad
- Guía para desarrolladores (contribución)
- FAQ y contactos
- Apéndices: ejemplos (requests/responses), docker-compose, comandos útiles

---

## Descripción
**Propósito:** API REST construida en Node.js + TypeScript para gestionar facturación electrónica: clientes, productos, facturas (creación, firma, transmisión), cobros/pagos, usuarios/roles, reportes y auditoría.

**Objetivos principales:**
- Proveer endpoints seguros y versionados para el frontend.
- Automatizar transmisión y firma de comprobantes (DTE) mediante colas asíncronas.
- Mantener trazabilidad y cumplimiento legal para facturación electrónica.
- Entregar documentación OpenAPI y colección Postman.

---

## Tecnologías y stack (recomendado)
- **Lenguaje:** Node.js + TypeScript
- **Framework HTTP:** Fastify (recomendado por rendimiento) o Express
- **ORM & Migrations:** Prisma + Prisma Migrate
- **Base de datos:** PostgreSQL
- **Cache / Colas:** Redis + BullMQ
- **Autenticación:** JWT (access + refresh tokens)
- **Validación:** Zod (o Joi)
- **Logging:** Pino (logs estructurados JSON) + Sentry (error tracking)
- **Documentación:** OpenAPI (Swagger) — endpoint `/docs`
- **Testing:** Jest + Supertest (integration)
- **Contenedores:** Docker + docker-compose
- **CI:** GitHub Actions
- **Infraestructura (recomendado):** Terraform (opcional)
- **Monitoreo:** Prometheus + Grafana (metrics), ELK / Loki para logs

---

## Requisitos previos
- Node.js >= 18
- npm / pnpm / yarn
- Docker & docker-compose (para desarrollo)
- PostgreSQL (local o en contenedor)
- Redis (local o en contenedor)
- Certificados digitales (según normativa del proveedor DTE)
- Acceso a proveedor de facturación electrónica (credenciales API)

---

## Instalación y ejecución local

1. Clonar repo
   - git clone <repo-url>
   - cd repo

2. Copiar variables de entorno
   - cp .env.example .env
   - Editar `.env` con credenciales locales.

3. Levantar servicios (docker-compose)
   - docker-compose up -d
   Servicios incluidos: postgres, redis, (pgadmin opcional)

4. Instalar dependencias
   - npm install

5. Generar client Prisma y ejecutar migraciones
   - npx prisma generate
   - npx prisma migrate dev --name init

6. Seed de datos de ejemplo (opcional)
   - npm run seed

7. Ejecutar en modo desarrollo
   - npm run dev
   - Server: http://localhost:3000
   - OpenAPI: http://localhost:3000/docs

Comandos útiles:
- `npm run build` — Compilar TypeScript
- `npm run start` — Ejecutar build
- `npm run test` — Ejecutar tests
- `npm run lint` — ESLint
- `npx prisma studio` — Inspeccionar DB

---

## Variables de entorno (ejemplo `.env.example`)
- PORT=3000
- NODE_ENV=development
- DATABASE_URL=postgresql://user:pass@postgres:5432/dbname
- REDIS_URL=redis://redis:6379
- JWT_SECRET=changeme
- JWT_EXPIRES_IN=15m
- REFRESH_TOKEN_SECRET=changemerefresh
- REFRESH_TOKEN_EXPIRES_IN=7d
- SENTRY_DSN=
- PROVIDER_API_URL=
- PROVIDER_API_KEY=
- CERT_PATH=/secrets/cert.p12
- LOG_LEVEL=info
- RATE_LIMIT_WINDOW_MS=60000
- RATE_LIMIT_MAX=100

**Warning:** No subir `.env` al repositorio. En producción usar Vault o Secret Manager.

---

## Arquitectura y diagramas (alto nivel)
Módulos principales:
- API Gateway (Fastify/Express)
- Auth (login, refresh, roles)
- Servicios: Clients, Products, Invoices, Payments, Reports
- DB: PostgreSQL (Prisma)
- Cache/Queue: Redis + BullMQ
- Workers: firmar/transmitir facturas, enviar correos
- Integraciones externas: Proveedor DTE, Email service, Payment gateway
- Observabilidad: Prometheus, Grafana, Sentry, Logs centralizados

(Agregar diagrama en /docs/diagrams/architecture.png)

---

## Autenticación y autorización
- Flujo:
  - POST /api/v1/auth/login -> devuelve `access_token` (JWT, expiración corta) y `refresh_token`.
  - POST /api/v1/auth/refresh -> renueva tokens.
  - POST /api/v1/auth/logout -> invalidar refresh token (blacklist).
- Cabecera requerida para endpoints protegidos:
  - Authorization: Bearer <access_token>
- Roles sugeridos: ADMIN, FACTURADOR, AUDITOR, CONSULTA
- Implementar middleware de verificación de rol y permisos por endpoint (RBAC).

---

## Endpoints (contratos) — versión /api/v1 (resumen)
> Nota: Exponer documentación OpenAPI completa. Aquí un resumen de cada recurso con métodos, esquema básico y autorizaciones.

Autenticación
- POST /api/v1/auth/login
  - body: { email, password }
  - response: { access_token, refresh_token, user }
- POST /api/v1/auth/refresh
  - body: { refresh_token }
  - response: new tokens
- POST /api/v1/auth/logout
  - body: { refresh_token }
  - auth: Bearer

Usuarios
- GET /api/v1/users — Lista (admin)
- GET /api/v1/users/{id}
- POST /api/v1/users — Crear usuario
- PUT /api/v1/users/{id} — Actualizar
- DELETE /api/v1/users/{id}
- PATCH /api/v1/users/{id}/roles — Asignar roles

Clientes
- GET /api/v1/clients
- GET /api/v1/clients/{id}
- POST /api/v1/clients
- PUT /api/v1/clients/{id}
- DELETE /api/v1/clients/{id}

Productos
- GET /api/v1/products
- GET /api/v1/products/{id}
- POST /api/v1/products
- PUT /api/v1/products/{id}
- PATCH /api/v1/products/{id}/stock
- DELETE /api/v1/products/{id}

Facturas (Invoices)
- POST /api/v1/invoices — Crear factura (draft/issued)
  - body: { client_id, items:[{product_id, description, quantity, unit_price, tax_rate}], payment_condition, currency, notes }
- GET /api/v1/invoices — Filtros: status, date_from, date_to, client_id
- GET /api/v1/invoices/{id}
- POST /api/v1/invoices/{id}/transmit — Encolar transmisión y firma (asíncrono)
- POST /api/v1/invoices/{id}/sign — Forzar firma digital
- GET /api/v1/invoices/{id}/status
- GET /api/v1/invoices/{id}/pdf
- POST /api/v1/invoices/{id}/send — Enviar por correo

Pagos / Cobros
- POST /api/v1/payments — Registrar pago (reference, amount, method)
- GET /api/v1/payments
- POST /api/v1/invoices/{id}/payments — Asociar pago

Reportes / BI (endpoints cacheables)
- GET /api/v1/reports/sales/summary?year=
- GET /api/v1/reports/sales/top-products
- GET /api/v1/reports/aging/invoices

Integraciones / Operativas
- POST /api/v1/webhooks/provider — Webhook del proveedor DTE
- GET /api/v1/health — health check
- GET /metrics — Prometheus metrics

Para cada endpoint:
- Documentar esquema JSON (Zod/DTO), ejemplos request/response y códigos HTTP (200/201/400/401/403/404/409/422/500).

---

## Modelos de datos (esquemas principales)
Se recomienda usar UUIDs y timestamps.

Tabla: users
- id: UUID
- email: string (unique)
- name: string
- password_hash: string
- state: enum(active, disabled)
- created_at, updated_at

Tabla: roles
- id, name, permissions[]

Tabla: clients
- id, name, tax_id (NIT/NRC), address, email, phone, type (individual/company), created_at

Tabla: products
- id, sku, name, description, price, tax_rate, stock, unit, active

Tabla: invoices
- id: UUID
- invoice_number: string (serie y correlativo)
- client_id: UUID
- issuer_id: UUID
- status: enum(draft, issued, transmitted, accepted, rejected, cancelled, paid)
- subtotal: decimal
- tax: decimal
- total: decimal
- currency: string
- created_at, updated_at, transmitted_at, provider_response, dte_number, signature_metadata

Tabla: invoice_items
- id, invoice_id, product_id, description, quantity, unit_price, tax_rate, total

Tabla: payments
- id, invoice_id, amount, method, reference, date, created_by

Tabla: audit_events
- id, user_id, event_type, resource_type, resource_id, ip, timestamp, details (json)

Índice recomendados:
- invoice_number (unique)
- client_id
- created_at
- status

---

## Validaciones y reglas de negocio (clave)
- NIT/NRC: validación de formato según país antes de transmitir.
- Número de factura: secuencial por serie y establecimiento; evitar gaps indebidos.
- Estados y transiciones válidas: 
  - draft -> issued -> transmitted -> accepted/rejected -> (if accepted) paid -> possible cancel
  - Solo roles con permiso pueden emitir, transmitir o anular.
- Stock: verificar disponibilidad al emitir factura con productos físicos.
- Cálculo de impuestos: aplicar tasas por item; redondeo según normativa (2 decimales o regla local).
- Idempotencia: endpoint de transmisión debe ser idempotente (usar invoice_id o request_id).
- Reintentos: transmisión con backoff exponencial; máximo N intentos; alertas si persistente.
- Firma digital: proteger claves privadas; uso de hardware/token si normativa lo exige.

---

## Manejo de errores y códigos de respuesta
Estructura estándar de error:
{
  "code": "ERR_VALIDATION",
  "message": "Descripción legible",
  "details": { ... } // opcional
}

Códigos y significados:
- 200 OK — éxito
- 201 Created — recurso creado
- 400 Bad Request — payload inválido
- 401 Unauthorized — token inválido/ausente
- 403 Forbidden — permiso insuficiente
- 404 Not Found — recurso no encontrado
- 409 Conflict — conflicto (p.ej. invoice_number duplicado)
- 422 Unprocessable Entity — reglas de negocio violadas
- 429 Too Many Requests — rate limit
- 500 Internal Server Error — fallo inesperado

Registrar y rastrear errores con Sentry (incluir request_id en logs).

---

## Seguridad y cumplimiento
- HTTPS obligatorio (TLS 1.2/1.3).
- Hashing de contraseñas con `bcrypt` o `argon2`.
- JWT secrets en Secret Manager; rotación periódica.
- Cifrado en reposo (discos DB) y backups cifrados.
- Rate limiting y WAF (en infra).
- Escanear dependencias: Dependabot, Snyk.
- Pentest antes de producción; revisar requisitos legales de conservación de comprobantes.
- Auditoría: registrar eventos críticos (login, emisión, cambio de roles, transmisión).
- Webhooks: validar firma HMAC para asegurar origen.

---

## Logs, auditoría y monitoreo
- Logs estructurados (JSON) con campos: request_id, user_id, level, route, latency, message, timestamp.
- Correlación: `X-Request-ID` generado en gateway y propagado.
- Métricas: latencia por endpoint, request rate, error rate, queue length, worker success/failure.
- Alertas: tasa de errores > X%, latencia > Y ms, backlog en colas.
- Retención de logs: configurar según políticas (30/90 días).
- Endpoint /metrics para Prometheus (usar `prom-client`).

---

## Tests
- Unit tests (Jest): lógica de cálculo de totales/impuestos, utilitarios.
- Integration tests: rutas principales contra DB de pruebas (usar SQLite/PG en memoria o contenedor).
- End-to-end: flujos críticos (crear cliente -> crear factura -> transmitir).
- Contract tests: validar que el frontend y la API concuerdan (opcional).
- Coverage target: mínimo 80% (definir según equipo).
- Test data: seed scripts y fixtures determinísticos.
- Comandos:
  - `npm run test`
  - `npm run test:watch`
  - `npm run test:coverage`

---

## CI / CD
Pipeline sugerido (GitHub Actions):
- On PR:
  - Instalar deps, lint, type-check (tsc), unit tests, security scan.
- On merge to main:
  - Build, run migrations en staging, publish Docker image, deploy to staging, smoke tests.
- Manual promote to production con approval:
  - Run DB migrations (with backup & confirmation), deploy image, smoke tests.
Artifacts:
- Docker images con tags semánticos.
Rollback:
- Mantener imágenes previas y migraciones reversibles o plan de rollback para DB.

---

## Base de datos y migraciones
- Usar Prisma Migrate (versionada).
- Convenciones:
  - UUIDs para PKs
  - timestamps `created_at`, `updated_at`
  - FK explicit
- Seeds: `prisma/seed.ts` para datos iniciales (roles, admin).
- Backups automáticos diarias y pruebas de restauración periódicas.
- Pooling: configurar `pg` pool y considerar PgBouncer si alto tráfico.
- Índices recomendados: invoice_number, client_id, created_at, status.

---

## Integraciones externas
- Proveedor DTE:
  - Endpoint(s), autenticación, formato de payload, tiempos de respuesta, reintentos.
  - Manejar estados: accepted, rejected, pending.
  - Webhook para notificaciones de aceptado/rechazado.
- Email service (SendGrid / SES / Mailgun) para envío de comprobantes.
- Payment gateway (opcional) para cobros.
- Servicio de verificación fiscal (si existe).
- Webhooks: mecanismo de verificación y reintento; almacenar eventos y estado de entrega.

Idempotencia y seguridad en webhooks: incluir signature header HMAC y validar.

---

## Operaciones y despliegue (runbooks)
- Despliegue habitual:
  1. Merge -> CI -> Build image -> Push registry
  2. Ejecutar migrations en entorno staging (verificar)
  3. Desplegar nueva versión
  4. Ejecutar smoke tests
- Rollback:
  - Revertir a imagen anterior, ejecutar migraciones reversibles o restaurar DB (según caso)
- Runbooks para incidentes:
  - DB unreachable: validar network, failover, restaurar backup, escalar
  - Proveedor DTE caído: pausar envíos automáticos, alertar, reintentar con backoff
  - Fuga de credenciales: rotar secretos, revocar tokens, investigar
- Backups:
  - Dump diario + retención (30/90 días), tests de restore mensual

---

## Performance y escalabilidad
- Cachear endpoints pesados con Redis (reports).
- Offload: transmisión/firma a workers (BullMQ).
- Horizontal scaling del API detrás de LB.
- Control de concurrencia y pool DB.
- Circuit Breaker para llamadas a proveedores externos.
- Monitor de latencias y uso de CPU/memoria.

---

## Guía para desarrolladores / Contribución
- Branching: feature/*, bugfix/*, release/*; PRs a main vía PR con al menos 1 reviewer.
- Normas:
  - ESLint + Prettier
  - TypeScript strict mode
  - Tests obligatorios para cambios de lógica
  - Documentar endpoints nuevos en OpenAPI
- Checklist PR:
  - Lint OK
  - Tests pasados
  - Tipado (tsc) OK
  - Descripción y screenshots (si aplica)
  - Issue link
- Onboarding:
  - `docker-compose up` -> `.env` desde `.env.example` -> `npm install` -> `npx prisma migrate dev`

---

## FAQ y contactos
- ¿Cómo agregar una nueva tasa de impuesto?
  - Añadir campo tax_rate en producto o tabla de tax_rates y actualizar cálculo en `invoices` service; agregar tests.
- ¿Cómo forzar reenvío de una factura?
  - Endpoint admin: POST /api/v1/invoices/{id}/transmit (con bandera force=true)
- Contactos:
  - Backend Lead: nombre.email@empresa.com
  - Product Owner: po.email@empresa.com
  - DevOps: devops.email@empresa.com
  - Slack: #team-backend

---

## Apéndices

### Ejemplo: request para crear una factura
POST /api/v1/invoices
Request body:
```json
{
  "client_id": "c4f4e6a2-8fbb-4d5a-9a1b-123456789abc",
  "type": "CREDITOFISCAL",
  "items": [
    {
      "product_id": "d2f6e8b1-1111-2222-3333-444444444444",
      "description": "Computadora portátil",
      "quantity": 1,
      "unit_price": 499.00,
      "tax_rate": 0.13
    }
  ],
  "payment_condition": "CONTADO",
  "currency": "USD",
  "notes": "Venta al contado"
}
```

Response (201 Created):
```json
{
  "id": "a1b2c3d4-5555-6666-7777-888888888888",
  "invoice_number": "DTE-01-M001-0000001",
  "status": "issued",
  "subtotal": 499.00,
  "tax": 64.87,
  "total": 563.87,
  "created_at": "2025-08-30T12:00:00Z"
}
```

### Ejemplo: flujo asíncrono para transmisión (resumen)
1. Cliente llama POST /invoices -> state `issued`.
2. API encola job `transmit_invoice` con BullMQ (payload: invoice_id, request_id).
3. Worker toma job:
   - Firma digital (usando certificado P12)
   - Llama a proveedor DTE (POST)
   - Actualiza invoice.status según respuesta (transmitted/accepted/rejected)
   - Envía notificación (WebSocket / email) y registra audit_event
4. Frontend consulta GET /invoices/{id}/status o recibe webhook.

### docker-compose (básico para desarrollo)
```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: devdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  app:
    build: .
    command: npm run dev
    volumes:
      - ./:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://dev:dev@postgres:5432/devdb
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  pgdata:
```
