import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: "220px" }}>
      <h5 className="mb-4">Koryzen-System</h5>

      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="">
            Metricas
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="inventario">
            Inventario
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink className="nav-link text-white" to="asociados">
            Asociados
          </NavLink>
        </li>
{/*
        <li className="nav-item">
          <NavLink className="nav-link text-white" to="configuracion">
            Configuración
          </NavLink>
        </li>*/}
      </ul>
    </div>
  );
}
