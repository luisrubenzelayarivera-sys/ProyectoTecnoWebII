const { body, validationResult } = require("express-validator");

const validarCrear = [
  body("id_beca")
    .notEmpty()
    .withMessage("El id_beca es requerido")
    .isUUID()
    .withMessage("El id_beca debe ser un UUID válido"),

  body("id_area")
    .notEmpty()
    .withMessage("El id_area es requerido")
    .isInt({ min: 1 })
    .withMessage("El id_area debe ser un número entero positivo"),

  body("id_pre_registro")
    .optional()
    .isUUID()
    .withMessage("El id_pre_registro debe ser un UUID válido"),

  body("horas_semana")
    .notEmpty()
    .withMessage("Las horas por semana son requeridas")
    .isInt({ min: 1 })
    .withMessage("Las horas por semana deben ser un número entero positivo"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

const validarEvaluar = [
  body("puntaje_desempeno")
    .notEmpty()
    .withMessage("El puntaje de desempeño es requerido")
    .isInt({ min: 1, max: 100 })
    .withMessage("El puntaje debe estar entre 1 y 100"),

  body("comentario_jefe_area")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("El comentario no puede exceder 500 caracteres"),

  body("recomienda_continuidad")
    .notEmpty()
    .withMessage("La recomendación de continuidad es requerida")
    .isBoolean()
    .withMessage("El valor debe ser true o false"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

module.exports = { validarCrear, validarEvaluar };
