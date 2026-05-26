const asignacionService = require("./asignacion.service");

const obtenerTodas = async (req, res, next) => {
  try {
    const resultado = await asignacionService.obtenerTodas(req.query);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asignacion = await asignacionService.obtenerPorId(id);
    res.status(200).json(asignacion);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const asignacion = await asignacionService.crear(req.body);
    res.status(201).json(asignacion);
  } catch (err) {
    next(err);
  }
};

const evaluar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluacion = await asignacionService.evaluar(id, req.body);
    res.status(200).json(evaluacion);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await asignacionService.eliminar(id);
    res.status(200).json({ mensaje: "Asignación eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, evaluar, eliminar };
