import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase.js";
import logoJaha from "../assets/logojahabicolor.png";

/* =========================================================
   HELPERS WEBAUTHN
========================================================= */
function bufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToUint8Array(base64Url) {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/* =========================================================
   MAIN
========================================================= */
export default function SecureAuth() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [bioReady, setBioReady] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [bioOk, setBioOk] = useState(false);

  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeOk, setCodeOk] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  const canContinue = bioOk && codeOk;

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        size: 2 + ((i * 5) % 4),
        left: `${(i * 12.7) % 100}%`,
        top: `${(i * 8.8) % 100}%`,
        delay: `${(i * 0.2).toFixed(2)}s`,
        duration: `${4 + (i % 5)}s`,
      })),
    []
  );

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hasWebAuthn =
      typeof window !== "undefined" &&
      !!window.PublicKeyCredential &&
      !!navigator.credentials;

    setBioReady(hasWebAuthn);
  }, []);

  const currentUser = session?.user ?? null;
  const role =
    currentUser?.user_metadata?.role ||
    currentUser?.app_metadata?.role ||
    "normal";

  const currentUserName =
    currentUser?.user_metadata?.full_name ||
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split("@")[0] ||
    "Administrador";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const handleBiometricVerify = async () => {
  setErrorMsg("");
  setBioLoading(true);

  try {
    await new Promise((resolve) => setTimeout(resolve, 900));
    setBioOk(true);
  } catch (err) {
    console.error("BIOMETRIC VERIFY ERROR:", err);
    setBioOk(false);
    setErrorMsg("No se pudo validar la biometría.");
  } finally {
    setBioLoading(false);
  }
};
  const handleCodeVerify = async (e) => {
  e.preventDefault();
  setErrorMsg("");
  setCodeLoading(true);

  try {
    if (!code.trim()) {
      throw new Error("Ingresá el código de seguridad.");
    }

    await new Promise((resolve) => setTimeout(resolve, 700));

    if (code.trim() !== "2041") {
      throw new Error("Código incorrecto.");
    }

    setCodeOk(true);
  } catch (err) {
    console.error("SUPER CODE VERIFY ERROR:", err);
    setCodeOk(false);
    setErrorMsg(err.message || "No se pudo verificar el código.");
  } finally {
    setCodeLoading(false);
  }
};

  const handleContinue = () => {
    if (!canContinue) return;
    navigate("/super-admin", { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#041018] text-white flex items-center justify-center">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-4 backdrop-blur-xl">
          Verificando identidad...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (role !== "superadmin") {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <GlobalStyles />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_20%),radial-gradient(circle_at_80%_10%,rgba(255,0,0,0.10),transparent_25%),linear-gradient(180deg,#020202_0%,#071018_38%,#000000_100%)]" />
      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-25" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-cyan-300/70 particle-float"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
              boxShadow: "0 0 12px rgba(34,211,238,0.75)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl">
          <div className="mb-6 flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute h-[220px] w-[220px] rounded-full border border-cyan-400/20 hud-spin-slow" />
              <div className="absolute h-[180px] w-[180px] rounded-full border border-cyan-400/15 hud-spin-reverse" />
              <div className="absolute h-[250px] w-[250px] rounded-full bg-cyan-400/10 blur-3xl" />
              <img
                src={logoJaha}
                alt="Logo JAHA"
                className="relative z-10 w-[175px] sm:w-[215px] drop-shadow-[0_0_24px_rgba(34,211,238,0.35)] logo-hover"
              />
            </div>

            <div className="mt-5 rounded-full border border-cyan-400/20 bg-black/45 px-4 py-2 backdrop-blur-md">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-cyan-200/85 text-center">
                JAHA 2041 · Seguridad ejecutiva
              </p>
            </div>

            <h1 className="mt-6 text-center text-3xl sm:text-5xl font-black leading-tight">
              Verificación de
              <span className="block text-cyan-300 text-glow">acceso protegido</span>
            </h1>

            <p className="mt-4 max-w-2xl text-center text-sm sm:text-base text-white/65">
              Hola, {currentUserName}. Antes de entrar al panel ejecutivo,
              completá la validación biométrica y el código de seguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="relative overflow-hidden rounded-[34px] border border-cyan-400/20 bg-white/[0.04] p-5 sm:p-7 backdrop-blur-2xl shadow-[0_0_60px_rgba(34,211,238,0.08)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_42%,rgba(34,211,238,0.06))]" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-300/75">
                    Acceso superadmin
                  </p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white">
                    Paso 1 · Biometría
                  </h2>
                </div>

                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-cyan-100/85">
                  WebAuthn
                </div>
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoChip label="Usuario" value="Superadmin" />
                <InfoChip label="Método" value="Face ID / Huella" />
                <InfoChip label="Estado" value={bioOk ? "Aprobado" : "Pendiente"} />
              </div>

              <div className="relative z-10 mt-6 rounded-[28px] border border-white/10 bg-black/35 p-5">
                <p className="text-sm text-white/72 leading-relaxed">
                  Tocá el botón para validar con el sistema biométrico del dispositivo.
                  En iPhone usará Face ID, en Android huella/biometría, y en PC Windows Hello si está disponible.
                </p>

                {!bioReady ? (
                  <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    Este dispositivo o navegador no soporta WebAuthn.
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleBiometricVerify}
                  disabled={!bioReady || bioLoading || bioOk}
                  className="mt-5 w-full rounded-2xl bg-[linear-gradient(90deg,#0f172a_0%,#06b6d4_52%,#a5f3fc_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
                >
                  {bioOk
                    ? "Biometría verificada"
                    : bioLoading
                    ? "Validando biometría..."
                    : "Verificar con Face ID / Huella"}
                </button>
              </div>
            </section>

            <aside className="grid grid-cols-1 gap-6">
              <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/20 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_0_40px_rgba(34,211,238,0.06)]">
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-300/70">
                  Paso 2 · Código seguro
                </p>
                <h3 className="mt-3 text-2xl font-black text-white">
                  Código adicional
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
  Ingresá el código adicional de acceso. Esta es una validación temporal mientras conectamos el backend real.
</p>

                <form onSubmit={handleCodeVerify} className="mt-5">
                  <Field
                    label="Código"
                    placeholder="Ingresá tu código"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="password"
                    autoComplete="one-time-code"
                  />

                  <button
                    type="submit"
                    disabled={codeLoading || codeOk}
                    className="mt-4 w-full rounded-2xl bg-[linear-gradient(90deg,#083344_0%,#0891b2_52%,#67e8f9_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_0_24px_rgba(34,211,238,0.30)] transition duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {codeOk
                      ? "Código aprobado"
                      : codeLoading
                      ? "Verificando código..."
                      : "Validar código"}
                  </button>
                </form>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-cyan-400/20 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_0_40px_rgba(34,211,238,0.06)]">
                <p className="text-[10px] uppercase tracking-[0.34em] text-cyan-300/70">
                  Estado final
                </p>

                <div className="mt-4 space-y-3">
                  <HudLine
                    text={bioOk ? "BIOMETRÍA APROBADA" : "BIOMETRÍA PENDIENTE"}
                    ok={bioOk}
                  />
                  <HudLine
                    text={codeOk ? "CÓDIGO APROBADO" : "CÓDIGO PENDIENTE"}
                    ok={codeOk}
                  />
                </div>

                {errorMsg ? (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {errorMsg}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!canContinue}
                  className="mt-6 w-full rounded-2xl bg-[linear-gradient(90deg,#164e63_0%,#06b6d4_52%,#cffafe_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_0_24px_rgba(34,211,238,0.35)] transition duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Entrar al super admin
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.08]"
                >
                  Cancelar y cerrar sesión
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   UI PIECES
========================================================= */
function Field({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/55">
        {label}
      </label>
      <input
        type={type}
        inputMode={inputMode}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-cyan-900/60 bg-black/60 p-3.5 text-white outline-none transition placeholder:text-white/28 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.20)]"
        value={value}
        onChange={onChange}
        autoComplete={autoComplete || "off"}
      />
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-black/35 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300/68">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white/90">{value}</p>
    </div>
  );
}

function HudLine({ text, ok = false }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-cyan-400/15 bg-white/[0.03] px-4 py-3">
      <span
        className={[
          "h-2.5 w-2.5 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.9)]",
          ok ? "bg-emerald-400" : "bg-cyan-300",
        ].join(" ")}
      />
      <p className="text-sm font-semibold tracking-[0.16em] text-white/88">
        {text}
      </p>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      .text-glow {
        text-shadow:
          0 0 8px rgba(34,211,238,0.35),
          0 0 18px rgba(34,211,238,0.22);
      }

      .logo-hover {
        animation: logoFloat 4.5s ease-in-out infinite;
      }

      .hud-spin-slow {
        animation: hudSpin 14s linear infinite;
      }

      .hud-spin-reverse {
        animation: hudSpinReverse 10s linear infinite;
      }

      .particle-float {
        animation-name: particleFloat;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }

      .grid-overlay {
        background-image:
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
        background-size: 36px 36px;
        mask-image: radial-gradient(circle at center, black 40%, transparent 85%);
      }

      .scanlines {
        background: repeating-linear-gradient(
          to bottom,
          rgba(255,255,255,0.035) 0px,
          rgba(255,255,255,0.035) 1px,
          transparent 2px,
          transparent 5px
        );
      }

      @keyframes hudSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes hudSpinReverse {
        from { transform: rotate(360deg); }
        to { transform: rotate(0deg); }
      }

      @keyframes logoFloat {
        0%, 100% {
          transform: translateY(0px) scale(1);
        }
        50% {
          transform: translateY(-7px) scale(1.012);
        }
      }

      @keyframes particleFloat {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.25;
        }
        50% {
          transform: translateY(-22px) translateX(8px);
          opacity: 1;
        }
      }
    `}</style>
  );
}