import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nacionalidad: '',
    email: '',
    password: '',
    confirmPassword: '',
    fecha_nacimiento: '',
  });
  
  const [paises, setPaises] = useState([]);
  const [error, setError] = useState('');
  
  // Estados para controlar la visibilidad de las contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:4000/api/countries')
      .then((res) => setPaises(res.data))
      .catch((err) => console.error('Error al cargar países', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validar si las contraseñas coinciden
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      // Excluimos confirmPassword para que el backend no reciba un campo extra que no necesita
      const { confirmPassword, ...dataToSend } = formData;
      
      await axios.post('http://localhost:4000/api/auth/register', dataToSend);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <div className="register-container">
      <div className="register-info-section">
        <div className="info-content-reg">
          <h2>Únete a nuestra comunidad</h2>
          <p>Crea una cuenta para comenzar a comprar y disfrutar de beneficios exclusivos.</p>
          <div className="floating-shape-reg"></div>
        </div>
      </div>
      <div className="register-form-section">
        <div className="register-form-wrapper">
          <h2>Crear Cuenta</h2>
          <p>Completa tus datos personales para registrarte.</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="input-row">
              <div className="input-group">
                <label>Nombre</label>
                <input type="text" name="nombre" onChange={handleChange} required placeholder="Tu nombre" />
              </div>
              <div className="input-group">
                <label>Apellido</label>
                <input type="text" name="apellido" onChange={handleChange} required placeholder="Tu apellido" />
              </div>
            </div>
            <div className="input-row">
              <div className="input-group">
                <label>Nacionalidad</label>
                <select name="nacionalidad" onChange={handleChange} required>
                  <option value="">Selecciona tu país</option>
                  {paises.map((pais, index) => (
                    <option key={index} value={pais}>{pais}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label>Correo Electrónico</label>
              <input type="email" name="email" onChange={handleChange} required placeholder="tucorreo@email.com" />
            </div>

            {/* Campo de Contraseña con Icono */}
            <div className="input-group">
              <label>Contraseña</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={formData.password}
                  onChange={handleChange} 
                  required 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Campo de Confirmar Contraseña con Icono */}
            <div className="input-group">
              <label>Confirmar Contraseña</label>
              <div className="password-wrapper">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  name="confirmPassword" 
                  value={formData.confirmPassword}
                  onChange={handleChange} 
                  required 
                  placeholder="••••••••" 
                />
                <button 
                  type="button" 
                  className="eye-btn" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="register-btn">Registrarse</button>
          </form>
          <p className="redirect-text">
            ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;