import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSupabase } from "../supabaseClient";

const supabase = getSupabase();

/* === ICONO DEL VEHÍCULO === */
const vehicleIcon = L.divIcon({
  html: `
    <div style="font-size: 30px; animation: pulse 1.5s infinite;">🚗</div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: .8; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  `,
  className: "vehicle-icon",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

/* === ASISTENTE FLOTANTE DE CHAT === */
function AsistenteFlotanteConductor({ conductor }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [hasNew, setHasNew] = useState(false);
  const bottomRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel("messages-conductor")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);

        if (!open) {
          setHasNew(true);
          audioRef.current?.play().catch(() => {});
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [open]);

  async function loadMessages() {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    setMessages(data || []);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;

    await supabase.from("messages").insert([
      {
        sender_id: conductor.id,
        sender_name: conductor.chofer,
        sender_role: "conductor",
        content: text.trim(),
      },
    ]);

    setText("");
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <audio ref={audioRef} src="/sfx/notify.mp3" preload="auto" />

      <div className="fixed bottom-6 right-6 z-[999]">
        <button
          onClick={() => {
            setOpen(!open);
            setHasNew(false);
          }}
          className="relative bg-red-600 hover:bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-red-700/40 transition-transform hover:scale-110"
        >
          💬
          {hasNew && (
            <span className="absolute -top-1 -right-1 bg-emerald-400 text-black text-[10px] font-bold rounded-full px-1.5 py-0.5 animate-pulse">
              ●
            </span>
          )}
        </button>

        {open && (
          <div className="absolute bottom-20 right-0 bg-neutral-900 border border-red-700/40 rounded-2xl w-80 h-96 flex flex-col shadow-[0_0_25px_rgba(255,0,0,0.4)] overflow-hidden animate-fadeIn">
            <div className="bg-red-700/40 text-center py-2 font-semibold text-sm text-white">
              Chat con Central
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 rounded-lg text-xs max-w-[85%] ${
                    m.sender_role === "conductor"
                      ? "bg-red-700/40 text-white self-end ml-auto"
                      : "bg-gray-800 text-gray-200"
                  }`}
                >
                  <p className="font-semibold text-[10px] text-gray-400 mb-0.5">
                    {m.sender_name}
                    {" "}
                    <span className="text-gray-500">
                      {new Date(m.created_at).toLocaleTimeString("es-PY", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                  <p>{m.content}</p>
                </div>
              ))}
              <div ref={bottomRef}></div>
            </div>

            <form onSubmit={sendMessage} className="p-2 border-t border-red-700/40 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mensaje..."
                className="flex-1 bg-black border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white"
              />
              <button className="bg-red-600 hover:bg-red-500 text-black rounded-lg px-3 text-xs font-semibold">
                ➤
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

/* === PANEL PRINCIPAL DEL CONDUCTOR === */
export default function ConductorPanel() {
  const [estado, setEstado] = useState("DESCONECTADO");
  const [ubicacion, setUbicacion] = useState({ lat: null, lng: null });
  const [ruta, setRuta] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const conductor = {
    id: 1,
    chofer: "Carlos Gómez",
    placa: "ABC-123",
    zona: "San José",
  };

  function obtenerUbicacion() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUbicacion({ lat: latitude, lng: longitude });
        setRuta((p) => [...p, [latitude, longitude]]);
      },
      () => alert("No se pudo obtener tu ubicación."),
      { enableHighAccuracy: true }
    );
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (estado === "EN LINEA") enviarUbicacion();
    }, 8000);
    return () => clearInterval(interval);
  }, [estado, ubicacion]);

  function cambiarEstado(nuevo) {
    setEstado(nuevo);
    obtenerUbicacion();
  }

  function enviarUbicacion() {
    if (!ubicacion.lat) return;
    console.log("Enviando ubicación:", ubicacion);
    setEnviando(true);
    setTimeout(() => setEnviando(false), 400);
  }

  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col items-center p-4">

      <h1 className="text-2xl font-bold text-red-500 mb-3">🚗 Panel del Conductor</h1>

      <div className="bg-neutral-900/60 w-full max-w-md rounded-xl p-4 border border-red-700/40 mb-4 text-center shadow-xl">
        <p className="text-xl font-semibold">{conductor.chofer}</p>
        <p className="text-gray-300">Placa: {conductor.placa}</p>
        <p className="text-gray-300">Zona: {conductor.zona}</p>

        <p className="mt-2 font-semibold">
          Estado actual:{" "}
          <span
            className={
              estado === "EN LINEA"
                ? "text-green-400"
                : estado === "PAUSA"
                ? "text-yellow-400"
                : "text-red-400"
            }
          >
            {estado}
          </span>
        </p>
      </div>

      {ubicacion.lat && (
        <div className="w-full max-w-md h-[350px] rounded-xl overflow-hidden border border-red-700/40 shadow-xl mb-4">
          <MapContainer center={[ubicacion.lat, ubicacion.lng]} zoom={16} className="h-full w-full">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[ubicacion.lat, ubicacion.lng]} icon={vehicleIcon} />
            {ruta.length > 1 && <Polyline positions={ruta} color="cyan" weight={4} />}
          </MapContainer>
        </div>
      )}

      <div className="flex flex-col gap-3 w-full max-w-md">
        <button onClick={() => cambiarEstado("EN LINEA")} className="bg-green-600 py-4 rounded-xl font-bold">
          🟢 EN LINEA
        </button>
        <button onClick={() => cambiarEstado("PAUSA")} className="bg-yellow-400 py-4 rounded-xl font-bold text-black">
          🟡 PAUSA
        </button>
        <button onClick={() => cambiarEstado("FINALIZADO")} className="bg-red-600 py-4 rounded-xl font-bold">
          🔴 FINALIZADO
        </button>
      </div>

      {enviando && <p className="mt-3 text-gray-400 text-sm animate-pulse">Enviando ubicación...</p>}

      {/* 💬 Chat flotante */}
      <AsistenteFlotanteConductor conductor={conductor} />
    </main>
  );
}
