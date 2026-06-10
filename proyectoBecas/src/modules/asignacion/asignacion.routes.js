const router = require("express").Router();
const {
  obtenerTodas,
  obtenerPorId,
  crear,
  evaluar,
  eliminar,
} = require("./asignacion.controller");
const {
  verificarToken,
  verificarRol,
} = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Asignacion
 *   description: Gestión de asignaciones y evaluaciones
 */

/**
 * @swagger
 * /asignacion:
 *   get:
 *     summary: Obtener todas las asignaciones
 *     tags: [Asignacion]
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 */
router.get("/", verificarToken, obtenerTodas);
router.get("/areas", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT id_area, nombre_area, ubicacion_campus
       FROM areas WHERE estado = true
       ORDER BY nombre_area`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /asignacion/{id}:
 *   get:
 *     summary: Obtener asignación por ID
 *     tags: [Asignacion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asignación encontrada
 *       404:
 *         description: Asignación no encontrada
 */
router.get("/:id", verificarToken, obtenerPorId);

/**
 * @swagger
 * /asignacion:
 *   post:
 *     summary: Crear nueva asignación
 *     tags: [Asignacion]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_beca
 *               - id_area
 *               - horas_semana
 *             properties:
 *               id_beca:
 *                 type: string
 *                 example: uuid-de-la-beca
 *               id_area:
 *                 type: integer
 *                 example: 1
 *               id_pre_registro:
 *                 type: string
 *                 example: uuid-del-pre-registro
 *               horas_semana:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: Asignación creada
 *       400:
 *         description: Tipo de beca no permite asignación
 */
router.post(
  "/",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  crear,
);

/**
 * @swagger
 * /asignacion/{id}/evaluacion:
 *   patch:
 *     summary: Registrar o actualizar evaluación de una asignación
 *     tags: [Asignacion]
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
 *             required:
 *               - puntaje_desempeno
 *               - recomienda_continuidad
 *             properties:
 *               puntaje_desempeno:
 *                 type: integer
 *                 example: 85
 *               comentario_jefe_area:
 *                 type: string
 *                 example: Buen desempeño durante el semestre
 *               recomienda_continuidad:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Evaluación registrada o actualizada
 *       404:
 *         description: Asignación no encontrada
 */
router.patch(
  "/:id/evaluacion",
  verificarToken,
  verificarRol("JEFE_AREA", "ADMIN"),
  evaluar,
);

/**
 * @swagger
 * /asignacion/{id}:
 *   delete:
 *     summary: Eliminar asignación (borrado lógico)
 *     tags: [Asignacion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Asignación eliminada
 *       404:
 *         description: Asignación no encontrada
 */
router.delete("/:id", verificarToken, verificarRol("ADMIN"), eliminar);

module.exports = router;
