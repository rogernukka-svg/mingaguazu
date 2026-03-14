import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapaBase from "./assets/mapa1.png";
import logoJaha from "./assets/logojahabicolor.png";

export default function Jaha2045({ onLogin = () => {} }) {
  const navigate = useNavigate();

  /* ===================== ESTADOS ===================== */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(2025);
  const [radarAudio] = useState(new Audio("/assets/radar.mp3"));

  const [formUser, setFormUser] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    codigo: "",
  });

  /* ===================== ANIMACIÓN INICIAL ===================== */
  useEffect(() => {
    const audio = radarAudio;
    audio.loop = true;
    audio.volume = 0.6;

    let pct = 0;
    let currentYear = 2025;

    const interval = setInterval(() => {
      pct += 1;

      if (pct % 3 === 0 && currentYear < 2041) currentYear++;

      setProgress(pct);
      setYear(currentYear);

      if (currentYear === 2041 && pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          audio.pause();
          setLoading(false);
        }, 1200);
      }
    }, 70);

    audio.play().catch(() => {
      const unlock = () => {
        audio.play().catch(() => {});
        document.removeEventListener("click", unlock);
      };
      document.addEventListener("click", unlock);
    });

    return () => {
      clearInterval(interval);
      audio.pause();
    };
  }, [radarAudio]);

  /* ===================== HELPERS ===================== */
  const handleChange = (field, value) => {
    if (field === "cedula" || field === "telefono" || field === "codigo") {
      value = value.replace(/\D/g, "");
    }

    setFormUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ===================== LOGIN NORMAL ===================== */
  const handleNormalLogin = (e) => {
    e.preventDefault();

    if (
      !formUser.nombre.trim() ||
      !formUser.apellido.trim() ||
      !formUser.cedula.trim() ||
      !formUser.telefono.trim() ||
      !formUser.codigo.trim()
    ) {
      alert("Completá todos los campos");
      return;
    }

    const userData = {
      nombre: formUser.nombre.trim(),
      apellido: formUser.apellido.trim(),
      cedula: formUser.cedula.trim(),
      telefono: formUser.telefono.trim(),
      username: formUser.cedula.trim(),
      role: "normal",
    };

    localStorage.setItem("jaha_user", JSON.stringify(userData));
    onLogin(userData);
    navigate("/app");
  };

  /* ===================== PANTALLA DE CARGA ===================== */
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,50,50,0.18),transparent_35%),linear-gradient(to_bottom,#0a0a0a,#120000,#000000)]" />

        <div className="absolute w-[420px] h-[420px] rounded-full bg-red-600/10 blur-3xl top-10" />

       <img
  src={mapaBase}
  alt="Mapa base"
  className="absolute w-[420px] sm:w-[560px] h-auto opacity-10 object-cover object-[50%_42%] select-none pointer-events-none"
/>

        <img
          src={logoJaha}
          alt="Logo JAHA"
          className="relative z-10 w-[220px] sm:w-[280px] drop-shadow-[0_0_25px_rgba(255,40,40,0.45)] select-none"
        />

        <div className="relative z-10 mt-6 text-center">
          <p className="text-5xl sm:text-6xl font-extrabold tracking-[0.18em] text-white">
            {year}
          </p>
          <p className="mt-2 text-[11px] sm:text-xs uppercase tracking-[0.35em] text-red-300/80">
            Minga Guazú · Ciudad Inteligente
          </p>
        </div>

        <div className="relative z-10 w-64 sm:w-80 h-2 mt-8 bg-white/10 rounded-full overflow-hidden border border-red-500/20">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-900 via-red-500 to-red-300 transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="relative z-10 text-xs text-white/70 mt-3 font-mono tracking-[0.25em]">
          {progress}%
        </p>
      </div>
    );
  }

  /* ===================== LOGIN ===================== */
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,40,40,0.18),transparent_30%),linear-gradient(to_bottom,#050505,#110000,#000000)]" />
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-red-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[520px] h-[220px] bg-red-600/10 blur-3xl rounded-full" />
<img
  src={mapaBase}
  alt="Mapa base"
  className="absolute w-[460px] sm:w-[620px] h-auto opacity-[0.07] object-cover object-[50%_42%] select-none pointer-events-none"
/>

      {/* logo arriba */}
      <div className="relative z-10 mb-6 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
          <img
            src={logoJaha}
            alt="Logo JAHA"
            className="relative w-[180px] sm:w-[220px] drop-shadow-[0_0_18px_rgba(255,0,0,0.35)]"
          />
        </div>

        <p className="mt-4 text-xs uppercase tracking-[0.35em] text-red-300/80 text-center">
          Plataforma Ciudadana · Acceso Seguro
        </p>

        <p className="mt-2 text-[11px] sm:text-xs text-white/50 text-center max-w-sm">
          Ingresá tus datos para acceder de forma rápida, clara y segura.
        </p>
      </div>
<div className="mt-4 relative z-10">
  <div className="absolute inset-0 blur-xl bg-red-500/20 rounded-xl"></div>

  <div className="relative px-5 py-2 rounded-xl border border-red-500/30 bg-black/60 backdrop-blur-md">
    <p className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-red-400 text-center font-semibold">
      Programa de Innovación Ciudadana · Rodrigo Ríos 2026
    </p>
  </div>
</div>
      <form
        onSubmit={handleNormalLogin}
        className="relative z-10 w-full max-w-md rounded-[28px] border border-red-600/30 bg-white/[0.05] backdrop-blur-xl p-5 sm:p-7 shadow-[0_0_40px_rgba(255,0,0,0.12)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-red-400 tracking-[0.28em] text-sm font-bold uppercase">
            Acceso Ciudadano
          </h2>

          <div className="px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-[10px] uppercase tracking-[0.2em] text-red-200/80">
            Secure ID
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block mb-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Tu nombre"
              className="w-full p-3 rounded-2xl bg-black/60 border border-red-800/70 text-white placeholder:text-white/30 outline-none focus:border-red-500 focus:shadow-[0_0_12px_rgba(255,0,0,0.18)] transition"
              value={formUser.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
              Apellido
            </label>
            <input
              type="text"
              placeholder="Tu apellido"
              className="w-full p-3 rounded-2xl bg-black/60 border border-red-800/70 text-white placeholder:text-white/30 outline-none focus:border-red-500 focus:shadow-[0_0_12px_rgba(255,0,0,0.18)] transition"
              value={formUser.apellido}
              onChange={(e) => handleChange("apellido", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block mb-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
            Número de cédula
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej: 51554163"
            className="w-full p-3 rounded-2xl bg-black/60 border border-red-800/70 text-white placeholder:text-white/30 outline-none focus:border-red-500 focus:shadow-[0_0_12px_rgba(255,0,0,0.18)] transition"
            value={formUser.cedula}
            onChange={(e) => handleChange("cedula", e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="block mb-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
            Número de teléfono
          </label>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Ej: 0982030926"
            className="w-full p-3 rounded-2xl bg-black/60 border border-red-800/70 text-white placeholder:text-white/30 outline-none focus:border-red-500 focus:shadow-[0_0_12px_rgba(255,0,0,0.18)] transition"
            value={formUser.telefono}
            onChange={(e) => handleChange("telefono", e.target.value)}
          />
        </div>

        <div className="mt-3">
          <label className="block mb-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
            Código de acceso
          </label>
          <input
            type="password"
            inputMode="numeric"
            placeholder="Ingresá tu código"
            className="w-full p-3 rounded-2xl bg-black/60 border border-red-800/70 text-white placeholder:text-white/30 outline-none focus:border-red-500 focus:shadow-[0_0_12px_rgba(255,0,0,0.18)] transition"
            value={formUser.codigo}
            onChange={(e) => handleChange("codigo", e.target.value)}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-red-700 via-red-500 to-red-400 text-white font-extrabold py-3.5 tracking-[0.2em] uppercase shadow-[0_0_18px_rgba(255,0,0,0.28)] hover:scale-[1.01] active:scale-[0.99] transition"
          >
            Entrar
          </button>
        </div>

        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-center text-[11px] text-white/45 tracking-[0.14em] uppercase">
            Interfaz clara · rápida · tecnológica
          </p>
        </div>
      </form>
    </main>
  );
}