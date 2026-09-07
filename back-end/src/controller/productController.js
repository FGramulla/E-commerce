const pool = require('../config/db');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM products p 
            LEFT JOIN categorias c ON p.categoria_id = c.id
        `);
        res.json(productos.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
};

const crearProducto = async (req, res) => {
    const { nombre, descripcion, precio, stock, imagen_base64, categoria_id } = req.body;
    const creado_por = req.user.id; // Obtenido del token del admin

    try {
        const nuevoProducto = await pool.query(
            `INSERT INTO products (nombre, descripcion, precio, stock, imagen_base64, categoria_id, creado_por) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nombre, descripcion, precio, stock, imagen_base64, categoria_id, creado_por]
        );
        res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: nuevoProducto.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el producto.' });
    }
};

const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, imagen_base64, categoria_id } = req.body;

    try {
        // Verificar si el producto existe
        const productoExistente = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productoExistente.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        // Si no se envía una nueva imagen, conservamos la que ya tenía guardada
        const imagenFinal = imagen_base64 || productoExistente.rows[0].imagen_base64;

        const productoActualizado = await pool.query(
            `UPDATE products 
             SET nombre = $1, descripcion = $2, precio = $3, stock = $4, imagen_base64 = $5, categoria_id = $6 
             WHERE id = $7 
             RETURNING *`,
            [nombre, descripcion, precio, stock, imagenFinal, categoria_id, id]
        );

        res.json({ 
            mensaje: 'Producto actualizado exitosamente', 
            producto: productoActualizado.rows[0] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el producto.' });
    }
};

const borrarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }
        res.json({ mensaje: 'Producto eliminado correctamente.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el producto.' });
    }
};

module.exports = { obtenerProductos, crearProducto, actualizarProducto, borrarProducto };