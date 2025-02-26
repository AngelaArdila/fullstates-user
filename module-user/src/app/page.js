"use client";  // 🔹 Agrega esta línea al inicio

import { useState } from 'react';
import UserList from '../components/userList';
import UserForm from '../components/userForm';
import { Container, Typography, Box } from "@mui/material";

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  const handleUserAdded = () => {
    setRefresh(!refresh);
  };

  
  return (
    <Container maxWidth="md">
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Gestión de Usuarios
        </Typography>
      <UserForm onUserAdded={handleUserAdded} />
      <UserList refresh={refresh} />
      </Box>
    </Container>
  );
}
