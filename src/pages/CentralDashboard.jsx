import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import logoJaha from "../assets/logojahabicolor.png";
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
        box-shadow:0 0 18px ${color};
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -10],
  });

const coordIcon = createIcon("#22c55e", 20);
const movilIcon = createIcon("#38bdf8", 16);
const fallbackCenter = [-25.5148, -54.611];

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_20px_rgba(0,255,255,0.04)]">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-white/45">{subtitle}</p>
    </div>
  );
}

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tiempo de espera agotado")), ms)
    ),
  ]);
}

function isValidCoord(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeCoords(list = []) {
  return list.filter((item) => isValidCoord(item?.lat) && isValidCoord(item?.lng));
}

async function fetchTable(tableNames) {
  let lastError = null;

  for (const tableName of tableNames) {
    try {
      console.log("Probando tabla:", tableName);

      const result = await withTimeout(
        supabase.from(tableName).select("*").order("id", { ascending: true }),
        8000
      );

      console.log("Respuesta tabla", tableName, result);

      if (!result.error) {
        return {
          ok: true,
          tableName,
          data: result.data || [],
        };
      }

      lastError = result.error;
    } catch (err) {
      console.error("Error tabla", tableName, err);
      lastError = err;
    }
  }

  return {
    ok: false,
    tableName: tableNames.join(" / "),
    data: [],
    error: lastError,
  };
}

export default function CentralDashboard() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("jaha_private_user");
  const user = raw ? JSON.parse(raw) : null;

  const [coordinadores, setCoordinadores] = useState([]);
  const [moviles, setMoviles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log("=== TEST CENTRAL SUPABASE ===");

        const { data, error } = await supabase
          .from("private_users")
          .select("*")
          .limit(1);

        console.log("CENTRAL TEST DATA:", data);
        console.log("CENTRAL TEST ERROR:", error);
      } catch (err) {
        console.error("CENTRAL TEST CATCH:", err);
      }
    };

    testSupabase();
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/central-login", { replace: true });
      return;
    }

    let mounted = true;

    const loadAll = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        console.log("Cargando dashboard central...");

        const [coordResult, movilResult] = await Promise.all([
          fetchTable(["coordinadores"]),
          fetchTable(["moviles", "móviles"]),
        ]);

        if (!mounted) return;

        if (coordResult.ok) {
          console.log("Coordinadores cargados:", coordResult.data);
          setCoordinadores(coordResult.data);
        } else {
          console.error("Error coordinadores:", coordResult.error);
          setErrorMsg("No se pudo cargar la tabla de coordinadores.");
        }

        if (movilResult.ok) {
          console.log("Móviles cargados:", movilResult.data);
          setMoviles(movilResult.data);
        } else {
          console.error("Error móviles:", movilResult.error);
          setErrorMsg((prev) =>
            prev
              ? `${prev} No se pudo cargar la tabla de móviles.`
              : "No se pudo cargar la tabla de móviles."
          );
        }
      } catch (err) {
        console.error("Error general dashboard:", err);
        if (mounted) {
          setErrorMsg(`No se pudo cargar el panel. ${err.message || ""}`);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAll();

    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const coordinadoresMap = useMemo(
    () => normalizeCoords(coordinadores),
    [coordinadores]
  );

  const movilesMap = useMemo(
    () => normalizeCoords(moviles),
    [moviles]
  );

  const center = useMemo(() => {
    const points = [...coordinadoresMap, ...movilesMap];
    if (!points.length) return fallbackCenter;
    return [points[0].lat, points[0].lng];
  }, [coordinadoresMap, movilesMap]);

  const coordinadoresOnline = coordinadores.filter((x) => x.online).length;
  const movilesOnline = moviles.filter((x) => x.online).length;

  const handleLogout = () => {
    localStorage.removeItem("jaha_private_user");
    localStorage.removeItem("jaha_user");
    sessionStorage.clear();
    navigate("/central-login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,0,110,0.08),transparent_24%),linear-gradient(to_bottom,#030303,#0a0a0a,#000000)] pointer-events-none" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <header className="relative z-10 border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-3xl border border-cyan-400/20 bg-white/[0.04] p-2">
              <img src={logoJaha} alt="JAHA" className="w-14 h-14 object-contain" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/70">
                Centro de monitoreo
              </p>
              <h1 className="text-2xl font-black tracking-[0.12em]">
                CENTRAL <span className="text-cyan-400">JAHA 2041</span>
              </h1>
              <p className="text-sm text-white/55">
                Interfaz rápida, tecnológica y fácil de usar
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/central"
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-black"
            >
              Inicio
            </Link>
            <Link
              to="/central/coordinadores"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              Coordinadores
            </Link>
            <Link
              to="/central/moviles"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              Móviles
            </Link>
            <Link
              to="/central/mapa"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              Mapa
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-white/5 border border-red-500/25"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto px-4 pt-5">
        {loading ? (
          <div className="rounded-[30px] border border-cyan-500/10 bg-white/[0.04] p-8 text-center text-cyan-300">
            Cargando panel...
          </div>
        ) : (
          <>
            {errorMsg ? (
              <div className="mb-4 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                {errorMsg}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                title="Coordinadores"
                value={coordinadores.length}
                subtitle="Total registrados"
              />
              <StatCard
                title="Móviles"
                value={moviles.length}
                subtitle="Total registrados"
              />
              <StatCard
                title="Coord. online"
                value={coordinadoresOnline}
                subtitle="En tiempo real"
              />
              <StatCard
                title="Móviles online"
                value={movilesOnline}
                subtitle="En tiempo real"
              />
            </div>
          </>
        )}
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        <div className="rounded-[30px] overflow-hidden border border-cyan-500/10 bg-white/[0.04]">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Mapa territorial inteligente</h2>
              <p className="text-sm text-white/55">
                Visualización centralizada de coordinadores y móviles
              </p>
            </div>
          </div>

          <div className="h-[70vh] min-h-[520px]">
            {!loading && (
              <MapContainer center={center} zoom={13} className="h-full w-full">
                <TileLayer
                  attribution="&copy; OpenStreetMap & Carto"
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {coordinadoresMap.map((c) => (
                  <Circle
                    key={`coord-circle-${c.id}`}
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

                {movilesMap.map((m) => (
                  <Circle
                    key={`movil-circle-${m.id}`}
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

                {coordinadoresMap.map((c) => (
                  <Marker key={c.id} position={[c.lat, c.lng]} icon={coordIcon}>
                    <Popup>
                      <div className="min-w-[180px] text-black">
                        <b>{c.nombre || "-"}</b>
                        <br />
                        Zona: {c.zona || "-"}
                        <br />
                        Tel: {c.telefono || "-"}
                        <br />
                        Concejal: {c.concejal || "-"}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {movilesMap.map((m) => (
                  <Marker key={m.id} position={[m.lat, m.lng]} icon={movilIcon}>
                    <Popup>
                      <div className="min-w-[180px] text-black">
                        <b>{m.nombre || "-"}</b>
                        <br />
                        Chofer: {m.chofer || "-"}
                        <br />
                        Coordinador: {m.coordinador || "-"}
                        <br />
                        Estado: {m.estado || "-"}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        <aside className="rounded-[30px] border border-cyan-500/10 bg-white/[0.04] p-5">
          <h3 className="text-lg font-black">Panel rápido</h3>
          <p className="text-sm text-white/55 mt-1">
            Todo visible, limpio y fácil de operar.
          </p>

          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-300/70">
                Usuario actual
              </p>
              <p className="mt-2 text-white/80 font-bold">{user?.name || "Sin usuario"}</p>
              <p className="text-xs text-white/45 uppercase mt-1">{user?.role || "sin rol"}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-cyan-300/70">
                Leyenda
              </p>
              <p className="mt-2 text-sm text-white/70">
                Verde = coordinador
                <br />
                Celeste = móvil
                <br />
                Toque en el punto = detalles
              </p>
            </div>

            <Link
              to="/central/coordinadores"
              className="block w-full text-center rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black py-3 font-black"
            >
              VER COORDINADORES
            </Link>

            <Link
              to="/central/moviles"
              className="block w-full text-center rounded-2xl bg-white/5 border border-white/10 py-3 font-bold"
            >
              VER MÓVILES
            </Link>

            <Link
              to="/central/mapa"
              className="block w-full text-center rounded-2xl bg-white/5 border border-white/10 py-3 font-bold"
            >
              ABRIR MAPA COMPLETO
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}