const reportesService = require("./reportes.service");

const estadosBecas = async (req, res, next) => {
  try {
    const data = await reportesService.estadosBecas();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const tiposBecas = async (req, res, next) => {
  try {
    const data = await reportesService.tiposBecas();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const estudiantesConBecas = async (req, res, next) => {
  try {
    const resultado = await reportesService.estudiantesConBecas(req.query);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const evaluaciones = async (req, res, next) => {
  try {
    const data = await reportesService.evaluaciones(req.query);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

const infoGeneral = async (req, res, next) => {
  try {
    const data = await reportesService.infoGeneral();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  estadosBecas,
  tiposBecas,
  estudiantesConBecas,
  evaluaciones,
  infoGeneral,
};
