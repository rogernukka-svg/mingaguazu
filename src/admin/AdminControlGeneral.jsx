import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getSupabase } from "../supabaseClient.js";
import AsistenteFlotante from "./AsistenteFlotante";
import { LogOut } from "lucide-react"; 


const supabase = getSupabase();

export default function AdminControlAsuncion() {
  const [vehiculos, setVehiculos] = useState([]);
  const [coordinadores, setCoordinadores] = useState([]);
  const [puntos, setPuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💬 Mensajería
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");

  // 🔍 Modales de detalle
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);
  const [selectedCoordinador, setSelectedCoordinador] = useState(null);

  /* ===============================
      🔥 MOCK INICIAL (SIN SERVIDOR)
  =============================== */
  useEffect(() => {
    setVehiculos([
      {
        id: 1,
        chofer: "César Benítez",
        placa: "ASU-123",
        zona: "Sajonia",
        estado: "EN LINEA",
        lat: -25.291,
        lng: -57.633,
        viajes: 18,
        sector: "Corredor Costero",
        ultimaActualizacionMin: 7,
      },
      {
        id: 2,
        chofer: "Luis Duarte",
        placa: "CAP-456",
        zona: "Barrio Obrero",
        estado: "PAUSA",
        lat: -25.284,
        lng: -57.635,
        viajes: 9,
        sector: "Anillos Intermedios",
        ultimaActualizacionMin: 3,
      },
      {
        id: 3,
        chofer: "Marta Acosta",
        placa: "ATY-789",
        zona: "San Vicente",
        estado: "EN LINEA",
        lat: -25.296,
        lng: -57.647,
        viajes: 21,
        sector: "Sur Metropolitano",
        ultimaActualizacionMin: 1,
      },
      {
        id: 4,
        chofer: "Ricardo Bogado",
        placa: "PJC-550",
        zona: "Catedral",
        estado: "DESCONECTADO",
        lat: -25.282,
        lng: -57.634,
        viajes: 5,
        sector: "Microcentro",
        ultimaActualizacionMin: 38,
      },
      {
        id: 5,
        chofer: "Fernanda Meza",
        placa: "FPS-310",
        zona: "República",
        estado: "EN LINEA",
        lat: -25.285,
        lng: -57.64,
        viajes: 17,
        sector: "Eje Cívico",
        ultimaActualizacionMin: 4,
      },
      {
        id: 6,
        chofer: "Nicolás Ortíz",
        placa: "ASU-777",
        zona: "Loma San Jerónimo",
        estado: "EN LINEA",
        lat: -25.286,
        lng: -57.628,
        viajes: 12,
        sector: "Laderas del Río",
        ultimaActualizacionMin: 2,
      },
    ]);

    setCoordinadores([
      {
        id: 1,
        nombre: "Rodrigo López",
        zona: "Sajonia",
        lat: -25.292,
        lng: -57.636,
        hogaresVisitados: 142,
        votantesConfirmados: 89,
        ultimoReporteMin: 5,
      },
      {
        id: 2,
        nombre: "Pedro Ferreira",
        zona: "San Vicente",
        lat: -25.298,
        lng: -57.645,
        hogaresVisitados: 131,
        votantesConfirmados: 73,
        ultimoReporteMin: 11,
      },
      {
        id: 3,
        nombre: "Rosa Aquino",
        zona: "Barrio Obrero",
        lat: -25.286,
        lng: -57.63,
        hogaresVisitados: 156,
        votantesConfirmados: 96,
        ultimoReporteMin: 3,
      },
      {
        id: 4,
        nombre: "Nicolás Cardozo",
        zona: "Catedral",
        lat: -25.283,
        lng: -57.632,
        hogaresVisitados: 98,
        votantesConfirmados: 57,
        ultimoReporteMin: 14,
      },
      {
        id: 5,
        nombre: "Julieta Alarcón",
        zona: "República",
        lat: -25.286,
        lng: -57.639,
        hogaresVisitados: 121,
        votantesConfirmados: 68,
        ultimoReporteMin: 8,
      },
      {
        id: 6,
        nombre: "Carlos Brítez",
        zona: "Loma San Jerónimo",
        lat: -25.285,
        lng: -57.629,
        hogaresVisitados: 173,
        votantesConfirmados: 101,
        ultimoReporteMin: 2,
      },
    ]);

    setPuntos([
      { id: 1, nombre: "Hospital Sajonia", lat: -25.293, lng: -57.634, visitado: true },
      { id: 2, nombre: "Plaza San Vicente", lat: -25.297, lng: -57.646, visitado: false },
      { id: 3, nombre: "Comedor Comunitario Obrero", lat: -25.285, lng: -57.631, visitado: true },
      { id: 4, nombre: "Panteón Nacional", lat: -25.282, lng: -57.636, visitado: false },
    ]);

    setLoading(false);
  }, []);

  /* ===============================
      🔁 MENSAJES EN TIEMPO REAL
  =============================== */
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      setMessages(data || []);
    }
    loadMessages();

    const channel = supabase
      .channel("messages-realtime-asuncion")
      .on(
        "postgres_changes",
        { event: "INSERT", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;

    await supabase.from("messages").insert([
      {
        sender_name: "Nodo Asunción",
        sender_role: "admin",
        content: newMsg.trim(),
      },
    ]);

    setNewMsg("");
  }

  /* ===============================
      🎨 ICONOS
  =============================== */
  const iconVehiculo = (estado) => {
    const color = estado === "EN LINEA" ? "lime" : estado === "PAUSA" ? "yellow" : "red";
    return L.divIcon({
      html: `<div style="font-size:24px; filter: drop-shadow(0 0 6px ${color})">🚗</div>`,
      className: "vehiculo",
    });
  };

 const iconCoord = L.divIcon({
  html: `
    <div style="display:flex;align-items:center;justify-content:center;">
      <img
        src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
        style="width:26px;filter: drop-shadow(0 0 6px #22d3ee)"
      />
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});


  const iconPunto = (v) =>
    L.divIcon({
      html: `<div style="font-size:20px; filter: drop-shadow(0 0 4px ${
        v ? "lime" : "orange"
      })">${v ? "📌" : "⚠️"}</div>`,
      className: "punto",
    });

  const colorEstado = (e) =>
    e === "EN LINEA" ? "lime" : e === "PAUSA" ? "yellow" : "red";

  /* ===============================
      📊 MÉTRICAS
  =============================== */
  const totalVeh = vehiculos.length;
  const totalCoord = coordinadores.length;
  const puntosVisitados = puntos.filter((p) => p.visitado).length;
  const porcentajeCobertura = puntos.length
    ? Math.round((puntosVisitados / puntos.length) * 100)
    : 0;

  const totalViajes = vehiculos.reduce((acc, v) => acc + (v.viajes || 0), 0);
  const totalVotantes = coordinadores.reduce(
    (acc, c) => acc + (c.votantesConfirmados || 0),
    0
  );

  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* HEADER FUTURISTA */}
<header className="p-4 border-b border-red-700/40 bg-gradient-to-r from-black via-neutral-900 to-black shadow-lg">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
    <div>
      <p className="text-[11px] tracking-[0.35em] text-red-400 font-mono uppercase">
        JAHA · 2041 · NÚCLEO REGIONAL
      </p>
      <h1 className="text-2xl md:text-3xl font-extrabold text-red-500 drop-shadow-[0_0_18px_rgba(239,68,68,0.9)]">
        🛰 Centro de Control — Asunción
      </h1>
      <p className="text-xs text-gray-400 mt-1">
        Monitoreo en tiempo real de vehículos, coordinadores y cobertura territorial
      </p>
    </div>

    <div className="text-xs text-right font-mono text-gray-400 flex flex-col items-end gap-1">
      <p>
        Operador nodo: <span className="text-red-400 font-semibold">Tiki González</span>
      </p>
      <p>Región: <span className="text-gray-300">Central · Capital</span></p>

      {/* 🔐 Botón Cerrar sesión */}
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login"; // 👈 redirección luego de cerrar sesión
        }}
        className="mt-1 flex items-center gap-1 text-[11px] px-2 py-1 border border-red-700/40 text-red-300 rounded-lg hover:bg-red-700/20 hover:border-red-400 transition-all"
      >
        <LogOut size={12} />
        Salir
      </button>
    </div>
  </div>
</header>


      {/* CONTENIDO */}
<div className="grid md:grid-cols-3 gap-4 p-3 pt-4 flex-grow">
  {/* MAPA */}
  <section className="md:col-span-2 bg-neutral-900/70 rounded-xl border border-red-700/40 p-3 shadow-[0_0_25px_rgba(248,113,113,0.15)]">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-red-400 text-sm font-semibold tracking-wide">
        MAPA DINÁMICO DE ACTIVIDAD
      </h2>
      <p className="text-[10px] text-gray-400 font-mono">
        Vehículos: {totalVeh} · Coordinadores: {totalCoord}
      </p>
    </div>

    <MapContainer
      center={[-25.286, -57.645]}
      zoom={13}
      className="h-[70vh] rounded-xl overflow-hidden border border-red-900/30"
    >
      <TileLayer
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png"
        attribution="&copy; Stadia Maps, OpenMapTiles & OpenStreetMap contributors"
      />

      {/* 🚗 Vehículos */}
      {vehiculos.map((v) => (
        <Marker
          key={v.id}
          position={[v.lat, v.lng]}
          icon={iconVehiculo(v.estado)}
          eventHandlers={{
            click: () => {
              setSelectedVehiculo(v);
              setSelectedCoordinador(null);
            },
          }}
        />
      ))}

      {/* 🧭 Coordinadores */}
      {coordinadores.map((c) => (
        <Marker
          key={c.id}
          position={[c.lat, c.lng]}
          icon={iconCoord}
          eventHandlers={{
            click: () => {
              setSelectedCoordinador(c);
              setSelectedVehiculo(null);
            },
          }}
        />
      ))}

      {/* 📌 Puntos de referencia */}
      {puntos.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={iconPunto(p.visitado)}
        >
          <Popup>
            <b>{p.nombre}</b>
            <br /> Visitado: {p.visitado ? "Sí" : "No"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </section>


        {/* PANEL DERECHO: MÉTRICAS + MENSAJERÍA */}
        <aside className="bg-neutral-900/70 rounded-xl border border-red-700/40 p-4 flex flex-col shadow-[0_0_25px_rgba(248,113,113,0.12)]">
          <h3 className="text-red-400 font-semibold mb-2 text-center text-sm tracking-wide">
            ESTADO GENERAL DEL NODO
          </h3>

          {!loading && (
            <>
              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div className="bg-black/60 border border-red-700/40 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Vehículos activos
                  </p>
                  <p className="text-lg font-bold text-green-400">{totalVeh}</p>
                  <p className="text-[10px] text-gray-500">Total viajes hoy: {totalViajes}</p>
                </div>

                <div className="bg-black/60 border border-red-700/40 rounded-lg p-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Coordinadores
                  </p>
                  <p className="text-lg font-bold text-cyan-300">{totalCoord}</p>
                  <p className="text-[10px] text-gray-500">
                    Votantes confirmados: {totalVotantes}
                  </p>
                </div>

                <div className="bg-black/60 border border-red-700/40 rounded-lg p-2 col-span-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                    Cobertura territorial
                  </p>
                  <div className="w-full h-2 bg-neutral-800 rounded mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-600 via-red-400 to-lime-400"
                      style={{ width: `${porcentajeCobertura}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-green-400 mt-1">
                    {porcentajeCobertura}% de los puntos estratégicos ya visitados
                  </p>
                </div>
              </div>

              <hr className="my-2 border-red-900/60" />

              {/* 💬 MENSAJERÍA */}
              <h4 className="text-red-400 text-xs font-semibold mb-2 text-center tracking-wide">
                CANAL DE COORDINACIÓN — ASUNCIÓN
              </h4>

              <div className="flex-1 overflow-y-auto mb-2 space-y-2 pr-1 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded-lg w-fit max-w-[90%] ${
                      m.sender_role === "admin"
                        ? "bg-red-700/40 text-white self-end ml-auto border border-red-500/60"
                        : "bg-gray-800/80 text-gray-100 border border-gray-700/60"
                    }`}
                  >
                    <p className="text-[10px] opacity-80 font-mono mb-0.5">
                      {m.sender_name}
                    </p>
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2 mt-auto">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Enviar instrucción al equipo..."
                  className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-500 text-black px-3 rounded-lg text-xs font-semibold"
                >
                  Enviar
                </button>
              </form>
            </>
          )}
        </aside>
      </div>

      {/* MODAL VEHÍCULO */}
      {selectedVehiculo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">

          <div className="bg-gradient-to-b from-black via-neutral-900 to-red-950 border border-red-600/70 rounded-2xl shadow-[0_0_45px_rgba(248,113,113,0.7)] w-80 sm:w-96 p-5 relative">
            <button
              onClick={() => setSelectedVehiculo(null)}
              className="absolute top-3 right-3 text-red-300 hover:text-red-100 text-lg"
            >
              ✕
            </button>

            <p className="text-[10px] text-red-400 font-mono tracking-[0.3em] uppercase mb-1">
              Unidad logística
            </p>
            <h2 className="text-xl font-bold text-red-100 mb-1">
              🚗 {selectedVehiculo.placa}
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Conductor: <span className="text-gray-100">{selectedVehiculo.chofer}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/60 border border-red-700/50 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Zona actual</p>
                <p className="font-semibold text-red-200">
                  {selectedVehiculo.zona}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Sector: {selectedVehiculo.sector}
                </p>
              </div>

              <div className="bg-black/60 border border-red-700/50 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Estado</p>
                <p
                  className="font-semibold"
                  style={{ color: colorEstado(selectedVehiculo.estado) }}
                >
                  {selectedVehiculo.estado}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Últ. actualización: {selectedVehiculo.ultimaActualizacionMin} min
                </p>
              </div>

              <div className="bg-black/60 border border-red-700/50 rounded-lg p-2 col-span-2">
                <p className="text-[10px] text-gray-400">
                  Viajes completados en la jornada
                </p>
                <p className="text-lg font-bold text-green-400">
                  {selectedVehiculo.viajes}
                </p>
                <div className="w-full h-1.5 bg-neutral-800 rounded mt-1 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-400 to-emerald-500"
                    style={{
                      width: `${Math.min(
                        (selectedVehiculo.viajes / 25) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 mt-3 text-center font-mono">
              Nodo Asunción · JAHA 2041 · Monitoreo en vivo
            </p>
          </div>
        </div>
      )}

      {/* MODAL COORDINADOR */}
      {selectedCoordinador && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">

          <div className="bg-gradient-to-b from-black via-neutral-900 to-red-950 border border-red-600/70 rounded-2xl shadow-[0_0_45px_rgba(248,113,113,0.7)] w-80 sm:w-96 p-5 relative">
            <button
              onClick={() => setSelectedCoordinador(null)}
              className="absolute top-3 right-3 text-red-300 hover:text-red-100 text-lg"
            >
              ✕
            </button>

            <p className="text-[10px] text-cyan-400 font-mono tracking-[0.3em] uppercase mb-1">
              Coordinador territorial
            </p>
            <h2 className="text-xl font-bold text-cyan-100 mb-1">
              🧭 {selectedCoordinador.nombre}
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              Zona asignada:{" "}
              <span className="text-gray-100">{selectedCoordinador.zona}</span>
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-black/60 border border-red-700/40 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Hogares visitados hoy</p>
                <p className="text-lg font-bold text-emerald-400">
                  {selectedCoordinador.hogaresVisitados}
                </p>
              </div>

              <div className="bg-black/60 border border-red-700/40 rounded-lg p-2">
                <p className="text-[10px] text-gray-400">Votantes confirmados</p>
                <p className="text-lg font-bold text-lime-300">
                  {selectedCoordinador.votantesConfirmados}
                </p>
              </div>

              <div className="bg-black/60 border border-red-700/40 rounded-lg p-2 col-span-2">
                <p className="text-[10px] text-gray-400">Último reporte</p>
                <p className="font-semibold text-gray-200">
                  Hace {selectedCoordinador.ultimoReporteMin} minutos
                </p>
                <p className="text-[10px] text-gray-500 mt-1">
                  Estado: equipo operativo y conectado al nodo central.
                </p>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 mt-3 text-center font-mono">
              Nodo Asunción · JAHA 2041 · Red de Coordinadores
            </p>
          </div>
        </div>
      )}

      <AsistenteFlotante />
    </main>
  );
}
