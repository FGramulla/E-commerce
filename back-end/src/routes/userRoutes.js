const express = require('express');
const router = express.Router();
const { obtenerPerfil, actualizarPerfil, eliminarPerfil } = require('../controller/userController');
const { verificarToken } = require('../middleware/authMiddleware');

router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);
router.delete('/perfil', verificarToken, eliminarPerfil);

module.exports = router;