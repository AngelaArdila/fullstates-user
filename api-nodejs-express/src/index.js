const express = require('express');
const app = express();
const port = 3001;
const cors = require('cors');  // <-- Importa CORS

const userRoutes = require('./routerUsers');

app.use(cors());  // <-- Habilita CORS para evitar errores de red

// Middleware para manejar JSON en las peticiones
app.use(express.json());

// Usar las rutas de usuarios
app.use('/users', userRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})