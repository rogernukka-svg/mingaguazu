import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Jaha2045 from "./Jaha2045.jsx";
import App from "./App.jsx";

// 🛰️ Panel administrador Minga (Rodrigo)
import AdminRealtime from "./admin/AdminRealtime.jsx";

// 🟥 Panel administrador Asunción (Tiki)
import AdminControlGeneral from "./admin/AdminControlGeneral.jsx";

// 🚗 Panel del conductor (nuevo)
import ConductorPanel from "./conductor/ConductorPanel.jsx";

import "./index.css";

function Main() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Cargar sesión guardada al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem("jaha_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // ⏳ pequeña pausa visual
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center text-sm font-mono">
        Cargando sistema...
      </div>
    );
  }

  return (
    <Router>
      <Routes>

        {/* 🧠 Acceso principal */}
        <Route path="/" element={<Jaha2045 onLogin={setUser} />} />

        {/* 📌 Ruta fall-back para /login (evita pantalla en blanco) */}
        <Route path="/login" element={<Jaha2045 onLogin={setUser} />} />

        {/* 🧩 Plataforma de coordinadores / ciudadanos */}
        <Route
          path="/app"
          element={<App initialUser={user} onLogout={() => setUser(null)} />}
        />

        {/* 🟢 Panel de comando regional (Rodrigo - Minga Guazú) */}
        <Route path="/adminrealtime" element={<AdminRealtime />} />

        {/* 🔴 Panel de control general (Tiki - Asunción) */}
        <Route path="/admincontrolgeneral" element={<AdminControlGeneral />} />

        {/* 🚗 Panel del conductor */}
        <Route path="/conductor" element={<ConductorPanel />} />

      </Routes>
    </Router>
  );
}

// 🚀 Render principal
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

/*
// 📴 Service Worker desactivado temporalmente
// Si querés reactivarlo más adelante, descomentá este bloque.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch((err) => console.log("SW falló", err));
  });
}
*/
