const { body, validationResult } = require("express-validator");

const validarCrear = [
  body("id_estudiante")
    .notEmpty()
    .withMessage("El id_estudiante es requerido")
    .isUUID()
    .withMessage("El id_estudiante debe ser un UUID válido"),

  body("id_tipo_beca")
    .notEmpty()
    .withMessage("El id_tipo_beca es requerido")
    .isInt({ min: 1 })
    .withMessage("El id_tipo_beca debe ser un número entero positivo"),

  body("porcentaje")
    .notEmpty()
    .withMessage("El porcentaje es requerido")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El porcentaje debe estar entre 0 y 100"),

  body("gestion")
    .notEmpty()
    .withMessage("La gestión es requerida")
    .isInt({ min: 1966 })
    .withMessage("La gestión debe ser mayor a 1966"),

  body("periodo")
    .notEmpty()
    .withMessage("El periodo es requerido")
    .isIn([1, 2])
    .withMessage("El periodo debe ser 1 o 2"),

  body("cod_doc_respaldo")
    .optional()
    .isLength({ max: 50 })
    .withMessage("El código de respaldo no puede exceder 50 caracteres")
    .trim(),

  body("declaracion_jurada")
    .optional()
    .isBoolean()
    .withMessage("La declaración jurada debe ser true o false"),

  body("observaciones").optional().trim(),

  body("subtipo")
    .optional({ nullable: true })
    .if(body("subtipo").notEmpty())
    .isIn(["PROMEDIO", "RESPONSABLE", "DISCIPLINA", "DISCAPACIDAD"])
    .withMessage("Subtipo no válido"),

  body("datos_subtipo.promedio_mantenido")
    .if(body("subtipo").equals("PROMEDIO"))
    .notEmpty()
    .withMessage("El promedio mantenido es requerido para este subtipo")
    .isFloat({ min: 0, max: 100 })
    .withMessage("El promedio debe estar entre 0 y 100"),

  body("datos_subtipo.gestion_obtenido")
    .if(body("subtipo").equals("PROMEDIO"))
    .notEmpty()
    .withMessage("La gestión obtenida es requerida para este subtipo")
    .isInt({ min: 1966 })
    .withMessage("La gestión debe ser mayor a 1966"),

  body("datos_subtipo.semestre_obtenido")
    .if(body("subtipo").equals("PROMEDIO"))
    .notEmpty()
    .withMessage("El semestre obtenido es requerido para este subtipo")
    .isInt({ min: 1, max: 2 })
    .withMessage("El semestre debe ser 1 o 2"),

  body("datos_subtipo.id_disciplina")
    .if(body("subtipo").equals("DISCIPLINA"))
    .notEmpty()
    .withMessage("El id_disciplina es requerido para este subtipo")
    .isInt({ min: 1 })
    .withMessage("El id_disciplina debe ser un número entero positivo"),

  body("datos_subtipo.porcentaje_disc")
    .if(body("subtipo").equals("DISCAPACIDAD"))
    .notEmpty()
    .withMessage("El porcentaje de discapacidad es requerido para este subtipo")
    .isInt({ min: 0, max: 100 })
    .withMessage("El porcentaje debe estar entre 0 y 100"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

const validarCambiarEstado = [
  body("estado_beca")
    .notEmpty()
    .withMessage("El estado_beca es requerido")
    .isIn(["ACTIVA", "SUSPENDIDA", "FINALIZADA", "ABANDONADA"])
    .withMessage("Estado no válido"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errores: errors.array() });
    }
    next();
  },
];

module.exports = { validarCrear, validarCambiarEstado };
