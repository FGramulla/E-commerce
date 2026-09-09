import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../components/Card';
import axiosClient from '../api/axiosClient';
import '../styles/Home.css';

const Home = () => {
  const heroBanners = [
    { 
      id: 1, 
      tag: 'OFERTAS DE TEMPORADA',
      title: 'Gran Liquidación de Verano', 
      subtitle: 'Hasta 50% de descuento en tecnología seleccionada.', 
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
      cta: 'Ver Ofertas' 
    },
    { 
      id: 2, 
      tag: 'NUEVA COLECCIÓN', 
      title: 'Innovación y Estilo', 
      subtitle: 'Descubre las últimas tendencias y dispositivos de alta gama.', 
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
      cta: 'Explorar Moda' 
    },
    { 
      id: 3, 
      tag: 'BENEFICIO EXCLUSIVO', 
      title: 'Envíos a Todo el País', 
      subtitle: 'Envío gratis asegurado en compras superiores a $50.', 
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1600&auto=format&fit=crop&q=80',
      cta: 'Comprar Ahora' 
    },
    { 
      id: 4, 
      tag: 'TECNOLOGÍA AVANZADA', 
      title: 'Conectividad Total', 
      subtitle: 'Renueva tu ecosistema digital con equipos de última generación.', 
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&auto=format&fit=crop&q=80',
      cta: 'Descubrir Más' 
    },
  ];

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [maxPrice, setMaxPrice] = useState(1000); // Precio máximo ajustable
  const [sortBy, setSortBy] = useState('recientes'); // Ordenamiento
  const [currentIndex, setCurrentIndex] = useState(0);

  // Cargar datos del backend
useEffect(() => {
    const fetchData = async () => {
      try {
        const [resProd, resCat] = await Promise.all([
          axiosClient.get('/api/products'),
          axiosClient.get('/api/categorias')
        ]);
        setProductos(resProd.data);
        setCategorias(resCat.data);

        if (resProd.data.length > 0) {
          const precios = resProd.data.map(p => Number(p.precio));
          const highest = Math.max(...precios);
          setMaxPrice(Math.ceil(highest));
        }
      } catch (error) {
        console.error('Error al cargar datos del Home:', error);
      }
    };
    fetchData();
  }, []);

  // Efecto de Loop Automático controlado por estado
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  // Filtrado avanzado (nombre, categoría, precio y stock)
  const productosFiltrados = productos.filter((prod) => {
    const coincideNombre = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (prod.descripcion && prod.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const coincideCategoria = selectedCategory === 'todos' || String(prod.categoria_id) === String(selectedCategory);
    const coincidePrecio = Number(prod.precio) <= maxPrice;
    return coincideNombre && coincideCategoria && coincidePrecio;
  }).sort((a, b) => {
    if (sortBy === 'precio-asc') return Number(a.precio) - Number(b.precio);
    if (sortBy === 'precio-desc') return Number(b.precio) - Number(a.precio);
    if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre);
    if (sortBy === 'recientes') return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const scrollToCatalog = () => {
    const catalogSection = document.getElementById('catalog-section');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* SECCIÓN 1: HERO SLIDER CONTROLADO */}
      <section className="hero-section">
        <div className="hero-container">
          <div 
            className="hero-track" 
            style={{ transform: `translateX(-${currentIndex * 100}vw)` }}
          >
            {heroBanners.map((item) => (
              <div className="hero-slide" key={item.id}>
                <img src={item.image} alt={item.title} draggable="false" />
                <div className="hero-overlay"></div>
                <div className="hero-content">
                  <span className="hero-tag">{item.tag}</span>
                  <h2>{item.title}</h2>
                  <p>{item.subtitle}</p>
                  <button className="hero-btn" onClick={scrollToCatalog}>
                    {item.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-dots">
            {heroBanners.map((_, idx) => (
              <button
                key={idx}
                className={`hero-dot ${currentIndex === idx ? 'active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: CATÁLOGO Y FILTROS AVANZADOS */}
      <section id="catalog-section" className="catalog-section">
        <div className="catalog-header-wrapper">
          <div className="catalog-title-group">
            <span className="catalog-subtitle">Explora nuestra selección</span>
            <h2>Catálogo Exclusivo</h2>
          </div>
          <div className="filter-controls-top">
            <div className="search-box">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Buscar por nombre o descripción..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            {/* Selector de Ordenamiento */}
            <div className="sort-box">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio: Menor a Mayor</option>
                <option value="precio-desc">Precio: Mayor a Menor</option>
                <option value="nombre">Nombre (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* PANEL DE FILTROS SECUNDARIOS (CATEGORÍAS Y PRECIO) */}
        <div className="advanced-filters-panel">
          <div className="category-pills-container">
            <button 
              className={`category-pill ${selectedCategory === 'todos' ? 'active' : ''}`} 
              onClick={() => setSelectedCategory('todos')}
            >
              Todos
            </button>
            {categorias.map((cat) => (
              <button 
                key={cat.id}
                className={`category-pill ${String(selectedCategory) === String(cat.id) ? 'active' : ''}`} 
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Filtro por Rango de Precio */}
          <div className="price-filter-wrapper">
            <div className="price-label">
              <span>Precio máximo:</span>
              <span className="price-badge">${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000" 
              step="50"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-range-slider"
            />
          </div>
        </div>

        {/* GRILLA DE PRODUCTOS */}
        <div className="products-grid-container">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto) => (
              <Card key={producto.id} producto={producto} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No se encontraron resultados</h3>
              <p>Prueba ajustando el filtro de precios o cambiando los términos de búsqueda.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;