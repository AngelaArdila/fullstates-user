const mysql = require("mysql");

function createConnection() {
  return mysql.createConnection({
    host: "localhost", // Cambia según tu configuración
    user: "root", // Usuario de tu base de datos
    password: "", // Contraseña de tu base de datos
    database: "usuarios", // Cambia al nombre de tu base de datos
  });
}

module.exports = { createConnection };
