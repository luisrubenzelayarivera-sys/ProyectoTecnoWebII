const pool = require("../../config/db");
const bcrypt = require("bcryptjs");
const paginar = require("../../config/pagination");

const obtenerTodos = async (query) => {
  const { page, limit, offset } = paginar(query);

  const total = await pool.query(
    "SELECT COUNT(*) FROM usuarios_sistema WHERE estado = true",
  );

  const result = await pool.query(
    `SELECT id_usuario, email, rol, estado, fecha_creacion
     FROM usuarios_sistema
     WHERE estado = true
     ORDER BY fecha_creacion DESC
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
    `SELECT id_usuario, email, rol, estado, fecha_creacion
     FROM usuarios_sistema
     WHERE id_usuario = $1 AND estado = true`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const crear = async (datos) => {
  const { email, password, rol } = datos;

  const existe = await pool.query(
    "SELECT id_usuario FROM usuarios_sistema WHERE email = $1 AND estado = true",
    [email],
  );

  if (existe.rows[0]) {
    const err = new Error("El email ya está registrado");
    err.status = 400;
    throw err;
  }

  const rolesValidos = ["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA", "BECARIO"];
  if (!rolesValidos.includes(rol)) {
    const err = new Error("Rol no válido");
    err.status = 400;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const result = await pool.query(
    `INSERT INTO usuarios_sistema (email, password_hash, rol)
     VALUES ($1, $2, $3)
     RETURNING id_usuario, email, rol, estado, fecha_creacion`,
    [email, password_hash, rol],
  );

  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const { email, rol } = datos;

  const rolesValidos = ["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA", "BECARIO"];
  if (rol && !rolesValidos.includes(rol)) {
    const err = new Error("Rol no válido");
    err.status = 400;
    throw err;
  }

  const result = await pool.query(
    `UPDATE usuarios_sistema
     SET email = COALESCE($1, email),
         rol   = COALESCE($2, rol)
     WHERE id_usuario = $3 AND estado = true
     RETURNING id_usuario, email, rol, estado, fecha_creacion`,
    [email, rol, id],
  );

  if (!result.rows[0]) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  return result.rows[0];
};

const cambiarPassword = async (id, datos) => {
  const { password_actual, password_nuevo } = datos;

  const result = await pool.query(
    "SELECT * FROM usuarios_sistema WHERE id_usuario = $1 AND estado = true",
    [id],
  );

  const usuario = result.rows[0];
  if (!usuario) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }

  const passwordValido = await bcrypt.compare(
    password_actual,
    usuario.password_hash,
  );
  if (!passwordValido) {
    const err = new Error("Contraseña actual incorrecta");
    err.status = 401;
    throw err;
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password_nuevo, salt);

  await pool.query(
    "UPDATE usuarios_sistema SET password_hash = $1 WHERE id_usuario = $2",
    [password_hash, id],
  );

  return { mensaje: "Contraseña actualizada correctamente" };
};

const eliminar = async (id) => {
  const result = await pool.query(
    `UPDATE usuarios_sistema SET estado = false
     WHERE id_usuario = $1 AND estado = true
     RETURNING *`,
    [id],
  );

  if (!result.rows[0]) {
    const err = new Error("Usuario no encontrado");
    err.status = 404;
    throw err;
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  cambiarPassword,
  eliminar,
};
