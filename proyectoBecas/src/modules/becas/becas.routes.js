const router = require("express").Router();
const {
  obtenerTodas,
  obtenerPorId,
  crear,
  cambiarEstado,
  actualizar,
  eliminar,
  buscarEstudiantes,
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

// ─────────────────────────────────────────────────────────────────────────────
// RUTAS ESTÁTICAS  (deben ir SIEMPRE antes de cualquier /:id)
// ─────────────────────────────────────────────────────────────────────────────

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
 * /becas/buscar/estudiantes:
 *   get:
 *     summary: Buscar estudiantes con historial de becas
 *     tags: [Becas]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, carnet o email)
 *     responses:
 *       200:
 *         description: Lista de estudiantes encontrados con su historial de becas
 *       400:
 *         description: Parámetro de búsqueda inválido
 */
router.get("/buscar/estudiantes", verificarToken, buscarEstudiantes);

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

// ── Categorías de beca continua (para BACHILLER) ──────────────────────────
router.get("/categorias", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT id_categoria, nombre_categoria FROM categorias_beca ORDER BY id_categoria`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ── Becas por estudiante (historial completo) ─────────────────────────────
router.get("/by-estudiante/:id_estudiante", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT b.*, tb.nombre_beca,
        bp.promedio_mantenido, bp.gestion_obtenido, bp.semestre_obtenido,
        br.responsable_beca, br.hor_completo, br.antiguedad,
        bdd.id_disciplina, d.nombre_disciplina,
        bdi.carnet_discapacidad, bdi.porcentaje_disc, bdi.tipo_disc,
        bc.id_beca_continua, bc.semestres_otorgados, bc.semestres_consumidos,
        bc.responsable AS resp_continua, cb.nombre_categoria,
        a.id_asignacion, a.horas_semana, a.fecha_asignacion,
        ar.nombre_area, ar.ubicacion_campus,
        ev.puntaje_desempeno, ev.comentario_jefe_area, ev.recomienda_continuidad
       FROM becas b
       JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
       LEFT JOIN becas_promedio bp ON b.id_beca = bp.id_beca
       LEFT JOIN becas_responsable br ON b.id_beca = br.id_beca
       LEFT JOIN becas_disciplina bdd ON b.id_beca = bdd.id_beca
       LEFT JOIN disciplinas d ON bdd.id_disciplina = d.id_disciplina
       LEFT JOIN becas_discapacidad bdi ON b.id_beca = bdi.id_beca
       LEFT JOIN beca_cont_semestre bcs ON b.id_beca = bcs.id_beca
       LEFT JOIN becas_continuas bc ON bcs.id_beca_continua = bc.id_beca_continua
       LEFT JOIN categorias_beca cb ON bc.id_categoria = cb.id_categoria
       LEFT JOIN asignacion a ON b.id_beca = a.id_beca AND a.estado = true
       LEFT JOIN areas ar ON a.id_area = ar.id_area
       LEFT JOIN evaluaciones ev ON a.id_asignacion = ev.id_asignacion
       WHERE b.id_estudiante = $1 AND b.estado = true
       ORDER BY b.gestion DESC, b.periodo DESC`,
      [req.params.id_estudiante]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// RUTAS CON PARÁMETRO /:id  (van después de todas las estáticas)
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Detalle completo de una beca ──────────────────────────────────────────
router.get("/:id/detalle", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT b.*, e.nombre_completo, e.carnet, tb.nombre_beca,
        bp.promedio_mantenido, bp.gestion_obtenido, bp.semestre_obtenido,
        br.responsable_beca, br.hor_completo, br.antiguedad,
        bdd.id_disciplina, d.nombre_disciplina,
        bdi.carnet_discapacidad, bdi.porcentaje_disc, bdi.tipo_disc,
        bc.id_beca_continua, bc.semestres_otorgados, bc.semestres_consumidos,
        bc.responsable AS resp_continua, cb.nombre_categoria,
        a.id_asignacion, a.horas_semana, a.fecha_asignacion,
        ar.id_area, ar.nombre_area, ar.ubicacion_campus, ar.responsable_nombre,
        ev.puntaje_desempeno, ev.comentario_jefe_area, ev.recomienda_continuidad
       FROM becas b
       JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
       JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
       LEFT JOIN becas_promedio bp ON b.id_beca = bp.id_beca
       LEFT JOIN becas_responsable br ON b.id_beca = br.id_beca
       LEFT JOIN becas_disciplina bdd ON b.id_beca = bdd.id_beca
       LEFT JOIN disciplinas d ON bdd.id_disciplina = d.id_disciplina
       LEFT JOIN becas_discapacidad bdi ON b.id_beca = bdi.id_beca
       LEFT JOIN beca_cont_semestre bcs ON b.id_beca = bcs.id_beca
       LEFT JOIN becas_continuas bc ON bcs.id_beca_continua = bc.id_beca_continua
       LEFT JOIN categorias_beca cb ON bc.id_categoria = cb.id_categoria
       LEFT JOIN asignacion a ON b.id_beca = a.id_beca AND a.estado = true
       LEFT JOIN areas ar ON a.id_area = ar.id_area
       LEFT JOIN evaluaciones ev ON a.id_asignacion = ev.id_asignacion
       WHERE b.id_beca = $1 AND b.estado = true`,
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "Beca no encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /becas:
 *   post:
 *     summary: Crear nueva beca
 *     tags: [Becas]
 */
router.post(
  "/",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  validarCrear,
  crear,
);

router.post(
  "/:id/subtipo/promedio",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  async (req, res, next) => {
    try {
      const pool = require("../../config/db");
      const { promedio_mantenido, gestion_obtenido, semestre_obtenido } = req.body;
      const result = await pool.query(
        `INSERT INTO becas_promedio (id_beca, promedio_mantenido, gestion_obtenido, semestre_obtenido)
       VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.params.id, promedio_mantenido, gestion_obtenido, semestre_obtenido],
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

// ── Crear / obtener beca continua (BACHILLER) ─────────────────────────────
router.post("/:id/continua", verificarToken, verificarRol("ADMIN", "TRABAJO_SOCIAL"), async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const { id } = req.params;
    const { id_categoria, semestres_otorgados, responsable, gestion_inicio, periodo_inicio } = req.body;

    if (!semestres_otorgados || semestres_otorgados < 1) {
      return res.status(400).json({ error: "semestres_otorgados debe ser al menos 1" });
    }

    const resBeca = await pool.query(
      `SELECT id_estudiante FROM becas WHERE id_beca = $1 AND estado = true`, [id]
    );
    if (!resBeca.rows[0]) return res.status(404).json({ error: "Beca no encontrada" });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const resContinua = await client.query(
        `INSERT INTO becas_continuas (id_estudiante, gestion_inicio, periodo_inicio, id_categoria, semestres_otorgados, responsable)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [resBeca.rows[0].id_estudiante, gestion_inicio, periodo_inicio, id_categoria || null, semestres_otorgados, responsable || null]
      );
      await client.query(
        `INSERT INTO beca_cont_semestre (id_beca, id_beca_continua) VALUES ($1, $2)`,
        [id, resContinua.rows[0].id_beca_continua]
      );
      await client.query("COMMIT");
      res.status(201).json(resContinua.rows[0]);
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

router.get("/:id/continua", verificarToken, async (req, res, next) => {
  try {
    const pool = require("../../config/db");
    const result = await pool.query(
      `SELECT bc.*, cb.nombre_categoria
       FROM beca_cont_semestre bcs
       JOIN becas_continuas bc ON bcs.id_beca_continua = bc.id_beca_continua
       LEFT JOIN categorias_beca cb ON bc.id_categoria = cb.id_categoria
       WHERE bcs.id_beca = $1`,
      [req.params.id]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /becas/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de una beca
 *     tags: [Becas]
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
 *   patch:
 *     summary: Actualizar datos de una beca
 *     tags: [Becas]
 */
router.patch(
  "/:id",
  verificarToken,
  verificarRol("ADMIN", "TRABAJO_SOCIAL"),
  actualizar,
);

/**
 * @swagger
 * /becas/{id}:
 *   delete:
 *     summary: Eliminar beca (borrado lógico)
 *     tags: [Becas]
 */
router.delete("/:id", verificarToken, verificarRol("ADMIN"), eliminar);

module.exports = router;
