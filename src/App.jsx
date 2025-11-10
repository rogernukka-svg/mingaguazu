import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { jsPDF } from "jspdf";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

/* === Usuarios iniciales === */
const INITIAL_USERS = [
  { id: 1, name: "Coordinador de Barrio", username: "coordinador", password: "1234", role: "normal", active: true },
  { id: 2, name: "Súper Administrador", username: "admin", password: "2041", role: "admin", active: true },
  { id: 3, name: "Administrador General", username: "general", password: "2045", role: "general", active: true },
];

/* === Formulario base === */
const EMPTY_FORM = {
  fullName: "",
  phone: "",
  cedula: "",
  ocupacion: "",
  barrio: "",
  lugarVotacion: "",
  afiliacion: "No afiliado",
  etapa: "Etapa 1",
  estadoVoto: "Estambay",
  contacto: "Contacto",
};

/* === Centrar mapa dinámicamente === */
function ChangeView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 14);
  }, [coords, map]);
  return null;
}

/* === MODAL INTELIGENTE === */
function BarrioModal({ barrio, datos, onClose }) {
  const porcentaje = datos.porcentaje;
  const participacion = datos.participacion;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-neutral-900 border border-red-700/40 rounded-2xl p-6 w-[90%] max-w-md text-gray-100 shadow-[0_0_25px_rgba(255,0,0,0.3)]">
        <h2 className="text-xl font-bold text-red-500 mb-2">🏘️ {barrio}</h2>

        <p className="text-sm text-gray-400 mb-1">
          Votantes registrados: <b>{datos.total}</b>
        </p>
        <p className="text-sm text-gray-400 mb-4">
          Participación estimada: <b>{participacion}%</b>
        </p>

        <div className="flex justify-center items-center mb-4">
          <div
            className="relative w-32 h-32 rounded-full"
            style={{
              background: `conic-gradient(#ef4444 ${porcentaje}%, #222 ${porcentaje}% 100%)`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
              {porcentaje}%
            </span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-300">
          📊 <b>{datos.mensaje}</b>
        </p>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}

/* === LOGIN === */
function LoginScreen({ users, setUsers, onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("normal");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("jaha_user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      onLogin(parsed);
    }
  }, [onLogin]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      (u) =>
        u.username === username.trim() && u.password === password.trim()
    );
    if (!user) return setError("Usuario o contraseña incorrectos.");
    if (!user.active) return setError("Este usuario está desactivado.");
    setError("");
    setSuccess("");
    localStorage.setItem("jaha_user", JSON.stringify(user));
    onLogin(user);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!username || !password || !name)
      return setError("Completa todos los campos.");
    if (users.some((u) => u.username === username))
      return setError("Ese usuario ya existe.");

    const newUser = {
      id: Date.now(),
      name,
      username,
      password,
      role,
      active: true,
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem("jaha_users", JSON.stringify(updatedUsers));
    setSuccess("✅ Usuario registrado correctamente.");
    setError("");
    setName("");
    setUsername("");
    setPassword("");
    setMode("login");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-gray-100 flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold mb-2 text-red-500">
          Sistema de Registro de Votantes
        </h1>
        <p className="text-gray-300 text-sm">
          Plataforma moderna para registrar y visualizar datos de Minga Guazú.
        </p>
      </div>

      <div className="w-full max-w-md bg-neutral-900/90 border border-red-700/40 rounded-2xl p-6">
        {mode === "login" ? (
          <>
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              Iniciar sesión
            </h2>
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-3 text-sm">
              <input
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2"
              >
                Entrar
              </button>
            </form>
            <p
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className="mt-3 text-xs text-red-400 hover:text-red-300 cursor-pointer text-center"
            >
              ¿Nuevo? Crea una cuenta
            </p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4 text-gray-100">
              Crear cuenta
            </h2>
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            {success && <p className="text-xs text-green-400 mb-3">{success}</p>}
            <form onSubmit={handleRegister} className="space-y-3 text-sm">
              <input
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              />
              <input
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
              />
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2"
              >
                Crear cuenta
              </button>
            </form>
            <p
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className="mt-3 text-xs text-red-400 hover:text-red-300 cursor-pointer text-center"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </p>
          </>
        )}
      </div>
    </main>
  );
}

/* Helper: color según porcentaje */
function getPinColorClasses(porcentaje) {
  if (porcentaje >= 71) {
    return "bg-green-500 border-green-400 text-black";
  }
  if (porcentaje >= 41) {
    return "bg-yellow-300 border-yellow-400 text-black";
  }
  return "bg-red-600 border-red-500 text-white";
}

/* === PANEL NORMAL (COORDINADORES) === */
function NormalUserPanel({ currentUser, voters, setVoters, users }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [barrioModal, setBarrioModal] = useState(null);

  const MINGA_CENTER = [-25.508, -54.763];

  /* 12 puntos para los 12 equipos/coordinadores */
  const barrios = [
    { name: "Km 10 Acaray", coords: [-25.475, -54.746] },
    { name: "Km 12 Monday", coords: [-25.486, -54.754] },
    { name: "Km 14 Monday", coords: [-25.497, -54.762] },
    { name: "Km 16 Monday", coords: [-25.507, -54.771] },
    { name: "Km 18", coords: [-25.518, -54.784] },
    { name: "San Antonio", coords: [-25.495, -54.750] },
    { name: "San Blas", coords: [-25.490, -54.757] },
    { name: "Don Bosco", coords: [-25.481, -54.744] },
    { name: "Jardín del Este", coords: [-25.499, -54.767] },
    { name: "Villa 23", coords: [-25.512, -54.776] },
    { name: "Las Carmelitas", coords: [-25.504, -54.753] },
    { name: "San Roque", coords: [-25.493, -54.761] },
  ];

  const todayStr = new Date().toLocaleDateString();

  /* === Ranking de coordinadores (competencia sana) === */
  const coordinadoresStats = users
    .filter((u) => u.role === "normal")
    .map((u) => {
      const total = voters.filter((v) => v.createdById === u.id).length;
      const hoy = voters.filter(
        (v) => v.createdById === u.id && v.date === todayStr
      ).length;
      return { ...u, total, hoy };
    })
    .sort((a, b) => b.total - a.total);

  const totalCoordinadores = coordinadoresStats.length;
  const maxTotalCoord =
    totalCoordinadores > 0
      ? Math.max(...coordinadoresStats.map((c) => c.total))
      : 0;

  const myEntryIndex = coordinadoresStats.findIndex(
    (c) => c.id === currentUser.id
  );
  const myPosition = myEntryIndex !== -1 ? myEntryIndex + 1 : null;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.barrio || !form.lugarVotacion)
      return alert("Completa los campos obligatorios.");
    const newVoter = {
      id: Date.now(),
      ...form,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      date: todayStr,
    };
    setVoters((prev) => [newVoter, ...prev]);
    setForm(EMPTY_FORM);
  };

  const toggleEstadoVoto = (id) => {
    setVoters((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              estadoVoto: v.estadoVoto === "Votó" ? "Estambay" : "Votó",
              etapa: "Etapa 2",
            }
          : v
      )
    );
  };

  const exportTxt = (lista) => {
    const text = lista
      .map(
        (v, i) =>
          `${i + 1}. ${v.fullName} | ${v.barrio} | ${v.afiliacion} | ${v.etapa} | ${v.estadoVoto}`
      )
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reporte_votantes.txt";
    link.click();
  };

  /* === Datos reales por barrio para el modal (no random) === */
  const calcularDatos = (barrio) => {
    const total = voters.filter((v) => v.barrio === barrio).length;

    const totalesPorBarrio = barrios.map(
      (b) => voters.filter((v) => v.barrio === b.name).length
    );
    const maxTotal = Math.max(1, ...totalesPorBarrio);

    const porcentaje = total === 0 ? 0 : Math.round((total / maxTotal) * 100);
    const participacion = Math.min(100, porcentaje + 30);

    let mensaje =
      porcentaje > 75
        ? "Alta probabilidad de apoyo"
        : porcentaje > 50
        ? "Tendencia positiva"
        : total === 0
        ? "Zona aún sin trabajo, prioridad para visitar"
        : "Requiere más trabajo territorial";

    return { total, porcentaje, participacion, mensaje };
  };

  const exportPDF = (lista) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("📋 Registro de Votantes - JAHA 2041", 10, 15);
    doc.setFontSize(11);
    let y = 30;
    lista.forEach((v, i) => {
      doc.text(
        `${i + 1}. ${v.fullName} — ${v.cedula || "Sin CI"} — ${
          v.phone || "Sin teléfono"
        } — ${v.barrio} — ${v.afiliacion} — ${v.etapa} — ${v.estadoVoto}`,
        10,
        y
      );
      y += 7;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
    doc.save("registro_votantes.pdf");
  };

  const filteredVoters = voters.filter(
    (v) =>
      v.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.cedula || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.phone || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.barrio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const shareWhatsApp = (text) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const reporteDiario = () => {
    const totalHoy = voters.filter((v) => v.date === todayStr).length;
    const textoPosicion =
      myPosition && totalCoordinadores > 0
        ? `\n🏆 Posición: #${myPosition} de ${totalCoordinadores} coordinadores`
        : "";
    return `📅 Reporte Diario JAHA 2041
👤 Usuario: ${currentUser.name}
📍 Total registrados hoy: ${totalHoy}
✅ Total general: ${voters.length}${textoPosicion}`;
  };

  return (
    <main className="bg-black min-h-screen text-gray-100">
      <section className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {/* === Formulario === */}
        <div className="bg-neutral-900/80 border border-red-700/40 rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-2 text-red-400">Registrar votante</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <input
              name="fullName"
              placeholder="Nombre y Apellido"
              value={form.fullName}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            />
            <input
              name="cedula"
              placeholder="Cédula"
              value={form.cedula}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            />
            <input
              name="phone"
              placeholder="Teléfono o WhatsApp"
              value={form.phone}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            />
            <input
              name="barrio"
              placeholder="Barrio"
              value={form.barrio}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            />
            <input
              name="lugarVotacion"
              placeholder="Lugar de votación"
              value={form.lugarVotacion}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            />

            {/* 🔹 Afiliación */}
            <select
              name="afiliacion"
              value={form.afiliacion}
              onChange={handleChange}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2"
            >
              <option value="Afiliado">Afiliado</option>
              <option value="No afiliado">No afiliado</option>
              <option value="Simpatizante">Simpatizante</option>
            </select>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2"
            >
              Guardar registro
            </button>
          </form>

          {/* === Buscador + PDF + TXT === */}
          <div className="mt-6">
            <h3 className="text-red-400 font-semibold mb-2 text-sm">Buscar votante</h3>
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex justify-between items-center mt-3 gap-2">
              <button
                onClick={() => exportPDF(filteredVoters)}
                className="bg-red-600 hover:bg-red-500 text-black text-xs font-semibold px-3 py-1 rounded-lg shadow"
              >
                📄 PDF
              </button>
              <button
                onClick={() => exportTxt(filteredVoters)}
                className="bg-blue-500 hover:bg-blue-400 text-black text-xs font-semibold px-3 py-1 rounded-lg shadow"
              >
                🖨️ TXT
              </button>
              <p className="text-xs text-gray-400">Resultados: {filteredVoters.length}</p>
            </div>

            {/* === Lista de votantes === */}
            <ul className="mt-3 max-h-[200px] overflow-y-auto text-xs text-gray-300 space-y-1">
              {filteredVoters.length > 0 ? (
                filteredVoters.map((v) => (
                  <li
                    key={v.id}
                    className="border-b border-neutral-800 py-1 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-red-400 font-semibold">{v.fullName}</span> — {v.barrio}
                      <span className="block text-[11px] text-gray-400">
                        {v.afiliacion} | {v.etapa} | {v.estadoVoto}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        Coordinador: {v.createdByName}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleEstadoVoto(v.id)}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                        v.estadoVoto === "Votó"
                          ? "bg-green-500 text-black"
                          : "bg-gray-600 text-white"
                      }`}
                    >
                      {v.estadoVoto === "Votó" ? "✔️ Votó" : "🕓 Estambay"}
                    </button>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-xs italic">
                  No se encontraron resultados.
                </p>
              )}
            </ul>
          </div>

          {/* 🏆 Ranking de coordinadores */}
          {totalCoordinadores > 0 && (
            <div className="mt-6 border-t border-neutral-800 pt-4">
              <h3 className="text-red-400 font-semibold text-sm mb-1">
                🏆 Ranking de coordinadores
              </h3>
              {myPosition && (
                <p className="text-[11px] text-gray-300 mb-2">
                  Tu posición actual: <b>#{myPosition}</b> de {totalCoordinadores} coordinadores.
                </p>
              )}
              <ul className="space-y-2 text-xs">
                {coordinadoresStats.slice(0, 6).map((c, index) => {
                  const isMe = c.id === currentUser.id;
                  const width =
                    maxTotalCoord > 0 ? Math.max(8, (c.total / maxTotalCoord) * 100) : 0;
                  return (
                    <li
                      key={c.id}
                      className={`rounded-lg px-2 py-2 border border-neutral-800 ${
                        isMe ? "bg-red-900/40 border-red-600" : "bg-neutral-900/70"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          #{index + 1} {c.name}
                        </span>
                        <span className="text-[11px] text-gray-300">
                          {c.total} registros
                        </span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2 mt-1 overflow-hidden">
                        <div
                          className={`h-2 ${
                            isMe ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-red-700/70"
                          }`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                      {c.hoy > 0 && (
                        <p className="text-[10px] text-emerald-400 mt-1">
                          +{c.hoy} hoy — buen trabajo en tu zona.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* === Mapa === */}
<div className="bg-neutral-900/80 border border-red-700/40 rounded-2xl overflow-hidden">
  <h3 className="font-semibold mb-2 p-3 text-sm text-red-400">Mapa de Minga Guazú</h3>
  <MapContainer center={MINGA_CENTER} zoom={14} className="h-[400px] rounded-xl z-0">
    <ChangeView coords={MINGA_CENTER} />
    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    {barrios.map((b, index) => {
      const numero = index + 1;

      // Tomamos el coordinador según la posición en el ranking
      const coordData = coordinadoresStats[index];
      const totalCoord = coordData?.total || 0;
      const porcentajeCoord =
        maxTotalCoord > 0 && totalCoord > 0
          ? Math.round((totalCoord / maxTotalCoord) * 100)
          : 0;

      const color =
        porcentajeCoord >= 70
          ? "#22c55e" // verde
          : porcentajeCoord >= 40
          ? "#facc15" // amarillo
          : "#ef4444"; // rojo

      const nombreCorto = coordData
        ? coordData.name.split(" ").slice(0, 2).join(" ")
        : `Equipo ${numero}`;

      // 📍 Emoji animado con efecto de latido (pulse)
      const html = `
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
        <div class="flex flex-col items-center justify-center">
          <div style="
            font-size:22px;
            line-height:1;
            animation:pulse 2s infinite ease-in-out;
            text-shadow:0 0 6px ${color}, 0 0 12px ${color};
          ">
            📍
          </div>
          <div class="mt-0.5 text-[10px] font-semibold text-black bg-white/90 px-2 py-0.5 rounded-md shadow">
            Equipo ${numero}
          </div>
        </div>
      `;

      return (
        <Marker
          key={b.name}
          position={b.coords}
          icon={L.divIcon({
            className: "cursor-pointer",
            html,
          })}
          eventHandlers={{
            click: () =>
              setBarrioModal({
                name: b.name,
                datos: calcularDatos(b.name),
              }),
          }}
        />
      );
    })}
  </MapContainer>
</div>

      </section>

      {/* === Reporte Diario === */}
      <section className="max-w-3xl mx-auto mt-6 bg-neutral-900/80 border border-red-700/40 rounded-2xl p-4 text-center">
        <h3 className="text-red-400 font-semibold mb-2">📅 Reporte Diario</h3>
        <p className="text-sm text-gray-300 whitespace-pre-line">{reporteDiario()}</p>
        <button
          onClick={() => shareWhatsApp(reporteDiario())}
          className="mt-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-lg px-4 py-2 text-sm"
        >
          📤 Enviar por WhatsApp
        </button>
      </section>

      {barrioModal && (
        <BarrioModal
          barrio={barrioModal.name}
          datos={barrioModal.datos}
          onClose={() => setBarrioModal(null)}
        />
      )}
    </main>
  );
}

/* === PANEL ADMIN === */
function AdminGeneralPanel({ voters, users }) {
  return (
    <main className="bg-black text-gray-100 px-4 py-10 min-h-screen">
      <h1 className="text-2xl font-bold text-red-500 mb-4">Panel del Administrador General</h1>
      <h2 className="text-lg text-red-400 mb-2">Usuarios registrados ({users.length})</h2>
      <ul className="text-sm mb-6">
        {users.map((u) => (
          <li key={u.id}>
            <b>{u.name}</b> — {u.username} ({u.role})
          </li>
        ))}
      </ul>
      <h2 className="text-lg text-red-400 mb-2">Todos los votantes ({voters.length})</h2>
      <ul className="text-sm">
        {voters.map((v) => (
          <li key={v.id}>
            {v.fullName} — {v.phone || "Sin teléfono"} — {v.barrio} (
            <span className="text-gray-400">{v.createdByName}</span>)
          </li>
        ))}
      </ul>
    </main>
  );
}

/* === APP PRINCIPAL === */
export default function App() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [voters, setVoters] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("jaha_user");
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jaha_user");
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Navbar currentUser={currentUser} onLogout={handleLogout} />
      {!currentUser ? (
        <LoginScreen users={users} setUsers={setUsers} onLogin={setCurrentUser} />
      ) : currentUser.role === "general" ? (
        <AdminGeneralPanel voters={voters} users={users} />
      ) : (
        <NormalUserPanel
          currentUser={currentUser}
          voters={voters}
          setVoters={setVoters}
          users={users}
        />
      )}
      <Footer />
    </div>
  );
}
