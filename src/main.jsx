import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Jaha2045 from "./Jaha2045.jsx";
import App from "./App.jsx";

// ================= PRIVADAS =================
import CentralLogin from "./pages/CentralLogin.jsx";
import CentralDashboard from "./pages/CentralDashboard.jsx";
import CentralCoordinadores from "./pages/CentralCoordinadores.jsx";
import CentralMoviles from "./pages/CentralMoviles.jsx";
import CentralMapa from "./pages/CentralMapa.jsx";

import ConcejalLogin from "./pages/ConcejalLogin.jsx";
import ConcejalPanel from "./pages/ConcejalPanel.jsx";

import CoordinadorLogin from "./pages/CoordinadorLogin.jsx";
import CoordinadorPanel from "./pages/CoordinadorPanel.jsx";

import MovilLogin from "./pages/MovilLogin.jsx";
import MovilPanel from "./pages/MovilPanel.jsx";

import PrivateGuard from "./pages/PrivateGuard.jsx";

// 🔑 CSS GLOBAL DE LEAFLET
import "leaflet/dist/leaflet.css";
import "./index.css";

function Main() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("jaha_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-cyan-400 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,0,110,0.08),transparent_24%),linear-gradient(to_bottom,#030303,#0a0a0a,#000000)]" />
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

        <div className="relative z-10 rounded-[28px] border border-cyan-400/15 bg-white/[0.04] px-8 py-6 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />
            <p className="text-sm font-mono tracking-[0.18em] uppercase text-cyan-300">
              Inicializando sistema...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ================= PÚBLICO ================= */}
        <Route path="/" element={<Jaha2045 onLogin={setUser} />} />
        <Route path="/login" element={<Jaha2045 onLogin={setUser} />} />
        <Route
          path="/app"
          element={<App initialUser={user} onLogout={() => setUser(null)} />}
        />

        {/* ================= LOGIN PRIVADO ================= */}
        <Route path="/central-login" element={<CentralLogin />} />
        <Route path="/concejal-login" element={<ConcejalLogin />} />
        <Route path="/coordinador-login" element={<CoordinadorLogin />} />
        <Route path="/movil-login" element={<MovilLogin />} />

        {/* ================= CENTRAL PRIVADA ================= */}
        <Route
          path="/central"
          element={
            <PrivateGuard allowedRoles={["superadmin", "concejal"]}>
              <CentralDashboard />
            </PrivateGuard>
          }
        />
        <Route
          path="/central/coordinadores"
          element={
            <PrivateGuard allowedRoles={["superadmin", "concejal"]}>
              <CentralCoordinadores />
            </PrivateGuard>
          }
        />
        <Route
          path="/central/moviles"
          element={
            <PrivateGuard allowedRoles={["superadmin", "concejal"]}>
              <CentralMoviles />
            </PrivateGuard>
          }
        />
        <Route
          path="/central/mapa"
          element={
            <PrivateGuard allowedRoles={["superadmin", "concejal"]}>
              <CentralMapa />
            </PrivateGuard>
          }
        />

        {/* ================= PANEL CONCEJAL ================= */}
        <Route
          path="/concejal"
          element={
            <PrivateGuard allowedRoles={["concejal"]}>
              <ConcejalPanel />
            </PrivateGuard>
          }
        />

        {/* ================= PANEL COORDINADOR ================= */}
        <Route
          path="/coordinador"
          element={
            <PrivateGuard allowedRoles={["coordinador"]}>
              <CoordinadorPanel />
            </PrivateGuard>
          }
        />

        {/* ================= PANEL MÓVIL ================= */}
        <Route
          path="/movil"
          element={
            <PrivateGuard allowedRoles={["movil"]}>
              <MovilPanel />
            </PrivateGuard>
          }
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