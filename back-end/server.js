const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const countriesRoutes = require('./src/routes/countriesRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }))

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/countries', countriesRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});