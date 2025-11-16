import React from "react";
import { Link } from "react-router-dom";

export default function Navbar({ currentUser, onLogout }) {
  return (
    <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-red-700/40 shadow-[0_0_25px_rgba(255,0,0,0.25)]">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-red-400">
        
        {/* 🔴 Logo + título */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-red-700 to-red-500 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-red-900/40">
            J
          </div>
          <div>
            <p className="font-bold leading-tight text-white tracking-wide">
              JAHA 2041
            </p>
            <p className="text-[11px] text-red-300/80 leading-tight">
              Minga Guazú · Ciudad Inteligente
            </p>
          </div>
        </div>

        {/* 👤 Usuario o mensaje */}
        <div className="flex items-center gap-4 text-xs sm:text-sm">

          {currentUser ? (
            <>
              {/* Datos del usuario */}
              <div className="text-right">
                <p className="font-semibold text-white">{currentUser.name}</p>
                <p className="text-red-300/80 capitalize">
                  {currentUser.role === "admin"
                    ? "Súper Usuario"
                    : currentUser.role === "general"
                    ? "Administrador General"
                    : "Usuario Normal"}
                </p>
              </div>

              {/* 🚗 BOTÓN PANEL CONDUCTOR */}
              <Link
                to="/conductor"
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-semibold px-3 py-1.5 rounded-full text-xs shadow-lg shadow-emerald-900/40 transition-all"
              >
                🚗 Conductor
              </Link>

              {/* Cerrar Sesión */}
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1.5 rounded-full text-xs shadow-lg shadow-red-900/40 transition-all"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <p className="text-red-200 text-xs sm:text-sm">
              Inicia sesión para continuar
            </p>
          )}
        </div>

      </nav>
    </header>
  );
}
