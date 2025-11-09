import React, { useState, useEffect } from "react";
import mapaBase from "./assets/mapa1.png";
import rodrigoPhoto from "./assets/rodrigo.png";

export default function Jaha2045({ onLogin = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(2026);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [pendingUser, setPendingUser] = useState(null);
  const [radarAudio] = useState(new Audio("/assets/radar.mp3"));

  /* === Lista de accesos preautorizados === */
  const ACCESS_LIST = [
    { code: "51554163", name: "Rodrigo Rios", role: "superadmin" },
    { code: "123456", name: "Coordinador Barrio San José", role: "normal" },
    { code: "654321", name: "Coordinador Barrio Santa Ana", role: "normal" },
    { code: "789123", name: "Supervisor General", role: "normal" },
  ];

  const KEYPAD_ROWS = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["←", "0", "OK"],
  ];

  /* === Sonido del teclado === */
  const playBeep = () => {
    try {
      const beep = new Audio("/assets/beep.mp3");
      beep.volume = 0.4;
      beep.play().catch(() => {});
    } catch (e) {
      console.warn("No se pudo reproducir beep", e);
    }
  };

  /* === Animación inicial con radar === */
  useEffect(() => {
    const audio = radarAudio;
    audio.loop = true;
    audio.volume = 0.6;
    let pct = 0;
    let y = 2026;
    let started = false;

    const tryPlay = () => {
      if (started) return;
      started = true;
      audio
        .play()
        .then(() => console.log("🎧 Radar iniciado"))
        .catch(() => {
          console.warn("⚠️ Autoplay bloqueado. Esperando clic...");
          const resume = () => {
            audio.play().catch(() => {});
            document.removeEventListener("click", resume);
          };
          document.addEventListener("click", resume);
        });
    };

    setTimeout(tryPlay, 600);

    const interval = setInterval(() => {
      pct += 2;
      if (pct % 7 === 0 && y < 2041) y++;
      setProgress(pct);
      setYear(y);
      if (y === 2041 && pct >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
          setLoading(false);
        }, 2000);
      }
    }, 80);

    return () => {
      clearInterval(interval);
      audio.pause();
    };
  }, [radarAudio]);

  /* === Flujo de escaneo con audio de bienvenida === */
  useEffect(() => {
    if (!isScanning || !pendingUser) return;

    const scanSound = new Audio("/assets/scan.mp3");
    scanSound.volume = 0.5;
    scanSound.play().catch(() => {});

    setScanStep(0);

    const t1 = setTimeout(() => setScanStep(1), 1000);
    const t2 = setTimeout(() => {
      setScanStep(2);

      // 🎤 Audio de bienvenida de Rodrigo (desde /public/assets/)
      if (pendingUser.code === "51554163") {
        const welcome = new Audio("/assets/welcome-rodrigo.mp3");
        welcome.volume = 0.9;

        // Intento de reproducción con desbloqueo si el navegador bloquea
        const tryPlay = () => {
          welcome.play().catch(() => {
            console.warn("⚠️ Chrome bloqueó el audio, esperando clic...");
            const unlock = () => {
              welcome.play().catch(() => {});
              document.removeEventListener("click", unlock);
            };
            document.addEventListener("click", unlock);
          });
        };

        tryPlay();
      } else {
        const accessSound = new Audio("/assets/access-granted.mp3");
        accessSound.volume = 0.6;
        accessSound.play().catch(() => {});
      }
    }, 2000);

    const t3 = setTimeout(() => {
      try {
        const { code: rawCode, ...rest } = pendingUser;
        const storedUser = {
          ...rest,
          codeHash: rawCode ? btoa(rawCode) : null,
        };
        localStorage.setItem("jaha_user", JSON.stringify(storedUser));
      } catch (e) {
        console.warn("No se pudo guardar usuario:", e);
      }
      setIsScanning(false);
      setScanStep(0);
      onLogin(pendingUser);
    }, 8000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isScanning, pendingUser, onLogin]);

  /* === Pantalla de carga === */
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
      </div>
    );
  }

  /* === Validación del código === */
  const startValidation = () => {
    if (isScanning) return;
    if (!code.trim()) return setError("Ingresa tu código de acceso.");
    const found = ACCESS_LIST.find((u) => u.code === code.trim());
    if (!found) return setError("❌ Código inválido o no autorizado");
    setError("");
    setPendingUser(found);
    setIsScanning(true);
  };

  const handleKeyClick = (key) => {
    if (isScanning) return;
    playBeep();
    if (key === "←") return setCode((prev) => prev.slice(0, -1));
    if (key === "OK") return startValidation();
    if (/^\d$/.test(key))
      setCode((prev) => (prev.length >= 8 ? prev : prev + key));
  };

  /* === Pantalla principal === */
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-neutral-950 to-black text-gray-100 px-4 py-10 relative overflow-hidden">
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3 text-red-500 tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,0,0,0.6)]">
          JAHA ACCESS CORE
        </h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto font-mono">
          Consola de autenticación avanzada para la ciudad inteligente.
          Solo códigos autorizados pueden acceder al sistema central.
        </p>
      </div>

      <div className="w-full max-w-sm bg-neutral-900/90 border border-red-700/40 rounded-2xl p-6 shadow-[0_0_28px_rgba(248,113,113,0.35)] backdrop-blur-md relative z-10">
        {!isScanning && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              startValidation();
            }}
            className="flex flex-col space-y-4"
          >
            <input
              className="bg-black/90 border border-red-800 rounded-lg text-center text-xl tracking-widest py-3 text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
              type="password"
              placeholder="••••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
            />
            {error && (
              <p className="text-xs text-red-400 bg-red-950/30 border border-red-700/60 rounded-lg px-3 py-1.5 font-mono">
                {error}
              </p>
            )}
            <div className="mt-2 space-y-3">
              {KEYPAD_ROWS.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-3">
                  {row.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleKeyClick(key)}
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
          </form>
        )}

        {isScanning && pendingUser && (
          <div className="mt-6 w-full bg-black/90 border border-red-600/60 rounded-xl p-4 shadow-[0_0_25px_rgba(255,0,0,0.55)] relative overflow-hidden animate-fadeIn">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-[laserMove_2s_linear_infinite]" />
            <div className="relative flex flex-col items-center gap-4">
              <div className="relative w-32 h-32 rounded-full border-2 border-red-600 shadow-[0_0_18px_rgba(255,0,0,0.8)] overflow-hidden">
                <img
                  src={rodrigoPhoto}
                  alt="Rodrigo Rios"
                  className="w-full h-full object-cover grayscale brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-red-700/60 via-red-800/50 to-transparent mix-blend-overlay animate-[scanGlow_2.5s_ease-in-out_infinite]" />
              </div>
              <div className="text-center font-mono text-sm">
                <p className="text-red-400">
                  {scanStep === 0 && "Scanning code..."}
                  {scanStep === 1 && "Análisis biométrico completado"}
                  {scanStep === 2 && "✅ Acceso autorizado: Rodrigo Ríos"}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Nivel de acceso: COMANDO CENTRAL
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-6 text-center relative z-10">
        <span className="text-red-500 font-semibold">JAHA 2045</span> · Proyecto Municipal Inteligente · Paraguay 2025
      </p>

      <style>{`
        @keyframes laserMove {
          0% { transform: translateY(0); opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translateY(120px); opacity: 0.7; }
        }
        @keyframes scanGlow {
          0%,100% { opacity: 0.6; }
          50% { opacity: 0.9; filter: blur(1px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}
