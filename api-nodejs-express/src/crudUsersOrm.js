const { Op } = require("sequelize");
const User = require("./configBDmodelOrm");



const createUserV3 = async (data) => {
  return await User.create(data);
};

const getAllUsersV3 = async () => {
  return await User.findAll();
};

const getUserByIdV3 = async (id) => {
  return await User.findByPk(id);
};

const updateUserV3 = async (id, data) => {
  const { name, email } = data;

  if (!name || !email) {
      throw {error: 400 , menssaje:"El nombre y el email son obligatorios"};
  }

  const user = await User.findByPk(id);
  if (!user) {
      throw {error: 404 , menssaje:"Usuario no encontrado"};
  }

  // Verificar si el correo ya está registrado por otro usuario EXCLUYENDO al usuario actual
  const emailExists = await User.findOne({ where: { email, id: { [Op.ne]: id } } });
  if (emailExists) {
       throw {error: 400 , menssaje:"El correo electrónico ya está en uso por otro usuario"};
  }

  // Actualizar usuario
  user.name = name;
  user.email = email;
  await user.save();

  return user;
};


const deleteUserV3 = async (id) => {
  const user = await User.findByPk(id);
  if (user) {
    await user.destroy();
    return true;
  }
  return false;
};

module.exports = {
  createUserV3,
  getAllUsersV3,
  getUserByIdV3,
  updateUserV3,
  deleteUserV3,
  User,
};
