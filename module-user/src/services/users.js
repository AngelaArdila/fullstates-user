import { Upcoming } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:3001';

export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL + "/users/all/v3");
    return response.data;
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return [];
  }
};

export const addUser = async (user) => {
  try {
    const response = await axios.post(API_URL + "/users/v3", user);
    return response.data;
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    throw error;
  }
};

export const 
updateUser = async (userId,updatedData) => {
  try {
   
    const response = await axios.put(API_URL + "/users/v3/" + userId, updatedData);
    console.log("Respuesta del servidor:", response); // 👈 Verifica la respuesta de la API
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.error("Error del servidor:", error.response.data);
      throw new Error(error.response.data.mensaje || "Error al actualizar usuario");
    } else {
      console.error("Error inesperado:", error);
      throw new Error("Ocurrió un error inesperado. Inténtalo nuevamente.");
    }
  }
};


export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(API_URL + "/users/v3/" + userId);
    return response.data;
  } catch (error) {
    console.error('Error al eliminar usuario:', error); // 🔹 Mensaje corregido
    throw error;
  }
};