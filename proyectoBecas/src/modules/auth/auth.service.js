const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const pool = require("../../config/db");
require("dotenv").config();

const login = async (email, password) => {
  const result = await pool.query(
    "SELECT * FROM usuarios_sistema WHERE email = $1 AND estado = true",
    [email],
  );

  const usuario = result.rows[0];
  if (!usuario) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const passwordValido = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValido) {
    const err = new Error("Credenciales inválidas");
    err.status = 401;
    throw err;
  }

  const accessToken = jwt.sign(
    { id: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  const refreshTokenValue = uuidv4();
  const tokenHash = crypto
    .createHash("sha256")
    .update(refreshTokenValue)
    .digest("hex");

  const expiracion = new Date();
  expiracion.setDate(expiracion.getDate() + 7);

  await pool.query(
    `INSERT INTO refresh_tokens (id_usuario, token_hash, fecha_expiracion)
     VALUES ($1, $2, $3)`,
    [usuario.id_usuario, tokenHash, expiracion],
  );

  return { accessToken, refreshToken: refreshTokenValue, rol: usuario.rol };
};

const refreshToken = async (token) => {
  if (!token) {
    const err = new Error("Refresh token requerido");
    err.status = 400;
    throw err;
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const result = await pool.query(
    `SELECT rt.*, u.email, u.rol 
     FROM refresh_tokens rt
     JOIN usuarios_sistema u ON rt.id_usuario = u.id_usuario
     WHERE rt.token_hash = $1 
     AND rt.revocado = false 
     AND rt.fecha_expiracion > NOW()`,
    [tokenHash],
  );

  const tokenData = result.rows[0];
  if (!tokenData) {
    const err = new Error("Refresh token inválido o expirado");
    err.status = 403;
    throw err;
  }

  const accessToken = jwt.sign(
    { id: tokenData.id_usuario, email: tokenData.email, rol: tokenData.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

  return { accessToken };
};

const logout = async (token) => {
  if (!token) return;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await pool.query(
    "UPDATE refresh_tokens SET revocado = true WHERE token_hash = $1",
    [tokenHash],
  );
};

module.exports = { login, refreshToken, logout };
