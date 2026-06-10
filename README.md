# 🎓 Sistema de Control de Becas — UCB

Sistema web fullstack para la gestión y control de becas universitarias de la Universidad Católica Boliviana (UCB). Desarrollado con Node.js + Express en el backend y React en el frontend.

---

## 📁 Estructura del proyecto

```
ProyectoBecasBF/
├── proyectoBecas/        → Backend (Node.js + Express)
└── frontend-becas/       → Frontend (React + Tailwind CSS)
```

---

## ⚙️ Tecnologías

| Capa | Tecnología |
|------|-----------|
| Backend | Node.js, Express.js |
| Base de datos | PostgreSQL |
| Autenticación | JWT + Refresh Tokens |
| Documentación API | Swagger / OpenAPI |
| Frontend | React, Tailwind CSS |
| HTTP Client | Axios |
| Enrutamiento | React Router DOM |

---

## 🚀 Instalación y configuración

### Requisitos previos
- Node.js v18 o superior
- PostgreSQL v14 o superior
- npm v9 o superior

---

### 1. Base de datos

Crea la base de datos en PostgreSQL:

```sql
CREATE DATABASE becas_ucb;
```

Ejecuta el script SQL del proyecto para crear todas las tablas, índices y triggers:

```bash
psql -U postgres -d becas_ucb -f script_becas.sql
```

Inserta los datos iniciales necesarios:

```sql
-- Carreras
INSERT INTO carreras (nombre_carrera, sigla_carrera) VALUES
  ('Ingeniería de Sistemas', 'ISC'),
  ('Ingeniería Civil', 'IC'),
  ('Administración de Empresas', 'ADE');

-- Tipos de beca
INSERT INTO tipos_beca (nombre_beca) VALUES
  ('COMUNIDAD/SOCIOECONOMICA'),
  ('RECTOR NACIONAL'),
  ('PROMEDIO'),
  ('DISCIPLINA'),
  ('DISCAPACIDAD');

-- Disciplinas
INSERT INTO disciplinas (nombre_disciplina) VALUES
  ('Fútbol'), ('Básquet'), ('Natación'), ('Atletismo'), ('Voleibol');

-- Área de ejemplo
INSERT INTO areas (nombre_area, ubicacion_campus)
VALUES ('Biblioteca Central', 'Campus Principal');

-- Usuario administrador (password: cambia esto en producción)
INSERT INTO usuarios_sistema (email, password_hash, rol)
VALUES (
  'admin@ucb.edu',
  '$2a$10$...hash_generado_con_bcrypt...',
  'ADMIN'
);
```

Para generar el hash de la contraseña desde el backend:

```bash
cd proyectoBecas
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('TuPassword123', 10).then(h => console.log(h))"
```

---

### 2. Backend

```bash
cd proyectoBecas
npm install
```

Crea el archivo `.env` en la raíz de `proyectoBecas/`:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=becas_ucb
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# JWT
JWT_SECRET=ucb_becas_jwt_secret_seguro
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=ucb_becas_refresh_secret_seguro
JWT_REFRESH_EXPIRES_IN=7d
```

Inicia el servidor:

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

El backend estará disponible en `http://localhost:3000`
La documentación Swagger en `http://localhost:3000/api/docs`

---

### 3. Frontend

```bash
cd frontend-becas
npm install
npm start
```

El frontend estará disponible en `http://localhost:3001`

---

## 📌 Endpoints principales de la API

Todos los endpoints (excepto login) requieren el header:
```
Authorization: Bearer <accessToken>
```

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| POST | `/api/v1/auth/login` | Iniciar sesión | Público |
| POST | `/api/v1/auth/refresh` | Renovar token | Público |
| POST | `/api/v1/auth/logout` | Cerrar sesión | Autenticado |
| GET | `/api/v1/estudiantes` | Listar estudiantes | Autenticado |
| POST | `/api/v1/estudiantes` | Crear estudiante | ADMIN, TRABAJO_SOCIAL |
| GET | `/api/v1/becas` | Listar becas | Autenticado |
| POST | `/api/v1/becas` | Crear beca | ADMIN, TRABAJO_SOCIAL |
| PATCH | `/api/v1/becas/:id/estado` | Cambiar estado | ADMIN, TRABAJO_SOCIAL |
| GET | `/api/v1/asignacion` | Listar asignaciones | Autenticado |
| POST | `/api/v1/asignacion` | Crear asignación | ADMIN, TRABAJO_SOCIAL |
| PATCH | `/api/v1/asignacion/:id/evaluacion` | Evaluar asignación | JEFE_AREA, ADMIN |
| GET | `/api/v1/usuarios` | Listar usuarios | ADMIN |
| POST | `/api/v1/usuarios` | Crear usuario | ADMIN |
| GET | `/api/v1/reportes/estados-becas` | Reporte por estado | ADMIN, TRABAJO_SOCIAL, JEFE_AREA |
| GET | `/api/v1/reportes/tipos-becas` | Reporte por tipo | ADMIN, TRABAJO_SOCIAL, JEFE_AREA |
| GET | `/api/v1/reportes/evaluaciones` | Reporte evaluaciones | ADMIN, TRABAJO_SOCIAL, JEFE_AREA |

---

## 👥 Roles del sistema

| Rol | Permisos |
|-----|---------|
| `ADMIN` | Acceso total al sistema |
| `TRABAJO_SOCIAL` | Gestión de estudiantes, becas y asignaciones |
| `JEFE_AREA` | Evaluación de becarios en su área |
| `BECARIO` | Acceso de solo lectura |

---

## 🗂️ Estructura del backend

```
proyectoBecas/
├── src/
│   ├── config/
│   │   ├── db.js              → Conexión a PostgreSQL
│   │   ├── swagger.js         → Configuración Swagger
│   │   ├── env.js             → Validación de variables de entorno
│   │   └── pagination.js      → Helper de paginación
│   ├── middlewares/
│   │   ├── auth.middleware.js  → Verificación JWT y roles
│   │   └── error.middleware.js → Manejo centralizado de errores
│   ├── modules/
│   │   ├── auth/
│   │   ├── usuarios/
│   │   ├── estudiantes/
│   │   ├── becas/
│   │   ├── asignacion/
│   │   └── reportes/
│   └── app.js
├── .env
├── .gitignore
└── package.json
```

Cada módulo sigue la arquitectura en capas:
```
modulo/
├── modulo.routes.js      → Definición de rutas y middlewares
├── modulo.controller.js  → Recepción de peticiones y respuestas
├── modulo.service.js     → Lógica de negocio y consultas a BD
└── modulo.validation.js  → Validaciones con express-validator
```

---

## 🗂️ Estructura del frontend

```
frontend-becas/
├── src/
│   ├── api/               → Llamadas al backend (axios)
│   ├── components/        → Navbar, Pagination, DropdownMenu, etc.
│   ├── context/           → AuthContext (estado global de sesión)
│   ├── pages/
│   │   ├── auth/          → Login
│   │   ├── dashboard/     → Dashboard con KPIs y reportes
│   │   ├── estudiantes/   → CRUD estudiantes
│   │   ├── becas/         → CRUD becas + subtipos
│   │   ├── asignacion/    → Asignaciones y evaluaciones
│   │   └── usuarios/      → Gestión de usuarios
│   └── App.js             → Rutas principales
```

---

## 🔒 Seguridad implementada

- Autenticación con JWT (access token 1h + refresh token 7d)
- Bcrypt para hash de contraseñas
- Helmet para headers de seguridad HTTP
- Rate limiting: 100 req/15min general, 10 intentos/15min en login
- Control de roles por endpoint y por pantalla
- Validación de datos de entrada con express-validator
- Borrado lógico en todas las entidades (nunca se eliminan registros)
- Auditoría automática de cambios via triggers en PostgreSQL
- Validación de variables de entorno al iniciar el servidor

---

## 🗃️ Características de la base de datos

- UUIDs como claves primarias
- Índices parciales para unicidad en registros activos
- Triggers de auditoría automática en tablas principales
- Trigger de exclusividad de subtipos de beca
- Trigger de validación de tipo de beca para asignaciones
- Trigger de consumo automático de semestres en becas continuas

---

## 📄 Licencia

Proyecto académico — Universidad Católica Boliviana (UCB)
Asignatura: Tecnologías Web II
