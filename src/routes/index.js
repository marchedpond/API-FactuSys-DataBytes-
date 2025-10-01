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

// Ruta de información de la API
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'FactuSys API v1.0.0',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/api/auth',
            empresas: '/api/empresas',
            clientes: '/api/clientes',
            productos: '/api/productos',
            facturas: '/api/facturas',
            categorias: '/api/categorias',
            impuestos: '/api/impuestos'
        }
    });
});

module.exports = router;
