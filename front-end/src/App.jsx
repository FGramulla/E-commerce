import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Páginas y componentes
import Login from './pages/Login';
import Register from './pages/Register';
import Header from './components/Header';
import Home from './pages/Home';
import Perfil from './pages/Perfil';
import Gestor from './pages/Gestor';
import ProductoDetalle from './pages/ProductoDetalle'; // Importamos la nueva vista
import Footer from './components/Footer';

// Componente para proteger rutas privadas y renderizar el Header y Footer automáticamente
const PrivateLayout = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20rem' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/gestor" element={<Gestor />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} /> {/* Nueva ruta dinámica */}
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// Componente para evitar que usuarios logueados entren a Login/Register
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20rem' }}>Cargando...</div>;
  }

  return !user ? children : <Navigate to="/home" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas (Sin Header ni Footer) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />

          {/* Rutas Privadas (Con Header, Footer y vistas integradas) */}
          <Route path="/*" element={<PrivateLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;