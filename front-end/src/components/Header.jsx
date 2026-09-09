import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/Header.css";

export const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Aplicar el atributo "dark" al <html> cuando cambia isDark
  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute("dark", "");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  // Obtener las iniciales del usuario
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header-container">
      <div className="header-left">
        <Link to="/home" className="header-logo-link">
          <h2 className="header-logo-text">E-Commerce</h2>
        </Link>
      </div>

      <div className="header-right" ref={dropdownRef}>
        <div
          className="header-user-menu-trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="header-profile-wrapper">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="header-avatar-img"
              />
            ) : (
              <div className="header-initials-circle">
                {user?.nombre
                  ? `${user.nombre[0]}${user?.apellido ? user.apellido[0] : ""}`.toUpperCase()
                  : "U"}
              </div>
            )}
            <span className="header-user-name">
              {user?.nombre
                ? `${user.nombre} ${user?.apellido || ""}`
                : "Usuario"}
            </span>
          </div>
        </div>

        {isOpen && (
          <div className="header-dropdown-menu">
            {/* Toggle Dark Mode - arriba de todo */}
            <div className="header-theme-toggle-wrapper">
              <span className="header-theme-label">
                {isDark ? "Modo oscuro" : "Modo claro"}
              </span>
              <button
                onClick={toggleDarkMode}
                className={`header-theme-switch ${isDark ? "is-dark" : ""}`}
                aria-label="Cambiar tema"
              >
                <span className="header-theme-switch-thumb">
                  <span className="header-theme-icon header-theme-icon-sun">
                    ☀️
                  </span>
                  <span className="header-theme-icon header-theme-icon-moon">
                    🌙
                  </span>
                </span>
              </button>
            </div>

            <Link
              to="/home"
              className="header-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/perfil"
              className="header-dropdown-item"
              onClick={() => setIsOpen(false)}
            >
              Mi perfil
            </Link>

            {user?.rol === "owner" && (
              <Link
                to="/gestor"
                className="header-dropdown-item header-owner-item"
                onClick={() => setIsOpen(false)}
              >
                Gestor de Productos
              </Link>
            )}

            <div className="header-dropdown-divider"></div>

            <button
              onClick={handleLogout}
              className="header-dropdown-item header-logout-btn"
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
