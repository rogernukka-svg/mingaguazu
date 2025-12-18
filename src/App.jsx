import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

/* =====================================================
   CENTRO URBANO – MINGA GUAZÚ
   ===================================================== */
const MINGA_GUAZU_CENTER = [-25.5160, -54.6450];

/* =====================================================
   PROYECTOS – NO SE TOCAN (MAPA)
   ===================================================== */
const PROJECTS = [
  {
    id: 1,
    name: "Transparencia- rendición de cuentas en tiempo real",
    area: "DIRECCION DE FINANZAS",
    progress: 85,
    lat: -25.5172,
    lng: -54.6468,
    radius: 700,
  },
  {
    id: 2,
    name: "Guardería Municipal - PRESENTACION",
    area: "DIRECCION DE OBRAS",
    progress: 55,
    lat: -25.5149,
    lng: -54.6429,
    radius: 900,
  },
  {
    id: 3,
    name: "iluminaciones de espacio publico",
    area: "SEGURIDAD",
    progress: 25,
    lat: -25.5186,
    lng: -54.6479,
    radius: 650,
  },
];

/* =====================================================
   PUNTOS ESTRATÉGICOS – MAPA (NO TOCAR)
   ===================================================== */
const MAP_POINTS = [
  {
    id: "seg",
    type: "Seguridad",
    name: "Base Operativa de Seguridad Urbana",
    lat: -25.5158,
    lng: -54.6495,
    radius: 1000,
    color: "#2563eb",
  },
  {
    id: "traf",
    type: "Tránsito",
    name: "Nodo de Tránsito Inteligente",
    lat: -25.5166,
    lng: -54.6438,
    radius: 800,
    color: "#f59e0b",
  },
  {
    id: "sal",
    type: "Salud",
    name: "Unidad de Atención Barrial",
    lat: -25.5191,
    lng: -54.6462,
    radius: 750,
    color: "#16a34a",
  },
  {
    id: "edu",
    type: "Educación",
    name: "Complejo Educativo Público",
    lat: -25.5144,
    lng: -54.6441,
    radius: 850,
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

export default function App() {
  const [view, setView] = useState("mapa");
  const [activeProject, setActiveProject] = useState(null);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-red-800">
        <div className="flex items-center gap-2">
          <span className="text-red-500 font-extrabold text-xl">JAHA</span>
          <span className="text-gray-400 text-sm">2041</span>
        </div>

        <nav className="flex gap-6 text-sm">
          {["mapa", "proyectos", "participar", "seguimiento", "perfil"].map(
            (v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={view === v ? "text-red-400" : ""}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            )
          )}
        </nav>
      </header>

      {/* ================= CONTENIDO ================= */}
      <main className="flex-1 relative">
        {/* ================= MAPA ================= */}
        {view === "mapa" && (
          <div className="h-[calc(100vh-72px)] relative">
            <MapContainer
              center={MINGA_GUAZU_CENTER}
              zoom={15}
              maxBounds={[
                [-25.55, -54.67],
                [-25.48, -54.62],
              ]}
              maxBoundsViscosity={1.0}
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap & Carto"
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              {PROJECTS.map((p) => {
  const s = getSemaphore(p.progress);
  const color =
    s === "green"
      ? "#16a34a"
      : s === "yellow"
      ? "#f59e0b"
      : "#dc2626";

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
            fillOpacity: 0.25,
          }}
        />
      )}

      <Marker
        position={[p.lat, p.lng]}
        eventHandlers={{
          click: () => setActiveProject(p.id),
        }}
      >
        <Popup>
          <div className="text-black">
            <b>{p.name}</b>
            <br />
            Área: {p.area}
            <br />
            Avance: {p.progress}%
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
          fillOpacity: 0.15,
        }}
      />
      <Marker position={[p.lat, p.lng]}>
        <Popup>
          <div className="text-black">
            <b>{p.name}</b>
            <br />
            Tipo: {p.type}
          </div>
        </Popup>
      </Marker>
    </React.Fragment>
  ))}

            </MapContainer>

            <button
              onClick={() => setView("proyectos")}
              className="absolute bottom-6 right-6 z-[1000]
                         bg-red-600 text-black px-6 py-3 rounded-full
                         font-bold shadow-[0_0_30px_rgba(255,0,0,0.7)]"
            >
              Explorar proyectos
            </button>
          </div>
        )}

        {/* ================= PROYECTOS ================= */}
        {view === "proyectos" && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl text-red-400">
              Proyectos Estratégicos – Minga Guazú 2041
            </h2>

            {PROJECTS.map((p) => {
              const s = getSemaphore(p.progress);
              return (
                <div
                  key={p.id}
                  className="bg-neutral-900 border border-red-800 rounded-xl p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <b>{p.name}</b>
                      <p className="text-sm text-gray-400">{p.area}</p>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-full ${
                        s === "green"
                          ? "bg-green-500"
                          : s === "yellow"
                          ? "bg-yellow-400"
                          : "bg-red-500"
                      }`}
                    />
                  </div>

                  <div className="mt-2 text-sm">
                    Avance actual: <b>{p.progress}%</b>
                  </div>

                  <div className="mt-1 text-xs text-gray-500">
                    Plan de Desarrollo Municipal – Horizonte 2041
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= PARTICIPAR ================= */}
        {view === "participar" && (
          <div className="p-6 space-y-4">
            <h2 className="text-xl text-red-400">
              Participación Ciudadana
            </h2>

            <div className="bg-neutral-900 border border-red-800 rounded-xl p-4">
              📊 Encuestas geolocalizadas por barrio
            </div>
            <div className="bg-neutral-900 border border-red-800 rounded-xl p-4">
              🚧 Reportar proyectos y necesidades 
            </div>
            <div className="bg-neutral-900 border border-red-800 rounded-xl p-4">
              💡 Acompañamiento de obras e informacion actualizada 
            </div>
            <div className="bg-neutral-900 border border-red-800 rounded-xl p-4">
              🗳️ Proyecto participativos 
            </div>
          </div>
        )}

        {/* ================= SEGUIMIENTO ================= */}
        {view === "seguimiento" && (
          <div className="p-6 space-y-3">
            <h2 className="text-xl text-red-400">
              Seguimiento del Plan Minga Guazú 2041
            </h2>

            {[
              "Salud",
              "Educación",
              "Seguridad",
              "Infraestructura",
              "Agricultura",
              "Tecnología y transparencia",
            ].map((a) => (
              <div
                key={a}
                className="flex justify-between items-center bg-neutral-900 border border-red-800 rounded-xl p-4"
              >
                <span>{a}</span>
                <span className="w-4 h-4 rounded-full bg-yellow-400" />
              </div>
            ))}

            <p className="text-xs text-gray-500">
              Sistema de semáforo ciudadano: verde (avanza),
              amarillo (riesgo), rojo (detenido).
            </p>
          </div>
        )}

        {/* ================= PERFIL ================= */}
        {view === "perfil" && (
          <div className="p-6 space-y-3">
            <h2 className="text-xl text-red-400">Perfil Ciudadano</h2>

            <p className="text-gray-400">
              Plataforma oficial del Plan de Desarrollo
              Sostenible Minga Guazú 2041.
            </p>

            <ul className="list-disc list-inside text-sm text-gray-400">
              <li>Acceso a información pública</li>
              <li>Monitoreo de proyectos y obras</li>
              <li>Participación activa ciudadana</li>
              <li>Modo invitado sin registro obligatorio</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
