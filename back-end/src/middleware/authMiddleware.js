const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Guarda los datos del usuario (id, rol, etc.) en req.user
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

const verificarOwner = (req, res, next) => {
    if (req.user && req.user.rol === 'owner') {
        next();
    } else {
        res.status(403).json({ error: 'Acceso denegado. Se requiere rol de dueño.' });
    }
};

module.exports = { verificarToken, verificarOwner };