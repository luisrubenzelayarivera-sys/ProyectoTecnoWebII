const pool = require("../../config/db");
const paginar = require("../../config/pagination");

const obtenerTodos = async (query) => {
  const { page, limit, offset } = paginar(query);

  const total = await pool.query(
    "SELECT COUNT(*) FROM estudiantes WHERE estado = true",
  );

  const result = await pool.query(
    `SELECT e.*, c.nombre_carrera
     FROM estudiantes e
     LEFT JOIN carr_estudiante ce ON e.id_estudiante = ce.id_estudiante
     LEFT JOIN carreras c ON ce.id_carrera = c.id_carrera
     WHERE e.estado = true
     ORDER BY e.nombre_completo ASC
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
    `SELECT e.*, c.nombre_carrera
     FROM estudiantes e
     LEFT JOIN carr_estudiante ce ON e.id_estudiante = ce.id_estudiante
     LEFT JOIN carreras c ON ce.id_carrera = c.id_carrera
     WHERE e.id_estudiante = $1 AND e.estado = true`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Estudiante no encontrado");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const crear = async (datos) => {
  const {
    nombre_completo,
    carnet,
    email_ucb,
    telefono,
    id_carrera,
    gestion_inicio,
    periodo_inicio,
  } = datos;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const resultEstudiante = await client.query(
      `INSERT INTO estudiantes (nombre_completo, carnet, email_ucb, telefono)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [nombre_completo, carnet, email_ucb, telefono],
    );

    const estudiante = resultEstudiante.rows[0];

    if (id_carrera) {
      await client.query(
        `INSERT INTO carr_estudiante (id_estudiante, id_carrera, gestion_inicio, periodo_inicio)
         VALUES ($1, $2, $3, $4)`,
        [estudiante.id_estudiante, id_carrera, gestion_inicio, periodo_inicio],
      );
    }

    await client.query("COMMIT");
    return estudiante;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

const actualizar = async (id, datos) => {
  const { nombre_completo, carnet, email_ucb, telefono } = datos;

  const result = await pool.query(
    `UPDATE estudiantes
     SET nombre_completo = $1, carnet = $2, email_ucb = $3, telefono = $4
     WHERE id_estudiante = $5 AND estado = true
     RETURNING *`,
    [nombre_completo, carnet, email_ucb, telefono, id],
  );

  if (!result.rows[0]) {
    const err = new Error("Estudiante no encontrado");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const eliminar = async (id) => {
  const result = await pool.query(
    `UPDATE estudiantes SET estado = false
     WHERE id_estudiante = $1 AND estado = true
     RETURNING *`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Estudiante no encontrado");
    err.status = 404;
    throw err;
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
