const express = require("express");
const router = express.Router();
const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");

const { processCsv } = require("./uploadCsvController");

//IMPORTAR LAS FUNCIONES CRUD CREADAS CON QUERY
const {
  createUser,
  readUsers,
  updateUser,
  deleteUser,
} = require("./crudUserDb");

//IMPORTAR LAS FUNCIONES CRUD
const {
  createUserV3,
  getAllUsersV3,
  getUserByIdV3,
  updateUserV3,
  deleteUserV3,
  User,
} = require("./crudUsersOrm");

// Configuración de Multer para subir archivos
const upload = multer({ dest: "uploads/" });

// Ruta para subir un archivo CSV y procesarlo
router.post("/v2upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No se ha subido ningún archivo." });
  }

  processCsv(req.file.path, res);
});

// Ruta para subir CSV y cargar en la base de datos con bulkCreate
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ mensaje: "No se proporcionó ningún archivo" });
    }

    const users = [];

    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        users.push({ name: row.nombre, email: row.email });
      })
      .on("end", async () => {
        try {
          // Inserción masiva con Sequelize
          await User.bulkCreate(users);
          fs.unlinkSync(req.file.path); // Eliminar archivo temporal
          res
            .status(201)
            .json({ mensaje: "Usuarios importados correctamente" });
        } catch (error) {
          res
            .status(500)
            .json({ mensaje: "Error al importar usuarios", error });
        }
      });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al procesar el archivo CSV", error });
  }
});

// Todas las rutas con el prefijo /users/**

// Array simulado para almacenar usuarios
let users = [];

// Ruta para obtener todos los usuarios (Read)
router.get("/all", (req, res) => {
  res.json(users);
});

// Ruta para obtener un usuario por ID (Read)
router.get("/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find((u) => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send({ message: "Usuario no encontrado" });
  }
});

// Ruta para crear un nuevo usuario (Create)
router.post("/", (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: users.length + 1, // Generar un ID único
    name,
    email,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Ruta para actualizar un usuario por ID (Update)
router.put("/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { id: userId, name, email };
    res.json(users[userIndex]);
  } else {
    res.status(404).send({ message: "Usuario no encontrado" });
  }
});

// Ruta para eliminar un usuario por ID (Delete)
router.delete("/:id", (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    users.splice(userIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).send({ message: "Usuario no encontrado" });
  }
});

// VERSION 2
router.get("/all/v2", async (req, res) => {
  try {
    const users = await readUsers(); // Espera a que la promesa se resuelva
    res.json(users); // Devuelve los usuarios como respuesta en formato JSON
  } catch (err) {
    res.status(500).json({ error: "Hubo un error al obtener los datos" }); // Maneja errores
  }
});

// Ruta para crear un nuevo usuario en base de datos msql(Create)

router.post("/v2", async (req, res) => {
  try {
    const { name, email } = req.body;

    const result = await createUser(name, email);

    if (!result.success) {
      return res.status(400).json({ error: result.message }); // 400 Bad Request para email duplicado
    }

    res.status(201).json({ id: result.userId, name, email });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: "Hubo un error al crear usuario" }); // 500 solo si es otro error
  }
});

// users/v2/id
// Ruta para actualizar un usuario en la base de datos
router.put("/v2/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // Validar que los campos sean obligatorios
    if (!name || !email) {
      return res.status(400).json({ error: "Los campos name y email son obligatorios." });
    }

    const response = await updateUser(id, name, email);

    if (!response.success) {
      return res.status(400).json({ error: response.message });
    }

    res.status(200).json({ message: response.message });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Hubo un error al actualizar usuario" });
  }
});


router.delete("/v2/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`ID recibido: ${id}`);

    if (!id) {
      console.log("ID no proporcionado.");
      return res.status(400).json({ mensaje: "ID no proporcionado" });
    }

    const response = await deleteUser(id);
    if (!response) {
      console.log("Usuario no encontrado.");
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    console.log("Usuario eliminado con éxito.");
    res.status(200).json({ mensaje: "Exito" });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({ mensaje: "Error" });
  }
});

//Version 3, rutas para usar el crud realizado con ORM

router.post("/v3", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res
        .status(400)
        .json({ mensaje: "El nombre y el email son obligatorios" });
    }

    // Verificar si el correo ya está registrado antes de intentar crear un usuario
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ mensaje: "El usuario ya existe con este correo electrónico" });
    }

    // Crear el usuario si no existe
    const user = await createUserV3({ name, email });
    res.status(201).json({ mensaje: "usauario creado exitasamente", user });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al crear usuario", error: error.message });
  }
});

//obtener todos los usuarios
router.get("/all/v3", async (req, res) => {
  try {
    const users = await getAllUsersV3();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
});

router.get("/v3/:id", async (req, res) => {
  try {
    const user = await getUserByIdV3(req.params.id);
    if (!user) return res.status(400).json({ mensaje: "Usuario no encontrao" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ mensaje: "error al obtener usuario", error });
  }
});

router.put("/v3/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUserV3(id, req.body);
    res
      .status(200)
      .json({
        mensaje: "Usuario actualizado correctamente",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error en el backend:", error); // Para depuración
  
      // Asegurarse de que el error tenga un código y un mensaje correctos
      res.status(error.error || 500).json({
        mensaje: error.menssaje || "Error al actualizar usuario",
      });
    }
  });
router.delete("/v3/:id", async (req, res) => {
  try {
    const user = await deleteUserV3(req.params.id);
    if (!user)
      return res.status(400).json({ mensaje: "usuario no encontrado" });
    res.status(200).json({ mensaje: "usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "error al obtener usuario", error });
  }
});

module.exports = router;
