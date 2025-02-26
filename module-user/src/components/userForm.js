'use client';  // Necesario en Next.js 13+

import { useState } from 'react';
import { addUser } from '../services/users';
import { TextField, Button, Box, Typography } from "@mui/material";

export default function UserForm({ onUserAdded }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert('Por favor, completa todos los campos');
      return;
    }

    try {
      await addUser({ name, email });
      alert('Usuario registrado con éxito');
      setName('');
      setEmail('');
      onUserAdded();
    } catch (error) {
      alert('Error al registrar el usuario');
    }
  };

  return (
    <Box sx={{ maxWidth: 400, p: 2, backgroundColor: "white", borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom>Registrar Usuario</Typography>
      <form onSubmit={handleSubmit}>
        <TextField 
          fullWidth 
          label="Nombre" 
          variant="outlined" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          sx={{ mb: 2 }}
        />
        <TextField 
          fullWidth 
          label="Email" 
          type="email" 
          variant="outlined" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Registrar
        </Button>
      </form>
    </Box>
  );
};