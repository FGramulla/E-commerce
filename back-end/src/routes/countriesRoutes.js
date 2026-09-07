const express = require('express');
const router = express.Router();
const { getPaises } = require('../controller/countriesController');

// Ruta GET para obtener los países
router.get('/', getPaises);

module.exports = router;