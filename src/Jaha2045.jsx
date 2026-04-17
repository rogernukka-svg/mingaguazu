import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapaBase from "./assets/mapa1.png";
import logoJaha from "./assets/logojahabicolor.png";
import supabase from "./lib/supabase.js";

export default function Jaha2045({ onLogin = () => {} }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [year, setYear] = useState(2025);
  const [bootText, setBootText] = useState("");
  const [hudReady, setHudReady] = useState(false);
  const [mode, setMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formUser, setFormUser] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
  });

  const audioRef = useRef(null);

  const bootLines = useMemo(
    () => [
      "INICIANDO NÚCLEO JAHA...",
      "CARGANDO CARTOGRAFÍA URBANA...",
      "SINCRONIZANDO NODOS CIUDADANOS...",
      "VERIFICANDO CANAL SEGURO...",
      "ACTIVANDO INTERFAZ 2041...",
      "MINGA GUAZÚ · MODO TECNOLÓGICO...",
    ],
    []
  );

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        size: 2 + ((i * 7) % 5),
        left: `${(i * 13.7) % 100}%`,
        top: `${(i * 9.2) % 100}%`,
        delay: `${(i * 0.23).toFixed(2)}s`,
        duration: `${4 + (i % 6)}s`,
      })),
    []
  );

  useEffect(() => {
    const audio = new Audio("/assets/radar.mp3");
    audio.loop = true;
    audio.volume = 0.45;
    audioRef.current = audio;

    let pct = 0;
    let currentYear = 2025;
    let lineIndex = 0;

    const textInterval = setInterval(() => {
      setBootText(bootLines[lineIndex] || bootLines[bootLines.length - 1]);
      lineIndex = Math.min(lineIndex + 1, bootLines.length - 1);
    }, 900);

    const interval = setInterval(() => {
      pct += 1;

      if (pct % 6 === 0 && currentYear < 2041) currentYear++;

      setProgress(pct);
      setYear(currentYear);

      if (pct >= 100) {
        clearInterval(interval);
        clearInterval(textInterval);
        setBootText("SISTEMA OPERATIVO LISTO");
        setTimeout(() => {
          audio.pause();
          setLoading(false);
          setTimeout(() => setHudReady(true), 150);
        }, 1100);
      }
    }, 58);

    audio.play().catch(() => {
      const unlock = () => {
        audio.play().catch(() => {});
        document.removeEventListener("click", unlock);
        document.removeEventListener("touchstart", unlock);
      };
      document.addEventListener("click", unlock);
      document.addEventListener("touchstart", unlock);
    });

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
      audio.pause();
    };
  }, [bootLines]);

useEffect(() => {
  let mounted = true;

  const syncSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    console.log("Jaha2045 getSession:", { data, error });

    if (!mounted) return;

    const session = data?.session ?? null;

    if (session?.user) {
      onLogin(session.user);
      navigate("/app", { replace: true });
    }
  };

  syncSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Jaha2045 onAuthStateChange:", event, session);

    if (!mounted) return;

    if (session?.user) {
      onLogin(session.user);
      navigate("/app", { replace: true });
      return;
    }

    if (event === "SIGNED_OUT") {
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!mounted) return;

    if (data?.session?.user) {
      onLogin(data.session.user);
      navigate("/app", { replace: true });
    }
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, [navigate, onLogin]);

  const handleChange = (field, value) => {
    if (field === "email") {
      value = value.trim().toLowerCase();
    }

    setFormUser((prev) => ({
  ...prev,
  [field]: value,
}));
  };

  const resetPasswordVisibility = () => setShowPassword(false);

 const handleRegister = async (e) => {
  e.preventDefault();

  if (
    !formUser.nombre.trim() ||
    !formUser.apellido.trim() ||
    !formUser.email.trim() ||
    !formUser.password.trim()
  ) {
    alert("Completá todos los campos");
    return;
  }

  if (formUser.password.trim().length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  setAuthLoading(true);

  try {
    const cleanNombre = formUser.nombre.trim();
    const cleanApellido = formUser.apellido.trim();
    const cleanEmail = formUser.email.trim().toLowerCase();
    const cleanPassword = formUser.password.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPassword,
      options: {
        data: {
          name: cleanNombre,
          apellido: cleanApellido,
          full_name: `${cleanNombre} ${cleanApellido}`.trim(),
          role: "normal",
        },
      },
    });

    console.log("REGISTER DATA:", data);
    console.log("REGISTER ERROR:", error);

    if (error) {
      alert(error.message || "No se pudo crear la cuenta");
      return;
    }

    if (data?.session?.user) {
      onLogin(data.session.user);
      navigate("/app", { replace: true });
      return;
    }

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

    console.log("REGISTER LOGIN DATA:", loginData);
    console.log("REGISTER LOGIN ERROR:", loginError);

    if (loginError) {
      alert(
        loginError.message || "Cuenta creada, pero no se pudo iniciar sesión"
      );
      return;
    }

    if (loginData?.user) {
      onLogin(loginData.user);

      const { data: sessionData } = await supabase.auth.getSession();
      console.log("REGISTER SESSION AFTER LOGIN:", sessionData);

      navigate("/app", { replace: true });
      return;
    }

    alert("Cuenta creada, pero no se pudo recuperar la sesión.");
  } catch (err) {
    console.error("REGISTER CATCH:", err);
    alert("No se pudo crear la cuenta");
  } finally {
    setAuthLoading(false);
  }
};

 const handleLogin = async (e) => {
  e.preventDefault();

  if (!formUser.email.trim() || !formUser.password.trim()) {
    alert("Completá correo y contraseña");
    return;
  }

  setAuthLoading(true);

  try {
    const cleanEmail = formUser.email.trim().toLowerCase();
    const cleanPassword = formUser.password.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    console.log("LOGIN DATA:", data);
    console.log("LOGIN ERROR:", error);

    if (error) {
      alert("Correo o contraseña incorrectos");
      return;
    }

    if (data?.user) {
      onLogin(data.user);

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      console.log("LOGIN SESSION CHECK:", sessionData, sessionError);

      navigate("/app", { replace: true });
      return;
    }

    alert("No se pudo recuperar la sesión.");
  } catch (err) {
    console.error("LOGIN CATCH:", err);
    alert("Error al iniciar sesión");
  } finally {
    setAuthLoading(false);
  }
};

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-black text-white">
        <GlobalStyles />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,70,70,0.18),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(255,0,0,0.12),transparent_25%),linear-gradient(180deg,#020202_0%,#0b0000_40%,#000000_100%)]" />

        <div className="absolute inset-0 opacity-[0.18] mix-blend-screen">
          <img
            src={mapaBase}
            alt="Mapa"
            className="absolute left-1/2 top-1/2 w-[540px] sm:w-[760px] -translate-x-1/2 -translate-y-1/2 object-contain pulse-map"
          />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full bg-red-400/70 particle-float"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
                boxShadow: "0 0 14px rgba(255,60,60,0.75)",
              }}
            />
          ))}
        </div>

        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] sm:h-[460px] sm:w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/20">
          <div className="absolute inset-0 rounded-full border border-red-400/20 hud-spin-slow" />
          <div className="absolute inset-[16px] rounded-full border border-red-500/25 hud-spin-reverse" />
          <div className="absolute inset-[34px] rounded-full border border-white/10" />
          <div className="absolute inset-[56px] rounded-full border border-red-500/15 pulse-ring" />
          <div className="absolute left-1/2 top-1/2 h-[2px] w-[48%] origin-left -translate-y-1/2 bg-gradient-to-r from-red-500/0 via-red-400 to-red-200 radar-sweep" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-red-600/20 blur-3xl" />
            <img
              src={logoJaha}
              alt="Logo JAHA"
              className="relative w-[220px] sm:w-[290px] drop-shadow-[0_0_28px_rgba(255,50,50,0.45)] logo-hover"
            />
          </div>

          <div className="relative mb-5">
            <p className="text-[13px] uppercase tracking-[0.55em] text-red-300/85">
              Ciudad Inteligente
            </p>
            <h1 className="mt-3 text-6xl sm:text-7xl font-black tracking-[0.2em] text-white text-glow">
              {year}
            </h1>
            <p className="mt-3 text-[11px] sm:text-xs uppercase tracking-[0.38em] text-white/60">
              Núcleo urbano tecnológico del Paraguay
            </p>
          </div>

          <div className="mb-6 w-full max-w-lg rounded-[24px] border border-red-500/20 bg-white/[0.03] px-4 py-4 backdrop-blur-xl shadow-[0_0_40px_rgba(255,0,0,0.08)]">
            <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-red-300/75">
              <span>Sistema operativo</span>
              <span>JAHA CORE</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full border border-red-500/20 bg-white/5">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#3f0000_0%,#ff2d2d_45%,#ffd0d0_100%)] shadow-[0_0_18px_rgba(255,50,50,0.45)] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-white/65">
              <span className="font-mono tracking-[0.18em]">{bootText}</span>
              <span className="font-mono tracking-[0.18em]">{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <GlobalStyles />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,55,55,0.18),transparent_20%),radial-gradient(circle_at_80%_10%,rgba(255,0,0,0.12),transparent_25%),linear-gradient(180deg,#020202_0%,#0a0000_35%,#000000_100%)]" />
      <div className="absolute inset-0 opacity-[0.09] mix-blend-screen">
        <img
          src={mapaBase}
          alt="Mapa base"
          className="absolute left-1/2 top-1/2 w-[760px] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain pulse-map"
        />
      </div>

      <div className="absolute inset-0 grid-overlay pointer-events-none" />
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />

      <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-red-500/12 blur-3xl" />
      <div className="absolute bottom-[-120px] left-1/2 h-[320px] w-[720px] -translate-x-1/2 rounded-full bg-red-700/12 blur-3xl" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-red-400/70 particle-float"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: `${5 + (p.id % 5)}s`,
              boxShadow: "0 0 12px rgba(255,60,60,0.75)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div
          className={`w-full max-w-6xl transition-all duration-700 ${
            hudReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="mb-6 flex flex-col items-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute h-[220px] w-[220px] rounded-full border border-red-500/20 hud-spin-slow" />
              <div className="absolute h-[180px] w-[180px] rounded-full border border-red-500/15 hud-spin-reverse" />
              <div className="absolute h-[250px] w-[250px] rounded-full bg-red-500/10 blur-3xl" />
              <img
                src={logoJaha}
                alt="Logo JAHA"
                className="relative z-10 w-[175px] sm:w-[215px] drop-shadow-[0_0_24px_rgba(255,40,40,0.35)] logo-hover"
              />
            </div>

            <div className="mt-5 rounded-full border border-red-500/20 bg-black/45 px-4 py-2 backdrop-blur-md">
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-red-300/85 text-center">
                JAHA 2041 · Interfaz urbana avanzada
              </p>
            </div>

            <h1 className="mt-6 text-center text-3xl sm:text-5xl font-black leading-tight">
              La ciudad más tecnológica
              <span className="block text-red-400 text-glow">del Paraguay</span>
            </h1>

            <p className="mt-4 max-w-2xl text-center text-sm sm:text-base text-white/65">
              Una interfaz pensada para transmitir futuro, control, seguridad y
              visión de ciudad inteligente.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="relative overflow-hidden rounded-[34px] border border-red-500/20 bg-white/[0.04] p-5 sm:p-7 backdrop-blur-2xl shadow-[0_0_60px_rgba(255,0,0,0.08)]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_42%,rgba(255,0,0,0.06))]" />
              <div className="absolute right-[-40px] top-[-40px] h-36 w-36 rounded-full border border-red-500/10" />
              <div className="absolute right-[-70px] top-[-70px] h-52 w-52 rounded-full border border-red-500/10" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.34em] text-red-300/75">
                    Centro de control
                  </p>
                  <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white">
                    {mode === "login" ? "Acceso Ciudadano" : "Crear Cuenta"}
                  </h2>
                </div>

                <div className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-red-200/85">
                  Secure ID
                </div>
              </div>

              <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoChip label="Estado" value="Online" />
                <InfoChip label="Seguridad" value="Nivel alto" />
                <InfoChip label="Nodo" value="Minga Guazú" />
              </div>

              <div className="relative z-10 mt-6 flex gap-2 rounded-2xl border border-red-500/15 bg-black/35 p-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    resetPasswordVisibility();
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    mode === "login"
                      ? "bg-red-500 text-white shadow-[0_0_18px_rgba(255,0,0,0.25)]"
                      : "bg-transparent text-white/65"
                  }`}
                >
                  Iniciar sesión
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    resetPasswordVisibility();
                  }}
                  className={`flex-1 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    mode === "register"
                      ? "bg-red-500 text-white shadow-[0_0_18px_rgba(255,0,0,0.25)]"
                      : "bg-transparent text-white/65"
                  }`}
                >
                  Registrarse
                </button>
              </div>

              <form
                onSubmit={mode === "login" ? handleLogin : handleRegister}
                className="relative z-10 mt-6"
              >
                {mode === "register" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field
                      label="Nombre"
                      placeholder="Tu nombre"
                      value={formUser.nombre}
                      onChange={(e) => handleChange("nombre", e.target.value)}
                    />
                    <Field
                      label="Apellido"
                      placeholder="Tu apellido"
                      value={formUser.apellido}
                      onChange={(e) => handleChange("apellido", e.target.value)}
                    />
                  </div>
                )}

                <div className={mode === "register" ? "mt-3" : ""}>
  <Field
    label="Correo Gmail"
    placeholder="tucorreo@gmail.com"
    type="email"
    autoComplete={mode === "login" ? "email" : "username"}
    value={formUser.email}
    onChange={(e) => handleChange("email", e.target.value)}
  />
</div>

<div className="mt-3">
  <Field
    label="Contraseña"
    placeholder="Ingresá tu contraseña"
    type={showPassword ? "text" : "password"}
    autoComplete={mode === "login" ? "current-password" : "new-password"}
    value={formUser.password}
    onChange={(e) => handleChange("password", e.target.value)}
  />
</div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-white/45">
                    {mode === "login"
                      ? "Ingresá con tu correo y tu contraseña."
                      : "Creá tu cuenta con Gmail y contraseña, sin confirmación."}
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 rounded-xl border border-red-500/20 bg-black/35 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 transition hover:text-white"
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="group relative overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#6d0000_0%,#ff2a2a_52%,#ffc7c7_100%)] px-5 py-4 text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_0_24px_rgba(255,40,40,0.35)] transition duration-300 hover:scale-[1.015] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100"
                  >
                    <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.26),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
                    <span className="relative z-10">
                      {authLoading
                        ? "Procesando..."
                        : mode === "login"
                        ? "Entrar al sistema"
                        : "Crear cuenta"}
                    </span>
                  </button>

                  <div className="rounded-2xl border border-red-500/15 bg-black/45 px-4 py-3 backdrop-blur-md">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-red-300/70">
                      Interfaz
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white/85">
                      Tecnológica
                    </p>
                  </div>
                </div>
              </form>

              <div className="relative z-10 mt-5 border-t border-white/10 pt-4">
                <p className="text-center text-[11px] uppercase tracking-[0.18em] text-white/45">
                  Clara · potente · futurista · ciudadana
                </p>
              </div>
            </section>

            <aside className="grid grid-cols-1 gap-6">
              <div className="relative overflow-hidden rounded-[30px] border border-red-500/20 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,0,0,0.06)]">
                <div className="absolute right-[-20px] top-[-20px] h-28 w-28 rounded-full border border-red-500/10 hud-spin-slow" />
                <p className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">
                  Proyección 2041
                </p>
                <h3 className="mt-3 text-2xl font-black text-white">
                  Visión de ciudad inteligente
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Un acceso con identidad visual fuerte, lenguaje tecnológico y
                  presencia futurista para transmitir innovación real.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MetricCard title="Infraestructura" value="98%" />
                  <MetricCard title="Conectividad" value="24/7" />
                  <MetricCard title="Respuesta" value="< 1s" />
                  <MetricCard title="Control" value="Total" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[30px] border border-red-500/20 bg-black/45 p-5 backdrop-blur-2xl shadow-[0_0_40px_rgba(255,0,0,0.06)]">
                <p className="text-[10px] uppercase tracking-[0.34em] text-red-300/70">
                  Mensaje visual
                </p>

                <div className="mt-4 space-y-3">
                  <HudLine text="FUTURO URBANO" />
                  <HudLine text="TECNOLOGÍA CÍVICA" />
                  <HudLine text="SEGURIDAD DIGITAL" />
                  <HudLine text="IDENTIDAD Y CONTROL" />
                </div>

                <div className="mt-6 rounded-2xl border border-red-500/15 bg-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-red-400">
                    Programa de Innovación Ciudadana
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    Rodrigo Ríos 2026
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

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
        className="w-full rounded-2xl border border-red-900/70 bg-black/60 p-3.5 text-white outline-none transition placeholder:text-white/28 focus:border-red-500 focus:shadow-[0_0_15px_rgba(255,0,0,0.18)]"
        value={value}
        onChange={onChange}
        autoComplete={
          autoComplete ||
          (type === "email"
            ? "email"
            : type === "password"
            ? "current-password"
            : "off")
        }
      />
    </div>
  );
}

function InfoChip({ label, value }) {
  return (
    <div className="rounded-2xl border border-red-500/15 bg-black/35 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.24em] text-red-300/68">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-white/90">{value}</p>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-red-500/15 bg-white/[0.03] px-4 py-4">
      <p className="text-[10px] uppercase tracking-[0.24em] text-red-300/68">
        {title}
      </p>
      <p className="mt-2 text-lg font-black text-white">{value}</p>
    </div>
  );
}

function HudLine({ text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-red-500/15 bg-white/[0.03] px-4 py-3">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(255,50,50,0.9)]" />
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
          0 0 8px rgba(255,60,60,0.35),
          0 0 18px rgba(255,60,60,0.22);
      }

      .logo-hover {
        animation: logoFloat 4.5s ease-in-out infinite;
      }

      .pulse-map {
        animation: pulseMap 6s ease-in-out infinite;
      }

      .pulse-ring {
        animation: pulseRing 2.6s ease-in-out infinite;
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

      .radar-sweep {
        animation: radarSweep 2.8s linear infinite;
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

      @keyframes radarSweep {
        0% { transform: rotate(0deg); opacity: 0.35; }
        50% { opacity: 1; }
        100% { transform: rotate(360deg); opacity: 0.35; }
      }

      @keyframes pulseRing {
        0%, 100% {
          transform: scale(1);
          opacity: 0.35;
        }
        50% {
          transform: scale(1.03);
          opacity: 0.85;
        }
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

      @keyframes pulseMap {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0.10;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.045);
          opacity: 0.17;
        }
      }
    `}</style>
  );
}