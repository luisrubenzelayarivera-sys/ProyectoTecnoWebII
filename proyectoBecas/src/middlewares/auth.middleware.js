const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

const verificarToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verificar que el usuario siga activo en BD
    const result = await pool.query(
      "SELECT id_usuario, rol, estado FROM usuarios_sistema WHERE id_usuario = $1",
      [decoded.id],
    );

    const usuario = result.rows[0];
    if (!usuario || !usuario.estado) {
      return res
        .status(401)
        .json({ error: "Usuario inactivo o no encontrado" });
    }

    req.usuario = decoded;
    next();
  } catch (err) {
    // Log del intento fallido
    console.warn(
      `[SEGURIDAD] Token inválido desde IP: ${req.ip} — ${new Date().toISOString()}`,
    );
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};

const verificarRol = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      // Log de intento de acceso no autorizado
      console.warn(
        `[SEGURIDAD] Acceso denegado — Usuario: ${req.usuario.email} — Rol: ${req.usuario.rol} — Ruta: ${req.originalUrl} — IP: ${req.ip}`,
      );
      return res
        .status(403)
        .json({ error: "No tienes permisos para esta acción" });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
