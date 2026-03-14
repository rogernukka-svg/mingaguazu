import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logoJaha from "./assets/logojahabicolor.png";

/* =====================================================
   CENTRO REAL – MINGA GUAZÚ
===================================================== */
const MINGA_GUAZU_CENTER = [-25.4968706, -54.8418689];

/* =====================================================
   PROYECTOS – ACTUALIZADOS EN MINGA GUAZÚ
===================================================== */
const PROJECTS = [
  {
    id: 1,
    name: "Transparencia - rendición de cuentas en tiempo real",
    area: "Dirección de Finanzas",
    progress: 85,
    lat: -25.4978,
    lng: -54.8442,
    radius: 1400,
    description:
      "Sistema de seguimiento financiero con datos públicos y control ciudadano en tiempo real.",
  },
  {
    id: 2,
    name: "Guardería Municipal - Presentación",
    area: "Dirección de Obras",
    progress: 55,
    lat: -25.4939,
    lng: -54.8386,
    radius: 1800,
    description:
      "Proyecto de infraestructura social enfocado en atención infantil y fortalecimiento comunitario.",
  },
  {
    id: 3,
    name: "Iluminaciones de espacio público",
    area: "Seguridad",
    progress: 25,
    lat: -25.5008,
    lng: -54.8483,
    radius: 1300,
    description:
      "Mejora del alumbrado urbano para seguridad, movilidad y recuperación de espacios públicos.",
  },
];

/* =====================================================
   PUNTOS ESTRATÉGICOS – ACTUALIZADOS EN MINGA GUAZÚ
===================================================== */
const MAP_POINTS = [
  {
    id: "seg",
    type: "Seguridad",
    name: "Base Operativa de Seguridad Urbana",
    lat: -25.4952,
    lng: -54.8424,
    radius: 1600,
    color: "#2563eb",
  },
  {
    id: "traf",
    type: "Tránsito",
    name: "Nodo de Tránsito Inteligente",
    lat: -25.4917,
    lng: -54.8401,
    radius: 1400,
    color: "#f59e0b",
  },
  {
    id: "sal",
    type: "Salud",
    name: "Unidad de Atención Barrial",
    lat: -25.4989,
    lng: -54.8397,
    radius: 1350,
    color: "#16a34a",
  },
  {
    id: "edu",
    type: "Educación",
    name: "Complejo Educativo Público",
    lat: -25.4947,
    lng: -54.8468,
    radius: 1450,
    color: "#9333ea",
  },
];

/* =====================================================
   SEMÁFORO
===================================================== */
function getSemaphore(progress) {
  if (progress >= 80) return "green";
  if (progress >= 40) return "yellow";
  return "red";
}

function getProgressColor(progress) {
  if (progress >= 80) return "#22c55e";
  if (progress >= 40) return "#facc15";
  return "#ef4444";
}

function getProgressLabel(progress) {
  if (progress >= 80) return "Avance sólido";
  if (progress >= 40) return "En desarrollo";
  return "Requiere atención";
}

function createProjectIcon(progress) {
  const color =
    progress >= 80 ? "#22c55e" : progress >= 40 ? "#facc15" : "#ef4444";

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 999px;
        background: ${color};
        border: 3px solid #ffffff;
        box-shadow: 0 0 18px ${color};
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

function createStrategicIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: ${color};
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px ${color};
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function HeaderButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-red-500 text-white shadow-[0_0_18px_rgba(255,0,0,0.35)]"
          : "bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value, subtitle, color = "red" }) {
  const glow =
    color === "green"
      ? "shadow-[0_0_24px_rgba(34,197,94,0.18)]"
      : color === "yellow"
      ? "shadow-[0_0_24px_rgba(250,204,21,0.18)]"
      : "shadow-[0_0_24px_rgba(255,0,0,0.14)]";

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4 ${glow}`}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">
        {title}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-white/50">{subtitle}</p>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("mapa");
  const [activeProject, setActiveProject] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("jaha_user");
    window.location.href = "/";
  };

  const totalProjects = PROJECTS.length;
  const completedProjects = PROJECTS.filter((p) => p.progress >= 80).length;
  const avgProgress = Math.round(
    PROJECTS.reduce((acc, p) => acc + p.progress, 0) / PROJECTS.length
  );

  const selectedProject = useMemo(
    () => PROJECTS.find((p) => p.id === activeProject) || null,
    [activeProject]
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,40,40,0.16),transparent_22%),radial-gradient(circle_at_bottom,rgba(255,40,40,0.10),transparent_18%),linear-gradient(to_bottom,#050505,#0b0000,#000000)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* ================= HEADER ================= */}
      <header className="relative z-[1001] border-b border-red-900/40 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-red-500/20 bg-white/[0.04] p-2 shadow-[0_0_20px_rgba(255,0,0,0.12)]">
              <img
                src={logoJaha}
                alt="JAHA 2041"
                className="w-14 h-14 object-contain"
              />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-[0.18em] text-white">
                JAHA <span className="text-red-400">2041</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/55 uppercase tracking-[0.18em]">
                Plataforma urbana inteligente · Minga Guazú
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <nav className="flex flex-wrap gap-2">
              <HeaderButton
                active={view === "mapa"}
                onClick={() => setView("mapa")}
              >
                Mapa
              </HeaderButton>
              <HeaderButton
                active={view === "proyectos"}
                onClick={() => setView("proyectos")}
              >
                Proyectos
              </HeaderButton>
              <HeaderButton
                active={view === "participar"}
                onClick={() => setView("participar")}
              >
                Participar
              </HeaderButton>
              <HeaderButton
                active={view === "seguimiento"}
                onClick={() => setView("seguimiento")}
              >
                Seguimiento
              </HeaderButton>
              <HeaderButton
                active={view === "perfil"}
                onClick={() => setView("perfil")}
              >
                Perfil
              </HeaderButton>
            </nav>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-bold bg-white/5 text-white border border-red-500/30 hover:bg-red-600 hover:border-red-500 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* ================= DASH TOP ================= */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Proyectos activos"
            value={totalProjects}
            subtitle="Frentes estratégicos cargados"
          />
          <StatCard
            title="Promedio general"
            value={`${avgProgress}%`}
            subtitle="Nivel de ejecución del plan"
            color="yellow"
          />
          <StatCard
            title="Avance sólido"
            value={completedProjects}
            subtitle="Proyectos con semáforo verde"
            color="green"
          />
        </div>
      </section>

      {/* ================= CONTENIDO ================= */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-6">
        {/* ================= MAPA ================= */}
        {view === "mapa" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
            <div className="relative overflow-hidden rounded-3xl border border-red-900/30 bg-white/[0.03] backdrop-blur-md shadow-[0_0_40px_rgba(255,0,0,0.10)]">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-[0.08em]">
                    Centro Urbano Inteligente
                  </h2>
                  <p className="text-sm text-white/55">
                    Visualización geográfica de proyectos y puntos estratégicos
                  </p>
                </div>

                <button
                  onClick={() => setView("proyectos")}
                  className="hidden sm:inline-flex bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(255,0,0,0.35)] transition"
                >
                  Ver proyectos
                </button>
              </div>

              <div className="h-[72vh] min-h-[520px] relative">
                <MapContainer
                  center={MINGA_GUAZU_CENTER}
                  zoom={13}
                  maxBounds={[
                    [-25.56, -54.93],
                    [-25.44, -54.76],
                  ]}
                  maxBoundsViscosity={1.0}
                  className="h-full w-full z-0"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap & Carto"
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />

                  {PROJECTS.map((p) => {
                    const s = getSemaphore(p.progress);
                    const color =
                      s === "green"
                        ? "#22c55e"
                        : s === "yellow"
                        ? "#facc15"
                        : "#ef4444";

                    const isActive = activeProject === p.id;

                    return (
                      <React.Fragment key={p.id}>
                        {isActive && (
                          <Circle
                            center={[p.lat, p.lng]}
                            radius={p.radius}
                            pathOptions={{
                              color,
                              fillColor: color,
                              fillOpacity: 0.18,
                              weight: 2,
                            }}
                          />
                        )}

                        <Marker
                          position={[p.lat, p.lng]}
                          icon={createProjectIcon(p.progress)}
                          eventHandlers={{
                            click: () => setActiveProject(p.id),
                          }}
                        >
                          <Popup className="jaha-popup">
                            <div className="text-black min-w-[220px]">
                              <div className="font-extrabold text-sm">
                                {p.name}
                              </div>
                              <div className="mt-1 text-xs text-neutral-700">
                                Área: {p.area}
                              </div>
                              <div className="mt-2 text-sm">
                                Avance: <b>{p.progress}%</b>
                              </div>
                              <div className="mt-1 text-xs text-neutral-600">
                                {getProgressLabel(p.progress)}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  })}

                  {!activeProject &&
                    MAP_POINTS.map((p) => (
                      <React.Fragment key={p.id}>
                        <Circle
                          center={[p.lat, p.lng]}
                          radius={p.radius}
                          pathOptions={{
                            color: p.color,
                            fillColor: p.color,
                            fillOpacity: 0.10,
                            weight: 1.5,
                          }}
                        />
                        <Marker
                          position={[p.lat, p.lng]}
                          icon={createStrategicIcon(p.color)}
                        >
                          <Popup className="jaha-popup">
                            <div className="text-black min-w-[210px]">
                              <div className="font-extrabold text-sm">
                                {p.name}
                              </div>
                              <div className="mt-1 text-xs text-neutral-700">
                                Tipo: {p.type}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    ))}
                </MapContainer>

                <button
                  onClick={() => setView("proyectos")}
                  className="sm:hidden absolute bottom-4 right-4 z-[1000] bg-red-600 text-white px-5 py-3 rounded-full font-bold shadow-[0_0_25px_rgba(255,0,0,0.45)]"
                >
                  Ver proyectos
                </button>
              </div>
            </div>

            {/* Panel lateral */}
            <aside className="rounded-3xl border border-red-900/30 bg-white/[0.04] backdrop-blur-md p-5 shadow-[0_0_30px_rgba(255,0,0,0.10)]">
              <div className="flex items-center gap-3">
                <img
                  src={logoJaha}
                  alt="JAHA"
                  className="w-12 h-12 object-contain rounded-xl"
                />
                <div>
                  <h3 className="text-lg font-extrabold tracking-[0.08em]">
                    Panel rápido
                  </h3>
                  <p className="text-xs text-white/50 uppercase tracking-[0.16em]">
                    Acceso visual
                  </p>
                </div>
              </div>

              {!selectedProject ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-red-300/70">
                      Cómo usar
                    </p>
                    <p className="mt-2 text-white/80 text-sm leading-relaxed">
                      Tocá un punto del mapa para ver el proyecto. Si querés más
                      detalle, entrá a la sección <b>Proyectos</b>.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm font-bold text-white mb-3">
                      Referencias
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                        <span className="text-white/75">
                          Verde · avance sólido
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                        <span className="text-white/75">
                          Amarillo · en desarrollo
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                        <span className="text-white/75">
                          Rojo · requiere atención
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm font-bold text-white">
                      Lectura rápida
                    </p>
                    <p className="mt-2 text-sm text-white/65 leading-relaxed">
                      Este panel fue pensado para que cualquier persona pueda
                      entender el estado de los proyectos sin complicaciones.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-red-300/70">
                      Proyecto seleccionado
                    </p>

                    <h4 className="mt-2 text-lg font-extrabold text-white">
                      {selectedProject.name}
                    </h4>

                    <p className="mt-2 text-sm text-white/65 leading-relaxed">
                      {selectedProject.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-white/70">Área</span>
                      <span className="text-sm font-bold text-white">
                        {selectedProject.area}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-white/70">Avance</span>
                      <span
                        className="text-sm font-extrabold"
                        style={{
                          color: getProgressColor(selectedProject.progress),
                        }}
                      >
                        {selectedProject.progress}%
                      </span>
                    </div>

                    <div className="mt-4 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${selectedProject.progress}%`,
                          background: getProgressColor(selectedProject.progress),
                          boxShadow: `0 0 18px ${getProgressColor(
                            selectedProject.progress
                          )}`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/55">
                      {getProgressLabel(selectedProject.progress)}
                    </p>

                    <button
                      onClick={() => setActiveProject(null)}
                      className="mt-5 w-full rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 py-2.5 font-bold text-white transition"
                    >
                      Limpiar selección
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ================= PROYECTOS ================= */}
        {view === "proyectos" && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-red-900/30 bg-white/[0.04] backdrop-blur-md p-5 sm:p-6 shadow-[0_0_35px_rgba(255,0,0,0.10)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-[0.08em]">
                    Proyectos Estratégicos
                  </h2>
                  <p className="text-white/55 text-sm mt-1">
                    Plan de Desarrollo Municipal · Horizonte 2041
                  </p>
                </div>

                <button
                  onClick={() => setView("mapa")}
                  className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-full font-bold shadow-[0_0_20px_rgba(255,0,0,0.35)] transition"
                >
                  Volver al mapa
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {PROJECTS.map((p) => {
                const s = getSemaphore(p.progress);
                const barColor =
                  s === "green"
                    ? "#22c55e"
                    : s === "yellow"
                    ? "#facc15"
                    : "#ef4444";

                return (
                  <div
                    key={p.id}
                    className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 shadow-[0_0_26px_rgba(255,0,0,0.08)] hover:translate-y-[-2px] transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">
                          {p.name}
                        </h3>
                        <p className="text-sm text-white/50 mt-1">{p.area}</p>
                      </div>

                      <span
                        className={`w-4 h-4 rounded-full shrink-0 ${
                          s === "green"
                            ? "bg-green-500"
                            : s === "yellow"
                            ? "bg-yellow-400"
                            : "bg-red-500"
                        }`}
                        style={{ boxShadow: `0 0 14px ${barColor}` }}
                      />
                    </div>

                    <p className="mt-4 text-sm text-white/65 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm text-white/65">
                        Avance actual
                      </span>
                      <span
                        className="font-extrabold"
                        style={{ color: barColor }}
                      >
                        {p.progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${p.progress}%`,
                          background: barColor,
                          boxShadow: `0 0 18px ${barColor}`,
                        }}
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setActiveProject(p.id);
                          setView("mapa");
                        }}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition"
                      >
                        Ver en mapa
                      </button>

                      <button className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition">
                        Ver detalle
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PARTICIPAR ================= */}
        {view === "participar" && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-red-900/30 bg-white/[0.04] backdrop-blur-md p-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-[0.08em]">
                Participación Ciudadana
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Módulos simples para conectar a la ciudadanía con el desarrollo
                territorial.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  emoji: "📊",
                  title: "Encuestas por barrio",
                  text: "Relevamiento simple para conocer necesidades y prioridades de cada zona.",
                },
                {
                  emoji: "🚧",
                  title: "Reportes urbanos",
                  text: "Carga de problemas o necesidades sobre obras, servicios y espacios públicos.",
                },
                {
                  emoji: "💡",
                  title: "Información clara",
                  text: "Seguimiento de avances con una experiencia fácil de entender.",
                },
                {
                  emoji: "🗳️",
                  title: "Proyectos participativos",
                  text: "Espacio para acompañar decisiones y propuestas comunitarias.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 shadow-[0_0_26px_rgba(255,0,0,0.07)]"
                >
                  <div className="text-3xl">{item.emoji}</div>
                  <h3 className="mt-4 text-lg font-extrabold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/65 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= SEGUIMIENTO ================= */}
        {view === "seguimiento" && (
          <div className="space-y-5">
            <div className="rounded-3xl border border-red-900/30 bg-white/[0.04] backdrop-blur-md p-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-[0.08em]">
                Seguimiento del Plan Minga Guazú 2041
              </h2>
              <p className="mt-2 text-sm text-white/55">
                Sistema visual de monitoreo por ejes estratégicos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { area: "Salud", color: "bg-yellow-400" },
                { area: "Educación", color: "bg-yellow-400" },
                { area: "Seguridad", color: "bg-green-500" },
                { area: "Infraestructura", color: "bg-red-500" },
                { area: "Agricultura", color: "bg-yellow-400" },
                { area: "Tecnología y transparencia", color: "bg-green-500" },
              ].map((a) => (
                <div
                  key={a.area}
                  className="flex justify-between items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-4"
                >
                  <span className="font-semibold text-white">{a.area}</span>
                  <span className={`w-4 h-4 rounded-full ${a.color}`} />
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-sm text-white/65 leading-relaxed">
                Sistema de semáforo ciudadano:
                <span className="text-green-400 font-semibold"> verde</span>{" "}
                significa que avanza bien,
                <span className="text-yellow-300 font-semibold"> amarillo</span>{" "}
                indica atención,
                <span className="text-red-400 font-semibold"> rojo</span>{" "}
                señala prioridad o retraso.
              </p>
            </div>
          </div>
        )}

        {/* ================= PERFIL ================= */}
        {view === "perfil" && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 shadow-[0_0_28px_rgba(255,0,0,0.08)]">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-2xl border border-red-500/20 bg-black/30 p-3">
                  <img
                    src={logoJaha}
                    alt="JAHA"
                    className="w-24 h-24 object-contain"
                  />
                </div>

                <h2 className="mt-4 text-xl font-extrabold tracking-[0.08em]">
                  Perfil Ciudadano
                </h2>
                <p className="mt-2 text-sm text-white/55">
                  Acceso simple a información pública y monitoreo territorial.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-6 shadow-[0_0_28px_rgba(255,0,0,0.08)]">
              <h3 className="text-lg font-extrabold text-white">
                Sobre la plataforma
              </h3>

              <p className="mt-3 text-white/65 leading-relaxed">
                JAHA 2041 es una plataforma orientada al seguimiento del Plan de
                Desarrollo Sostenible de Minga Guazú, con foco en transparencia,
                participación y lectura territorial.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Acceso a información pública",
                  "Monitoreo de proyectos y obras",
                  "Participación activa ciudadana",
                  "Modo simple y fácil de usar",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/75"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}