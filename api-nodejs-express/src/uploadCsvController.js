const fs = require("fs");
const csv = require("csv-parser");

const connection = require("./configBD");

async function processCsv(filePath, res) {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      // Mapeamos la columna "nombre" del CSV a "name" para la base de datos
      const formattedRow = {
        name: row.nombre, // CSV usa "nombre", lo convertimos a "name"
        email: row.email, // Se mantiene igual
      };

      results.push(formattedRow);
    })
    .on("end", () => {
      if (results.length === 0) {
        return res.status(400).json({ error: "El archivo CSV está vacío." });
      }

      const query = "INSERT INTO Users (name, email) VALUES ?";
      const values = results.map((row) => [row.name, row.email]);

      const connection2 = connection.createConnection();

      connection2.query(query, [values], (err, result) => {
        if (err) {
          console.error("Error al insertar datos:", err);
          return res.status(500).json({ error: "Error al insertar datos." });
        }

        res.status(200).json({
          message: "Datos cargados correctamente",
          insertedRows: result.affectedRows,
        });

        fs.unlinkSync(filePath); // Eliminar el archivo después de procesarlo
      });
      connection2.end((err) => {
        if (err) console.error(`Error cerrando la conexión: ${err.message}`);
      });
    })
    .on("error", (err) => {
      console.error("Error al leer CSV:", err);
      res.status(500).json({ error: "Error al procesar el archivo CSV." });
    });
}
module.exports = { processCsv };
