const pool = require("../../config/db");
const paginar = require("../../config/pagination");

const obtenerTodas = async (query) => {
  const { page, limit, offset } = paginar(query);

  const total = await pool.query(
    "SELECT COUNT(*) FROM asignacion WHERE estado = true",
  );

  const result = await pool.query(
    `SELECT a.*,
     b.porcentaje, b.estado_beca,
     e.nombre_completo,
     ar.nombre_area,
     tb.nombre_beca
     FROM asignacion a
     JOIN becas b ON a.id_beca = b.id_beca
     JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
     JOIN areas ar ON a.id_area = ar.id_area
     JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     WHERE a.estado = true
     ORDER BY a.fecha_asignacion DESC
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
    `SELECT a.*,
     b.porcentaje, b.estado_beca,
     e.nombre_completo,
     ar.nombre_area,
     tb.nombre_beca
     FROM asignacion a
     JOIN becas b ON a.id_beca = b.id_beca
     JOIN estudiantes e ON b.id_estudiante = e.id_estudiante
     JOIN areas ar ON a.id_area = ar.id_area
     JOIN tipos_beca tb ON b.id_tipo_beca = tb.id_tipo_beca
     WHERE a.id_asignacion = $1 AND a.estado = true`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Asignación no encontrada");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const crear = async (datos) => {
  const { id_beca, id_area, id_pre_registro, horas_semana } = datos;

  const existe = await pool.query(
    `SELECT id_asignacion FROM asignacion 
     WHERE id_beca = $1 AND id_area = $2 AND estado = true`,
    [id_beca, id_area],
  );

  if (existe.rows[0]) {
    const err = new Error(
      "Este estudiante ya tiene una asignación activa en esta área",
    );
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `INSERT INTO asignacion (id_beca, id_area, id_pre_registro, horas_semana)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id_beca, id_area, id_pre_registro, horas_semana],
  );

  return result.rows[0];
};

const evaluar = async (id_asignacion, datos) => {
  const { puntaje_desempeno, comentario_jefe_area, recomienda_continuidad } =
    datos;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existe = await client.query(
      "SELECT * FROM evaluaciones WHERE id_asignacion = $1",
      [id_asignacion],
    );

    let result;
    if (existe.rows[0]) {
      result = await client.query(
        `UPDATE evaluaciones
         SET puntaje_desempeno = $1, comentario_jefe_area = $2, recomienda_continuidad = $3
         WHERE id_asignacion = $4
         RETURNING *`,
        [
          puntaje_desempeno,
          comentario_jefe_area,
          recomienda_continuidad,
          id_asignacion,
        ],
      );
    } else {
      result = await client.query(
        `INSERT INTO evaluaciones (id_asignacion, puntaje_desempeno, comentario_jefe_area, recomienda_continuidad)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          id_asignacion,
          puntaje_desempeno,
          comentario_jefe_area,
          recomienda_continuidad,
        ],
      );
    }

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const eliminar = async (id) => {
  const result = await pool.query(
    `UPDATE asignacion SET estado = false
     WHERE id_asignacion = $1 AND estado = true
     RETURNING *`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Asignación no encontrada");
    err.status = 404;
    throw err;
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, evaluar, eliminar };
