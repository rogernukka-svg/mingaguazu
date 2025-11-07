import React, { useState, useEffect } from "react";
import mapaBase from "./assets/mapa1.png"; // ✅ Ruta correcta

export default function Jaha2045({ onLogin = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(2026);
  const [mode, setMode] = useState("login");
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("normal");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* === Guardar y cargar usuarios del localStorage === */
  useEffect(() => {
    const savedUsers = localStorage.getItem("jaha_users");
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    // 🧠 Si ya hay sesión activa, entra directo
    const activeUser = localStorage.getItem("jaha_user");
    if (activeUser) {
      const parsed = JSON.parse(activeUser);
      onLogin(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("jaha_users", JSON.stringify(users));
  }, [users]);

 /* === Animación inicial cinematográfica con audio === */
useEffect(() => {
  const audio = new Audio("/assets/radar.mp3"); // 🎧 tu sonido tecnológico
  audio.loop = true;
  audio.volume = 0.7;

  let pct = 0;
  let y = 2026;

  // Intenta reproducir después de un breve retraso para evitar bloqueo de autoplay
  const playAudio = () => {
    audio
      .play()
      .then(() => console.log("🔊 Audio reproduciéndose correctamente"))
      .catch(() => console.warn("⚠️ Autoplay bloqueado, requiere interacción del usuario"));
  };

  setTimeout(playAudio, 500); // espera medio segundo antes de iniciar

  const interval = setInterval(() => {
    pct += 2;
    if (pct % 7 === 0 && y < 2041) y++;
    setProgress(pct);
    setYear(y);

    if (y === 2041 && pct >= 100) {
      clearInterval(interval);

      // 🔇 Detiene el sonido al finalizar
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
        setLoading(false);
      }, 2500);
    }
  }, 80);

  return () => {
    clearInterval(interval);
    audio.pause();
  };
}, []);

/* === Pantalla de introducción === */
if (loading) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden text-red-500 transition-opacity duration-1000">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#180000] to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15)_0%,transparent_70%)] animate-pulse" />
        <div className="absolute w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[180%] h-[180%] bg-[conic-gradient(from_90deg_at_center,rgba(255,0,0,0.4),transparent_60%)] animate-spin-slow opacity-25 blur-3xl" />
        <div className="absolute w-[160%] h-[160%] bg-[conic-gradient(from_270deg_at_center,rgba(255,255,255,0.1),transparent_70%)] animate-spin-rev opacity-20 blur-2xl" />
      </div>

      <img
        src={mapaBase}
        alt="Mapa de Minga Guazú"
        className="relative w-[340px] sm:w-[440px] opacity-95 drop-shadow-[0_0_50px_rgba(255,0,0,0.8)] animate-float"
      />

      <div className="absolute w-[520px] h-[520px] border border-red-600/40 rounded-full animate-pulse-ring blur-[1px]" />
      <div className="absolute w-[300px] h-[300px] border border-red-400/30 rounded-full animate-pulse-ring delay-700 blur-sm" />

      <div className="relative text-center z-10">
        <h1 className="text-6xl sm:text-7xl font-extrabold tracking-[0.25em] text-white animate-typewriter mb-3 drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
          JAHA
        </h1>
        <p className="text-5xl sm:text-6xl font-mono font-bold text-red-500 animate-year-glow drop-shadow-[0_0_30px_rgba(255,50,50,0.8)]">
          {year}
        </p>
        <p className="mt-4 text-sm sm:text-base text-gray-300 tracking-widest opacity-0 animate-fadeIn-final">
          Minga Guazú — La única ciudad inteligente del futuro.
        </p>
      </div>

      <div className="w-64 mt-8 h-1 bg-neutral-900 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-red-700 via-red-400 to-red-700 animate-pulse-fast transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-2 font-mono z-10">{progress}%</p>

      <style>{`
        @keyframes spin-slow {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);} }
        @keyframes spin-rev {0%{transform:rotate(360deg);}100%{transform:rotate(0deg);} }
        @keyframes float {0%,100%{transform:translateY(-6px);}50%{transform:translateY(6px);} }
        @keyframes typewriter {0%{width:0;opacity:0;}40%{opacity:1;}100%{width:100%;} }
        @keyframes year-glow {0%,100%{text-shadow:0 0 15px rgba(255,0,0,0.6);}50%{text-shadow:0 0 35px rgba(255,80,80,1);} }
        @keyframes fadeIn-final {0%,65%{opacity:0;transform:translateY(10px);}80%,100%{opacity:1;transform:translateY(0);} }
        @keyframes pulse-ring {0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:1;transform:scale(1.05);} }
        @keyframes pulse {0%,100%{opacity:0.3;}50%{opacity:1;} }
        .animate-spin-slow{animation:spin-slow 15s linear infinite;}
        .animate-spin-rev{animation:spin-rev 22s linear infinite;}
        .animate-float{animation:float 4s ease-in-out infinite;}
        .animate-pulse-ring{animation:pulse-ring 3.5s ease-in-out infinite;}
        .animate-fadeIn-final{animation:fadeIn-final 6s ease-in-out forwards;animation-delay:2.8s;}
        .animate-pulse-fast{animation:pulse 1.5s ease-in-out infinite;}
      `}</style>
    </div>
  );
}

  /* === Login === */
  const handleLogin = (e) => {
    e.preventDefault();
    if (users.length === 0)
      return setError("No hay usuarios registrados todavía.");
    const user = users.find(
      (u) =>
        u.username === username.trim() && u.password === password.trim()
    );
    if (!user) return setError("Usuario o contraseña incorrectos.");
    if (!user.active) return setError("Usuario desactivado.");
    setError("");
    localStorage.setItem("jaha_user", JSON.stringify(user)); // ✅ Guarda sesión activa
    onLogin(user);
  };

  /* === Registro === */
  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !username || !password)
      return setError("Completa todos los campos.");
    if (users.some((u) => u.username === username))
      return setError("Ese usuario ya existe.");

    const newUser = {
      id: Date.now(),
      name,
      username,
      password,
      role,
      active: true,
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("jaha_users", JSON.stringify(updatedUsers)); // ✅ guarda persistente
    setSuccess("✅ Registrado con éxito. Ya puedes iniciar sesión.");
    setError("");
    setMode("login");
    setName("");
    setUsername("");
    setPassword("");
    setRole("normal");
  };

  /* === Pantalla Login/Registro === */
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center max-w-3xl mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-red-500 tracking-wide drop-shadow-[0_0_10px_rgba(255,0,0,0.4)]">
          Sistema de Registro de Votantes
        </h1>
        <p className="text-sm md:text-base text-gray-300 max-w-2xl mx-auto">
          Plataforma moderna para registrar, organizar y visualizar el avance de contacto con los votantes.
        </p>
      </div>

      <div className="w-full max-w-md bg-neutral-900/90 border border-red-700/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,0,0,0.25)] backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
              setSuccess("");
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {mode === "login"
              ? "¿Nuevo? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>

        {error && (
          <p className="mb-3 text-xs text-red-400 bg-red-950/40 border border-red-700/60 rounded-lg px-3 py-1.5">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 text-xs text-green-400 bg-green-950/30 border border-green-700/60 rounded-lg px-3 py-1.5">
            {success}
          </p>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3 text-sm">
            <input
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />
            <input
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2 mt-2"
            >
              Entrar
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3 text-sm">
            <input
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
            />
            <input
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
            />
            <input
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
            <select
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="normal">Usuario Normal</option>
              <option value="admin">Súper Usuario</option>
            </select>
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2 mt-2"
            >
              Crear cuenta
            </button>
          </form>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-6 text-center">
        <span className="text-red-500 font-semibold">JAHA 2045</span> · Proyecto Municipal Inteligente · Paraguay 2025
      </p>
    </main>
  );
}
