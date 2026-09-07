import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Card.css';

const Card = ({ producto }) => {
  return (
    <div className="product-card">
      <div className="card-image-wrapper">
        <img src={producto.imagen_base64} alt={producto.nombre} />
      </div>
      <div className="card-body">
        <span className="card-category">{producto.categoria_nombre || 'General'}</span>
        <h3 className="card-title">{producto.nombre}</h3>
        <div className="card-footer">
          <span className="card-price">${Number(producto.precio).toFixed(2)}</span>
          
          {/* Convertimos el botón en un Link dinámico usando el id del producto */}
          <Link to={`/producto/${producto.id}`} className="card-btn">
            Ver Detalle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;