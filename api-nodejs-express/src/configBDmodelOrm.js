const { Sequelize, DataTypes } = require("sequelize");
// Configurar la conexión a la base de datos con Sequelize
const sequelize = new Sequelize("usuarios", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

// Definir el modelo User
const User = sequelize.define(
  "users",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: false }
);

// Sincronizar la base de datos
sequelize
  .sync()
  .then(() => console.log("Base de datos sincronizada"))
  .catch((error) => console.error("Error al sincronizar:", error));



module.exports = sequelize;
module.exports = User;