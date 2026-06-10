const authService = require("./auth.service");

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y password son requeridos" });
    }

    const resultado = await authService.login(email, password);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const resultado = await authService.refreshToken(refreshToken);
    res.status(200).json(resultado);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.status(200).json({ mensaje: "Sesión cerrada correctamente" });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refreshToken, logout };
