"use client"; // Necesario para usar `useState` en Next.js 13+
import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateUser } from "../services/users";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  IconButton,
  Modal,
  TextField,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function UserList({ refresh }) {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ name: "", email: "" });
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };
    fetchUsers();
  }, [refresh]);

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId); // Llamamos la API para eliminar usuario
      setUsers(users.filter((user) => user.id !== userId)); // Actualizamos la lista eliminando el usuario
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // ✅ Función para abrir el modal con los datos del usuario seleccionado
  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setUpdatedName(user.name);
    setUpdatedEmail(user.email);
    setOpen(true);
  };

  // ✅ Función para cerrar el modal
  const handleCloseModal = () => {
    setOpen(false);
    setSelectedUser(null);
  };

  // ✅ Función para actualizar usuario 
  const handleUpdate = async () => {
    if (!updatedName || !updatedEmail) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (updatedEmail === selectedUser.email) {
      alert("No hay cambios en el correo electrónico.");
      //console.log("hola aqui estube")
      return;
    }

    // Expresión regular para validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updatedEmail)) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    try {
      const updatedUser = await updateUser(selectedUser.id, {
        name: updatedName,
        email: updatedEmail,
      });

      console.log("Usuario actualizado:", updatedUser);
      setUsers(
        users.map((user) => (user.id === selectedUser.id ? updatedUser : user))
        
      );
      handleCloseModal();
    } catch (error) {
      alert(error.message); // Ahora muestra el mensaje correcto
      console.error("Error al actualizar usuario:", error);
    }
  };
  return (
    <Box sx={{ maxWidth: 500, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Lista de Usuarios
      </Typography>
      <Card sx={{ backgroundColor: "white", boxShadow: 3 }}>
        <CardContent>
          <List>
            {users.map((user, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={user.name} secondary={user.email} />

                {/* 🔹 Botón de actualizar */}
                <IconButton
                  edge="end"
                  color="primary"
                  onClick={() => handleOpenModal(user)}
                >
                  <EditIcon />
                </IconButton>

                {/* 🔹 Botón para eliminar usuario */}
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleDelete(user.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* ✅ Modal para actualizar usuario */}
      <Modal open={open} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Actualizar Usuario
          </Typography>
          <TextField
            fullWidth
            label="Nombre"
            variant="outlined"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            sx={{ mr: 2 }}
          >
            Guardar Cambios
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleCloseModal}
          >
            Cancelar
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
