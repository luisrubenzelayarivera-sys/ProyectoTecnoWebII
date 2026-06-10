const requeridas = [
  "PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRES_IN",
];

const validarEnv = () => {
  const faltantes = requeridas.filter((v) => !process.env[v]);
  if (faltantes.length > 0) {
    console.error(`❌ Variables de entorno faltantes: ${faltantes.join(", ")}`);
    process.exit(1);
  }
  console.log("✅ Variables de entorno validadas");
};

module.exports = validarEnv;
