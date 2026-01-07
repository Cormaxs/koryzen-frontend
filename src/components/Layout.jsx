import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    // Usamos navigate para una transición más fluida en React Router
    navigate("/login"); 
  };

  return (
    <div className="d-flex">
      {/* El Sidebar se mantiene como componente externo o podrías integrarlo igual */}
      <Sidebar />

      <div className="flex-grow-1">
        {/* Navbar Integrado directamente aquí */}
        <nav className="navbar navbar-light bg-light px-3 border-bottom">
          <span className="navbar-brand mb-0 h6">
            Koryzen
          </span>
          <button onClick={logout} className="btn btn-outline-dark btn-sm">
            Cerrar sesión
          </button>
        </nav>

        {/* Contenido Principal */}
        <main className="p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}