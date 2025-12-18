import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-black border-b border-red-700/40 shadow-md shadow-red-900/20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* 🔴 LOGO / TÍTULO */}
        <div className="flex items-center gap-3">
          <span className="text-red-500 font-extrabold tracking-[0.2em] text-sm">
            JAHA
          </span>
          <span className="text-gray-400 text-xs font-mono">
            2041
          </span>
        </div>

        {/* 🧭 LINKS */}
        <nav className="flex items-center gap-4 text-xs font-semibold">

          <Link
            to="/app"
            className="text-gray-300 hover:text-red-400 transition"
          >
            Inicio
          </Link>

          <Link
            to="/app"
            className="text-gray-300 hover:text-red-400 transition"
          >
            Registro
          </Link>

          <Link
            to="/app"
            className="text-gray-300 hover:text-red-400 transition"
          >
            Mapa
          </Link>

          {/* 👤 USUARIO */}
          {currentUser ? (
            <>
              <span className="hidden sm:inline text-[11px] text-gray-400 font-mono">
                {currentUser.name}
              </span>

              <button
                onClick={handleLogout}
                className="ml-2 bg-red-600 hover:bg-red-500 text-black px-3 py-1 rounded-md text-[11px] font-semibold transition"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-red-600 hover:bg-red-500 text-black px-3 py-1 rounded-md text-[11px] font-semibold transition"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
