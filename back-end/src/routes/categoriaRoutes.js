const express = require('express');
const router = express.Router();
const { 
    getCategorias, 
    crearCategoria, 
    actualizarCategoria, 
    eliminarCategoria 
} = require('../controller/categoriaController');
const { verificarToken, verificarOwner } = require('../middleware/authMiddleware');

// Ruta pública: Cualquiera puede ver las categorías
router.get('/', getCategorias);

// Rutas protegidas: Solo el dueño puede modificar
router.post('/', verificarToken, verificarOwner, crearCategoria);
router.put('/:id', verificarToken, verificarOwner, actualizarCategoria);
router.delete('/:id', verificarToken, verificarOwner, eliminarCategoria);

module.exports = router;