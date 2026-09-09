import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient'; // <-- Usamos el cliente centralizado
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Reemplazamos axios.post por axiosClient.post y usamos ruta relativa
      const response = await axiosClient.post('/api/auth/login', {
        email,
        password,
      });

      const { token, usuario } = response.data;

      login(usuario, token);

      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-section">
        <div className="login-form-wrapper">
          <h2>Bienvenido de nuevo</h2>
          <p>Ingresa tus credenciales para acceder a tu cuenta.</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tucorreo@email.com"
              />
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="login-btn">Iniciar Sesión</button>
          </form>
          <p className="redirect-text">
            ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
          </p>
        </div>
      </div>
      <div className="login-info-section">
        <div className="info-content">
          <h2>Descubre el mejor E-Commerce</h2>
          <p>Explora miles de productos, gestiona tus compras y disfruta de una experiencia única.</p>
          <div className="floating-shape"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;