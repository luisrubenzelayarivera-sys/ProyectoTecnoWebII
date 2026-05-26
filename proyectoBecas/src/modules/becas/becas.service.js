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
    `SELECT b.*, e.nombre_completo, tb.nombre_beca
     FROM becas b
     JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
     JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     WHERE b.id_beca = $1 AND b.estado = true`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Beca no encontrada");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
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

module.exports = { obtenerTodas, obtenerPorId, crear, cambiarEstado, eliminar };
