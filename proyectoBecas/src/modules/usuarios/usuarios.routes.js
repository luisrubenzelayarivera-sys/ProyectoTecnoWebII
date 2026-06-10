const router = require("express").Router();
const {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  cambiarPassword,
  eliminar,
} = require("./usuarios.controller");
const {
  verificarToken,
  verificarRol,
} = require("../../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios del sistema
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/", verificarToken, verificarRol("ADMIN"), obtenerTodos);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/:id", verificarToken, verificarRol("ADMIN"), obtenerPorId);

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               email:
 *                 type: string
 *                 example: trabajosocial@ucb.edu
 *               password:
 *                 type: string
 *                 example: miPassword123
 *               rol:
 *                 type: string
 *                 enum: [ADMIN, TRABAJO_SOCIAL, JEFE_AREA, BECARIO]
 *                 example: TRABAJO_SOCIAL
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Email ya registrado o rol inválido
 */
router.post("/", verificarToken, verificarRol("ADMIN"), crear);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: nuevoemail@ucb.edu
 *               rol:
 *                 type: string
 *                 enum: [ADMIN, TRABAJO_SOCIAL, JEFE_AREA, BECARIO]
 *                 example: JEFE_AREA
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/:id", verificarToken, verificarRol("ADMIN"), actualizar);

/**
 * @swagger
 * /usuarios/{id}/password:
 *   patch:
 *     summary: Cambiar contraseña
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password_actual
 *               - password_nuevo
 *             properties:
 *               password_actual:
 *                 type: string
 *                 example: miPasswordActual
 *               password_nuevo:
 *                 type: string
 *                 example: miPasswordNuevo123
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.patch("/:id/password", verificarToken, cambiarPassword);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar usuario (borrado lógico)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:id", verificarToken, verificarRol("ADMIN"), eliminar);

module.exports = router;
