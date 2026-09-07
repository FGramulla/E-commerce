import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Pide los datos reales directamente al backend usando tu ruta de perfil
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(
            "http://localhost:4000/api/users/perfil",
            config,
          );

          // Guardamos el usuario real que viene de la base de datos
          setUser(response.data);
        } catch (err) {
          console.error("Sesión expirada o token inválido", err);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    setUser(userData); // userData debe venir del backend con nombre y apellido
  };

  const updateUser = (updatedData) => {
    setUser((prevUser) => ({ ...prevUser, ...updatedData }));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
