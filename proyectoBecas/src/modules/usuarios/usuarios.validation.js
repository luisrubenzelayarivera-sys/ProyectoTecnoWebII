const { body, validationResult } = require("express-validator");

const validarCrear = [
  body("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no tiene formato válido")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener mínimo 8 caracteres"),

  body("rol")
    .notEmpty()
    .withMessage("El rol es requerido")
    .isIn(["ADMIN", "TRABAJO_SOCIAL", "JEFE_AREA", "BECARIO"])
    .withMessage("Rol no válido"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

const validarCambiarPassword = [
  body("password_actual")
    .notEmpty()
    .withMessage("La contraseña actual es requerida"),

  body("password_nuevo")
    .notEmpty()
    .withMessage("La contraseña nueva es requerida")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener mínimo 8 caracteres"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

module.exports = { validarCrear, validarCambiarPassword };
