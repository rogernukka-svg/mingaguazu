import React from 'react';

const BLOQUES = [
  {
    title: 'Usuario Normal',
    desc: 'Inicia sesión, registra nuevos votantes y solo puede ver / editar los que él mismo cargó.',
  },
  {
    title: 'Súper Usuario',
    desc: 'Ve toda la base, filtra por barrio, lugar de votación, estados y usuario que registró.',
  },
  {
    title: 'Exportación',
    desc: 'Desde el panel de administrador se pueden exportar los votantes filtrados a CSV / Excel.',
  },
  {
    title: 'Gestión de usuarios',
    desc: 'Crear nuevos usuarios, activar / desactivar cuentas y definir el rol (normal / admin).',
  },
  {
    title: 'Mapa & Reportes',
    desc: 'Se reserva espacio para integrar mapa georreferenciado y reportes gráficos por barrio.',
  },
  {
    title: 'Próximos pasos',
    desc: 'Conectar este frontend a una API o directamente a Supabase para guardar todo en la nube.',
  },
];

function EjesGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {BLOQUES.map((b) => (
        <article
          key={b.title}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-800/80 transition-colors shadow-sm hover:shadow-md"
        >
          <div className="p-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-sm md:text-base font-semibold text-emerald-300 mb-1.5">
                {b.title}
              </h3>
              <p className="text-xs md:text-sm text-slate-200/90">
                {b.desc}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default EjesGrid;
