const validarEnv = require("./config/env");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/error.middleware");
require("dotenv").config();
validarEnv();

const app = express();

// ── Middlewares globales ──────────────────────
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());

// ── Documentación Swagger ─────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Seguridad HTTP headers ────────────────────
app.use(helmet());

// ── Prevenir HTTP Parameter Pollution ────────
app.use(hpp());

// ── Rate limiting global ──────────────────────
const limiterGeneral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: "Demasiadas peticiones, intenta de nuevo en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiterGeneral);

// ── Rate limiting estricto para login ─────────
const limiterLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Demasiados intentos de login, intenta en 15 minutos" },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/v1/auth/login", limiterLogin);

// ── Rutas ─────────────────────────────────────
app.use("/api/v1/auth", require("./modules/auth/auth.routes"));
app.use("/api/v1/usuarios", require("./modules/usuarios/usuarios.routes"));
app.use(
  "/api/v1/estudiantes",
  require("./modules/estudiantes/estudiantes.routes"),
);
app.use("/api/v1/becas", require("./modules/becas/becas.routes"));
app.use(
  "/api/v1/asignacion",
  require("./modules/asignacion/asignacion.routes"),
);
app.use("/api/v1/reportes", require("./modules/reportes/reportes.routes"));

// ── Ruta de salud ─────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", mensaje: "Backend Becas UCB funcionando" });
});

// ── Manejo de errores ─────────────────────────
app.use(errorHandler);

// ── Iniciar servidor ──────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación en http://localhost:${PORT}/api/docs`);
});

module.exports = app;
