import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/ProductoDetalle.css';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerDetalleProducto = async () => {
      try {
        setLoading(true);
        // Petición directa optimizada al endpoint por ID
        const response = await axiosClient.get(`/api/products/${id}`);
        setProducto(response.data);
      } catch (err) {
        console.error(err);
        setError('El producto no existe, fue eliminado o hubo un error al cargarlo.');
      } finally {
        setLoading(false);
      }
    };

    obtenerDetalleProducto();
  }, [id]);

  const handleCantidadChange = (tipo) => {
    if (tipo === 'incrementar' && cantidad < (producto?.stock || 1)) {
      setCantidad(prev => prev + 1);
    } else if (tipo === 'decrementar' && cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  const agregarAlCarrito = () => {
    const carritoActual = JSON.parse(localStorage.getItem('carrito')) || [];
    
    const index = carritoActual.findIndex(item => item.id === producto.id);
    if (index >= 0) {
      carritoActual[index].cantidad += cantidad;
    } else {
      carritoActual.push({ ...producto, cantidad });
    }

    localStorage.setItem('carrito', JSON.stringify(carritoActual));
    alert(`¡Se agregaron ${cantidad} unidad(es) al carrito exitosamente!`);
  };

  if (loading) return <div className="detalle-loading">Cargando producto...</div>;
  if (error) return <div className="detalle-error"><h2>{error}</h2><button onClick={() => navigate('/home')}>Volver al Home</button></div>;
  if (!producto) return null;

  return (
    <div className="detalle-container">
      <button className="detalle-volver-btn" onClick={() => navigate(-1)}>
        &larr; Volver
      </button>

      <div className="detalle-grid">
        {/* Columna Izquierda: Imagen */}
        <div className="detalle-imagen-wrapper">
          {producto.imagen_base64 ? (
            <img src={producto.imagen_base64} alt={producto.nombre} className="detalle-img" />
          ) : (
            <div className="detalle-sin-imagen">Sin imagen disponible</div>
          )}
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="detalle-info">
          <span className="detalle-categoria">{producto.categoria_nombre || 'General'}</span>
          <h1 className="detalle-titulo">{producto.nombre}</h1>
          <p className="detalle-precio">${Number(producto.precio).toLocaleString()}</p>

          <div className="detalle-descripcion-box">
            <h3>Descripción</h3>
            <p>{producto.descripcion || 'Este producto no cuenta con una descripción detallada.'}</p>
          </div>

          <div className="detalle-stock-info">
            Stock disponible: <strong>{producto.stock} unidades</strong>
          </div>

          {/* Selector de cantidad y Botón de Carrito */}
          {producto.stock > 0 ? (
            <div className="detalle-acciones">
              <div className="detalle-contador">
                <button onClick={() => handleCantidadChange('decrementar')}>-</button>
                <span>{cantidad}</span>
                <button onClick={() => handleCantidadChange('incrementar')}>+</button>
              </div>

              <button className="detalle-btn-comprar" onClick={agregarAlCarrito}>
                Agregar al Carrito
              </button>
            </div>
          ) : (
            <p className="detalle-agotado">Producto agotado temporalmente</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;