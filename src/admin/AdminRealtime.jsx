import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getSupabase } from "../supabaseClient.js";
import AsistenteFlotante from "./AsistenteFlotante"; // 👈 Importa el nuevo asistente

const supabase = getSupabase();

export default function AdminRealtime() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coordinadores, setCoordinadores] = useState([]);

  /* === Cargar y conectar datos en tiempo real === */
  useEffect(() => {
    async function loadInitial() {
      const { data, error } = await supabase.from("voters").select("*");
      if (!error) setVoters(data || []);
      setLoading(false);

      const { data: coord } = await supabase
        .from("coordinadores")
        .select("*")
        .order("participacion", { ascending: false });
      setCoordinadores(coord || []);
    }
    loadInitial();

    const channel = supabase
      .channel("voters-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "voters" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setVoters((prev) => [payload.new, ...prev]);
          }
          if (payload.eventType === "UPDATE") {
            setVoters((prev) =>
              prev.map((v) => (v.id === payload.new.id ? payload.new : v))
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  /* === Cálculos globales === */
  const total = voters.length;
  const votaron = voters.filter((v) => v.estadoVoto === "Votó").length;
  const porcentaje = total > 0 ? Math.round((votaron / total) * 100) : 0;

  /* === Ícono personalizado con animación === */
  const markerHTML = `
    <div style="font-size: 22px; animation: pulse 1.5s infinite; transform-origin: center;">📍</div>
    <style>
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.3); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    </style>
  `;

  /* === Render principal === */
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-gray-100 flex flex-col">
      {/* === HEADER TECNOLÓGICO === */}
      <header className="relative border-b border-red-700/40 p-4 bg-gradient-to-r from-black via-neutral-900 to-black rounded-xl mb-3 shadow-[0_0_25px_rgba(255,0,0,0.3)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,0,0,0.2),transparent_70%),radial-gradient(circle_at_80%_70%,rgba(0,200,255,0.15),transparent_60%)] animate-pulse blur-3xl"></div>

        <div className="relative flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-2 z-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] animate-pulse-slow">
              🛡️ <span className="tracking-wider text-red-400">Centro de Comando</span>{" "}
              <span className="text-gray-200">— Intendencia Minga Guazú</span>
            </h1>

            <div className="h-[2px] w-36 bg-gradient-to-r from-cyan-400 via-emerald-300 to-transparent mt-1 animate-scan"></div>

            <p className="text-sm text-gray-400 mt-1">
              Bienvenido,{" "}
              <span className="text-white font-semibold">Rodrigo Ríos</span>{" "}
              <span className="text-cyan-300">— Gestión en tiempo real</span>
            </p>
          </div>

          <div className="text-sm text-gray-400 text-center sm:text-right">
            <p className="text-gray-400">
              {new Date().toLocaleDateString("es-PY", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-emerald-400 font-semibold flex items-center justify-center sm:justify-end gap-1">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>
              🟢 Sistema Activo
            </p>
          </div>
        </div>

        <style>{`
          @keyframes pulse-slow {
            0%, 100% { opacity: 1; text-shadow: 0 0 8px rgba(255, 0, 0, 0.6); }
            50% { opacity: 0.85; text-shadow: 0 0 20px rgba(255, 0, 0, 0.9); }
          }
          .animate-pulse-slow {
            animation: pulse-slow 2.5s infinite;
          }
          @keyframes scan {
            0% { transform: translateX(-40%); opacity: 0.3; }
            50% { transform: translateX(40%); opacity: 1; }
            100% { transform: translateX(-40%); opacity: 0.3; }
          }
          .animate-scan {
            animation: scan 4s linear infinite;
          }
        `}</style>
      </header>

      {/* === CONTENIDO PRINCIPAL === */}
      <div className="grid md:grid-cols-3 gap-4 flex-grow">
        {/* === MAPA === */}
        <section className="md:col-span-2 bg-neutral-900/80 border border-red-700/40 rounded-2xl p-3 shadow-[0_0_25px_rgba(255,0,0,0.2)] overflow-hidden">
          <h2 className="text-red-400 font-semibold mb-2 text-center sm:text-left">
            🌍 Mapa en Vivo — Coordinadores Activos
          </h2>

          <MapContainer
            center={[-25.5, -54.76]}
            zoom={13}
            className="h-[70vh] sm:h-[75vh] rounded-xl"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {voters.map((v) => (
              <Marker
                key={v.id}
                position={[
                  -25.48 + Math.random() * 0.04,
                  -54.77 + Math.random() * 0.03,
                ]}
                icon={L.divIcon({
                  html: markerHTML,
                  className: "cursor-pointer",
                })}
              >
                <Popup>
                  <b>{v.fullName}</b> <br />
                  🏠 {v.barrio} <br />
                  🗳️ Estado: <b>{v.estadoVoto}</b>
                </Popup>
              </Marker>
            ))}

            {/* Radar circular animado */}
            {window.innerWidth > 768 && (
              <Circle
                center={[-25.5, -54.76]}
                radius={1000}
                pathOptions={{
                  color: "red",
                  fillColor: "red",
                  fillOpacity: 0.1,
                }}
              />
            )}
          </MapContainer>
        </section>

        {/* === PANEL DERECHO === */}
        <aside className="bg-neutral-900/80 border border-red-700/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(255,0,0,0.15)] flex flex-col">
          <h3 className="text-red-400 font-semibold mb-3 text-center sm:text-left">
            📊 Resumen General
          </h3>

          {loading ? (
            <p className="text-gray-400 text-center">Cargando...</p>
          ) : (
            <>
              <div className="mb-4">
                <p>👥 Total registrados: <b className="text-white">{total}</b></p>
                <p>✅ Votaron: <b className="text-green-400">{votaron}</b></p>
                <p>
                  📈 Participación:{" "}
                  <b
                    className={`${
                      porcentaje > 70
                        ? "text-green-400"
                        : porcentaje > 40
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {porcentaje}%
                  </b>
                </p>

                {/* Barra de progreso */}
                <div className="w-full bg-neutral-800 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      porcentaje > 70
                        ? "bg-green-500"
                        : porcentaje > 40
                        ? "bg-yellow-400"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  ></div>
                </div>
              </div>

              {/* === RANKING === */}
              <h3 className="text-red-400 font-semibold mb-2 text-center sm:text-left">
                🥇 Ranking de Coordinadores
              </h3>
              <div className="overflow-y-auto h-[40vh] sm:h-[45vh] rounded-md border border-neutral-800/40">
                {coordinadores.length === 0 ? (
                  <p className="text-gray-400 text-sm p-2 text-center">
                    Sin registros aún.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-800/70">
                      <tr className="text-gray-400 border-b border-red-800/40">
                        <th className="text-left px-2 py-1">Nombre</th>
                        <th className="text-left px-2 py-1">Barrio</th>
                        <th className="text-right px-2 py-1">% Voto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coordinadores.map((c, i) => (
                        <tr
                          key={c.id}
                          className={`border-b border-neutral-800 ${
                            i === 0
                              ? "bg-red-800/30"
                              : i === 1
                              ? "bg-yellow-700/20"
                              : i === 2
                              ? "bg-green-700/20"
                              : ""
                          }`}
                        >
                          <td className="px-2 py-1 font-semibold text-white">{c.nombre}</td>
                          <td className="px-2 py-1 text-gray-400">{c.barrio}</td>
                          <td className="px-2 py-1 text-right font-semibold text-emerald-400">
                            {c.participacion}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </aside>
      </div>

      {/* 🧠 ASISTENTE FLOTANTE */}
      <AsistenteFlotante />
    </main>
  );
}
