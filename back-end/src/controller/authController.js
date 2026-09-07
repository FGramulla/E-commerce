const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registrar = async (req, res) => {
    const { nombre, apellido, nacionalidad, email, password, fecha_nacimiento, avatar } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Devolvemos todos los datos necesarios en el RETURNING
        const nuevoUsuario = await pool.query(
            `INSERT INTO usuarios (nombre, apellido, nacionalidad, email, password_hash, rol, fecha_nacimiento, avatar) 
             VALUES ($1, $2, $3, $4, $5, 'cliente', $6, $7) RETURNING id, nombre, apellido, email, rol, avatar`,
            [nombre, apellido, nacionalidad, email, password_hash, fecha_nacimiento, avatar]
        );

        res.status(201).json({ mensaje: 'Usuario registrado con éxito', usuario: nuevoUsuario.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario. El email podría ya estar en uso.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        const usuario = resultado.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Enviamos un objeto "usuario" completo que incluya nombre, apellido y avatar
        res.json({ 
            mensaje: 'Login exitoso', 
            token, 
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                rol: usuario.rol,
                avatar: usuario.avatar
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
};

module.exports = { registrar, login };