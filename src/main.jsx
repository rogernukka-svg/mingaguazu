import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Jaha2045 from "./Jaha2045.jsx";
import App from "./App.jsx";

// 🔑 CSS GLOBAL DE LEAFLET (arregla la flecha del popup en producción)
import "leaflet/dist/leaflet.css";

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

        {/* 📌 Fallback login */}
        <Route path="/login" element={<Jaha2045 onLogin={setUser} />} />

        {/* 🧩 App principal */}
        <Route
          path="/app"
          element={<App initialUser={user} onLogout={() => setUser(null)} />}
        />
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
