const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./authRoutes');
const empresaRoutes = require('./empresaRoutes');
const clienteRoutes = require('./clienteRoutes');
const productoRoutes = require('./productoRoutes');
const facturaRoutes = require('./facturaRoutes');
const categoriaRoutes = require('./categoriaRoutes');
const impuestoRoutes = require('./impuestoRoutes');
const emailRoutes = require('./emailRoutes');

const router = express.Router();

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FactuSys API',
            version: '1.0.0',
            description: 'API completa para sistema de facturación con integración a Hacienda de El Salvador',
            contact: {
                name: 'DataBytes',
                email: 'info@databytes.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: process.env.API_URL || 'http://localhost:3000/api',
                description: 'Servidor de desarrollo'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Error message'
                        }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Success message'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string', example: 'Juan' },
                        apellido: { type: 'string', example: 'Pérez' },
                        email: { type: 'string', format: 'email', example: 'juan@example.com' },
                        rol: { type: 'string', enum: ['admin', 'contador', 'vendedor', 'cliente'] },
                        activo: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' }
                    }
                },
                Empresa: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        nombre: { type: 'string', example: 'Mi Empresa S.A. de C.V.' },
                        nit: { type: 'string', example: '0614-123456-123-4' },
                        direccion: { type: 'string', example: 'San Salvador, El Salvador' },
                        telefono: { type: 'string', example: '+503 2222-2222' },
                        email: { type: 'string', format: 'email', example: 'info@miempresa.com' },
                        representante_legal: { type: 'string', example: 'Juan Pérez' },
                        actividad_economica: { type: 'string', example: 'Comercio al por menor' },
                        regimen_tributario: { type: 'string', enum: ['general', 'simplificado', 'pequeno_contribuyente'] }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js'
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Documentación de Swagger
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'FactuSys API Documentation'
}));

// Rutas de la API
router.use('/auth', authRoutes);
router.use('/empresas', empresaRoutes);
router.use('/clientes', clienteRoutes);
router.use('/productos', productoRoutes);
router.use('/facturas', facturaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/impuestos', impuestoRoutes);
router.use('/email', emailRoutes);

// Ruta de información de la API
router.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
        success: true,
        message: 'FactuSys API v1.0.0 - DataBytes',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        server: {
            baseUrl: baseUrl,
            apiUrl: `${baseUrl}/api`,
            environment: process.env.NODE_ENV || 'development',
            port: process.env.PORT || 3000
        },
        documentation: `${baseUrl}/api/docs`,
        endpoints: {
            auth: {
                base: '/api/auth',
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                profile: 'GET /api/auth/profile',
                refresh: 'POST /api/auth/refresh'
            },
            empresas: {
                base: '/api/empresas',
                list: 'GET /api/empresas',
                create: 'POST /api/empresas',
                get: 'GET /api/empresas/:id',
                update: 'PUT /api/empresas/:id'
            },
            clientes: {
                base: '/api/clientes',
                list: 'GET /api/clientes',
                create: 'POST /api/clientes',
                get: 'GET /api/clientes/:id',
                update: 'PUT /api/clientes/:id',
                delete: 'DELETE /api/clientes/:id'
            },
            productos: {
                base: '/api/productos',
                list: 'GET /api/productos',
                create: 'POST /api/productos',
                get: 'GET /api/productos/:id',
                update: 'PUT /api/productos/:id',
                delete: 'DELETE /api/productos/:id'
            },
            facturas: {
                base: '/api/facturas',
                list: 'GET /api/facturas',
                create: 'POST /api/facturas',
                get: 'GET /api/facturas/:id',
                emitir: 'POST /api/facturas/:id/emitir',
                anular: 'POST /api/facturas/:id/anular',
                pdf: 'GET /api/facturas/:id/pdf'
            },
            categorias: {
                base: '/api/categorias',
                list: 'GET /api/categorias',
                create: 'POST /api/categorias',
                get: 'GET /api/categorias/:id',
                update: 'PUT /api/categorias/:id'
            },
            impuestos: {
                base: '/api/impuestos',
                list: 'GET /api/impuestos',
                create: 'POST /api/impuestos',
                get: 'GET /api/impuestos/:id',
                update: 'PUT /api/impuestos/:id'
            },
            email: {
                base: '/api/email',
                send: 'POST /api/email/send'
            }
        },
        frontend: {
            expectedUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
            corsEnabled: true
        },
        database: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            name: process.env.DB_NAME || 'factusys_db',
            dialect: process.env.DB_DIALECT || 'postgres'
        },
        testCredentials: {
            admin: {
                email: 'admin@databytes.sv',
                password: 'Admin123',
                role: 'admin'
            },
            contador: {
                email: 'contador@databytes.sv',
                password: 'Admin123',
                role: 'contador'
            },
            vendedor: {
                email: 'vendedor@databytes.sv',
                password: 'Admin123',
                role: 'vendedor'
            },
            cliente: {
                email: 'cliente@databytes.sv',
                password: 'Admin123',
                role: 'cliente'
            }
        }
    });
});

module.exports = router;
