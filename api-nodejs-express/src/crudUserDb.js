const { createConnection } = require("./configBD");

// Crear un nuevo usuario
// Crear un nuevo usuario verificando si el email ya existe
function createUser(name, email) {
  return new Promise((resolve, reject) => {
    const connection = createConnection();

    connection.connect((err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Verificar si el correo ya existe
      const checkQuery = "SELECT COUNT(*) AS count FROM Users WHERE email = ?";
      connection.query(checkQuery, [email], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (results[0].count > 0) {
          resolve({ success: false, message: "El correo ya está registrado" });
          return;
        }

        // Si no existe, insertar el nuevo usuario
        const insertQuery = "INSERT INTO Users (name, email) VALUES (?, ?)";
        connection.query(insertQuery, [name, email], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, message: "Usuario creado correctamente", userId: results.insertId });
          }
        });

        connection.end((err) => {
          if (err) console.error(`Error cerrando la conexión: ${err.message}`);
        });
      });
    });
  });
}



// Leer todos los usuarios
function readUsers() {
  return new Promise((resolve, reject) => {
    const connection = createConnection();
    connection.connect((err) => {
      if (err) {
        reject(err);
        return;
      }

      const query = "SELECT * FROM Users";
      connection.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });

      connection.end((err) => {
        if (err) console.error(`Error cerrando la conexión: ${err.message}`);
      });
    });
  });
}

// Actualizar un usuario
function updateUser(id, name, email) {
  return new Promise((resolve, reject) => {
    const connection = createConnection();
    connection.connect((err) => {
      if (err) {
        reject(err);
        return;
      }

      // Obtener el email actual del usuario
      const getEmailQuery = "SELECT email FROM Users WHERE id = ?";
      connection.query(getEmailQuery, [id], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        if (results.length === 0) {
          resolve({ success: false, message: "Usuario no encontrado" });
          return;
        }

        const currentEmail = results[0].email;

        // Si el email no cambió, solo actualizar el nombre
        if (currentEmail === email) {
          const updateQuery = "UPDATE Users SET name = ? WHERE id = ?";
          connection.query(updateQuery, [name, id], (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve({ success: true, message: "Usuario actualizado correctamente" });
            }
          });

          connection.end((err) => {
            if (err) console.error(`Error cerrando la conexión: ${err.message}`);
          });

          return;
        }

        // Si el email cambió, verificar si ya está en uso por otro usuario
        const checkQuery = "SELECT COUNT(*) AS count FROM Users WHERE email = ? AND id != ?";
        connection.query(checkQuery, [email, id], (err, results) => {
          if (err) {
            reject(err);
            return;
          }

          if (results[0].count > 0) {
            resolve({ success: false, message: "El correo ya está registrado por otro usuario" });
            return;
          }

          // Actualizar usuario con el nuevo nombre y email
          const updateQuery = "UPDATE Users SET name = ?, email = ? WHERE id = ?";
          connection.query(updateQuery, [name, email, id], (err, results) => {
            if (err) {
              reject(err);
            } else {
              resolve({ success: true, message: "Usuario actualizado correctamente" });
            }
          });

          connection.end((err) => {
            if (err) console.error(`Error cerrando la conexión: ${err.message}`);
          });
        });
      });
    });
  });
}

// Eliminar un usuario
function deleteUser(id) {
  return new Promise((resolve, reject) => {
    const connection = createConnection();
    connection.connect((err) => {
      if (err) {
        reject(`Error conectando a la base de datos: ${err.message}`);
        return;
      }

      const query = "DELETE FROM Users WHERE id = ?";
      connection.query(query, [id], (err, results) => {
        if (err) {
          reject(`Error al eliminar el usuario: ${err.message}`);
        } else {
          resolve(`Usuario eliminado correctamente.`);
        }
      });

      connection.end((err) => {
        if (err) console.error(`Error cerrando la conexión: ${err.message}`);
      });
    });
  });
}

module.exports = {
  createUser,
  readUsers,
  updateUser,
  deleteUser,
};
