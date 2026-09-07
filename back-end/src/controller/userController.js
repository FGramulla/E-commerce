const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Obtener el perfil del usuario autenticado
const obtenerPerfil = async (req, res) => {
    try {
        const userId = req.user.id;
        const resultado = await pool.query(
            'SELECT id, nombre, apellido, nacionalidad, email, rol, activo, created_at, avatar, fecha_nacimiento FROM usuarios WHERE id = $1',
            [userId]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el perfil.' });
    }
};

// Editar el propio perfil
const actualizarPerfil = async (req, res) => {
    const userId = req.user.id;
    const { nombre, apellido, nacionalidad, fecha_nacimiento, avatar, email, password, currentPassword } = req.body;

    try {
        // Traemos el usuario actual para comparar email y validar contraseña si hace falta
        const usuarioActual = await pool.query(
            'SELECT email, password_hash FROM usuarios WHERE id = $1',
            [userId]
        );

        if (usuarioActual.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const { email: emailActual, password_hash: hashActual } = usuarioActual.rows[0];

        const cambiaEmail = email && email !== emailActual;
        const cambiaPassword = Boolean(password);

        // Si va a cambiar email o password, la contraseña actual es obligatoria y debe ser correcta
        if (cambiaEmail || cambiaPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Debes ingresar tu contraseña actual para cambiar el email o la contraseña.' });
            }

            const passwordValida = await bcrypt.compare(currentPassword, hashActual);
            if (!passwordValida) {
                return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
            }
        }

        let query = '';
        let params = [];

        if (cambiaPassword) {
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            query = `UPDATE usuarios SET nombre = $1, apellido = $2, nacionalidad = $3, fecha_nacimiento = $4, avatar = $5, email = $6, password_hash = $7 WHERE id = $8 RETURNING id, nombre, apellido, email, nacionalidad, avatar, fecha_nacimiento, rol`;
            params = [nombre, apellido, nacionalidad, fecha_nacimiento, avatar, email, password_hash, userId];
        } else {
            query = `UPDATE usuarios SET nombre = $1, apellido = $2, nacionalidad = $3, fecha_nacimiento = $4, avatar = $5, email = $6 WHERE id = $7 RETURNING id, nombre, apellido, email, nacionalidad, avatar, fecha_nacimiento, rol`;
            params = [nombre, apellido, nacionalidad, fecha_nacimiento, avatar, email, userId];
        }

        const resultado = await pool.query(query, params);
        res.json({ mensaje: 'Perfil actualizado exitosamente', usuario: resultado.rows[0] });
    } catch (error) {
        console.error(error);
        // Si el email ya está en uso por otro usuario, PostgreSQL tira un error de constraint único
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Ese email ya está en uso por otra cuenta.' });
        }
        res.status(500).json({ error: 'Error al actualizar el perfil.' });
    }
};

// Eliminar/Desactivar la propia cuenta
const eliminarPerfil = async (req, res) => {
    const userId = req.user.id;
    try {
        const resultado = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [userId]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json({ mensaje: 'Cuenta eliminada correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la cuenta.' });
    }
};

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
    eliminarPerfil
};