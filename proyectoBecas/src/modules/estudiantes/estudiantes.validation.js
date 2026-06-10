const { body, validationResult } = require("express-validator");

const validarCrear = [
  body("nombre_completo")
    .notEmpty()
    .withMessage("El nombre completo es requerido")
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener mínimo 3 caracteres")
    .trim(),

  body("carnet")
    .optional()
    .isLength({ min: 5, max: 25 })
    .withMessage("El carnet debe tener entre 5 y 25 caracteres")
    .trim(),

  body("email_ucb")
    .optional()
    .isEmail()
    .withMessage("El email UCB no tiene formato válido")
    .normalizeEmail(),

  body("telefono")
    .optional()
    .isLength({ min: 7, max: 15 })
    .withMessage("El teléfono debe tener entre 7 y 15 caracteres"),

  body("id_carrera")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El id_carrera debe ser un número entero positivo"),

  body("gestion_inicio")
    .optional()
    .isInt({ min: 1966 })
    .withMessage("La gestión debe ser mayor a 1966"),

  body("periodo_inicio")
    .optional()
    .isIn([1, 2])
    .withMessage("El periodo debe ser 1 o 2"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

const validarActualizar = [
  body("nombre_completo")
    .optional()
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener mínimo 3 caracteres")
    .trim(),

  body("carnet")
    .optional()
    .isLength({ min: 5, max: 25 })
    .withMessage("El carnet debe tener entre 5 y 25 caracteres")
    .trim(),

  body("email_ucb")
    .optional()
    .isEmail()
    .withMessage("El email UCB no tiene formato válido")
    .normalizeEmail(),

  body("telefono")
    .optional()
    .isLength({ min: 7, max: 15 })
    .withMessage("El teléfono debe tener entre 7 y 15 caracteres"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

module.exports = { validarCrear, validarActualizar };
