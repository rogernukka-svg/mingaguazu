import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import supabase from "../supabaseClient";

const createIcon = (color, size = 18) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:2px solid white;
        box-shadow:0 0 16px ${color};
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -10],
  });

const coordIcon = createIcon("#22c55e", 20);
const movilIcon = createIcon("#38bdf8", 16);
const fallbackCenter = [-25.5148, -54.611];

export default function CentralMapa() {
  const [coordinadores, setCoordinadores] = useState([]);
  const [moviles, setMoviles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [{ data: coordData }, { data: movilData }] = await Promise.all([
          supabase.from("coordinadores").select("*").order("id", { ascending: true }),
          supabase.from("moviles").select("*").order("id", { ascending: true }),
        ]);

        setCoordinadores(coordData || []);
        setMoviles(movilData || []);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const center = useMemo(() => {
    const points = [...coordinadores, ...moviles].filter((x) => x.lat && x.lng);
    if (!points.length) return fallbackCenter;
    return [points[0].lat, points[0].lng];
  }, [coordinadores, moviles]);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Visualización avanzada
            </p>
            <h1 className="text-3xl font-black">Mapa Central</h1>
            <p className="text-white/55 mt-1">
              Vista ampliada de coordinadores y móviles
            </p>
          </div>

          <Link
            to="/central"
            className="px-5 py-3 rounded-2xl bg-cyan-500 text-black font-black"
          >
            Volver
          </Link>
        </div>

        <div className="rounded-[30px] overflow-hidden border border-cyan-500/10 h-[78vh] min-h-[560px]">
          {!loading && (
            <MapContainer center={center} zoom={13} className="h-full w-full">
              <TileLayer
                attribution="&copy; OpenStreetMap & Carto"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {coordinadores.map((c) => (
                <Circle
                  key={`coord-${c.id}`}
                  center={[c.lat, c.lng]}
                  radius={850}
                  pathOptions={{
                    color: "#22c55e",
                    fillColor: "#22c55e",
                    fillOpacity: 0.08,
                    weight: 1.5,
                  }}
                />
              ))}

              {moviles.map((m) => (
                <Circle
                  key={`movil-${m.id}`}
                  center={[m.lat, m.lng]}
                  radius={500}
                  pathOptions={{
                    color: "#38bdf8",
                    fillColor: "#38bdf8",
                    fillOpacity: 0.06,
                    weight: 1,
                  }}
                />
              ))}

              {coordinadores.map((c) => (
                <Marker key={c.id} position={[c.lat, c.lng]} icon={coordIcon}>
                  <Popup>
                    <div className="text-black">
                      <b>{c.nombre}</b>
                      <br />
                      Zona: {c.zona}
                      <br />
                      Concejal: {c.concejal}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {moviles.map((m) => (
                <Marker key={m.id} position={[m.lat, m.lng]} icon={movilIcon}>
                  <Popup>
                    <div className="text-black">
                      <b>{m.nombre}</b>
                      <br />
                      Chofer: {m.chofer}
                      <br />
                      Estado: {m.estado}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </main>
  );
}