import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
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

function Card({ title, value, subtitle }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_20px_rgba(0,255,255,0.04)]">
      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{title}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
      <p className="mt-1 text-xs text-white/45">{subtitle}</p>
    </div>
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

function isValidCoord(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeCoords(list = []) {
  return list
    .map((item) => ({
      ...item,
      lat: typeof item?.lat === "string" ? Number(item.lat) : item?.lat,
      lng: typeof item?.lng === "string" ? Number(item.lng) : item?.lng,
    }))
    .filter((item) => isValidCoord(item?.lat) && isValidCoord(item?.lng));
}

function slugifyUsername(text = "") {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

function buildAutoPoint(index = 0) {
  const row = Math.floor(index / 4);
  const col = index % 4;

  return {
    lat: fallbackCenter[0] + row * 0.0022,
    lng: fallbackCenter[1] + col * 0.0022,
  };
}

export default function ConcejalPanel() {
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem("jaha_private_user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [coordinadores, setCoordinadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messageToRole, setMessageToRole] = useState("central");
  const [messageToUserId, setMessageToUserId] = useState("");

  const [otrosConcejales, setOtrosConcejales] = useState([]);
  const [misCoordinadores, setMisCoordinadores] = useState([]);

  const [form, setForm] = useState({
    nombre: "",
    zona: "",
    telefono: "",
    estado: "Activo",
    online: false,
    username: "",
    password: "",
  });

  useEffect(() => {
    if (!user || user.role !== "concejal") {
      navigate("/concejal-login", { replace: true });
    }
  }, [navigate, user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setMsg("");

      const { data, error } = await supabase
        .from("coordinadores")
        .select("*")
        .eq("concejal", user.name)
        .order("id", { ascending: true });

      if (error) throw error;

      setCoordinadores(data || []);
      setMisCoordinadores(data || []);

      const { data: concejalesData } = await supabase
        .from("private_users")
        .select("id, name, role, active")
        .eq("role", "concejal")
        .eq("active", true)
        .neq("id", user.id)
        .order("name", { ascending: true });

      setOtrosConcejales(concejalesData || []);

      const { data: messagesData } = await supabase
        .from("mensajes_privados")
        .select("*")
        .or(`from_id.eq.${user.id},to_user_id.eq.${user.id},to_role.eq.central,to_role.eq.concejal_general`)
        .order("created_at", { ascending: false })
        .limit(30);

      setMessages(messagesData || []);
    } catch (err) {
      console.error("Error cargando concejal panel:", err);
      setMsg("No se pudieron cargar los datos del concejal.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const coordinadoresMap = useMemo(
    () => normalizeCoords(coordinadores),
    [coordinadores]
  );

  const activos = useMemo(
    () => coordinadores.filter((c) => c.estado === "Activo").length,
    [coordinadores]
  );

  const online = useMemo(
    () => coordinadores.filter((c) => !!c.online).length,
    [coordinadores]
  );

  const center = useMemo(() => {
    if (!coordinadoresMap.length) return fallbackCenter;
    return [coordinadoresMap[0].lat, coordinadoresMap[0].lng];
  }, [coordinadoresMap]);

  const handleLogout = () => {
    localStorage.removeItem("jaha_private_user");
    localStorage.removeItem("jaha_user");
    sessionStorage.clear();
    navigate("/concejal-login", { replace: true });
  };

  const reloadCoordinadores = async () => {
    const { data, error } = await supabase
      .from("coordinadores")
      .select("*")
      .eq("concejal", user.name)
      .order("id", { ascending: true });

    if (error) throw error;
    setCoordinadores(data || []);
    setMisCoordinadores(data || []);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    let insertedCoordinadorId = null;

    try {
      const nombre = form.nombre.trim();
      const zona = form.zona.trim();
      const telefono = form.telefono.trim();
      const username =
        form.username.trim() || `coord_${slugifyUsername(nombre)}`;
      const password =
        form.password.trim() || `CJ${Math.floor(100000 + Math.random() * 900000)}`;

      if (!nombre) {
        setMsg("El nombre del coordinador es obligatorio.");
        setSaving(false);
        return;
      }

      const autoPoint = buildAutoPoint(coordinadores.length);

      const payload = {
        nombre,
        zona,
        telefono,
        concejal: user.name,
        estado: form.estado,
        online: form.online,
        lat: autoPoint.lat,
        lng: autoPoint.lng,
      };

      const { data: insertedCoord, error: coordError } = await supabase
        .from("coordinadores")
        .insert(payload)
        .select()
        .single();

      if (coordError) throw coordError;

      insertedCoordinadorId = insertedCoord.id;

      const privateUserPayload = {
        username,
        password,
        role: "coordinador",
        name: nombre,
        active: true,
      };

      const { error: privateUserError } = await supabase
        .from("private_users")
        .insert(privateUserPayload);

      if (privateUserError) {
        await supabase.from("coordinadores").delete().eq("id", insertedCoordinadorId);
        throw privateUserError;
      }

      setForm({
        nombre: "",
        zona: "",
        telefono: "",
        estado: "Activo",
        online: false,
        username: "",
        password: "",
      });

      await reloadCoordinadores();
      setMsg(`Coordinador creado correctamente. Usuario: ${username} | Contraseña: ${password}`);
    } catch (err) {
      console.error("Error creando coordinador:", err);
      setMsg("No se pudo crear el coordinador.");
    } finally {
      setSaving(false);
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

    if (messageToRole === "coordinador") {
      const found = misCoordinadores.find((x) => String(x.id) === String(messageToUserId));
      if (!found) return null;

      return {
        to_role: "coordinador",
        to_user_id: found.id,
        to_name: found.nombre,
      };
    }

    if (messageToRole === "concejal") {
      const found = otrosConcejales.find((x) => String(x.id) === String(messageToUserId));
      if (!found) return null;

      return {
        to_role: "concejal",
        to_user_id: found.id,
        to_name: found.name,
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
        setMsg("Seleccioná un destinatario.");
        setSendingMessage(false);
        return;
      }

      const payload = {
        from_id: user.id,
        from_name: user.name,
        from_role: "concejal",
        to_role: recipient.to_role,
        to_user_id: recipient.to_user_id,
        to_name: recipient.to_name,
        message: messageText.trim(),
      };

      const { error } = await supabase.from("mensajes_privados").insert(payload);
      if (error) throw error;

      setMessageText("");
      setMessageToUserId("");
      await loadData();
      setMsg(`Mensaje enviado a ${recipient.to_name}.`);
    } catch (err) {
      console.error("Error enviando mensaje:", err);
      setMsg("No se pudo enviar el mensaje.");
    } finally {
      setSendingMessage(false);
    }
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
                Gestión territorial
              </p>
              <h1 className="text-2xl font-black tracking-[0.12em]">
                PANEL <span className="text-cyan-400">CONCEJAL</span>
              </h1>
              <p className="text-sm text-white/55">
                {user?.name || "Concejal"} • control de coordinadores y comunicación
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/concejal"
              className="px-4 py-2 rounded-full bg-cyan-500 text-black font-black"
            >
              Inicio
            </Link>

            <button
              onClick={() => setMessageModalOpen(true)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              Mensajería
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
            Cargando panel del concejal...
          </div>
        ) : (
          <>
            {msg ? (
              <div className="mb-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
                {msg}
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                title="Mis coordinadores"
                value={coordinadores.length}
                subtitle="Total asignados"
              />
              <Card
                title="Activos"
                value={activos}
                subtitle="Estado activo"
              />
              <Card
                title="Online"
                value={online}
                subtitle="En tiempo real"
              />
            </div>
          </>
        )}
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <div className="rounded-[30px] border border-cyan-500/10 bg-white/[0.04] p-5">
          <h2 className="text-xl font-black">Crear coordinador</h2>
          <p className="text-sm text-white/55 mt-1">
            Este coordinador quedará vinculado automáticamente a tu concejalía.
          </p>

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <input
              type="text"
              placeholder="Nombre completo"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 outline-none focus:border-cyan-400/40"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            <input
              type="text"
              placeholder="Zona"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 outline-none focus:border-cyan-400/40"
              value={form.zona}
              onChange={(e) => setForm({ ...form, zona: e.target.value })}
            />

            <input
              type="text"
              placeholder="Teléfono"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 outline-none focus:border-cyan-400/40"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />

            <input
              type="text"
              placeholder="Usuario coordinador"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 outline-none focus:border-cyan-400/40"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <input
              type="text"
              placeholder="Contraseña coordinador"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 outline-none focus:border-cyan-400/40"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <select
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 outline-none focus:border-cyan-400/40"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="Activo">Activo</option>
              <option value="Pausa">Pausa</option>
              <option value="Inactivo">Inactivo</option>
            </select>

            <label className="flex items-center gap-3 text-sm text-white/75">
              <input
                type="checkbox"
                checked={form.online}
                onChange={(e) => setForm({ ...form, online: e.target.checked })}
              />
              Marcar como online
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black transition disabled:opacity-60"
            >
              {saving ? "GUARDANDO..." : "CREAR COORDINADOR"}
            </button>
          </form>
        </div>

        <div className="rounded-[30px] overflow-hidden border border-cyan-500/10 bg-white/[0.04]">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black">Mapa de mis coordinadores</h2>
              <p className="text-sm text-white/55">
                Visualización de los coordinadores asignados a tu concejalía
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

                {coordinadoresMap.map((c) => (
                  <Marker key={c.id} position={[c.lat, c.lng]} icon={coordIcon}>
                    <Popup>
                      <div className="min-w-[180px] text-black">
                        <b>{c.nombre}</b>
                        <br />
                        Zona: {c.zona || "-"}
                        <br />
                        Tel: {c.telefono || "-"}
                        <br />
                        Estado: {c.estado || "-"}
                        <br />
                        Online: {c.online ? "Sí" : "No"}
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
              <h2 className="text-xl font-black">Mis coordinadores</h2>
              <p className="text-sm text-white/55 mt-1">
                Solo ves los coordinadores asignados a tu nombre.
              </p>
            </div>

            <button
              onClick={() => setMessageModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-cyan-500 text-black font-black"
            >
              ABRIR MENSAJERÍA
            </button>
          </div>

          {loading ? (
            <div className="mt-5 text-cyan-300">Cargando coordinadores...</div>
          ) : coordinadores.length === 0 ? (
            <div className="mt-5 text-white/60">Todavía no cargaste coordinadores.</div>
          ) : (
            <div className="mt-5 overflow-hidden rounded-3xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.04] text-white/55">
                  <tr>
                    <th className="text-left p-4">Nombre</th>
                    <th className="text-left p-4">Zona</th>
                    <th className="text-left p-4">Teléfono</th>
                    <th className="text-left p-4">Estado</th>
                    <th className="text-left p-4">Online</th>
                  </tr>
                </thead>
                <tbody>
                  {coordinadores.map((c) => (
                    <tr key={c.id} className="border-t border-white/10">
                      <td className="p-4">{c.nombre}</td>
                      <td className="p-4">{c.zona || "-"}</td>
                      <td className="p-4">{c.telefono || "-"}</td>
                      <td className="p-4">{c.estado || "-"}</td>
                      <td className="p-4">{c.online ? "Sí" : "No"}</td>
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
                <h3 className="text-xl font-black mt-1">Mensajería concejal</h3>
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
                      }}
                    >
                      <option value="central">PC Central</option>
                      <option value="coordinador">Mi coordinador</option>
                      <option value="concejal">Otro concejal</option>
                    </Select>
                  </div>

                  {messageToRole === "coordinador" ? (
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
                        Elegir coordinador
                      </label>
                      <Select
                        value={messageToUserId}
                        onChange={(e) => setMessageToUserId(e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        {misCoordinadores.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </Select>
                    </div>
                  ) : null}

                  {messageToRole === "concejal" ? (
                    <div>
                      <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
                        Elegir concejal
                      </label>
                      <Select
                        value={messageToUserId}
                        onChange={(e) => setMessageToUserId(e.target.value)}
                      >
                        <option value="">Seleccionar</option>
                        {otrosConcejales.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
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
                  Conversaciones con central, coordinadores y otros concejales
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