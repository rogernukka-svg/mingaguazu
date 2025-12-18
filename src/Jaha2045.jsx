import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapaBase from "./assets/mapa1.png";
import rodrigoPhoto from "./assets/rodrigo.png";

export default function Jaha2045({ onLogin = () => {} }) {
  const navigate = useNavigate();

  /* ===================== ESTADOS ===================== */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(2025);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [showAdminCode, setShowAdminCode] = useState(false);


  const [radarAudio] = useState(new Audio("/assets/radar.mp3"));

  const [formUser, setFormUser] = useState({
    name: "",
    username: "",
    code: "",
  });

  /* ===================== ACCESO ADMIN ===================== */
  const ACCESS_LIST = [
    {
      code: "51554163",
      name: "Rodri de Minga",
      role: "admin",
      region: "MINGA",
    },
  ];

  const KEYPAD_ROWS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["←", "0", "OK"],
  ];

 /* ===================== ANIMACIÓN INICIAL ===================== */
useEffect(() => {
  const audio = radarAudio;
  audio.loop = true;
  audio.volume = 0.6;

  let pct = 0;
  let currentYear = 2025;

  const interval = setInterval(() => {
    pct += 1;

    // ⏩ Año avanza más rápido (antes era % 6)
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


  /* ===================== LOGIN NORMAL ===================== */
  const handleNormalLogin = (e) => {
    e.preventDefault();
    if (!formUser.name || !formUser.username || !formUser.code) {
      alert("Completá todos los campos");
      return;
    }

    const userData = {
      name: formUser.name,
      username: formUser.username,
      role: "normal",
    };

    localStorage.setItem("jaha_user", JSON.stringify(userData));
    onLogin(userData);
    navigate("/app");
  };

  /* ===================== ADMIN ===================== */
  const handleAdminKey = (key) => {
    if (isScanning) return;
    if (key === "←") return setAdminCode((p) => p.slice(0, -1));
    if (key === "OK") return validateAdmin();
    if (/^\d$/.test(key))
      setAdminCode((p) => (p.length >= 8 ? p : p + key));
  };

  const validateAdmin = () => {
    const found = ACCESS_LIST.find((u) => u.code === adminCode.trim());
    if (!found) {
      setAdminError("Código inválido");
      return;
    }
    setAdminError("");
    setPendingUser(found);
    setIsScanning(true);
    setShowAdminModal(false);
  };

  /* ====== VOLVER ATRÁS (ADMIN) ====== */
  const handleAdminBack = () => {
    setShowAdminModal(false);
    setAdminCode("");
    setAdminError("");
    setPendingUser(null);
    setIsScanning(false);
  };

  useEffect(() => {
    if (!isScanning || !pendingUser) return;

    const t = setTimeout(() => {
      setIsScanning(false);
      localStorage.setItem("jaha_user", JSON.stringify(pendingUser));
      onLogin(pendingUser);
      navigate("/app");
    }, 5200);

    return () => clearTimeout(t);
  }, [isScanning, pendingUser, onLogin, navigate]);

  /* ===================== PANTALLA DE CARGA ===================== */
  if (loading) {
    return (
      <div className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden text-red-500">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#140000] to-black" />
        <img
          src={mapaBase}
          alt="Mapa base"
          className="w-[360px] sm:w-[460px] opacity-80 drop-shadow-[0_0_60px_rgba(255,0,0,0.8)]"
        />

        <div className="mt-6 text-center z-10">
          <h1 className="text-6xl font-extrabold tracking-[0.3em] text-white">
            JAHA
          </h1>
          <p className="text-5xl font-mono font-bold text-red-500 mt-2">
            {year}
          </p>
          <p className="text-xs tracking-widest text-gray-400 mt-2">
            Minga Guazú · Ciudad Inteligente
          </p>
        </div>

        <div className="w-64 h-1 bg-neutral-800 rounded-full mt-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-800 via-red-500 to-red-800 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-xs text-gray-500 mt-2 font-mono">
          {progress}%
        </p>
      </div>
    );
  }

  /* ===================== LOGIN ===================== */
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <form
        onSubmit={handleNormalLogin}
        className="w-full max-w-sm bg-neutral-900 border border-red-700 rounded-2xl p-6 shadow-[0_0_30px_rgba(255,0,0,0.4)]"
      >
        <h2 className="text-center text-red-400 mb-4 tracking-widest">
          ACCESO CIUDADANO
        </h2>

        <input
          placeholder="Nombre completo"
          className="w-full mb-3 p-2 bg-black border border-red-800 text-center"
          value={formUser.name}
          onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
        />

        <input
          placeholder="Usuario"
          className="w-full mb-3 p-2 bg-black border border-red-800 text-center"
          value={formUser.username}
          onChange={(e) =>
            setFormUser({ ...formUser, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Código"
          className="w-full mb-4 p-2 bg-black border border-red-800 text-center"
          value={formUser.code}
          onChange={(e) => setFormUser({ ...formUser, code: e.target.value })}
        />

        <button className="w-full bg-gradient-to-r from-red-600 to-red-400 text-black font-bold py-2 rounded-lg">
          Entrar
        </button>
      </form>

      {/* BOTÓN ADMIN */}
      <button
        onClick={() => setShowAdminModal(true)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-red-700 to-black px-4 py-3 rounded-full shadow-[0_0_25px_rgba(255,0,0,0.6)]"
      >
        🛡️ RODRI DE MINGA
      </button>

      {/* MODAL ADMIN */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-red-700 rounded-2xl p-6 w-80 relative">
            {/* VOLVER */}
            <button
              onClick={handleAdminBack}
              className="absolute top-3 left-3 text-sm text-red-400 hover:text-red-200"
            >
              ← Volver
            </button>

            <img
              src={rodrigoPhoto}
              className="w-24 h-24 rounded-full mx-auto mb-4 border border-red-600"
            />

            <div className="relative mb-3">
  <input
    readOnly
    type={showAdminCode ? "text" : "password"}
    value={adminCode}
    className="w-full p-2 bg-black border border-red-800 text-center pr-10"
  />

  <button
    type="button"
    onClick={() => setShowAdminCode((v) => !v)}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 text-sm"
  >
    {showAdminCode ? "🙈" : "👁️"}
  </button>
</div>

            {adminError && (
              <p className="text-red-500 text-sm text-center mb-2">
                {adminError}
              </p>
            )}

            {KEYPAD_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                {row.map((k) => (
                  <button
                    key={k}
                    onClick={() => handleAdminKey(k)}
                    className="bg-black border border-red-700 py-2"
                  >
                    {k}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
