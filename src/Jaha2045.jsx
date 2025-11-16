import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import mapaBase from "./assets/mapa1.png";
import rodrigoPhoto from "./assets/rodrigo.png";
import tikiPhoto from "./assets/tiki.png";

export default function Jaha2045({ onLogin = () => {} }) {
  const navigate = useNavigate();

  /* === ESTADOS PRINCIPALES === */
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(2026);

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [pendingUser, setPendingUser] = useState(null);
  const [radarAudio] = useState(new Audio("/assets/radar.mp3"));

  const [formUser, setFormUser] = useState({
    name: "",
    username: "",
    code: "",
  });
/* === DATOS DE ACCESO === */
const ACCESS_LIST = [
  { code: "51554163", name: "Rodrigo Ríos", role: "superadmin", region: "MINGA" },
  { code: "888999", name: "Tiki González", role: "superadmin", region: "ASUNCION" },
  { code: "123456", name: "Coordinador Barrio San José", role: "normal", region: "MINGA" },
  { code: "654321", name: "Coordinador Barrio Santa Ana", role: "normal", region: "MINGA" },
  { code: "789123", name: "Supervisor General", role: "normal", region: "MINGA" },
];


  const KEYPAD_ROWS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["←", "0", "OK"],
  ];

   /* === EFECTO RADAR INICIAL === */
  useEffect(() => {
    const audio = radarAudio;
    audio.loop = true;
    audio.volume = 0.6;
    let pct = 0;
    let y = 2026;

    const interval = setInterval(() => {
      pct += 2;
      if (pct % 7 === 0 && y < 2041) y++;
      setProgress(pct);
      setYear(y);
      if (y === 2041 && pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          audio.pause();
          setLoading(false);
        }, 1500);
      }
    }, 80);

    audio.play().catch(() => {
      console.warn("⚠️ Autoplay bloqueado. Esperando clic...");
      const resume = () => {
        audio.play().catch(() => {});
        document.removeEventListener("click", resume);
      };
      document.addEventListener("click", resume);
    });

    return () => {
      clearInterval(interval);
      audio.pause();
    };
  }, [radarAudio]);


  /* === LOGIN / REGISTRO DE USUARIO NORMAL === */
  const handleNormalLogin = (e) => {
    e.preventDefault();
    if (!formUser.name || !formUser.username || !formUser.code)
      return alert("Completa todos los campos para continuar.");
    const userData = {
      name: formUser.name,
      username: formUser.username,
      code: formUser.code,
      role: "normal",
    };
    localStorage.setItem("jaha_user", JSON.stringify(userData));
    onLogin(userData);
    navigate("/app"); // ✅ redirigir al panel ciudadano
  };

  /* === FUNCIONES DE ADMIN (MODAL) === */
  const playBeep = () => {
    try {
      const beep = new Audio("/assets/beep.mp3");
      beep.volume = 0.4;
      beep.play().catch(() => {});
    } catch (e) {
      console.warn("Beep error:", e);
    }
  };

  const handleAdminKey = (key) => {
    if (isScanning) return;
    playBeep();
    if (key === "←") return setAdminCode((p) => p.slice(0, -1));
    if (key === "OK") return validateAdmin();
    if (/^\d$/.test(key))
      setAdminCode((p) => (p.length >= 8 ? p : p + key));
  };

  const validateAdmin = () => {
    if (!adminCode.trim()) return setAdminError("Ingrese su código de acceso.");
    const found = ACCESS_LIST.find((u) => u.code === adminCode.trim());
    if (!found) return setAdminError("❌ Código inválido o no autorizado");
    setAdminError("");
    setPendingUser(found);
    setIsScanning(true);
    setShowAdminModal(false);
  };

 /* === ESCANEO Y BIENVENIDA ADMIN === */
useEffect(() => {
  if (!isScanning || !pendingUser) return;

  const scanSound = new Audio("/assets/scan.mp3");
  scanSound.volume = 0.5;
  scanSound.play().catch(() => {});

  setScanStep(0);

  const t1 = setTimeout(() => setScanStep(1), 1000);

  const t2 = setTimeout(() => {
    setScanStep(2);

    if (pendingUser.code === "51554163") {
      // 🟢 Bienvenida Rodrigo (Minga)
      const welcome = new Audio("/assets/welcome-rodrigo.mp3");
      welcome.volume = 0.9;
      welcome.play().catch(() => {
        console.warn("⚠️ Chrome bloqueó el audio de Rodrigo...");
        const unlock = () => {
          welcome.play().catch(() => {});
          document.removeEventListener("click", unlock);
        };
        document.addEventListener("click", unlock);
      });

    } else if (pendingUser.code === "888999") {
      // 🔴 Bienvenida Tiki González (Asunción)
      const welcomeTiki = new Audio("/assets/tiki-welcome.mp3");
      welcomeTiki.volume = 0.9;
      welcomeTiki.play().catch(() => {
        console.warn("⚠️ Chrome bloqueó el audio de Tiki...");
        const unlock = () => {
          welcomeTiki.play().catch(() => {});
          document.removeEventListener("click", unlock);
        };
        document.addEventListener("click", unlock);
      });

    } else {
      // Acceso genérico para otros
      const accessSound = new Audio("/assets/access-granted.mp3");
      accessSound.volume = 0.6;
      accessSound.play().catch(() => {});
    }

  }, 2000);

  const t3 = setTimeout(() => {
    setIsScanning(false);
    localStorage.setItem("jaha_user", JSON.stringify(pendingUser));
    onLogin(pendingUser);

    if (pendingUser.region === "ASUNCION") {
      navigate("/admincontrolgeneral"); // Panel de Tiki (Asunción)
    } else if (pendingUser.region === "MINGA") {
      navigate("/adminrealtime"); // Panel de Rodrigo (Minga Guazú)
    } else {
      navigate("/app");
    }
  }, 8000);

  return () => {
    clearTimeout(t1);
    clearTimeout(t2);
    clearTimeout(t3);
  };
}, [isScanning, pendingUser, onLogin, navigate]);


  /* === PANTALLA DE CARGA === */
  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-black overflow-hidden text-red-500 transition-opacity duration-1000">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#180000] to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.15)_0%,transparent_70%)] animate-pulse" />
        </div>
        <img
          src={mapaBase}
          alt="Mapa"
          className="relative w-[340px] sm:w-[440px] drop-shadow-[0_0_50px_rgba(255,0,0,0.8)] animate-float"
        />
        <div className="relative text-center z-10">
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-[0.25em] text-white mb-3 animate-typewriter drop-shadow-[0_0_25px_rgba(255,0,0,0.8)]">
            JAHA
          </h1>
          <p className="text-5xl font-mono font-bold text-red-500 animate-year-glow drop-shadow-[0_0_30px_rgba(255,50,50,0.8)]">
            {year}
          </p>
          <p className="mt-4 text-sm text-gray-300 tracking-widest">
            Minga Guazú — Ciudad Inteligente del Futuro
          </p>
        </div>
        <div className="w-64 mt-8 h-1 bg-neutral-900 rounded-full overflow-hidden z-10">
          <div
            className="h-full bg-gradient-to-r from-red-700 via-red-400 to-red-700 animate-pulse-fast transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 font-mono z-10">{progress}%</p>
      </div>
    );
  }

  /* === PANTALLA PRINCIPAL === */
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-black text-gray-100 px-4 py-10 relative overflow-hidden">
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-red-500 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
          JAHA ACCESS CORE
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto font-mono">
          Login o registro de ciudadano.  
          Acceso exclusivo para personal autorizado.
        </p>
      </div>

      {/* === FORMULARIO LOGIN/REGISTRO === */}
      <form
        onSubmit={handleNormalLogin}
        className="w-full max-w-sm bg-neutral-900/90 border border-red-700/40 rounded-2xl p-6 shadow-[0_0_28px_rgba(248,113,113,0.35)] backdrop-blur-md relative z-10"
      >
        <h2 className="text-lg font-semibold text-red-400 mb-4 text-center">
          Login / Registro
        </h2>
        <input
          type="text"
          placeholder="Nombre completo"
          className="bg-black/90 border border-red-800 rounded-lg text-center text-md py-2 text-red-300 mb-3 w-full font-mono"
          value={formUser.name}
          onChange={(e) => setFormUser({ ...formUser, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Usuario"
          className="bg-black/90 border border-red-800 rounded-lg text-center text-md py-2 text-red-300 mb-3 w-full font-mono"
          value={formUser.username}
          onChange={(e) => setFormUser({ ...formUser, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Código de acceso"
          className="bg-black/90 border border-red-800 rounded-lg text-center text-md py-2 text-red-300 mb-4 w-full font-mono"
          value={formUser.code}
          onChange={(e) => setFormUser({ ...formUser, code: e.target.value })}
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-red-600 to-red-400 text-black font-bold rounded-lg py-2 hover:scale-105 transition-transform w-full"
        >
          Entrar
        </button>
      </form>

      {/* BOTÓN ADMIN TIKI — ASUNCIÓN */}
<button
  onClick={() => {
    setShowAdminModal(true);
    setPendingUser({ region: "ASUNCION" });
  }}
  className="fixed bottom-6 right-6 bg-gradient-to-r from-red-700 to-black text-white px-4 py-3 rounded-full shadow-[0_0_25px_rgba(255,0,0,0.6)] hover:scale-110 transition-transform font-semibold text-sm tracking-wide"
>
  🛡️ ASUNCIÓN — TIKI
</button>

{/* BOTÓN ADMIN RODRIGO — MINGA GUAZÚ */}
<button
  onClick={() => {
    setShowAdminModal(true);
    setPendingUser({ region: "MINGA" });
  }}
  className="fixed bottom-6 left-6 bg-gradient-to-r from-red-700 to-black text-white px-4 py-3 rounded-full shadow-[0_0_25px_rgba(255,0,0,0.6)] hover:scale-110 transition-transform font-semibold text-sm tracking-wide"
>
  🛡️ MINGA — RODRIGO
</button>


     {/* === MODAL ADMIN CON TECLADO === */}
{showAdminModal && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm animate-fadeIn z-50">
    <div className="bg-gradient-to-b from-black via-neutral-900 to-red-950 border border-red-700/50 rounded-2xl shadow-[0_0_50px_rgba(255,0,0,0.5)] p-6 w-80 sm:w-96 relative">
      <button
        onClick={() => setShowAdminModal(false)}
        className="absolute top-3 right-3 text-red-400 hover:text-red-200"
      >
        ✕
      </button>

      <div className="flex flex-col items-center gap-4">

        {/* FOTO DINÁMICA SEGÚN REGIÓN */}
        <img
          src={pendingUser?.region === "ASUNCION" ? tikiPhoto : rodrigoPhoto}
          alt={pendingUser?.region === "ASUNCION" ? "Tiki González" : "Rodrigo Ríos"}
          className="w-24 h-24 rounded-full border-2 border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.7)] object-cover"
        />

        <h2 className="text-xl font-bold text-red-400">Acceso de Comando</h2>

        {/* NOMBRE DEL OPERADOR */}
        <p className="text-xs text-gray-400 -mt-2 mb-1">
          {pendingUser?.region === "ASUNCION"
            ? "Operador: Tiki González — Asunción"
            : "Operador: Rodrigo Ríos — Minga Guazú"}
        </p>

        <p className="text-sm text-gray-400 text-center">
          Ingrese su código de autorización.
        </p>

        <input
          value={adminCode}
          readOnly
          className="bg-black/90 border border-red-800 rounded-lg text-center text-xl tracking-widest py-3 text-red-400 font-mono w-full mt-2"
          placeholder="••••••••"
        />

        {adminError && (
          <p className="text-xs text-red-400 bg-red-950/30 border border-red-700/60 rounded-lg px-3 py-1.5 font-mono w-full text-center">
            {adminError}
          </p>
        )}

        <div className="mt-3 space-y-3 w-full">
          {KEYPAD_ROWS.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-3">
              {row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleAdminKey(key)}
                  className={`py-3 rounded-lg text-lg font-semibold border font-mono ${
                    key === "OK"
                      ? "bg-gradient-to-r from-red-600 to-red-400 text-black border-red-500 shadow-[0_0_12px_rgba(248,113,113,0.7)]"
                      : key === "←"
                      ? "bg-neutral-950 text-red-400 border-red-700"
                      : "bg-neutral-950/90 text-red-300 border-red-800/70"
                  } hover:scale-105 active:scale-95 transition-transform duration-150`}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  </div>
)}


      {/* === ESCANEO BIOMÉTRICO FUTURISTA === */}
{isScanning && pendingUser && (
  pendingUser.region === "ASUNCION" ? (
    /* === ESCANEO TIKI — ASUNCIÓN (ROJO) === */
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-black z-50 overflow-hidden">
      {/* 🔴 Radar circular rojo */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-red-700/30 animate-spin-slow blur-sm shadow-[0_0_60px_rgba(255,0,0,0.2)]"></div>
      <div className="absolute w-[700px] h-[700px] rounded-full border border-red-800/10 animate-pulse-slow blur-[3px]"></div>

      <div className="mt-6 w-80 bg-black/90 border border-red-600/60 rounded-xl p-4 shadow-[0_0_25px_rgba(255,0,0,0.55)] relative overflow-hidden animate-fadeIn">
        {/* 🔦 Línea láser roja */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-laserLoop" />

        <div className="relative flex flex-col items-center gap-5">
          <div className="relative w-36 h-36 rounded-full border-2 border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.8)] overflow-hidden">
            <img
              src={tikiPhoto}
              alt="Tiki González"
              className="w-full h-full object-cover grayscale brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-red-700/60 via-red-800/40 to-transparent mix-blend-overlay animate-scanGlow" />
            <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-energyPulse"></div>
          </div>

          <div className="text-center font-mono text-sm">
            <p className="text-red-400 drop-shadow-[0_0_6px_rgba(255,50,50,0.7)]">
              {scanStep === 0 && "Inicializando escaneo de control político..."}
              {scanStep === 1 && "Analizando estructura administrativa..."}
              {scanStep === 2 && "🔴 Acceso concedido: Tiki González"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Nivel de acceso: NÚCLEO DE ADMINISTRACIÓN · ASUNCIÓN
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : pendingUser.region === "MINGA" ? (
    /* === ESCANEO RODRIGO — MINGA GUAZÚ (VERDE) === */
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black via-neutral-900 to-black z-50 overflow-hidden">
      {/* 🟢 Radar circular verde */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-green-600/30 animate-spin-slow blur-sm shadow-[0_0_60px_rgba(0,255,120,0.2)]"></div>
      <div className="absolute w-[700px] h-[700px] rounded-full border border-green-800/10 animate-pulse-slow blur-[3px]"></div>

      <div className="mt-6 w-80 bg-black/90 border border-green-500/60 rounded-xl p-4 shadow-[0_0_25px_rgba(0,255,120,0.45)] relative overflow-hidden animate-fadeIn">
        {/* 🔦 Línea láser verde */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-laserLoop" />

        <div className="relative flex flex-col items-center gap-5">
          <div className="relative w-36 h-36 rounded-full border-2 border-green-400 shadow-[0_0_20px_rgba(0,255,120,0.8)] overflow-hidden">
            <img
              src={rodrigoPhoto}
              alt="Rodrigo Ríos"
              className="w-full h-full object-cover grayscale brightness-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-green-700/50 via-green-800/30 to-transparent mix-blend-overlay animate-scanGlow" />
            <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-energyPulse"></div>
          </div>

          <div className="text-center font-mono text-sm">
            <p className="text-green-400 drop-shadow-[0_0_6px_rgba(0,255,120,0.7)]">
              {scanStep === 0 && "Conectando red territorial..."}
              {scanStep === 1 && "Verificando legitimidad zonal..."}
              {scanStep === 2 && "🟢 Acceso concedido: Rodrigo Ríos"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Nivel de acceso: COMANDO REGIONAL · MINGA GUAZÚ
            </p>
          </div>
        </div>
      </div>
    </div>
  ) : null
)}

<p className="text-[11px] text-gray-500 mt-6 text-center relative z-10">
  <span className="text-red-500 font-semibold">JAHA 2041</span> · Proyecto Municipal Inteligente · Paraguay 2025
</p>

<style>{`
  @keyframes laserLoop {
    0%,100% { transform: translateY(0); opacity: 0.8; }
    50% { transform: translateY(130px); opacity: 1; }
  }
  .animate-laserLoop { animation: laserLoop 2s linear infinite; }

  @keyframes scanGlow {
    0%,100% { opacity: 0.5; }
    50% { opacity: 0.9; filter: blur(1px); }
  }
  .animate-scanGlow { animation: scanGlow 2.5s ease-in-out infinite; }

  @keyframes energyPulse {
    0% { transform: scale(0.95); opacity: 0.6; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.6; }
  }
  .animate-energyPulse { animation: energyPulse 3s ease-in-out infinite; }

  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .animate-spin-slow { animation: spin-slow 12s linear infinite; }

  @keyframes pulse-slow {
    0%,100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`}</style>

    </main>
  );
}
