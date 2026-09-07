import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FiChevronDown, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import "../styles/Gestor.css";

const Gestor = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // En el estado inicial del formulario:
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria_id: "",
    imagen_base64: "", // antes: imagen_url
  });

  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
    descripcion: "",
  });
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);

  // Control de paneles desplegables
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [productoFormOpen, setProductoFormOpen] = useState(false);
  const categoriasRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cerrar el dropdown de categorías al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        categoriasRef.current &&
        !categoriasRef.current.contains(event.target)
      ) {
        setCategoriasOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-ocultar mensajes de éxito/error después de un tiempo
  useEffect(() => {
    if (!success && !error) return;
    const t = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  const cargarDatos = async () => {
    try {
      const [resProductos, resCategorias] = await Promise.all([
        axios.get("http://localhost:4000/api/products"),
        axios.get("http://localhost:4000/api/categorias"),
      ]);
      setProductos(resProductos.data);
      setCategorias(resCategorias.data);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("No se pudieron cargar los datos del gestor.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imagen_base64: reader.result }); // antes: imagen_url
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post("http://localhost:4000/api/products", formData, config);

      setSuccess("¡Producto creado con éxito!");
      // En el reset del formulario dentro de handleSubmit, después del POST exitoso:
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        categoria_id: "",
        imagen_base64: "", // antes: imagen_url
      });
      setProductoFormOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el producto.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:4000/api/products/${id}`, config);
      setSuccess("Producto eliminado correctamente.");
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el producto.");
    }
  };

  const handleCategoriaChange = (e) => {
    setCategoriaForm({ ...categoriaForm, [e.target.name]: e.target.value });
  };

  const handleCategoriaSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (categoriaEditandoId) {
        await axios.put(
          `http://localhost:4000/api/categorias/${categoriaEditandoId}`,
          categoriaForm,
          config,
        );
        setSuccess("Categoría actualizada con éxito.");
      } else {
        await axios.post(
          "http://localhost:4000/api/categorias",
          categoriaForm,
          config,
        );
        setSuccess("Categoría creada con éxito.");
      }

      setCategoriaForm({ nombre: "", descripcion: "" });
      setCategoriaEditandoId(null);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al guardar la categoría.");
    }
  };

  const handleEditarCategoria = (cat) => {
    setCategoriaForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion || "",
    });
    setCategoriaEditandoId(cat.id);
    setError("");
    setSuccess("");
  };

  const handleCancelarEdicionCategoria = () => {
    setCategoriaForm({ nombre: "", descripcion: "" });
    setCategoriaEditandoId(null);
  };

  const handleEliminarCategoria = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta categoría?"))
      return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:4000/api/categorias/${id}`, config);
      setSuccess("Categoría eliminada correctamente.");
      if (categoriaEditandoId === id) handleCancelarEdicionCategoria();
      cargarDatos();
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "Error al eliminar la categoría.",
      );
    }
  };

  return (
    <div className="gestor-container">
      <div className="gestor-header">
        <h2>Gestor de Productos</h2>
        <p>Administrá tu catálogo y las categorías de la tienda.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      {/* ========================================================== */}
      {/* BARRA DE CATEGORÍAS — dropdown compacto */}
      {/* ========================================================== */}
      <div className="categorias-bar" ref={categoriasRef}>
        <button
          type="button"
          className={`categorias-trigger ${categoriasOpen ? "is-open" : ""}`}
          onClick={() => setCategoriasOpen((v) => !v)}
        >
          <span className="categorias-trigger-label">Categorías</span>
          <span className="categorias-count-badge">{categorias.length}</span>
          <span className="categorias-chevron">
            <FiChevronDown />
          </span>
        </button>

        {categoriasOpen && (
          <div className="categorias-dropdown">
            <form
              className="categorias-mini-form"
              onSubmit={handleCategoriaSubmit}
            >
              <div className="categorias-mini-form-row">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre de la categoría"
                  value={categoriaForm.nombre}
                  onChange={handleCategoriaChange}
                  required
                />
                <input
                  type="text"
                  name="descripcion"
                  placeholder="Descripción (opcional)"
                  value={categoriaForm.descripcion}
                  onChange={handleCategoriaChange}
                />
              </div>
              <div className="categorias-mini-form-actions">
                <button type="submit" className="btn-submit btn-sm">
                  {categoriaEditandoId ? "Actualizar" : "Agregar categoría"}
                </button>
                {categoriaEditandoId && (
                  <button
                    type="button"
                    className="btn-cancel btn-sm"
                    onClick={handleCancelarEdicionCategoria}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>

            <div className="categorias-list">
              {categorias.length > 0 ? (
                categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className={`categoria-list-item ${cat.id === categoriaEditandoId ? "is-editing" : ""}`}
                  >
                    <div className="categoria-list-item-text">
                      <span className="categoria-list-item-nombre">
                        {cat.nombre}
                      </span>
                      {cat.descripcion && (
                        <span className="categoria-list-item-desc">
                          {cat.descripcion}
                        </span>
                      )}
                    </div>
                    <div className="categoria-list-item-actions">
                      <button
                        type="button"
                        className="icon-btn icon-btn-edit"
                        onClick={() => handleEditarCategoria(cat)}
                        title="Editar categoría"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-delete"
                        onClick={() => handleEliminarCategoria(cat.id)}
                        title="Eliminar categoría"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="categorias-empty">
                  Todavía no creaste ninguna categoría.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* PRODUCTOS — sección principal */}
      {/* ========================================================== */}
      <section className="productos-section">
        <div className="productos-section-header">
          <div>
            <h3>Productos</h3>
            <span className="productos-count">
              {productos.length} producto{productos.length !== 1 ? "s" : ""} en
              el catálogo
            </span>
          </div>
          <button
            type="button"
            className={`btn-nuevo-producto ${productoFormOpen ? "is-open" : ""}`}
            onClick={() => setProductoFormOpen((v) => !v)}
          >
            {productoFormOpen ? <FiX /> : <FiPlus />}
            {productoFormOpen ? "Cerrar" : "Nuevo producto"}
          </button>
        </div>

        {productoFormOpen && (
          <form className="gestor-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del producto"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="precio"
                placeholder="Precio ($)"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="stock"
                placeholder="Stock disponible"
                value={formData.stock}
                onChange={handleChange}
                required
              />
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              name="descripcion"
              placeholder="Descripción detallada del producto..."
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
            <div className="file-input-group">
              <label>Imagen del producto (desde tu computadora):</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
            <button type="submit" className="btn-submit">
              Guardar Producto
            </button>
          </form>
        )}

        <div className="gestor-table-wrapper">
          <table className="gestor-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.length > 0 ? (
                productos.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <img
                        src={prod.imagen_base64}
                        alt={prod.nombre}
                        className="table-thumb"
                      />
                    </td>
                    <td className="cell-strong">{prod.nombre}</td>
                    <td>${Number(prod.precio).toFixed(2)}</td>
                    <td>
                      <span
                        className={`stock-badge ${
                          prod.stock <= 0
                            ? "stock-badge-empty"
                            : prod.stock <= 5
                              ? "stock-badge-low"
                              : ""
                        }`}
                      >
                        {prod.stock}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        onClick={() => handleDelete(prod.id)}
                        className="icon-btn icon-btn-delete"
                        title="Eliminar producto"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Gestor;
