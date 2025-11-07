import React from 'react';

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 space-y-4">
        <p className="uppercase tracking-[0.24em] text-emerald-300 text-[11px] md:text-xs">
          PROYECTO MUNICIPAL · REGISTRO DE VOTANTES
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold leading-tight max-w-2xl">
          Sistema de Gestión de Votantes con control por rol.
        </h1>
        <p className="text-sm md:text-base text-slate-200 max-w-3xl">
          Este panel permite que cada <span className="font-semibold">Usuario Normal</span> registre votantes desde campo
          y que el <span className="font-semibold">Súper Usuario</span> tenga una vista completa con filtros,
          exportación y reportes para la estrategia electoral.
        </p>
      </div>
    </section>
  );
}

export default HeroSection;
