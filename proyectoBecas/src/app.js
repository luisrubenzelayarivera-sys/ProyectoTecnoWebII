const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const errorHandler = require("./middlewares/error.middleware");
require("dotenv").config();

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
