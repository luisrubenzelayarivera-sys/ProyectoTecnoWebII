-- ================================================
-- BACKEND BECAS UCB - ARQUITECTURA SEGURA Y TRANSACCIONAL (V2)
-- ================================================

-- Habilitar UUIDs (Requerido para el backend)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- 1. SEGURIDAD Y AUDITORÍA
-- ================================================
CREATE TABLE usuarios_sistema (
    id_usuario UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) NOT NULL, -- El UNIQUE se maneja con un índice parcial abajo
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) CHECK (rol IN ('ADMIN', 'TRABAJO_SOCIAL', 'JEFE_AREA', 'BECARIO')),
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice parcial para evitar correos duplicados SOLO en usuarios activos
CREATE UNIQUE INDEX idx_usuarios_email_activo ON usuarios_sistema (email) WHERE estado = true;

CREATE TABLE refresh_tokens (
    id_token UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_usuario UUID NOT NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    fecha_expiracion TIMESTAMP NOT NULL,
    ip_creacion VARCHAR(50),
    revocado BOOLEAN DEFAULT false
);

CREATE TABLE auditoria_logs (
    id_log SERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    tabla_afectada VARCHAR(100) NOT NULL,
    accion VARCHAR(10) CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id VARCHAR(100) NOT NULL,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_origen VARCHAR(50),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 2. CATÁLOGOS BÁSICOS
-- ================================================
CREATE TABLE carreras (
    id_carrera SERIAL PRIMARY KEY,
    nombre_carrera VARCHAR(150) NOT NULL,
    sigla_carrera VARCHAR(10) UNIQUE,
    estado BOOLEAN DEFAULT true
);

CREATE TABLE areas (
    id_area SERIAL PRIMARY KEY,
    nombre_area VARCHAR(100) NOT NULL,
    responsable_nombre VARCHAR(100),
    responsable_telefono VARCHAR(50),
    ubicacion_campus VARCHAR(50),
    estado BOOLEAN DEFAULT true
);

CREATE TABLE tipos_beca (
    id_tipo_beca SERIAL PRIMARY KEY,
    nombre_beca VARCHAR(150) NOT NULL UNIQUE,
    estado BOOLEAN DEFAULT true
);

-- ================================================
-- 3. ESTUDIANTES Y REGISTROS SOCIALES
-- ================================================
CREATE TABLE estudiantes (
    id_estudiante UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_completo VARCHAR(255) NOT NULL,
    carnet VARCHAR(25) NULL,
    email_ucb VARCHAR(150) NULL,
    telefono VARCHAR(15),
    estado BOOLEAN DEFAULT true
);

-- Índices parciales para carnets y correos únicos SOLO si están activos
CREATE UNIQUE INDEX idx_estudiantes_carnet_activo ON estudiantes (carnet) WHERE estado = true AND carnet IS NOT NULL;
CREATE UNIQUE INDEX idx_estudiantes_email_ucb_activo ON estudiantes (email_ucb) WHERE estado = true AND email_ucb IS NOT NULL;

CREATE TABLE carr_estudiante (
    id_carr_estudiante UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_estudiante UUID REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_carrera INT REFERENCES carreras(id_carrera) ON DELETE SET NULL,
    gestion_inicio SMALLINT CHECK (gestion_inicio > 1900),
    periodo_inicio SMALLINT CHECK (periodo_inicio IN (1, 2)),
    estado BOOLEAN DEFAULT true
);

CREATE TABLE pre_registro_social (
    id_pre_registro UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_estudiante UUID NOT NULL REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    visitadora VARCHAR(150),
    nivel_necesidad VARCHAR(50),
    codigo_informe VARCHAR(20),
    gestion_post SMALLINT CHECK (gestion_post > 1900),
    periodo_post SMALLINT CHECK (periodo_post IN (1, 2)),
    estado BOOLEAN DEFAULT true
);

-- ================================================
-- 4. BECAS Y TRANSACCIONES
-- ================================================
CREATE TABLE becas (
    id_beca UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_estudiante UUID NOT NULL REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE,
    id_tipo_beca INT NOT NULL REFERENCES tipos_beca(id_tipo_beca),
    porcentaje DECIMAL(5, 2) NOT NULL CHECK (porcentaje BETWEEN 0.00 AND 100.00),
    gestion SMALLINT CHECK (gestion > 1900),
    periodo SMALLINT CHECK (periodo IN (1, 2)),
    estado_beca VARCHAR(20) CHECK (estado_beca IN ('ACTIVA','SUSPENDIDA','FINALIZADA', 'ABANDONADA')) DEFAULT 'ACTIVA',
    cod_doc_respaldo VARCHAR(50),
    declaracion_jurada BOOLEAN DEFAULT false,
    observaciones TEXT,
    estado BOOLEAN DEFAULT true
);

-- ================================================
-- 5. SUBTIPOS DE BECAS
-- ================================================
CREATE TABLE becas_promedio (
    id_beca UUID PRIMARY KEY REFERENCES becas(id_beca) ON DELETE CASCADE,
    promedio_mantenido DECIMAL(5,2) NOT NULL CHECK (promedio_mantenido BETWEEN 0 AND 100),
    gestion_obtenido SMALLINT NOT NULL,
    semestre_obtenido SMALLINT NOT NULL
);

CREATE TABLE becas_responsable (
    id_beca UUID PRIMARY KEY REFERENCES becas(id_beca) ON DELETE CASCADE,
    responsable_beca VARCHAR(150),
    hor_completo BOOLEAN,
    antiguedad SMALLINT
);

CREATE TABLE disciplinas (
    id_disciplina SERIAL PRIMARY KEY,
    nombre_disciplina VARCHAR(25) NOT NULL
);

CREATE TABLE becas_disciplina (
    id_beca UUID PRIMARY KEY REFERENCES becas(id_beca) ON DELETE CASCADE,
    id_disciplina INT REFERENCES disciplinas(id_disciplina) ON DELETE SET NULL
);

CREATE TABLE categorias_beca (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(25) NOT NULL
);

CREATE TABLE becas_continuas (
    id_beca_continua UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_estudiante UUID REFERENCES estudiantes(id_estudiante),
    gestion_inicio SMALLINT CHECK (gestion_inicio > 1900),
    periodo_inicio SMALLINT CHECK (periodo_inicio IN (1, 2)),
    id_categoria INT NULL REFERENCES categorias_beca(id_categoria),
    semestres_otorgados INT NOT NULL CHECK (semestres_otorgados > 0),
    semestres_consumidos INT DEFAULT 0 CHECK (semestres_consumidos <= semestres_otorgados),
    responsable VARCHAR(150),
    estado_beca VARCHAR(20) DEFAULT 'ACTIVA'
);

CREATE TABLE beca_cont_semestre (
    id_beca UUID PRIMARY KEY REFERENCES becas(id_beca) ON DELETE CASCADE,
    id_beca_continua UUID NOT NULL REFERENCES becas_continuas(id_beca_continua) ON DELETE SET NULL
);

CREATE TABLE becas_discapacidad (
    id_beca UUID PRIMARY KEY REFERENCES becas(id_beca) ON DELETE CASCADE,
    carnet_discapacidad VARCHAR(100),
    porcentaje_disc INT CHECK (porcentaje_disc BETWEEN 0 AND 100),
    tipo_disc VARCHAR(100)
);

-- ================================================
-- 6. ASIGNACIONES Y EVALUACIONES
-- ================================================
CREATE TABLE asignacion (
    id_asignacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_beca UUID NOT NULL REFERENCES becas(id_beca) ON DELETE CASCADE,
    id_area INT NOT NULL REFERENCES areas(id_area) ON DELETE RESTRICT,
    id_pre_registro UUID REFERENCES pre_registro_social(id_pre_registro) ON DELETE SET NULL,
    horas_semana INT NOT NULL CHECK (horas_semana > 0),
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    estado BOOLEAN DEFAULT true,
    UNIQUE (id_beca, id_area)
);

CREATE TABLE evaluaciones (
    id_evaluacion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    id_asignacion UUID NOT NULL UNIQUE REFERENCES asignacion(id_asignacion) ON DELETE CASCADE,
    puntaje_desempeno INT CHECK (puntaje_desempeno BETWEEN 1 AND 100),
    comentario_jefe_area TEXT,
    recomienda_continuidad BOOLEAN,
    estado BOOLEAN DEFAULT true
);

-- ================================================
-- 7. ÍNDICES DE RENDIMIENTO (Backend Optimization)
-- ================================================
CREATE INDEX idx_becas_estudiante ON becas(id_estudiante);
CREATE INDEX idx_becas_tipo ON becas(id_tipo_beca);
CREATE INDEX idx_carr_est_estudiante ON carr_estudiante(id_estudiante);
CREATE INDEX idx_pre_registro_estudiante ON pre_registro_social(id_estudiante);
CREATE INDEX idx_asignacion_beca ON asignacion(id_beca);
CREATE INDEX idx_asignacion_area ON asignacion(id_area);

-- ================================================
-- 8. TRIGGERS DE LÓGICA DE NEGOCIO Y AUDITORÍA
-- ================================================

-- Trigger A: Consumo automático de Semestres para Becas Continuas
CREATE OR REPLACE FUNCTION consumir_semestre_beca_continua()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE becas_continuas
    SET semestres_consumidos = semestres_consumidos + 1
    WHERE id_beca_continua = NEW.id_beca_continua;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_consumir_semestre AFTER INSERT ON beca_cont_semestre 
FOR EACH ROW EXECUTE FUNCTION consumir_semestre_beca_continua();

-- Trigger B: Exclusividad de Subtipos
CREATE OR REPLACE FUNCTION check_subtipo_exclusivo()
RETURNS TRIGGER AS $$
DECLARE conteo INTEGER;
BEGIN
    SELECT COUNT(*) INTO conteo FROM (
        SELECT 1 FROM becas_promedio     WHERE id_beca = NEW.id_beca
        UNION ALL SELECT 1 FROM becas_responsable  WHERE id_beca = NEW.id_beca
        UNION ALL SELECT 1 FROM becas_disciplina   WHERE id_beca = NEW.id_beca
        UNION ALL SELECT 1 FROM beca_cont_semestre WHERE id_beca = NEW.id_beca
        UNION ALL SELECT 1 FROM becas_discapacidad WHERE id_beca = NEW.id_beca
    ) subtipos;

    IF conteo > 0 THEN
        RAISE EXCEPTION 'Error: La beca ya pertenece a otro subtipo.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_becas_promedio_exclusivo BEFORE INSERT OR UPDATE ON becas_promedio FOR EACH ROW EXECUTE FUNCTION check_subtipo_exclusivo();
CREATE TRIGGER trg_becas_responsable_exclusivo BEFORE INSERT OR UPDATE ON becas_responsable FOR EACH ROW EXECUTE FUNCTION check_subtipo_exclusivo();
CREATE TRIGGER trg_becas_disciplina_exclusivo BEFORE INSERT OR UPDATE ON becas_disciplina FOR EACH ROW EXECUTE FUNCTION check_subtipo_exclusivo();
CREATE TRIGGER trg_beca_cont_semestre_exclusivo BEFORE INSERT OR UPDATE ON beca_cont_semestre FOR EACH ROW EXECUTE FUNCTION check_subtipo_exclusivo();
CREATE TRIGGER trg_becas_discapacidad_exclusivo BEFORE INSERT OR UPDATE ON becas_discapacidad FOR EACH ROW EXECUTE FUNCTION check_subtipo_exclusivo();

-- Trigger C: Validar que la asignación solo sea para becas de servicio
CREATE OR REPLACE FUNCTION validar_tipo_beca_asignacion()
RETURNS TRIGGER AS $$
DECLARE v_nombre_beca VARCHAR;
BEGIN
    SELECT tb.nombre_beca INTO v_nombre_beca
    FROM becas b JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
    WHERE b.id_beca = NEW.id_beca;

    IF v_nombre_beca NOT IN ('COMUNIDAD/SOCIOECONOMICA', 'RECTOR NACIONAL') THEN
        RAISE EXCEPTION 'Solo las becas de Comunidad/Socioeconomica y Rector Nacional permiten asignación de horas.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validar_tipo_beca_asignacion BEFORE INSERT OR UPDATE ON asignacion FOR EACH ROW EXECUTE FUNCTION validar_tipo_beca_asignacion();

-- Trigger D: Auditoría Automatizada Dinámica
CREATE OR REPLACE FUNCTION registrar_auditoria()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id UUID;
    v_registro_id VARCHAR;
BEGIN
    -- Intentar capturar el ID del usuario desde la variable de sesión de PostgreSQL
    BEGIN
        v_usuario_id := current_setting('app.current_user_id', true)::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL; -- Si el backend no envía el ID, queda en NULL
    END;

    -- Obtener el valor de la clave primaria dinámicamente usando el nombre de la columna pasado en los argumentos del trigger
    IF (TG_OP = 'DELETE') THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) USING OLD INTO v_registro_id;
        INSERT INTO auditoria_logs (id_usuario, tabla_afectada, accion, registro_id, datos_anteriores)
        VALUES (v_usuario_id, TG_TABLE_NAME, 'DELETE', v_registro_id, row_to_json(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) USING NEW INTO v_registro_id;
        INSERT INTO auditoria_logs (id_usuario, tabla_afectada, accion, registro_id, datos_anteriores, datos_nuevos)
        VALUES (v_usuario_id, TG_TABLE_NAME, 'UPDATE', v_registro_id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        EXECUTE format('SELECT ($1).%I', TG_ARGV[0]) USING NEW INTO v_registro_id;
        INSERT INTO auditoria_logs (id_usuario, tabla_afectada, accion, registro_id, datos_nuevos)
        VALUES (v_usuario_id, TG_TABLE_NAME, 'INSERT', v_registro_id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar la auditoría a las tablas principales (se pasa el nombre de la columna Primary Key como argumento)
CREATE TRIGGER trg_audit_usuarios_sistema AFTER INSERT OR UPDATE OR DELETE ON usuarios_sistema FOR EACH ROW EXECUTE FUNCTION registrar_auditoria('id_usuario');
CREATE TRIGGER trg_audit_estudiantes AFTER INSERT OR UPDATE OR DELETE ON estudiantes FOR EACH ROW EXECUTE FUNCTION registrar_auditoria('id_estudiante');
CREATE TRIGGER trg_audit_becas AFTER INSERT OR UPDATE OR DELETE ON becas FOR EACH ROW EXECUTE FUNCTION registrar_auditoria('id_beca');
CREATE TRIGGER trg_audit_asignacion AFTER INSERT OR UPDATE OR DELETE ON asignacion FOR EACH ROW EXECUTE FUNCTION registrar_auditoria('id_asignacion');

-- ================================================
-- FIN DEL SCRIPT
-- ================================================
INSERT INTO tipos_beca (nombre_beca) VALUES 
    ('APORTE VOLUNTARIO'),
    ('COCA COLA'),
    ('ESTRELLA DEL SUR'),
    ('FERRUFINO'),
    ('INSTITUCIONAL'),
    ('RELIGIOSOS'),
    ('DISCAPACIDAD'),
    ('TRIUNFAR'), 
    ('GRAN CANCILLER'), 
    ('HANSA'),
    ('PATROCINIO'),
    ('COMUNIDAD/SOCIOECONOMICA'),    
    ('RECTOR NACIONAL'),
    ('EXCELENCIA ACAD.'),
    ('OBISPO'),
    ('APORTE DEPORTE'),
    ('APORTE CULTURA'),
    ('BACHILLER');

INSERT INTO usuarios_sistema (email, password_hash, rol)
VALUES (
  'marcel@ucb.edu.bo',
  '$2b$10$x3EkluFrKyGbsjdBSQctdesk.QIrPaWZv4VsCHZuok/mcIqUIgaWC',
  'ADMIN'
);

-- ================================================
-- CARGA DE CATÁLOGOS ESTÁTICOS (DATOS MAESTROS)
-- ================================================
-- Vaciamos las tablas y reiniciamos los contadores SERIAL para una inserción limpia
TRUNCATE TABLE carreras, areas, disciplinas, categorias_beca RESTART IDENTITY CASCADE;

-- 1. CARRERAS (Lista oficial completa)
INSERT INTO carreras (sigla_carrera, nombre_carrera) VALUES
    ('ADM', 'Administración de Empresas'),
    ('ADT', 'Administración Turística'),
    ('ARQ', 'Arquitectura'),
    ('CPR', 'Ciencias Políticas y Relaciones Internacionales'),
    ('CDM', 'Comunicación Digital Multimedia'),
    ('COM', 'Comunicación Social'),
    ('CPA', 'Contaduría Pública'),
    ('DER', 'Derecho'),
    ('DIG', 'Diseño Digital'),
    ('DGR', 'Diseño Gráfico y Comunicación Visual'),
    ('ECO', 'Economía'),
    ('EIN', 'Economía e Inteligencia de Negocios'),
    ('IMA', 'Ingeniería Ambiental'),
    ('INB', 'Ingeniería Biomédica'),
    ('IBB', 'Ingeniería Bioquímica y de Bioprocesos'),
    ('INC', 'Ingeniería Civil'),
    ('ICO', 'Ingeniería Comercial'),
    ('INS', 'Ingeniería de Sistemas'),
    ('IIE', 'Ingeniería en Innovación Empresarial'),
    ('IMU', 'Ingeniería en Multimedia e Interactividad Digital'),
    ('INT', 'Ingeniería en Telecomunicaciones'),
    ('IND', 'Ingeniería Industrial'),
    ('IMT', 'Ingeniería Mecatrónica'),
    ('IQM', 'Ingeniería Química'),
    ('MKD', 'Marketing y Medios Digitales'),
    ('MED', 'Medicina'),
    ('PSI', 'Psicología'),
    ('PSP', 'Psicopedagogía');

-- 2. ÁREAS DE SERVICIO (Lugares donde los becarios prestan sus horas)
-- Hemos incluido ubicaciones para dar más contexto en la interfaz web
INSERT INTO areas (nombre_area, responsable_nombre, responsable_telefono, ubicacion_campus) VALUES
    ('Cuarto de Control - Becas', 'Lic. Ester Gomez', '71234567', 'Bloque D - Planta Baja'),
    ('Biblioteca Central', 'Carlos Ruiz', '72345678', 'Bloque A - Piso 1'),
    ('Pastoral Universitaria', 'Padre Juan Perez', '73456789', 'Capilla Universitaria'),
    ('Laboratorio de Cómputo e Infraestructura', 'Ing. Roberto Silva', '74567890', 'Bloque C - Piso 2'),
    ('Marketing y Relaciones Públicas', 'Lic. Mariana Costa', '75678901', 'Bloque Administrativo'),
    ('Kardex Académico', 'Lic. Andrea Rojas', '76789012', 'Bloque D - Planta Baja'),
    ('Bienestar Estudiantil', 'Lic. Fernando Rios', '77890123', 'Bloque B'),
    ('Gimnasio Deportivo', 'Prof. Marco Antonio', '78901234', 'Coliseo Universitario'),
    ('Clínica Universitaria', 'Dra. Susana Lima', '79012345', 'Bloque A - Planta Baja'),
    ('Atención al Cliente (Informaciones)', 'Lic. Patricia Vargas', '70123456', 'Ingreso Principal');

-- 3. DISCIPLINAS (Ramas para becas deportivas y culturales)
INSERT INTO disciplinas (nombre_disciplina) VALUES
    ('DANZA MODERNA'),
    ('TEATRO'),
    ('CORO'),
    ('BALLET FOLKLORICO'),
    ('TUNA'),
    ('VOLEIBOL'),
    ('BÁSQUETBOL'),
    ('AJEDREZ'),
    ('FUTSAL');

-- 4. CATEGORÍAS DE BECA CONTINUA
INSERT INTO categorias_beca (nombre_categoria) VALUES
    ('ORO'),
    ('PLATA'),
    ('BRONCE'),
    ('HONOR');

-- ================================================
-- 5. USUARIOS BASE DEL SISTEMA (ROLES)
-- ================================================
-- Nota: El hash insertado equivale a la contraseña 'password123' procesada con Bcrypt.
-- Sirve perfectamente para que pruebes el login en NestJS sin tener que encriptar a mano al principio.

INSERT INTO usuarios_sistema (email, password_hash, rol) VALUES 
    ('admin.sistema@ucb.edu.bo', '$2b$10$x3EkluFrKyGbsjdBSQctdesk.QIrPaWZv4VsCHZuok/mcIqUIgaWC', 'ADMIN'),
    ('ester.gomez@ucb.edu.bo', '$2b$10$x3EkluFrKyGbsjdBSQctdesk.QIrPaWZv4VsCHZuok/mcIqUIgaWC', 'JEFE_AREA'),
    ('trabajosocial@ucb.edu.bo', '$2b$10$x3EkluFrKyGbsjdBSQctdesk.QIrPaWZv4VsCHZuok/mcIqUIgaWC', 'TRABAJO_SOCIAL'),
    ('roberto.silva@ucb.edu.bo', '$2b$10$x3EkluFrKyGbsjdBSQctdesk.QIrPaWZv4VsCHZuok/mcIqUIgaWC', 'JEFE_AREA'),
    ('carlos.ruiz@ucb.edu.bo', '$2b$10$x3EkluFrKyGbsjdBSQctdesk.QIrPaWZv4VsCHZuok/mcIqUIgaWC', 'JEFE_AREA');