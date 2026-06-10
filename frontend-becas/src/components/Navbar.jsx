import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/estudiantes", label: "Estudiantes" },
  { to: "/becas", label: "Becas" },
  { to: "/asignacion", label: "Asignación" },
];

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <nav className="bg-slate-900 text-white shadow-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-sm font-bold tracking-wide text-white">Becas UCB</span>
          </div>

          {/* Nav links desktop */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition
                  ${isActive(link.to) ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>
                {link.label}
              </Link>
            ))}
            {usuario?.rol === "ADMIN" && (
              <Link to="/usuarios"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition
                  ${isActive("/usuarios") ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-800"}`}>
                Usuarios
              </Link>
            )}
          </div>
        </div>

        {/* Right side desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/estudiantes/buscar"
            className="text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-md hover:bg-slate-800 transition border border-slate-700 hover:border-slate-600 flex items-center gap-1.5"
            title="Buscar estudiantes por historial de becas">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center">
              <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs text-slate-400 max-w-[120px] truncate">{usuario?.email}</span>
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-medium">{usuario?.rol}</span>
          </div>
          <button onClick={handleLogout}
            className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-md hover:bg-slate-800 transition border border-slate-700 hover:border-slate-600">
            Salir
          </button>
        </div>

        {/* Hamburger button mobile */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Abrir menú"
        >
          {menuAbierto ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuAbierto && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={cerrarMenu}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition
                ${isActive(link.to) ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
              {link.label}
            </Link>
          ))}
          {usuario?.rol === "ADMIN" && (
            <Link to="/usuarios" onClick={cerrarMenu}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition
                ${isActive("/usuarios") ? "bg-blue-600 text-white" : "text-slate-300 hover:text-white hover:bg-slate-700"}`}>
              Usuarios
            </Link>
          )}
          <Link to="/estudiantes/buscar" onClick={cerrarMenu}
            className="px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar estudiantes
          </Link>
          <div className="border-t border-slate-700 mt-2 pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 truncate max-w-[160px]">{usuario?.email}</span>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded font-medium">{usuario?.rol}</span>
            </div>
            <button onClick={handleLogout}
              className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-md hover:bg-slate-700 transition border border-slate-600">
              Salir
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
