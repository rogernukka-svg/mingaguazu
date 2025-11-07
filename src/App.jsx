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
  afiliacion: "No afiliado",   // 🔹 Nuevo: estado de afiliación
  etapa: "Etapa 1",            // 🔹 Nuevo: etapa del proceso
  estadoVoto: "Estambay",      // 🔹 Nuevo: estado del voto
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
  }, []);

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

/* === PANEL NORMAL === */
function NormalUserPanel({ currentUser, voters, setVoters }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState("");
  const [barrioModal, setBarrioModal] = useState(null);

  const MINGA_CENTER = [-25.508, -54.763];
  const barrios = [
    { name: "Km 10 Acaray", coords: [-25.475, -54.746] },
    { name: "Km 12 Monday", coords: [-25.486, -54.754] },
    { name: "Km 14 Monday", coords: [-25.497, -54.762] },
    { name: "Km 16 Monday", coords: [-25.507, -54.771] },
    { name: "Km 18", coords: [-25.518, -54.784] },
    { name: "San Antonio", coords: [-25.495, -54.750] },
  ];

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
      date: new Date().toLocaleDateString(),
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

  const calcularDatos = (barrio) => {
    const total = voters.filter((v) => v.barrio === barrio).length;
    const porcentaje = Math.min(100, Math.round(Math.random() * 100));
    const participacion = Math.round(50 + Math.random() * 50);
    let mensaje =
      porcentaje > 75
        ? "Alta probabilidad de apoyo"
        : porcentaje > 50
        ? "Tendencia positiva"
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
    const totalHoy = voters.filter(
      (v) => v.date === new Date().toLocaleDateString()
    ).length;
    return `📅 Reporte Diario JAHA 2041\n👤 Usuario: ${currentUser.name}\n📍 Total registrados hoy: ${totalHoy}\n📞 Último teléfono: ${
      voters[0]?.phone || "N/A"
    }\n✅ Total general: ${voters.length}`;
  };

  return (
    <main className="bg-black min-h-screen text-gray-100">
      <section className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        {/* === Formulario === */}
        <div className="bg-neutral-900/80 border border-red-700/40 rounded-2xl p-4">
          <h2 className="text-lg font-semibold mb-2 text-red-400">Registrar votante</h2>
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <input name="fullName" placeholder="Nombre y Apellido" value={form.fullName} onChange={handleChange} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2" />
            <input name="cedula" placeholder="Cédula" value={form.cedula} onChange={handleChange} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2" />
            <input name="phone" placeholder="Teléfono o WhatsApp" value={form.phone} onChange={handleChange} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2" />
            <input name="barrio" placeholder="Barrio" value={form.barrio} onChange={handleChange} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2" />
            <input name="lugarVotacion" placeholder="Lugar de votación" value={form.lugarVotacion} onChange={handleChange} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2" />

            {/* 🔹 Afiliación */}
            <select name="afiliacion" value={form.afiliacion} onChange={handleChange} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2">
              <option value="Afiliado">Afiliado</option>
              <option value="No afiliado">No afiliado</option>
              <option value="Simpatizante">Simpatizante</option>
            </select>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-black font-semibold rounded-lg py-2">Guardar registro</button>
          </form>

          {/* === Buscador + PDF + TXT === */}
          <div className="mt-6">
            <h3 className="text-red-400 font-semibold mb-2 text-sm">Buscar votante</h3>
            <input type="text" placeholder="Buscar por nombre, cédula o teléfono..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm" />
            <div className="flex justify-between items-center mt-3 gap-2">
              <button onClick={() => exportPDF(filteredVoters)} className="bg-red-600 hover:bg-red-500 text-black text-xs font-semibold px-3 py-1 rounded-lg shadow">📄 PDF</button>
              <button onClick={() => exportTxt(filteredVoters)} className="bg-blue-500 hover:bg-blue-400 text-black text-xs font-semibold px-3 py-1 rounded-lg shadow">🖨️ TXT</button>
              <p className="text-xs text-gray-400">Resultados: {filteredVoters.length}</p>
            </div>

            {/* === Lista de votantes === */}
            <ul className="mt-3 max-h-[200px] overflow-y-auto text-xs text-gray-300 space-y-1">
              {filteredVoters.length > 0 ? filteredVoters.map((v) => (
                <li key={v.id} className="border-b border-neutral-800 py-1 flex justify-between items-center">
                  <div>
                    <span className="text-red-400 font-semibold">{v.fullName}</span> — {v.barrio}
                    <span className="block text-[11px] text-gray-400">
                      {v.afiliacion} | {v.etapa} | {v.estadoVoto}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleEstadoVoto(v.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-semibold ${
                      v.estadoVoto === "Votó" ? "bg-green-500 text-black" : "bg-gray-600 text-white"
                    }`}
                  >
                    {v.estadoVoto === "Votó" ? "✔️ Votó" : "🕓 Estambay"}
                  </button>
                </li>
              )) : <p className="text-gray-500 text-xs italic">No se encontraron resultados.</p>}
            </ul>
          </div>
        </div>

        {/* === Mapa === */}
        <div className="bg-neutral-900/80 border border-red-700/40 rounded-2xl overflow-hidden">
          <h3 className="font-semibold mb-2 p-3 text-sm text-red-400">Mapa de Minga Guazú</h3>
          <MapContainer center={MINGA_CENTER} zoom={14} className="h-[400px] rounded-xl z-0">
            <ChangeView coords={MINGA_CENTER} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {barrios.map((b) => (
              <Marker
                key={b.name}
                position={b.coords}
                icon={L.divIcon({
                  className: "bg-white text-red-700 text-[11px] font-bold px-2 py-1 rounded-full border border-red-500 shadow-lg",
                  html: `<div>${b.name}</div>`,
                })}
                eventHandlers={{
                  click: () => setBarrioModal({ name: b.name, datos: calcularDatos(b.name) }),
                }}
              />
            ))}
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
            {v.fullName} — {v.phone || "Sin teléfono"} — {v.barrio} (<span className="text-gray-400">{v.createdByName}</span>)
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
        <NormalUserPanel currentUser={currentUser} voters={voters} setVoters={setVoters} />
      )}
      <Footer />
    </div>
  );
}
