const estudiantesService = require("./estudiantes.service");

const obtenerTodos = async (req, res, next) => {
  try {
    const resultado = await estudiantesService.obtenerTodos(req.query);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estudiante = await estudiantesService.obtenerPorId(id);
    res.status(200).json(estudiante);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const estudiante = await estudiantesService.crear(req.body);
    res.status(201).json(estudiante);
  } catch (err) {
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const estudiante = await estudiantesService.actualizar(id, req.body);
    res.status(200).json(estudiante);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await estudiantesService.eliminar(id);
    res.status(200).json({ mensaje: "Estudiante eliminado correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodos, obtenerPorId, crear, actualizar, eliminar };
