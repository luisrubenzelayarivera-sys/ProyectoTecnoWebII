const becasService = require("./becas.service");

const obtenerTodas = async (req, res, next) => {
  try {
    const resultado = await becasService.obtenerTodas(req.query);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const beca = await becasService.obtenerPorId(id);
    res.status(200).json(beca);
  } catch (err) {
    next(err);
  }
};

const crear = async (req, res, next) => {
  try {
    const beca = await becasService.crear(req.body);
    res.status(201).json(beca);
  } catch (err) {
    next(err);
  }
};

const cambiarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado_beca } = req.body;
    const beca = await becasService.cambiarEstado(id, estado_beca);
    res.status(200).json(beca);
  } catch (err) {
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await becasService.eliminar(id);
    res.status(200).json({ mensaje: "Beca eliminada correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = { obtenerTodas, obtenerPorId, crear, cambiarEstado, eliminar };
