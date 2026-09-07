const express = require('express');
const router = express.Router();
const { 
    obtenerProductos, 
    crearProducto, 
    actualizarProducto, 
    borrarProducto 
} = require('../controller/productController');

// Middleware de autenticación (ajusta la ruta según dónde tengas tu middleware)
const { verificarToken, verificarOwner } = require('../middleware/authMiddleware');

// Ruta pública para ver los productos
router.get('/', obtenerProductos);

// Rutas protegidas (solo para usuarios autenticados / dueños)
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, borrarProducto);

module.exports = router;