const router = require("express").Router();
const {
  estadosBecas,
  tiposBecas,
  estudiantesConBecas,
  evaluaciones,
  infoGeneral,
} = require("./reportes.controller");
const {
  verificarToken,
  verificarRol,
} = require("../../middlewares/auth.middleware");
//const { infoGeneral } = require("./reportes.service");

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Reportes y monitoreo del sistema de becas
 */

/**
 * @swagger
 * /reportes/estados-becas:
 *   get:
 *     summary: Reporte de becas agrupadas por estado
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Total de becas por estado
 *         content:
 *           application/json:
 *             example:
 *               - estado_beca: ACTIVA
 *                 total: "15"
 *               - estado_beca: FINALIZADA
 *                 total: "8"
 */
router.get(
  "/estados-becas",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA"),
  estadosBecas,
);

router.get(
  "/evaluaciones",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA"),
  evaluaciones,
);
router.get(
  "/info-general",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  infoGeneral,
);

/**
 * @swagger
 * /reportes/tipos-becas:
 *   get:
 *     summary: Reporte de becas agrupadas por tipo
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Total y promedio de porcentaje por tipo de beca
 *         content:
 *           application/json:
 *             example:
 *               - nombre_beca: COMUNIDAD/SOCIOECONOMICA
 *                 total: "10"
 *                 promedio_porcentaje: "65.50"
 */
router.get(
  "/tipos-becas",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA"),
  tiposBecas,
);

/**
 * @swagger
 * /reportes/estudiantes-becas:
 *   get:
 *     summary: Reporte de estudiantes con sus becas
 *     tags: [Reportes]
 *     responses:
 *       200:
 *         description: Lista de estudiantes con detalle de sus becas
 *         content:
 *           application/json:
 *             example:
 *               - nombre_completo: Juan Pérez
 *                 total_becas: 2
 *                 becas:
 *                   - tipo_beca: PROMEDIO
 *                     porcentaje: 50
 *                     estado_beca: ACTIVA
 */
router.get(
  "/estudiantes-becas",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  estudiantesConBecas,
);

module.exports = router;
