import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-wide">🎓 Becas UCB</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/dashboard" className="hover:text-blue-200 transition">
            Dashboard
          </Link>
          <Link to="/estudiantes" className="hover:text-blue-200 transition">
            Estudiantes
          </Link>
          <Link to="/becas" className="hover:text-blue-200 transition">
            Becas
          </Link>
          <Link to="/asignacion" className="hover:text-blue-200 transition">
            Asignación
          </Link>
          {usuario?.rol === "ADMIN" && (
            <Link to="/usuarios" className="hover:text-blue-200 transition">
              Usuarios
            </Link>
          )}
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-3 text-sm">
          <span className="bg-blue-700 px-3 py-1.5 rounded-full text-xs font-medium">
            {usuario?.rol}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1.5
              rounded-lg transition text-sm font-medium"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
