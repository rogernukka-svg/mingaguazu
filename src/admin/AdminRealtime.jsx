import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getSupabase } from "../supabaseClient.js";
import AsistenteFlotante from "./AsistenteFlotante";

const supabase = getSupabase();

export default function AdminVehiculosRealtime() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [filterZona, setFilterZona] = useState("todos");

  // =====================================
  // 🔥 1) DATOS MOCK (PRUEBA SIN SERVIDOR)
  // =====================================
  useEffect(() => {
    setVehiculos([
      {
        id: 1,
        chofer: "Carlos Gómez",
        placa: "ABC123",
        zona: "San José",
        estado: "EN LINEA",
        lat: -25.50,
        lng: -54.76,
      },
      {
        id: 2,
        chofer: "Luis Martínez",
        placa: "XYZ987",
        zona: "Don Bosco",
        estado: "PAUSA",
        lat: -25.49,
        lng: -54.77,
      },
      {
        id: 3,
        chofer: "Miguel Duarte",
        placa: "MNO555",
        zona: "Santa Ana",
        estado: "EN LINEA",
        lat: -25.51,
        lng: -54.75,
      },
    ]);
    setLoading(false);
  }, []);

  // ===================================================
  // 🔁 2) LECTURA DE MENSAJES (MISMO CHAT DE COORDINADOR)
  // ===================================================
  useEffect(() => {
    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true });
      setMessages(data || []);
    }
    loadMessages();

    const chatChannel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(chatChannel);
  }, []);

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMsg.trim()) return;

    await supabase.from("messages").insert([
      {
        sender_name: "Administrador Vehículos",
        sender_role: "general",
        content: newMsg.trim(),
      },
    ]);

    setNewMsg("");
  }

  // ========================
  // 🎨 ICONO DE VEHICULO
  // ========================
  function iconVehiculo(color) {
    const html = `
      <div style="
        font-size: 22px;
        animation: pulse 1.5s infinite;
        filter: drop-shadow(0 0 3px ${color});
      ">
        🚗
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: .7; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
    `;
    return L.divIcon({ html, className: "icono-vehiculo" });
  }

  // Color según estado
  function colorEstado(estado) {
    switch (estado) {
      case "EN LINEA":
        return "lime";
      case "PAUSA":
        return "yellow";
      default:
        return "red";
    }
  }

  // ============================
  // 📊 CÁLCULOS DEL PANEL DERECHA
  // ============================
  const total = vehiculos.length;
  const enLinea = vehiculos.filter((v) => v.estado === "EN LINEA").length;
  const enPausa = vehiculos.filter((v) => v.estado === "PAUSA").length;

  // ============================
  // 🎯 FILTRO POR ZONA
  // ============================
  const vehiculosFiltrados =
    filterZona === "todos"
      ? vehiculos
      : vehiculos.filter((v) => v.zona === filterZona);

  // ============================
  // 🖥️ UI PRINCIPAL
  // ============================
  return (
    <main className="min-h-screen bg-black text-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="relative border-b border-red-700/40 p-4 bg-gradient-to-r from-black via-neutral-900 to-black shadow">
        <h1 className="text-2xl font-extrabold text-red-500">
          🚗 Centro de Control — Vehículos Día D
        </h1>
        <p className="text-sm text-gray-400">Monitoreo en tiempo real</p>
      </header>

      {/* CONTENIDO */}
      <div className="grid md:grid-cols-3 gap-4 p-3 pt-4 flex-grow">
        {/* MAPA */}
        <section className="md:col-span-2 bg-neutral-900/70 rounded-xl border border-red-700/40 p-3">
          <h2 className="text-red-400 mb-2">Mapa en vivo — Vehículos</h2>

          <select
            value={filterZona}
            onChange={(e) => setFilterZona(e.target.value)}
            className="bg-black border border-red-600 text-red-400 px-2 py-1 rounded-lg text-sm mb-2"
          >
            <option value="todos">Todas las zonas</option>
            <option value="San José">San José</option>
            <option value="Santa Ana">Santa Ana</option>
            <option value="Don Bosco">Don Bosco</option>
          </select>

          <MapContainer
            center={[-25.50, -54.76]}
            zoom={13}
            className="h-[70vh] rounded-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {vehiculosFiltrados.map((v) => (
              <Marker
                key={v.id}
                position={[v.lat, v.lng]}
                icon={iconVehiculo(colorEstado(v.estado))}
              >
                <Popup>
                  <b>Chofer:</b> {v.chofer} <br />
                  <b>Placa:</b> {v.placa} <br />
                  <b>Zona:</b> {v.zona} <br />
                  <b>Estado:</b>{" "}
                  <span
                    style={{ color: colorEstado(v.estado), fontWeight: "bold" }}
                  >
                    {v.estado}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>

        {/* PANEL DERECHO */}
        <aside className="bg-neutral-900/70 rounded-xl border border-red-700/40 p-4 flex flex-col">
          <h3 className="text-red-400 font-semibold mb-3 text-center">
            📊 Estado General
          </h3>

          {loading ? (
            <p className="text-gray-400 text-center">Cargando...</p>
          ) : (
            <>
              <p>Total móviles: {total}</p>
              <p className="text-green-400">En línea: {enLinea}</p>
              <p className="text-yellow-400">En pausa: {enPausa}</p>

              <hr className="my-3 border-red-700/40" />

              <h4 className="text-red-400 text-sm mb-2">💬 Comunicación</h4>

              <div className="flex-1 overflow-y-auto mb-2 space-y-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2 rounded-lg text-sm w-fit max-w-[85%] ${
                      m.sender_role === "general"
                        ? "bg-red-700/40 text-white self-end ml-auto"
                        : "bg-gray-800 text-gray-200"
                    }`}
                  >
                    <b>{m.sender_name}</b>
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Mensaje..."
                  className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-1 text-sm"
                />
                <button className="bg-red-600 hover:bg-red-500 text-black px-3 rounded-lg text-sm font-semibold">
                  Enviar
                </button>
              </form>
            </>
          )}
        </aside>
      </div>

      {/* Asistente flotante */}
      <AsistenteFlotante />
    </main>
  );
}
