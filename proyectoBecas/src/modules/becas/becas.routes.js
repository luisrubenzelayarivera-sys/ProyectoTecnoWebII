const router = require("express").Router();
const {
  obtenerTodas,
  obtenerPorId,
  crear,
  cambiarEstado,
  eliminar,
} = require("./becas.controller");
const {
  verificarToken,
  verificarRol,
} = require("../../middlewares/auth.middleware");
const { validarCrear, validarCambiarEstado } = require("./becas.validation");

/**
 * @swagger
 * tags:
 *   name: Becas
 *   description: Gestión de becas
 */

/**
 * @swagger
 * /becas:
 *   get:
 *     summary: Obtener todas las becas
 *     tags: [Becas]
 *     responses:
 *       200:
 *         description: Lista de becas
 */
router.get("/", verificarToken, obtenerTodas);

/**
 * @swagger
 * /becas/tipos:
 *   get:
 *     summary: Obtener lista de tipos de beca
 *     tags: [Becas]
 *     responses:
 *       200:
 *         description: Lista de tipos
 */
router.get("/tipos", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT id_tipo_beca, nombre_beca FROM tipos_beca WHERE estado = true ORDER BY nombre_beca`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /becas/disciplinas:
 *   get:
 *     summary: Obtener lista de disciplinas
 *     tags: [Becas]
 *     responses:
 *       200:
 *         description: Lista de disciplinas
 */
router.get("/disciplinas", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT id_disciplina, nombre_disciplina FROM disciplinas ORDER BY nombre_disciplina`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /becas/lista:
 *   get:
 *     summary: Obtener lista simple de becas para selectores
 *     tags: [Becas]
 *     responses:
 *       200:
 *         description: Lista de becas
 */
router.get("/lista", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT b.id_beca, e.nombre_completo, tb.nombre_beca, b.porcentaje, b.gestion, b.periodo
       FROM becas b
       JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
       JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
       WHERE b.estado = true AND b.estado_beca = 'ACTIVA'
       AND tb.nombre_beca IN ('COMUNIDAD/SOCIOECONOMICA', 'RECTOR NACIONAL')
       ORDER BY e.nombre_completo`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/subtipo/promedio",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  async (req, res, next) => {
    try {
      const pool = require("../../config/db");
      const { promedio_mantenido, gestion_obtenido, semestre_obtenido } =
        req.body;
      const result = await pool.query(
        `INSERT INTO becas_promedio (id_beca, promedio_mantenido, gestion_obtenido, semestre_obtenido)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [
          req.params.id,
          promedio_mantenido,
          gestion_obtenido,
          semestre_obtenido,
        ],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/subtipo/responsable",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  async (req, res, next) => {
    try {
      const pool = require("../../config/db");
      const { responsable_beca, hor_completo, antiguedad } = req.body;
      const result = await pool.query(
        `INSERT INTO becas_responsable (id_beca, responsable_beca, hor_completo, antiguedad)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.params.id, responsable_beca, hor_completo, antiguedad],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/subtipo/disciplina",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  async (req, res, next) => {
    try {
      const pool = require("../../config/db");
      const { id_disciplina } = req.body;
      const result = await pool.query(
        `INSERT INTO becas_disciplina (id_beca, id_disciplina)
       VALUES ($1, $2) RETURNING *`,
        [req.params.id, id_disciplina],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/subtipo/discapacidad",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  async (req, res, next) => {
    try {
      const pool = require("../../config/db");
      const { carnet_discapacidad, porcentaje_disc, tipo_disc } = req.body;
      const result = await pool.query(
        `INSERT INTO becas_discapacidad (id_beca, carnet_discapacidad, porcentaje_disc, tipo_disc)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.params.id, carnet_discapacidad, porcentaje_disc, tipo_disc],
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  },
);

/**
 * @swagger
 * /becas/{id}:
 *   get:
 *     summary: Obtener beca por ID
 *     tags: [Becas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Beca encontrada
 *       404:
 *         description: Beca no encontrada
 */
router.get("/:id", verificarToken, obtenerPorId);

/**
 * @swagger
 * /becas:
 *   post:
 *     summary: Crear nueva beca
 *     tags: [Becas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_estudiante
 *               - id_tipo_beca
 *               - porcentaje
 *               - gestion
 *               - periodo
 *             properties:
 *               id_estudiante:
 *                 type: string
 *                 example: 41ee5536-cefc-4e7d-8966-1d6c9200b3fd
 *               id_tipo_beca:
 *                 type: integer
 *                 example: 1
 *               porcentaje:
 *                 type: number
 *                 example: 50.00
 *               gestion:
 *                 type: integer
 *                 example: 2024
 *               periodo:
 *                 type: integer
 *                 example: 1
 *               cod_doc_respaldo:
 *                 type: string
 *                 example: DOC-001
 *               declaracion_jurada:
 *                 type: boolean
 *                 example: true
 *               observaciones:
 *                 type: string
 *                 example: Beca por rendimiento académico
 *               subtipo:
 *                 type: string
 *                 enum: [PROMEDIO, RESPONSABLE, DISCIPLINA, DISCAPACIDAD]
 *                 example: PROMEDIO
 *               datos_subtipo:
 *                 type: object
 *                 example: {
 *                   "promedio_mantenido": 85.5,
 *                   "gestion_obtenido": 2023,
 *                   "semestre_obtenido": 2
 *                 }
 *     responses:
 *       201:
 *         description: Beca creada
 *       400:
 *         description: Datos inválidos
 */
router.post(
  "/",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  validarCrear,
  crear,
);

/**
 * @swagger
 * /becas/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una beca
 *     tags: [Becas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado_beca:
 *                 type: string
 *                 enum: [ACTIVA, SUSPENDIDA, FINALIZADA, ABANDONADA]
 *                 example: SUSPENDIDA
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Beca no encontrada
 */
router.patch(
  "/:id/estado",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  validarCambiarEstado,
  cambiarEstado,
);
/**
 * @swagger
 * /becas/{id}:
 *   delete:
 *     summary: Eliminar beca (borrado lógico)
 *     tags: [Becas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Beca eliminada
 *       404:
 *         description: Beca no encontrada
 */
router.delete("/:id", verificarToken, verificarRol("ADMIN"), eliminar);

module.exports = router;
