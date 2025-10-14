CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Tabla: empresas
-- ============================================
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(200) NOT NULL,
    nit VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150) NOT NULL,
    representante_legal VARCHAR(200) NOT NULL,
    actividad_economica VARCHAR(500) NOT NULL,
    regimen_tributario VARCHAR(30) DEFAULT 'general',
    codigo_establecimiento VARCHAR(10),
    codigo_punto_venta VARCHAR(10),
    codigo_actividad VARCHAR(10),
    logo_url VARCHAR(500),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin','contador','vendedor','cliente')) DEFAULT 'vendedor',
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL ON UPDATE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: clientes
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) UNIQUE NOT NULL,
    tipo_cliente VARCHAR(20) NOT NULL CHECK (tipo_cliente IN ('persona_natural','persona_juridica')),
    nombre VARCHAR(200) NOT NULL,
    apellido VARCHAR(200),
    nit VARCHAR(20) UNIQUE,
    dui VARCHAR(15) UNIQUE,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    limite_credito DECIMAL(15,2) DEFAULT 0.00,
    saldo_actual DECIMAL(15,2) DEFAULT 0.00,
    dias_credito INT DEFAULT 0,
    exento_impuestos BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: productos
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(15,2) NOT NULL,
    precio_compra DECIMAL(15,2),
    costo_unitario DECIMAL(15,2),
    stock_actual DECIMAL(10,2) DEFAULT 0,
    stock_minimo DECIMAL(10,2) DEFAULT 0,
    unidad_medida VARCHAR(20) DEFAULT 'unidad' CHECK (unidad_medida IN ('unidad','kg','lb','litro','metro','m2','m3')),
    tipo_producto VARCHAR(20) DEFAULT 'producto' CHECK (tipo_producto IN ('producto','servicio')),
    exento_impuestos BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    imagen_url VARCHAR(500),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: impuestos
-- ============================================
CREATE TABLE IF NOT EXISTS impuestos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    tipo_impuesto VARCHAR(20) NOT NULL CHECK (tipo_impuesto IN ('iva','isc','consumo','municipal')),
    aplicable_por_defecto BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: facturas
-- ============================================
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_factura VARCHAR(50) UNIQUE NOT NULL,
    serie VARCHAR(10) NOT NULL,
    tipo_documento VARCHAR(20) DEFAULT 'factura' CHECK (tipo_documento IN ('factura','credito_fiscal','nota_credito','nota_debito')),
    fecha_emision TIMESTAMP NOT NULL,
    fecha_vencimiento TIMESTAMP,
    fecha_pago TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador','emitida','anulada','pagada','vencida')),
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    total_impuestos DECIMAL(15,2) DEFAULT 0.00,
    descuento_global DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) DEFAULT 0.00,
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia','cheque','credito')),
    observaciones TEXT,
    xml_generado TEXT,
    xml_firmado TEXT,
    respuesta_hacienda JSON,
    codigo_autorizacion VARCHAR(100),
    fecha_autorizacion TIMESTAMP,
    cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: detalles_factura
-- ============================================
CREATE TABLE IF NOT EXISTS detalles_factura (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cantidad DECIMAL(10,2) NOT NULL,
    precio_unitario DECIMAL(15,2) NOT NULL,
    descuento DECIMAL(15,2) DEFAULT 0.00,
    subtotal DECIMAL(15,2) NOT NULL,
    total_impuestos DECIMAL(15,2) DEFAULT 0.00,
    total DECIMAL(15,2) NOT NULL,
    descripcion_adicional TEXT,
    factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: detalles_impuesto
-- ============================================
CREATE TABLE IF NOT EXISTS detalles_impuesto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    base_imponible DECIMAL(15,2) NOT NULL,
    porcentaje DECIMAL(5,2) NOT NULL,
    monto DECIMAL(15,2) NOT NULL,
    detalle_factura_id UUID REFERENCES detalles_factura(id) ON DELETE CASCADE,
    impuesto_id UUID REFERENCES impuestos(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- ============================================
-- Tabla: pagos
-- ============================================
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    monto DECIMAL(15,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT NOW(),
    metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('efectivo','tarjeta','transferencia','cheque','credito')),
    referencia VARCHAR(100),
    banco VARCHAR(100),
    numero_cheque VARCHAR(50),
    observaciones TEXT,
    factura_id UUID REFERENCES facturas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);
