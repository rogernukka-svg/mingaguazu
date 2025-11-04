'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Map, BarChart3, Leaf, Users, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Tooltip, Polygon, useMap } from 'react-leaflet';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/* ===== ICONOS PERSONALIZADOS ===== */
const iconSmall = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/190/190411.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});
const iconLarge = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/149/149060.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

/* ===== DATOS ===== */
const smallProducers = [
  { id: 1, name: 'María López', product: 'Mandioca', location: [-25.490, -54.812], size: '2 ha' },
  { id: 2, name: 'Juan Romero', product: 'Lechuga y tomate', location: [-25.495, -54.820], size: '1.5 ha' },
];
const largeProducers = [
  { id: 1, name: 'Cooperativa AgroMinga', product: 'Soja y Maíz', location: [-25.505, -54.815], size: '500 ha' },
];
const envZones = [
  [[-25.48, -54.81], [-25.49, -54.80], [-25.50, -54.82]],
  [[-25.485, -54.825], [-25.49, -54.83], [-25.495, -54.825]],
];

/* === PUNTOS DE PROYECTOS MUNICIPALES === */
const projectPoints = [
  {
    id: 1,
    title: '💧 Tanque de Agua Comunitario',
    desc: 'Proyecto para garantizar agua potable en el Km 14. Capacidad: 50.000 litros.',
    location: [-25.486, -54.815],
    color: '#3B82F6'
  },
  {
    id: 2,
    title: '🏘️ Comisión Vecinal San Roque',
    desc: 'Espacio de participación ciudadana con 120 familias activas.',
    location: [-25.491, -54.823],
    color: '#10B981'
  },
  {
    id: 3,
    title: '🚨 Seguridad Barrial Norte',
    desc: 'Instalación de cámaras, alarmas vecinales y centro de control conjunto.',
    location: [-25.498, -54.818],
    color: '#EF4444'
  },
];

/* ===== COMPONENTE AUXILIAR ===== */
function SetViewOnce({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center); }, [center]);
  return null;
}

/* ===== MODAL GENERAL ===== */
function ModalWrapper({ title, color = 'red', children, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[9999]"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-[90%] p-5 overflow-y-auto max-h-[85vh]"
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
          <h2 className={`text-xl font-bold text-${color}-700`}>{title}</h2>
          <button
            onClick={onClose}
            className={`text-${color}-600 hover:text-${color}-800 transition font-semibold`}
          >
            ✖
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* === Ejes Estratégicos === */
function EjesModal({ onClose }) {
  const ejes = [
    { color: 'green', title: '🟢 Transparencia y Gobierno Abierto', desc: 'Portal público, presupuesto participativo y digitalización total.' },
    { color: 'blue', title: '🔵 Seguridad Ciudadana', desc: 'Centro de monitoreo, vecinos unidos y alumbrado LED inteligente.' },
    { color: 'yellow', title: '🟡 Desarrollo Social e Inclusión', desc: 'Apoyo a adultos, jóvenes y el programa “Minga Guazú sin hambre”.' },
    { color: 'orange', title: '🟠 Economía Local y Empleo', desc: 'Fomento agrícola, ferias locales y apoyo a emprendedores.' },
    { color: 'purple', title: '🟣 Obras y Medioambiente', desc: 'Viviendas, reciclaje, caminos rurales y reforestación.' },
    { color: 'red', title: '🔴 Participación Ciudadana', desc: 'Cabildos, oficinas móviles y aplicación de reclamos.' },
  ];

  return (
    <ModalWrapper title="Ejes Estratégicos – Plan 2041" color="red" onClose={onClose}>
      <div className="grid gap-3">
        {ejes.map((e, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="border border-slate-200 rounded-xl p-3 bg-gradient-to-r from-white to-slate-50 hover:shadow-md transition"
          >
            <p className="font-semibold text-slate-800">{e.title}</p>
            <p className="text-slate-600 text-sm">{e.desc}</p>
          </motion.div>
        ))}
      </div>
    </ModalWrapper>
  );
}

/* === Indicadores === */
function IndicadoresModal({ onClose }) {
  const data = [
    { eje: 'Seguridad', valor: 85 },
    { eje: 'Producción', valor: 90 },
    { eje: 'Inclusión', valor: 75 },
    { eje: 'Obras', valor: 60 },
  ];

  return (
    <ModalWrapper title="📊 Indicadores del Plan 2041" color="red" onClose={onClose}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="eje" />
            <Bar dataKey="valor" fill="#b91c1c" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-center mt-4 text-slate-500">
        Datos del seguimiento participativo municipal 🌱
      </p>
    </ModalWrapper>
  );
}

/* === Verde === */
function VerdeModal({ onClose }) {
  return (
    <ModalWrapper title="🌱 Programa Verde 2041" color="green" onClose={onClose}>
      <p className="text-sm text-slate-700">
        Reforestación urbana, huertas comunitarias y rutas ecológicas en toda Minga Guazú.
      </p>
      <ul className="list-disc text-sm mt-3 ml-4 space-y-1 text-slate-600">
        <li>🌳 15.000 árboles plantados</li>
        <li>🏫 8 huertas escolares activas</li>
        <li>🚴 Rutas verdes seguras y conectadas</li>
      </ul>
    </ModalWrapper>
  );
}

/* === Proyectos === */
function ProyectosModal({ onClose }) {
  const proyectos = [
    { name: '🏫 Escuela Técnica Municipal', status: 'En ejecución – Barrio San Roque' },
    { name: '🚜 Mercado del Productor', status: 'En planificación – Km 14' },
    { name: '🏥 Centro de Salud Digital', status: 'Proyecto 2026 – Centro de Minga Guazú' },
  ];

  return (
    <ModalWrapper title="🏗️ Proyectos Municipales" color="red" onClose={onClose}>
      <div className="space-y-3">
        {proyectos.map((p, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md transition"
          >
            <p className="font-bold text-red-700">{p.name}</p>
            <p className="text-xs text-slate-600">{p.status}</p>
          </motion.div>
        ))}
      </div>
    </ModalWrapper>
  );
}

/* ===== PRINCIPAL ===== */
export default function Jaha2045Page() {
  const [showBot, setShowBot] = useState(false);
  const [showEjes, setShowEjes] = useState(false);
  const [showIndicadores, setShowIndicadores] = useState(false);
  const [showVerde, setShowVerde] = useState(false);
  const [showProyectos, setShowProyectos] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const center = [-25.49, -54.82];
  // === Instalador PWA ===
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setShowInstall(false);
    setDeferredPrompt(null);
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white to-slate-200 text-slate-800">

      {/* INTRO ANIMADA — versión roja tecnológica con efecto de brillo */}
<AnimatePresence>
  {showIntro && (
    <motion.div
      className="fixed top-0 left-0 w-screen h-[100dvh] flex flex-col items-center justify-center z-[99999] text-white 
      bg-gradient-to-b from-[#8B0000] via-[#B30000] to-[#E50914] overflow-hidden relative"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 3.5, duration: 1.4 }}
      exit={{ opacity: 0 }}
    >
      {/* ✨ Luz vertical animada de fondo */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.05)_50%,transparent_100%)]"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* 🌟 Brillo radial central */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.25)_0%,transparent_70%)] blur-3xl"></div>

      {/* ⚡ TÍTULO con efecto de brillo dinámico */}
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] overflow-hidden"
      >
        <span className="relative z-10">JAHA 2041</span>

        {/* ✨ Efecto de brillo que pasa por encima del texto */}
        <span className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.8)_50%,transparent_100%)] 
          animate-shine"></span>
      </motion.h1>

      {/* 🌐 SUBTÍTULO */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="italic text-lg md:text-xl mt-3 text-white/90 font-light text-center max-w-[80%]"
      >
        ⚙️ Innovación, transparencia y futuro para <b>Minga Guazú</b> 🌱
      </motion.p>

      {/* 🔋 Barra de carga */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '70%' }}
        transition={{ delay: 1.5, duration: 2.3, ease: 'easeInOut' }}
        className="h-[3px] mt-8 bg-gradient-to-r from-white via-red-200 to-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]"
      ></motion.div>

      {/* 🔄 Keyframes Tailwind personalizados (debe ir en tu globals.css o tailwind.config) */}
      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 2.5s linear infinite;
          background-size: 200% auto;
          mix-blend-mode: screen;
        }
      `}</style>
    </motion.div>
  )}
</AnimatePresence>

      {/* HEADER */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-5 py-3 
        bg-gradient-to-r from-red-700 via-rose-600 to-pink-500 text-white shadow-md backdrop-blur-md border-b border-red-300/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center shadow-inner backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 12l10 5 10-5" />
              <path d="M2 17l10 5 10-5" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-extrabold tracking-tight">
              JAHA <span className="text-white">2041</span>
            </h1>
            <span className="text-[11px] uppercase text-white/80 tracking-wider">
              Ciudad Inteligente
            </span>
          </div>
        </div>
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xs md:text-sm italic text-white/90 font-light tracking-wide"
        >
          🚀 <i>El futuro de</i> <b>Minga Guazú</b> <i>empieza aquí</i>
        </motion.p>
      </header>

      {/* MAPA */}
      <div className="h-screen">
        <MapContainer center={center} zoom={12} className="h-full w-full z-0">
          <SetViewOnce center={center} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">Carto</a>'
          />

          {smallProducers.map(p => (
            <Marker key={p.id} position={p.location} icon={iconSmall}>
              <Tooltip>{p.name} 🌾<br />{p.product}</Tooltip>
            </Marker>
          ))}
          {largeProducers.map(p => (
            <Marker key={p.id} position={p.location} icon={iconLarge}>
              <Tooltip>{p.name} 🚜<br />{p.product}</Tooltip>
            </Marker>
          ))}

          {/* PROYECTOS MUNICIPALES */}
          {projectPoints.map(p => (
            <Marker
              key={p.id}
              position={p.location}
              eventHandlers={{ click: () => setActiveProject(p) }}
              icon={L.divIcon({
                className: "custom-project-icon",
                html: `<div style="
                  background:${p.color};
                  width:34px;
                  height:34px;
                  border-radius:50%;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  color:white;
                  font-size:18px;
                  box-shadow:0 0 8px rgba(0,0,0,0.3);
                  transform:scale(1);
                  animation:pulse 1.6s infinite;
                ">${p.title.split(' ')[0]}</div>`,
                iconSize: [34, 34],
              })}
            >
              <Tooltip>{p.title}</Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* MODAL PROYECTOS */}
      <AnimatePresence>
        {activeProject && (
          <ModalWrapper title={activeProject.title} color="red" onClose={() => setActiveProject(null)}>
            <p className="text-slate-700 text-sm mb-2">{activeProject.desc}</p>
            <p className="text-xs text-slate-500 italic">
              📍 Ubicación: {activeProject.location[0].toFixed(3)}, {activeProject.location[1].toFixed(3)}
            </p>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* BOT INTERACTIVO */}
      <AnimatePresence>
        {showBot && (
          <motion.div
            className="fixed bottom-24 right-6 w-80 bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800 rounded-2xl shadow-2xl border border-slate-300 overflow-hidden z-[5000] backdrop-blur-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
          >
            <div className="bg-gradient-to-r from-red-700 via-pink-600 to-rose-500 text-white p-3 font-semibold text-sm flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-lg animate-pulse">🤖</span>
                <b className="tracking-wide text-white drop-shadow-md">Jaha 2041</b>
              </div>
              <button onClick={() => setShowBot(false)} className="hover:text-yellow-300 transition">✖</button>
            </div>

            <div className="p-3 text-sm space-y-2 max-h-80 overflow-y-auto scroll-smooth" id="chat-area">
              <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-red-50 border border-red-100 rounded-xl p-2 shadow-sm">
                👋 ¡Hola! Soy <b>Jaha 2041</b>, tu guía digital del <b>Plan 2041</b> 🌟. <br />
                ¿Sabías que <b>Minga Guazú</b> significa <i>“gran trabajo comunitario”</i>? 💪🇵🇾
              </motion.p>

              <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-cyan-50 border border-cyan-100 rounded-xl p-2 shadow-sm">
                🌱 Somos una comunidad trabajadora, solidaria e innovadora. <br />
                Puedo contarte sobre la <b>historia</b>, los <b>ejes del plan</b>, los <b>proyectos municipales</b> y mucho más.
              </motion.p>

              <p className="text-xs text-center text-slate-500 italic">
                Escribí un mensaje abajo 👇 y descubrí el futuro inteligente de Minga Guazú 💬
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.target.elements.msg.value.trim();
                if (!input) return;
                const chat = document.getElementById('chat-area');

                const msgEl = document.createElement('p');
                msgEl.className = 'bg-gradient-to-r from-slate-200 to-slate-100 rounded-xl p-2 mt-2 text-right text-slate-700 shadow-inner';
                msgEl.textContent = input;
                chat.appendChild(msgEl);

                const reply = document.createElement('p');
                reply.className = 'bg-gradient-to-r from-red-50 to-rose-100 border border-rose-200 rounded-xl p-2 mt-2 shadow-sm';
                let response = '';

                if (input.toLowerCase().includes('historia')) {
                  response = '📜 Minga Guazú nació en 1958 gracias al trabajo conjunto...';
                } else if (input.toLowerCase().includes('plan')) {
                  response = '🗺️ El Plan 2041 busca transformar Minga Guazú en una ciudad sostenible, tecnológica y participativa.';
                } else if (input.toLowerCase().includes('hola')) {
                  response = '👋 ¡Hola humano curioso! Soy Jaha 2041, tu asistente digital.';
                } else {
                  response = '✨ Puedo hablarte sobre historia, ejes, tecnología o proyectos del Plan 2041 🚀.';
                }

                setTimeout(() => {
                  reply.textContent = response;
                  chat.appendChild(reply);
                  chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
                }, 700);

                e.target.reset();
              }}
              className="border-t border-slate-200 flex items-center p-2 bg-slate-50"
            >
              <input type="text" name="msg" placeholder="💬 Escribí algo..." className="flex-1 outline-none bg-transparent text-sm px-2 text-slate-700" />
              <button type="submit" className="bg-gradient-to-r from-red-600 to-rose-500 hover:brightness-110 text-white px-3 py-1 rounded-lg text-xs shadow-md">
                Enviar
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

   <motion.button
  onClick={() => setShowBot(!showBot)}
  whileHover={{ scale: 1.15 }}
  whileTap={{ scale: 0.9 }}
  className="fixed bottom-20 right-6 bg-gradient-to-r from-red-600 to-rose-500 hover:brightness-110 text-white p-4 rounded-full shadow-lg shadow-red-800/40 z-[6000] flex items-center justify-center transition-all duration-300"
>
  <MessageCircle size={22} className="animate-pulse" />
</motion.button>


      {/* MENÚ INFERIOR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-300 flex justify-around py-2 text-xs md:text-sm font-semibold text-slate-600 z-[4000]">
        <button className="flex flex-col items-center hover:text-red-600">
          <Map size={18} /> <span>Mapa</span>
        </button>
        <button onClick={() => setShowEjes(true)} className="flex flex-col items-center hover:text-red-600">
          <Layers size={18} /> <span>Ejes</span>
        </button>
        <button onClick={() => setShowIndicadores(true)} className="flex flex-col items-center hover:text-red-600">
          <BarChart3 size={18} /> <span>Indicadores</span>
        </button>
        <button onClick={() => setShowVerde(true)} className="flex flex-col items-center hover:text-red-600">
          <Leaf size={18} /> <span>Verde</span>
        </button>
        <button onClick={() => setShowProyectos(true)} className="flex flex-col items-center hover:text-red-600">
          <Users size={18} /> <span>Proyectos</span>
        </button>
      </div>

           {/* MODALES ACTIVOS */}
      <AnimatePresence>
        {showEjes && <EjesModal onClose={() => setShowEjes(false)} />}
        {showIndicadores && <IndicadoresModal onClose={() => setShowIndicadores(false)} />}
        {showVerde && <VerdeModal onClose={() => setShowVerde(false)} />}
        {showProyectos && <ProyectosModal onClose={() => setShowProyectos(false)} />}
      </AnimatePresence>

      {/* === BLOQUE INSTALADOR PWA === */}
      {showInstall && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-rose-500 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-3 z-[7000] cursor-pointer"
          onClick={handleInstall}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="font-semibold text-sm">Instalar JAHA 2041</span>
        </motion.div>
      )}
    </main>
  );
}
