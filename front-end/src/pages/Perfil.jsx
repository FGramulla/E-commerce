import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiTrash2, FiSave, FiEdit2, FiCamera, FiX } from 'react-icons/fi';
import '../styles/Perfil.css';

const Perfil = () => {
  const { logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    nacionalidad: '',
    email: '',
    rol: '',
    avatar: '',
    newPassword: '',
    currentPassword: '',
  });

  const [emailOriginal, setEmailOriginal] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:4000/api/users/perfil', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = response.data;
        const fechaFormateada = data.fecha_nacimiento
          ? data.fecha_nacimiento.split('T')[0]
          : '';

        setFormData((prev) => ({
          ...prev,
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          fecha_nacimiento: fechaFormateada,
          nacionalidad: data.nacionalidad || '',
          email: data.email || '',
          rol: data.rol || '',
          avatar: data.avatar || '',
        }));
        setEmailOriginal(data.email || '');
      } catch (error) {
        setMessage({ text: 'No se pudo cargar el perfil.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Por favor selecciona un archivo de imagen válido.', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Determina si hace falta pedir la contraseña actual:
  // solo cuando se va a cambiar el email o se cargó una nueva contraseña
  const requierePasswordActual =
    Boolean(formData.newPassword) || formData.email !== emailOriginal;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (requierePasswordActual && !formData.currentPassword) {
      setMessage({
        text: 'Ingresá tu contraseña actual para cambiar el email o la contraseña.',
        type: 'error',
      });
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        nacionalidad: formData.nacionalidad,
        fecha_nacimiento: formData.fecha_nacimiento,
        avatar: formData.avatar,
        email: formData.email,
      };
      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }
      if (requierePasswordActual) {
        payload.currentPassword = formData.currentPassword;
      }

      const response = await axios.put(
        'http://localhost:4000/api/users/perfil',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ text: '¡Perfil actualizado exitosamente!', type: 'success' });
      setIsEditing(false);
      setEmailOriginal(response.data.usuario.email);

      updateUser({
        nombre: response.data.usuario.nombre,
        apellido: response.data.usuario.apellido,
        avatar: response.data.usuario.avatar,
      });

      setFormData((prev) => ({ ...prev, newPassword: '', currentPassword: '' }));
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || 'Error al actualizar el perfil.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:4000/api/users/perfil', {
        headers: { Authorization: `Bearer ${token}` },
      });
      logout();
      navigate('/login');
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || 'No se pudo eliminar la cuenta.',
        type: 'error',
      });
      setShowDeleteModal(false);
    }
  };

  const calcularEdadYFormato = (fechaNac) => {
    if (!fechaNac) return 'No especificada';

    const nacimiento = new Date(fechaNac);
    const hoy = new Date();

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return `${fechaNac} (${edad} años)`;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setMessage({ text: '', type: '' });
    setFormData((prev) => ({
      ...prev,
      email: emailOriginal,
      newPassword: '',
      currentPassword: '',
    }));
  };

  if (loading) {
    return <div className="perfil-loading">Cargando perfil...</div>;
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h2 className="perfil-title">Mi Perfil</h2>
        <p className="perfil-subtitle">Administrá tu información personal y tu cuenta.</p>
      </div>

      {message.text && (
        <div className={`perfil-message ${message.type}`}>{message.text}</div>
      )}

      <div className="perfil-card">
        <div className="perfil-top-section">
          {isEditing ? (
            <label className="perfil-avatar-editable" title="Hacé clic para cambiar tu foto">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" />
              ) : (
                <FiUser size={34} className="perfil-default-icon" />
              )}
              <div className="perfil-avatar-overlay">
                <FiCamera size={16} />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="perfil-file-input"
              />
            </label>
          ) : (
            <div className="perfil-avatar-static">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" />
              ) : (
                <FiUser size={34} className="perfil-default-icon" />
              )}
            </div>
          )}

          <div className="perfil-user-info">
            <h3 className="perfil-user-name">
              {formData.nombre} {formData.apellido}
            </h3>
            <p className="perfil-user-email">
              {formData.email}
              {formData.rol && <span className="perfil-user-role">{formData.rol}</span>}
            </p>
            {isEditing && (
              <span className="perfil-hint-text">Hacé clic en tu foto para cambiarla</span>
            )}
          </div>
        </div>

        <div className="perfil-mode-wrapper">
          {!isEditing ? (
            <div className="perfil-view-mode" key="view">
              <div className="perfil-view-group">
                <span className="perfil-label-view">Fecha de nacimiento</span>
                <span className="perfil-value-view">
                  {calcularEdadYFormato(formData.fecha_nacimiento)}
                </span>
              </div>
              <div className="perfil-view-group">
                <span className="perfil-label-view">Nacionalidad</span>
                <span className="perfil-value-view">
                  {formData.nacionalidad || 'No especificada'}
                </span>
              </div>

              <div className="perfil-actions">
                <button onClick={() => setIsEditing(true)} className="btn-perfil-primary">
                  <FiEdit2 /> Editar perfil
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-perfil-danger"
                >
                  <FiTrash2 /> Eliminar cuenta
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="perfil-form" key="edit">
              <div className="perfil-form-grid">
                <div className="perfil-form-group">
                  <label className="perfil-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="perfil-input"
                    required
                  />
                </div>

                <div className="perfil-form-group">
                  <label className="perfil-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    className="perfil-input"
                    required
                  />
                </div>

                <div className="perfil-form-group">
                  <label className="perfil-label">
                    Fecha de nacimiento <span className="perfil-locked-tag">no modificable</span>
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    className="perfil-input perfil-input-disabled"
                    disabled
                  />
                </div>

                <div className="perfil-form-group">
                  <label className="perfil-label">Nacionalidad</label>
                  <input
                    type="text"
                    name="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={handleChange}
                    className="perfil-input"
                  />
                </div>

                <div className="perfil-form-group perfil-form-group-full">
                  <label className="perfil-label">Correo electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="perfil-input"
                    required
                  />
                </div>
              </div>

              <hr className="perfil-divider" />

              <div className="perfil-form-group">
                <label className="perfil-label">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Dejalo en blanco si no querés cambiarla"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="perfil-input"
                />
              </div>

              {requierePasswordActual && (
                <div className="perfil-form-group perfil-password-confirm">
                  <label className="perfil-label">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Requerida para cambiar tu email o contraseña"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="perfil-input"
                    required
                  />
                </div>
              )}

              <div className="perfil-actions">
                <button type="submit" className="btn-perfil-primary" disabled={saving}>
                  <FiSave /> {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="btn-perfil-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="perfil-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="perfil-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              className="perfil-modal-close"
              onClick={() => setShowDeleteModal(false)}
              type="button"
            >
              <FiX />
            </button>
            <h3 className="perfil-modal-title">¿Estás completamente seguro?</h3>
            <p className="perfil-modal-text">
              Esta acción no se puede deshacer. Todos tus datos se eliminarán permanentemente.
            </p>
            <div className="perfil-modal-actions">
              <button
                className="btn-perfil-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-perfil-danger-solid" onClick={handleDeleteAccount}>
                Sí, eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;