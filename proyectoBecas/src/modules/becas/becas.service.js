const pool = require("../../config/db");
const paginar = require("../../config/pagination");

const obtenerTodas = async (query) => {
  const { page, limit, offset } = paginar(query);

  const total = await pool.query(
    "SELECT COUNT(*) FROM becas WHERE estado = true",
  );

  const result = await pool.query(
    `SELECT b.*, e.nombre_completo, tb.nombre_beca
     FROM becas b
     JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
     JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     WHERE b.estado = true
     ORDER BY b.gestion DESC, b.periodo DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return {
    data: result.rows,
    total: parseInt(total.rows[0].count),
    page,
    limit,
    totalPages: Math.ceil(total.rows[0].count / limit),
  };
};

const obtenerPorId = async (id) => {
  const result = await pool.query(
    `SELECT b.*, e.nombre_completo, e.carnet, e.email_ucb, e.telefono, tb.nombre_beca, c.nombre_carrera
     FROM becas b
     JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
     JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     LEFT JOIN carr_estudiante ce ON e.id_estudiante = ce.id_estudiante
     LEFT JOIN carreras c ON ce.id_carrera = c.id_carrera
     WHERE b.id_beca = $1 AND b.estado = true`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Beca no encontrada");
    err.status = 404;
    throw err;
  }

  const beca = result.rows[0];

  // Obtener subtipo de beca
  let subtipo = null;
  let datosSubtipo = null;

  // Verificar PROMEDIO
  const resPromedio = await pool.query(
    `SELECT * FROM becas_promedio WHERE id_beca = $1`,
    [id],
  );
  if (resPromedio.rows[0]) {
    subtipo = "PROMEDIO";
    datosSubtipo = resPromedio.rows[0];
  }

  // Verificar RESPONSABLE
  const resResponsable = await pool.query(
    `SELECT * FROM becas_responsable WHERE id_beca = $1`,
    [id],
  );
  if (resResponsable.rows[0]) {
    subtipo = "RESPONSABLE";
    datosSubtipo = resResponsable.rows[0];
  }

  // Verificar DISCIPLINA
  const resDisciplina = await pool.query(
    `SELECT bd.*, d.nombre_disciplina FROM becas_disciplina bd
     LEFT JOIN disciplinas d ON bd.id_disciplina = d.id_disciplina
     WHERE bd.id_beca = $1`,
    [id],
  );
  if (resDisciplina.rows[0]) {
    subtipo = "DISCIPLINA";
    datosSubtipo = resDisciplina.rows[0];
  }

  // Verificar DISCAPACIDAD
  const resDiscapacidad = await pool.query(
    `SELECT * FROM becas_discapacidad WHERE id_beca = $1`,
    [id],
  );
  if (resDiscapacidad.rows[0]) {
    subtipo = "DISCAPACIDAD";
    datosSubtipo = resDiscapacidad.rows[0];
  }

  // Obtener asignación si existe
  const resAsignacion = await pool.query(
    `SELECT a.*, ar.nombre_area 
     FROM asignacion a
     LEFT JOIN areas ar ON a.id_area = ar.id_area
     WHERE a.id_beca = $1 AND a.estado = true`,
    [id],
  );
  const asignacion = resAsignacion.rows[0] || null;

  // Obtener evaluación si existe asignación
  let evaluacion = null;
  if (asignacion) {
    const resEvaluacion = await pool.query(
      `SELECT * FROM evaluaciones WHERE id_asignacion = $1`,
      [asignacion.id_asignacion],
    );
    evaluacion = resEvaluacion.rows[0] || null;
  }

  return {
    ...beca,
    subtipo,
    datosSubtipo,
    asignacion,
    evaluacion,
  };
};

const crear = async (datos) => {
  const {
    id_estudiante,
    id_tipo_beca,
    porcentaje,
    gestion,
    periodo,
    cod_doc_respaldo,
    declaracion_jurada,
    observaciones,
    subtipo,
    datos_subtipo,
  } = datos;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const resultBeca = await client.query(
      `INSERT INTO becas 
        (id_estudiante, id_tipo_beca, porcentaje, gestion, periodo, 
         cod_doc_respaldo, declaracion_jurada, observaciones)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        id_estudiante,
        id_tipo_beca,
        porcentaje,
        gestion,
        periodo,
        cod_doc_respaldo,
        declaracion_jurada,
        observaciones,
      ],
    );

    const beca = resultBeca.rows[0];

    if (subtipo && datos_subtipo) {
      switch (subtipo) {
        case "PROMEDIO":
          await client.query(
            `INSERT INTO becas_promedio (id_beca, promedio_mantenido, gestion_obtenido, semestre_obtenido)
             VALUES ($1, $2, $3, $4)`,
            [
              beca.id_beca,
              datos_subtipo.promedio_mantenido,
              datos_subtipo.gestion_obtenido,
              datos_subtipo.semestre_obtenido,
            ],
          );
          break;

        case "RESPONSABLE":
          await client.query(
            `INSERT INTO becas_responsable (id_beca, responsable_beca, hor_completo, antiguedad)
             VALUES ($1, $2, $3, $4)`,
            [
              beca.id_beca,
              datos_subtipo.responsable_beca,
              datos_subtipo.hor_completo,
              datos_subtipo.antiguedad,
            ],
          );
          break;

        case "DISCIPLINA":
          await client.query(
            `INSERT INTO becas_disciplina (id_beca, id_disciplina)
             VALUES ($1, $2)`,
            [beca.id_beca, datos_subtipo.id_disciplina],
          );
          break;

        case "DISCAPACIDAD":
          await client.query(
            `INSERT INTO becas_discapacidad (id_beca, carnet_discapacidad, porcentaje_disc, tipo_disc)
             VALUES ($1, $2, $3, $4)`,
            [
              beca.id_beca,
              datos_subtipo.carnet_discapacidad,
              datos_subtipo.porcentaje_disc,
              datos_subtipo.tipo_disc,
            ],
          );
          break;
      }
    }

    await client.query("COMMIT");
    return beca;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const cambiarEstado = async (id, estado_beca) => {
  const estadosValidos = ["ACTIVA", "SUSPENDIDA", "FINALIZADA", "ABANDONADA"];
  if (!estadosValidos.includes(estado_beca)) {
    const err = new Error("Estado no válido");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE becas SET estado_beca = $1
     WHERE id_beca = $2 AND estado = true
     RETURNING *`,
    [estado_beca, id],
  );

  if (!result.rows[0]) {
    const err = new Error("Beca no encontrada");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query(
    `UPDATE becas SET estado = false
     WHERE id_beca = $1 AND estado = true
     RETURNING *`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Beca no encontrada");
    err.status = 404;
    throw err;
  }
};

const actualizar = async (id, datos) => {
  const {
    porcentaje,
    gestion,
    periodo,
    estado_beca,
    cod_doc_respaldo,
    declaracion_jurada,
    observaciones,
  } = datos;

  const result = await pool.query(
    `UPDATE becas
     SET porcentaje = $1, gestion = $2, periodo = $3, 
         estado_beca = $4, cod_doc_respaldo = $5, 
         declaracion_jurada = $6, observaciones = $7
     WHERE id_beca = $8 AND estado = true
     RETURNING *`,
    [
      porcentaje,
      gestion,
      periodo,
      estado_beca,
      cod_doc_respaldo,
      declaracion_jurada,
      observaciones,
      id,
    ],
  );

  if (!result.rows[0]) {
    const err = new Error("Beca no encontrada");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const buscarEstudianteConHistorial = async (busqueda) => {
  const query = `
    SELECT DISTINCT e.id_estudiante, e.nombre_completo, e.carnet, e.email_ucb, e.telefono, c.nombre_carrera
    FROM estudiantes e
    LEFT JOIN carr_estudiante ce ON e.id_estudiante = ce.id_estudiante
    LEFT JOIN carreras c ON ce.id_carrera = c.id_carrera
    WHERE e.estado = true 
      AND (LOWER(e.nombre_completo) LIKE LOWER($1) 
           OR LOWER(e.carnet) LIKE LOWER($1)
           OR LOWER(e.email_ucb) LIKE LOWER($1))
    ORDER BY e.nombre_completo ASC
    LIMIT 20
  `;

  const result = await pool.query(query, [`%${busqueda}%`]);

  // Para cada estudiante, obtener su historial de becas
  const estudiantes = await Promise.all(
    result.rows.map(async (est) => {
      const resBecas = await pool.query(
        `SELECT b.id_beca, b.porcentaje, b.gestion, b.periodo, b.estado_beca, 
                tb.nombre_beca
         FROM becas b
         JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
         WHERE b.id_estudiante = $1 AND b.estado = true
         ORDER BY b.gestion DESC, b.periodo DESC`,
        [est.id_estudiante],
      );

      return {
        ...est,
        becas: resBecas.rows,
      };
    }),
  );

  return estudiantes;
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  cambiarEstado,
  eliminar,
  actualizar,
  buscarEstudianteConHistorial,
};
