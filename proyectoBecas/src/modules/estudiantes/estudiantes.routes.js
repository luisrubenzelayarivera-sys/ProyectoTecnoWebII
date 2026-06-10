const router = require("express").Router();
const {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
} = require("./estudiantes.controller");
const {
  verificarToken,
  verificarRol,
} = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Gestión de estudiantes
 */

/**
 * @swagger
 * /estudiantes:
 *   get:
 *     summary: Obtener todos los estudiantes
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes
 */
router.get("/", verificarToken, obtenerTodos);

/**
 * @swagger
 * /estudiantes/lista:
 *   get:
 *     summary: Obtener lista simple de estudiantes para selectores
 *     tags: [Estudiantes]
 *     responses:
 *       200:
 *         description: Lista de estudiantes
 */
router.get("/lista", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT id_estudiante, nombre_completo, carnet
       FROM estudiantes
       WHERE estado = true
       ORDER BY nombre_completo ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/carreras", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT id_carrera, nombre_carrera, sigla_carrera
       FROM carreras WHERE estado = true
       ORDER BY nombre_carrera`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /estudiantes/{id}:
 *   get:
 *     summary: Obtener estudiante por ID
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estudiante encontrado
 *       404:
 *         description: Estudiante no encontrado
 */
router.get("/:id", verificarToken, obtenerPorId);

/**
 * @swagger
 * /estudiantes:
 *   post:
 *     summary: Crear nuevo estudiante
 *     tags: [Estudiantes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_completo
 *             properties:
 *               nombre_completo:
 *                 type: string
 *                 example: Juan Pérez
 *               carnet:
 *                 type: string
 *                 example: 12345678
 *               email_ucb:
 *                 type: string
 *                 example: juan.perez@ucb.edu
 *               telefono:
 *                 type: string
 *                 example: 70000000
 *               id_carrera:
 *                 type: integer
 *                 example: 1
 *               gestion_inicio:
 *                 type: integer
 *                 example: 2024
 *               periodo_inicio:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Estudiante creado
 *       400:
 *         description: Datos inválidos
 */
router.post(
  "/",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  crear,
);

/**
 * @swagger
 * /estudiantes/{id}:
 *   put:
 *     summary: Actualizar estudiante
 *     tags: [Estudiantes]
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
 *               nombre_completo:
 *                 type: string
 *               carnet:
 *                 type: string
 *               email_ucb:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estudiante actualizado
 *       404:
 *         description: Estudiante no encontrado
 */
router.put(
  "/:id",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  actualizar,
);

/**
 * @swagger
 * /estudiantes/{id}:
 *   delete:
 *     summary: Eliminar estudiante (borrado lógico)
 *     tags: [Estudiantes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estudiante eliminado
 *       404:
 *         description: Estudiante no encontrado
 */
router.delete("/:id", verificarToken, verificarRol("ADMIN"), eliminar);


// ── Cambiar carrera del estudiante ────────────────────────────────
// PATCH /estudiantes/:id/carrera
// Body: { id_carrera, semestre_inicio }
router.patch("/:id/carrera", verificarToken, verificarRol("ADMIN", "TRABAJO_SOCIAL"), async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const { id } = req.params;
    const { id_carrera, semestre_inicio } = req.body;

    if (!id_carrera) return res.status(400).json({ error: "id_carrera es requerido" });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Desactivar carrera actual
      await client.query(
        `UPDATE carr_estudiante SET estado = false WHERE id_estudiante = $1 AND estado = true`,
        [id]
      );
      // Insertar nueva carrera
      const result = await client.query(
        `INSERT INTO carr_estudiante (id_estudiante, id_carrera, semestre_inicio, estado)
         VALUES ($1, $2, $3, true) RETURNING *`,
        [id, id_carrera, semestre_inicio || null]
      );
      await client.query("COMMIT");
      res.json(result.rows[0]);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
