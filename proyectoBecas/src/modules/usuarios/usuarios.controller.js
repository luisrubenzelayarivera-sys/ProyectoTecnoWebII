const usuariosService = require("./usuarios.service");

const obtenerTodos = async (req, res, next) => {
  try {
    const resultado = await usuariosService.obtenerTodos(req.query);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuariosService.obtenerPorId(id);
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const usuario = await usuariosService.crear(req.body);
    res.status(201).json(usuario);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const usuario = await usuariosService.actualizar(id, req.body);
    res.status(200).json(usuario);
  } catch (err) {
    next(err);
  }
};

const cambiarPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resultado = await usuariosService.cambiarPassword(id, req.body);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await usuariosService.eliminar(id);
    res.status(200).json({ mensaje: "Usuario eliminado correctamente" });
  } catch (err) {
    next(err);
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
