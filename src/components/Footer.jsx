import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300 text-center text-[11px] md:text-xs py-4 mt-6">
      <div className="max-w-4xl mx-auto px-4 space-y-1">
        <p className="font-semibold">
          Sistema de Gestión de Votantes · 2025
        </p>
        <p className="text-slate-400/90">
          Registro organizado de votantes · Acceso controlado por rol · Datos claros para la estrategia.
        </p>
        <p className="text-[10px] text-slate-500">
          Frontend de prueba — luego podemos conectarlo a una base de datos real (Supabase / Postgres).
        </p>
      </div>
    </footer>
  );
}

export default Footer;
