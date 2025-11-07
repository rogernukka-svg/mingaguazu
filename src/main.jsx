import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Jaha2045 from "./Jaha2045.jsx";
import App from "./App.jsx";
import "./index.css";

function Main() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧠 Cargar sesión guardada
  useEffect(() => {
    const savedUser = localStorage.getItem("jaha_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    // pequeña pausa para que no parpadee entre pantallas
    setTimeout(() => setLoading(false), 600);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center text-sm">
        Cargando sistema...
      </div>
    );
  }

  return (
    <>
      {!user ? (
        <Jaha2045 onLogin={setUser} />
      ) : (
        <App initialUser={user} onLogout={() => setUser(null)} />
      )}
    </>
  );
}

// 🚀 Render principal (Vite)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

/*
// 🚫 Desactivado temporalmente el Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch((err) => console.log("SW falló", err));
  });
}
*/
