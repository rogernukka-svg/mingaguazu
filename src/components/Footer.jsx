import React from 'react'

function Footer() {
  return (
    <footer
      id="contacto"
      className="border-t border-red-900/70 bg-slate-950 text-red-100 text-center text-xs md:text-sm py-5"
    >
      <div className="max-w-4xl mx-auto px-4 space-y-1">
        <p className="font-semibold">
          Movimiento JAHA — Rodrigo Ríos · 2025
        </p>
        <p className="text-red-200/80">
          El movimiento que camina contigo. Construimos Minga Guazú barrio por barrio,
          con la fuerza de su gente.
        </p>
        <p className="text-[11px] text-red-300/80">
          Plataforma desarrollada por ManosYA Tecnología para impulsar participación,
          transparencia y cercanía.
        </p>
      </div>
    </footer>
  )
}

export default Footer
