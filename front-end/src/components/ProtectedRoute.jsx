import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Mientras lee el localStorage, mostramos un mensaje de carga (evita parpadeos)
  if (loading) return <div>Cargando aplicación...</div>;

  // Si no hay usuario logueado, lo mandamos al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario, renderiza las páginas "hijas" (Dashboard, Productos, etc.)
  return <Outlet />; 
};