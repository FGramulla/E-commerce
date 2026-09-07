const pool = require("../config/db");

const getCategorias = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categorias ORDER BY nombre ASC");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const { rows } = await pool.query(
      "INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *",
      [nombre, descripcion]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ mensaje: "Error en el servidor. La categoría podría ya existir." });
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const { rows } = await pool.query(
      "UPDATE categorias SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *",
      [nombre, descripcion, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("DELETE FROM categorias WHERE id = $1 RETURNING *", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

module.exports = {
  getCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};