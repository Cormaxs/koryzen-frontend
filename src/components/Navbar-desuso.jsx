
export default function Navbar() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-light bg-light px-3">
      <span className="navbar-brand mb-0 h6">
       
      </span>

      <button onClick={logout} className="btn btn-outline-dark btn-sm">
        Cerrar sesión
      </button>
    </nav>
  );
}
