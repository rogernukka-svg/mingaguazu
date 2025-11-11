import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Cpu } from "lucide-react";

export default function AsistenteFlotante() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ia",
      text: "🔵 Sistema JAHA activo. Bienvenido Intendente Ríos. Monitoreo urbano listo. ¿Desea revisar reportes, participación o clima local?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const memoryRef = useRef([]);
  const chatRef = useRef(null);

  /* === AUTO-SCROLL === */
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isTyping]);

  /* === VOZ === */
  const speak = (text) => {
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "es-ES";
      utter.pitch = 1.05;
      utter.rate = 1.02;
      utter.volume = 1;
      utter.voice =
        speechSynthesis
          .getVoices()
          .find((v) =>
            v.name.toLowerCase().includes("google español") ||
            v.lang.toLowerCase().includes("es")
          ) || null;
      speechSynthesis.speak(utter);
    }
  };

  /* === INTELIGENCIA BÁSICA === */
  const generateResponse = (userInput) => {
    const lower = userInput.toLowerCase();
    let response = "";

    if (lower.includes("participación") || lower.includes("votación")) {
      response =
        "📊 Según los últimos datos, la participación ciudadana alcanza el 42%, con tendencia positiva en los barrios Primavera y Santa Lucía.";
    } else if (lower.includes("clima") || lower.includes("tiempo")) {
      response =
        "🌤️ Actualmente 28°C en Minga Guazú, humedad del 70%. Pronóstico: tarde cálida con posibles lluvias ligeras al anochecer.";
    } else if (lower.includes("coordinadores") || lower.includes("ranking")) {
      response =
        "🥇 El top de coordinadores activos es: 1️⃣ Carlos Martínez con 78%, 2️⃣ Ana López con 71%, 3️⃣ Miguel Duarte con 69%.";
    } else if (lower.includes("alerta") || lower.includes("emergencia")) {
      response =
        "🚨 No hay alertas activas, pero el sistema JAHA monitorea en tiempo real los barrios con mayor densidad de actividad.";
    } else if (lower.includes("seguridad") || lower.includes("patrulla")) {
      response =
        "🛡️ Las patrullas urbanas reportan actividad normal. No se registran incidentes en las últimas 6 horas.";
    } else if (lower.includes("reportes") || lower.includes("estadísticas")) {
      response =
        "📑 Generando informe consolidado... Los datos estarán disponibles en la bandeja del Centro de Comando en menos de un minuto.";
    } else if (lower.includes("hola") || lower.includes("buenas")) {
      response =
        "👋 Hola Intendente. JAHA a su servicio. Hoy podemos analizar comportamiento electoral, actividad vecinal o métricas en tiempo real.";
    } else if (lower.includes("gracias")) {
      response = "💫 Siempre a sus órdenes, Intendente Ríos. Continuo en línea.";
    } else if (lower.includes("modo") && lower.includes("oscuro")) {
      response = "🌓 Modo oscuro ya activo, Intendente. Energía optimizada.";
    } else {
      // 🧠 Memoria contextual
      memoryRef.current.push(userInput);
      if (memoryRef.current.length > 10) memoryRef.current.shift();
      const lastContext = memoryRef.current[memoryRef.current.length - 2];

      if (lastContext && lower.includes("sí")) {
        response = `Perfecto. Continuaré con el proceso de "${lastContext}".`;
      } else if (lastContext && lower.includes("no")) {
        response = `Entendido. Cancelaré la operación anterior: "${lastContext}".`;
      } else {
        response = `🧠 He registrado su instrucción: "${userInput}". JAHA aprenderá de este patrón para futuras decisiones.`;
      }
    }

    return response;
  };

  /* === ENVÍO DE MENSAJES === */
  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(userMsg);
      setMessages((prev) => [...prev, { sender: "ia", text: response }]);
      setIsTyping(false);
      speak(response);
    }, 1000);
  };

  return (
    <>
      {/* 🔴 BOTÓN FLOTANTE (alzamos el botón) */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-5 bg-gradient-to-r from-red-600 to-black text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform animate-pulse z-50"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* 💬 BURBUJA DE CHAT (también alzada) */}
      {open && (
        <div className="fixed bottom-36 right-5 w-80 sm:w-96 bg-gradient-to-b from-black via-neutral-900 to-red-950 border border-red-600/50 rounded-2xl shadow-[0_0_40px_rgba(255,0,0,0.5)] flex flex-col overflow-hidden animate-fadeIn backdrop-blur-md z-50">
          {/* ENCABEZADO */}
          <div className="flex justify-between items-center bg-gradient-to-r from-red-800 via-red-700 to-black text-white px-3 py-2 shadow-inner border-b border-red-600/40">
            <div className="flex items-center gap-2">
              <Cpu className="text-red-300 animate-pulse" />
              <span className="font-semibold tracking-wide">
                Sistema JAHA — Asistente Inteligente
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>

          {/* MENSAJES */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto bg-black/40 text-sm p-3 space-y-2"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-md w-fit max-w-[85%] leading-relaxed ${
                  m.sender === "ia"
                    ? "bg-red-900/40 text-red-100 border border-red-600/30 shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                    : "bg-emerald-900/40 text-emerald-100 self-end ml-auto border border-emerald-600/30 shadow-[0_0_10px_rgba(0,255,120,0.2)]"
                }`}
              >
                {m.text}
              </div>
            ))}

            {isTyping && (
              <div className="text-gray-400 text-xs animate-pulse">
                JAHA está analizando...
              </div>
            )}
          </div>

          {/* ENTRADA DE TEXTO */}
          <div className="flex items-center gap-2 p-2 border-t border-red-800/40 bg-neutral-950">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Dar orden o consultar..."
              className="flex-grow bg-neutral-800 text-white text-xs p-2 rounded-lg outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
            />
            <button
              onClick={handleSend}
              className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-[0_0_10px_rgba(255,0,0,0.4)]"
            >
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* ANIMACIONES */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}
