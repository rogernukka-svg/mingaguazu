import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import supabase from "../supabaseClient";
import logoJaha from "../assets/logojahabicolor.png";

const fallbackCenter = [-25.5148, -54.611];

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
const visitIcon = createIcon("#facc15", 14);

function Card({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_20px_rgba(0,255,255,0.04)]">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-white/45">{subtitle}</p>
    </div>
  );
}

function Badge({ online }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
        online
          ? "bg-green-500/15 text-green-300 border border-green-500/30"
          : "bg-white/5 text-white/60 border border-white/10"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${online ? "bg-green-400" : "bg-white/40"}`}
      />
      {online ? "EN LÍNEA" : "FUERA DE LÍNEA"}
    </span>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-white outline-none focus:border-cyan-400/40"
    />
  );
}

function Select({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-white outline-none focus:border-cyan-400/40"
    >
      {children}
    </select>
  );
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function isValidCoord(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeVisit(item) {
  return {
    ...item,
    lat: toNumberOrNull(item?.lat),
    lng: toNumberOrNull(item?.lng),
  };
}

export default function CoordinadorPanel() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem("jaha_private_user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [loading, setLoading] = useState(true);
  const [savingVisit, setSavingVisit] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [msg, setMsg] = useState("");

  const [coordinador, setCoordinador] = useState(null);
  const [visitas, setVisitas] = useState([]);
  const [recorrido, setRecorrido] = useState([]);

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageToRole, setMessageToRole] = useState("central");
  const [messageToUserId, setMessageToUserId] = useState("");
  const [messageToName, setMessageToName] = useState("");
  const [concejales, setConcejales] = useState([]);
  const [otrosCoordinadores, setOtrosCoordinadores] = useState([]);
  const [messages, setMessages] = useState([]);

  const [visitForm, setVisitForm] = useState({
    nombre_visitado: "",
    ci: "",
    telefono: "",
    direccion: "",
    barrio: "",
    observacion: "",
    estado_visita: "Visitado",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!user || user.role !== "coordinador") {
      navigate("/coordinador-login", { replace: true });
    }
  }, [user, navigate]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setMsg("");

      const { data: coordData, error: coordError } = await supabase
        .from("coordinadores")
        .select("*")
        .eq("private_user_id", user.id)
        .maybeSingle();

      if (coordError) throw coordError;

      const normalizedCoordinador = coordData
        ? {
            ...coordData,
            lat: toNumberOrNull(coordData.lat),
            lng: toNumberOrNull(coordData.lng),
          }
        : null;

      setCoordinador(normalizedCoordinador);

      const { data: visitasData, error: visitasError } = await supabase
        .from("coordinador_visitas")
        .select("*")
        .eq("coordinador_id", user.id)
        .order("created_at", { ascending: false });

      if (visitasError && visitasError.code !== "PGRST116") {
        throw visitasError;
      }

      const finalVisitas = (visitasData || []).map(normalizeVisit);
      setVisitas(finalVisitas);

      const orderedRoute = [...finalVisitas]
        .filter((v) => isValidCoord(v.lat) && isValidCoord(v.lng))
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

      setRecorrido(orderedRoute.map((v) => [v.lat, v.lng]));

      const { data: concejalesData, error: concejalesError } = await supabase
        .from("private_users")
        .select("id, name, role, active")
        .eq("role", "concejal")
        .eq("active", true)
        .order("name", { ascending: true });

      if (concejalesError) throw concejalesError;
      setConcejales(concejalesData || []);

      const { data: otrosCoordsData, error: otrosCoordsError } = await supabase
        .from("coordinadores")
        .select("id, private_user_id, nombre, concejal, online")
        .neq("private_user_id", user.id)
        .order("nombre", { ascending: true });

      if (otrosCoordsError) throw otrosCoordsError;
      setOtrosCoordinadores(otrosCoordsData || []);

      const { data: messagesData, error: messagesError } = await supabase
        .from("mensajes_privados")
        .select("*")
        .or(`from_id.eq.${user.id},to_user_id.eq.${user.id},to_role.eq.central`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (err) {
      console.error("Error panel coordinador:", err);
      setMsg("No se pudo cargar el panel del coordinador.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const center = useMemo(() => {
    if (isValidCoord(coordinador?.lat) && isValidCoord(coordinador?.lng)) {
      return [coordinador.lat, coordinador.lng];
    }

    const firstVisit = visitas.find(
      (v) => isValidCoord(v.lat) && isValidCoord(v.lng)
    );

    if (firstVisit) return [firstVisit.lat, firstVisit.lng];
    return fallbackCenter;
  }, [coordinador, visitas]);

  const stats = useMemo(() => {
    const total = visitas.length;
    const visitados = visitas.filter((v) => v.estado_visita === "Visitado").length;
    const pendiente = visitas.filter((v) => v.estado_visita === "Pendiente").length;
    const interesado = visitas.filter((v) => v.estado_visita === "Interesado").length;

    return { total, visitados, pendiente, interesado };
  }, [visitas]);

  const handleLogout = () => {
    localStorage.removeItem("jaha_private_user");
    localStorage.removeItem("jaha_user");
    sessionStorage.clear();
    navigate("/coordinador-login", { replace: true });
  };

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Tu navegador no soporta geolocalización"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

  const updateMyStatus = async ({ online, updateLocation = false }) => {
    if (!user?.id) return;

    try {
      setSavingStatus(true);
      setMsg("");

      let coords = null;

      if (updateLocation) {
        try {
          coords = await getCurrentLocation();
        } catch (err) {
          console.warn("No se pudo obtener ubicación:", err);
        }
      }

      const payload = {
        online,
        estado: online ? "Activo" : "Pausa",
      };

      if (coords) {
        payload.lat = coords.lat;
        payload.lng = coords.lng;
      }

      const { error } = await supabase
        .from("coordinadores")
        .update(payload)
        .eq("private_user_id", user.id);

      if (error) throw error;

      await loadData();
      setMsg(
        online
          ? "Jornada iniciada. Ya estás en línea."
          : "Jornada cerrada. Ya quedaste fuera de línea."
      );
    } catch (err) {
      console.error(err);
      setMsg("No se pudo actualizar tu estado.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleUseMyLocationForVisit = async () => {
    try {
      setMsg("");
      const coords = await getCurrentLocation();
      setVisitForm((prev) => ({
        ...prev,
        lat: String(coords.lat),
        lng: String(coords.lng),
      }));
      setMsg("Ubicación cargada correctamente.");
    } catch (err) {
      console.error(err);
      setMsg("No se pudo obtener tu ubicación actual.");
    }
  };

  const handleSaveVisit = async (e) => {
    e.preventDefault();

    if (!user || !coordinador) return;

    try {
      setSavingVisit(true);
      setMsg("");

      if (!visitForm.nombre_visitado.trim()) {
        setMsg("Debes cargar el nombre de la visita.");
        setSavingVisit(false);
        return;
      }

      const payload = {
        coordinador_id: user.id,
        coordinador_nombre: coordinador.nombre || user.name,
        concejal: coordinador.concejal || "",
        nombre_visitado: visitForm.nombre_visitado.trim(),
        ci: visitForm.ci.trim(),
        telefono: visitForm.telefono.trim(),
        direccion: visitForm.direccion.trim(),
        barrio: visitForm.barrio.trim(),
        observacion: visitForm.observacion.trim(),
        estado_visita: visitForm.estado_visita,
        lat: toNumberOrNull(visitForm.lat),
        lng: toNumberOrNull(visitForm.lng),
      };

      const { error } = await supabase.from("coordinador_visitas").insert(payload);
      if (error) throw error;

      if (payload.lat !== null && payload.lng !== null) {
        await supabase
          .from("coordinadores")
          .update({
            lat: payload.lat,
            lng: payload.lng,
            online: true,
            estado: "Activo",
          })
          .eq("private_user_id", user.id);
      }

      setVisitForm({
        nombre_visitado: "",
        ci: "",
        telefono: "",
        direccion: "",
        barrio: "",
        observacion: "",
        estado_visita: "Visitado",
        lat: "",
        lng: "",
      });

      await loadData();
      setMsg("Visita registrada correctamente.");
    } catch (err) {
      console.error(err);
      setMsg("No se pudo guardar la visita.");
    } finally {
      setSavingVisit(false);
    }
  };

  const resolveRecipient = () => {
    if (messageToRole === "central") {
      return {
        to_role: "central",
        to_user_id: null,
        to_name: "PC Central",
      };
    }

    if (messageToRole === "concejal") {
      const found = concejales.find((x) => String(x.id) === String(messageToUserId));
      if (!found) return null;

      return {
        to_role: "concejal",
        to_user_id: found.id,
        to_name: found.name,
      };
    }

    if (messageToRole === "coordinador") {
      const found = otrosCoordinadores.find(
        (x) => String(x.private_user_id) === String(messageToUserId)
      );
      if (!found) return null;

      return {
        to_role: "coordinador",
        to_user_id: found.private_user_id,
        to_name: found.nombre,
      };
    }

    return null;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    try {
      setSendingMessage(true);
      setMsg("");

      if (!messageText.trim()) {
        setMsg("Escribí un mensaje.");
        setSendingMessage(false);
        return;
      }

      const recipient = resolveRecipient();
      if (!recipient) {
        setMsg("Seleccioná a quién enviar el mensaje.");
        setSendingMessage(false);
        return;
      }

      const payload = {
        from_id: user.id,
        from_name: coordinador?.nombre || user.name || "Coordinador",
        from_role: "coordinador",
        to_role: recipient.to_role,
        to_user_id: recipient.to_user_id,
        to_name: recipient.to_name,
        message: messageText.trim(),
      };

      const { error } = await supabase.from("mensajes_privados").insert(payload);
      if (error) throw error;

      setMessageText("");
      setMessageToName(recipient.to_name);
      await loadData();
      setMsg(`Mensaje enviado a ${recipient.to_name}.`);
    } catch (err) {
      console.error(err);
      setMsg("No se pudo enviar el mensaje.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Bitácora del Coordinador", 14, 16);

      doc.setFontSize(10);
      doc.text(`Coordinador: ${currentName}`, 14, 24);
      doc.text(`Concejal: ${coordinador?.concejal || "-"}`, 14, 30);
      doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 36);

      autoTable(doc, {
        startY: 44,
        head: [[
          "Nombre",
          "C.I.",
          "Teléfono",
          "Dirección",
          "Barrio",
          "Estado",
          "Observación",
          "Fecha",
        ]],
        body: visitas.map((v) => [
          v.nombre_visitado || "-",
          v.ci || "-",
          v.telefono || "-",
          v.direccion || "-",
          v.barrio || "-",
          v.estado_visita || "-",
          v.observacion || "-",
          v.created_at ? new Date(v.created_at).toLocaleString() : "-",
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [20, 20, 20],
        },
      });

      doc.save(`bitacora_${(currentName || "coordinador").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error(err);
      setMsg("No se pudo descargar el PDF.");
    }
  };

  const handleShareWhatsApp = () => {
    try {
      const header = [
        `*Bitácora del Coordinador*`,
        `Coordinador: ${currentName}`,
        `Concejal: ${coordinador?.concejal || "-"}`,
        `Fecha: ${new Date().toLocaleString()}`,
        "",
      ];

      const lines = visitas.length
        ? visitas.map((v, index) =>
            [
              `*${index + 1}. ${v.nombre_visitado || "-" }*`,
              `CI: ${v.ci || "-"}`,
              `Tel: ${v.telefono || "-"}`,
              `Dirección: ${v.direccion || "-"}`,
              `Barrio: ${v.barrio || "-"}`,
              `Estado: ${v.estado_visita || "-"}`,
              `Obs: ${v.observacion || "-"}`,
              `Fecha: ${v.created_at ? new Date(v.created_at).toLocaleString() : "-"}`,
              "",
            ].join("\n")
          )
        : ["Todavía no hay visitas registradas."];

      const text = [...header, ...lines].join("\n");
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      setMsg("No se pudo compartir por WhatsApp.");
    }
  };

  const currentName = coordinador?.nombre || user?.name || "Coordinador";
  const isOnline = !!coordinador?.online;

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
                Gestión de zona
              </p>
              <h1 className="text-2xl font-black tracking-[0.12em]">
                PANEL <span className="text-cyan-400">COORDINADOR</span>
              </h1>
              <p className="text-sm text-white/55">
                {currentName} • interfaz ágil, tecnológica y fácil de usar
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Badge online={isOnline} />

            <button
              onClick={() => updateMyStatus({ online: true, updateLocation: true })}
              disabled={savingStatus}
              className="px-4 py-2 rounded-full bg-green-500 text-black font-black disabled:opacity-60"
            >
              {savingStatus ? "PROCESANDO..." : "INICIAR JORNADA"}
            </button>

            <button
              onClick={() => updateMyStatus({ online: false, updateLocation: false })}
              disabled={savingStatus}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 font-bold disabled:opacity-60"
            >
              SALIR DE LÍNEA
            </button>

            <button
              onClick={() => setMessageModalOpen(true)}
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-black"
            >
              MENSAJERÍA
            </button>

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
            Cargando panel del coordinador...
          </div>
        ) : (
          <>
            {msg ? (
              <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
                {msg}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card title="Visitas" value={stats.total} subtitle="Total registradas" />
              <Card title="Visitados" value={stats.visitados} subtitle="Confirmados" />
              <Card title="Pendientes" value={stats.pendiente} subtitle="Aún por cerrar" />
              <Card title="Interesados" value={stats.interesado} subtitle="Con potencial" />
            </div>
          </>
        )}
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="rounded-[30px] border border-cyan-500/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-black">Registrar visita</h2>
          <p className="text-sm text-white/55 mt-1">
            Cargá cada recorrido, visita, nombre, cédula y observación del día.
          </p>

          <form onSubmit={handleSaveVisit} className="mt-5 space-y-4">
            <Input
              placeholder="Nombre del visitado"
              value={visitForm.nombre_visitado}
              onChange={(e) =>
                setVisitForm({ ...visitForm, nombre_visitado: e.target.value })
              }
            />

            <Input
              placeholder="Cédula"
              value={visitForm.ci}
              onChange={(e) => setVisitForm({ ...visitForm, ci: e.target.value })}
            />

            <Input
              placeholder="Teléfono"
              value={visitForm.telefono}
              onChange={(e) => setVisitForm({ ...visitForm, telefono: e.target.value })}
            />

            <Input
              placeholder="Dirección"
              value={visitForm.direccion}
              onChange={(e) => setVisitForm({ ...visitForm, direccion: e.target.value })}
            />

            <Input
              placeholder="Barrio / zona"
              value={visitForm.barrio}
              onChange={(e) => setVisitForm({ ...visitForm, barrio: e.target.value })}
            />

            <Select
              value={visitForm.estado_visita}
              onChange={(e) =>
                setVisitForm({ ...visitForm, estado_visita: e.target.value })
              }
            >
              <option value="Visitado">Visitado</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Interesado">Interesado</option>
              <option value="No encontrado">No encontrado</option>
              <option value="Reagendar">Reagendar</option>
            </Select>

            <textarea
              placeholder="Observación"
              value={visitForm.observacion}
              onChange={(e) =>
                setVisitForm({ ...visitForm, observacion: e.target.value })
              }
              className="w-full min-h-[110px] p-3 rounded-2xl bg-black/50 border border-white/10 text-white outline-none focus:border-cyan-400/40"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="Lat"
                value={visitForm.lat}
                onChange={(e) => setVisitForm({ ...visitForm, lat: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Lng"
                value={visitForm.lng}
                onChange={(e) => setVisitForm({ ...visitForm, lng: e.target.value })}
              />
            </div>

            <button
              type="button"
              onClick={handleUseMyLocationForVisit}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 font-bold"
            >
              USAR MI UBICACIÓN ACTUAL
            </button>

            <button
              type="submit"
              disabled={savingVisit}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black transition disabled:opacity-60"
            >
              {savingVisit ? "GUARDANDO..." : "GUARDAR VISITA"}
            </button>
          </form>
        </div>

        <div className="rounded-[30px] overflow-hidden border border-cyan-500/10 bg-white/[0.04]">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Mapa y recorrido</h2>
              <p className="text-sm text-white/55">
                Tu posición, tus visitas y el trazado de tu recorrido del día
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

                {isValidCoord(coordinador?.lat) && isValidCoord(coordinador?.lng) ? (
                  <>
                    <Circle
                      center={[coordinador.lat, coordinador.lng]}
                      radius={700}
                      pathOptions={{
                        color: "#22c55e",
                        fillColor: "#22c55e",
                        fillOpacity: 0.08,
                        weight: 1.5,
                      }}
                    />
                    <Marker
                      position={[coordinador.lat, coordinador.lng]}
                      icon={coordIcon}
                    >
                      <Popup>
                        <div className="min-w-[180px] text-black">
                          <b>{currentName}</b>
                          <br />
                          Concejal: {coordinador?.concejal || "-"}
                          <br />
                          Zona: {coordinador?.zona || "-"}
                          <br />
                          Estado: {coordinador?.estado || "-"}
                          <br />
                          Online: {coordinador?.online ? "Sí" : "No"}
                        </div>
                      </Popup>
                    </Marker>
                  </>
                ) : null}

                {recorrido.length >= 2 ? (
                  <Polyline positions={recorrido} pathOptions={{ color: "#22d3ee", weight: 4 }} />
                ) : null}

                {visitas
                  .filter((v) => isValidCoord(v.lat) && isValidCoord(v.lng))
                  .map((v) => (
                    <Marker
                      key={v.id}
                      position={[v.lat, v.lng]}
                      icon={visitIcon}
                    >
                      <Popup>
                        <div className="min-w-[200px] text-black">
                          <b>{v.nombre_visitado}</b>
                          <br />
                          C.I.: {v.ci || "-"}
                          <br />
                          Tel: {v.telefono || "-"}
                          <br />
                          Dirección: {v.direccion || "-"}
                          <br />
                          Barrio: {v.barrio || "-"}
                          <br />
                          Estado: {v.estado_visita || "-"}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        <div className="rounded-[30px] border border-cyan-500/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-black">Bitácora de visitas</h2>
              <p className="text-sm text-white/55 mt-1">
                Historial de nombres, cédulas, observaciones y estados
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleDownloadPdf}
                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 font-bold"
              >
                DESCARGAR PDF
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="px-4 py-2 rounded-2xl bg-green-500 text-black font-black"
              >
                COMPARTIR WHATSAPP
              </button>

              <button
                onClick={() => setMessageModalOpen(true)}
                className="px-4 py-2 rounded-2xl bg-cyan-500 text-black font-black"
              >
                ABRIR MENSAJERÍA
              </button>
            </div>
          </div>

          {visitas.length === 0 ? (
            <div className="mt-5 text-white/60">Todavía no cargaste visitas.</div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 overflow-x-auto">
              <table className="w-full text-sm min-w-[980px]">
                <thead className="bg-white/[0.04] text-white/55">
                  <tr>
                    <th className="text-left p-4">Nombre</th>
                    <th className="text-left p-4">C.I.</th>
                    <th className="text-left p-4">Teléfono</th>
                    <th className="text-left p-4">Dirección</th>
                    <th className="text-left p-4">Barrio</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Observación</th>
                    <th className="text-left p-4">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {visitas.map((v) => (
                    <tr key={v.id} className="border-t border-white/10">
                      <td className="p-4">{v.nombre_visitado || "-"}</td>
                      <td className="p-4">{v.ci || "-"}</td>
                      <td className="p-4">{v.telefono || "-"}</td>
                      <td className="p-4">{v.direccion || "-"}</td>
                      <td className="p-4">{v.barrio || "-"}</td>
                      <td className="p-4">{v.estado_visita || "-"}</td>
                      <td className="p-4">{v.observacion || "-"}</td>
                      <td className="p-4">
                        {v.created_at ? new Date(v.created_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {messageModalOpen ? (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-[30px] border border-cyan-500/15 bg-[#080808] shadow-[0_0_40px_rgba(0,255,255,0.08)] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.20em] text-cyan-300/70">
                  Comunicación interna
                </p>
                <h3 className="text-xl font-black mt-1">Mensajería</h3>
              </div>

              <button
                onClick={() => setMessageModalOpen(false)}
                className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
              <div className="border-r border-white/10 p-5">
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
                      Destino
                    </label>
                    <Select
                      value={messageToRole}
                      onChange={(e) => {
                        setMessageToRole(e.target.value);
                        setMessageToUserId("");
                        setMessageToName("");
                      }}
                    >
                      <option value="central">PC Central</option>
                      <option value="concejal">Concejal</option>
                      <option value="coordinador">Otro coordinador</option>
                    </Select>
                  </div>

                  {messageToRole === "concejal" ? (
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
                        Elegir concejal
                      </label>
                      <Select
                        value={messageToUserId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMessageToUserId(value);
                          const found = concejales.find(
                            (x) => String(x.id) === String(value)
                          );
                          setMessageToName(found?.name || "");
                        }}
                      >
                        <option value="">Seleccionar</option>
                        {concejales.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null}

                  {messageToRole === "coordinador" ? (
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
                        Elegir coordinador
                      </label>
                      <Select
                        value={messageToUserId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setMessageToUserId(value);
                          const found = otrosCoordinadores.find(
                            (x) => String(x.private_user_id) === String(value)
                          );
                          setMessageToName(found?.nombre || "");
                        }}
                      >
                        <option value="">Seleccionar</option>
                        {otrosCoordinadores.map((c) => (
                          <option key={c.private_user_id} value={c.private_user_id}>
                            {c.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null}

                  <div>
                    <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Escribí tu mensaje..."
                      className="w-full min-h-[150px] p-3 rounded-2xl bg-black/50 border border-white/10 text-white outline-none focus:border-cyan-400/40"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black transition disabled:opacity-60"
                  >
                    {sendingMessage ? "ENVIANDO..." : "ENVIAR MENSAJE"}
                  </button>
                </form>
              </div>

              <div className="p-5">
                <h4 className="text-lg font-black">Mensajes recientes</h4>
                <p className="text-sm text-white/55 mt-1">
                  Conversaciones con central, concejales y otros coordinadores
                </p>

                <div className="mt-4 space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-white/60">
                      Todavía no hay mensajes.
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-bold text-white">
                              {m.from_name || "Sin remitente"}
                            </p>
                            <p className="text-xs text-white/45 uppercase">
                              {m.from_role || "-"} → {m.to_name || m.to_role || "-"}
                            </p>
                          </div>
                          <p className="text-xs text-white/40">
                            {m.created_at
                              ? new Date(m.created_at).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                        <p className="mt-3 text-sm text-white/80 whitespace-pre-wrap">
                          {m.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}