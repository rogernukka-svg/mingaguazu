import React from 'react'

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-red-800 via-red-700 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left space-y-6">
          <p className="uppercase tracking-[0.25em] text-red-200 text-xs md:text-sm">
            Minga Guazú · 2025
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight drop-shadow-lg">
            JAHA — El movimiento que camina contigo.
          </h1>
          <p className="text-base md:text-lg text-red-100 max-w-xl mx-auto md:mx-0">
            Un gobierno cerca de la gente, con transparencia, seguridad, trabajo y corazón.
            Impulsado por la innovación tecnológica de <span className="font-semibold">ManosYA</span> para
            construir la Minga Guazú que soñamos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start pt-2">
            <a
              href="#unete"
              className="bg-white text-red-700 font-semibold px-6 py-2.5 rounded-full text-sm shadow-lg shadow-red-900/40 hover:bg-red-50 transition-colors"
            >
              Únete al movimiento
            </a>
            <a
              href="#ejes"
              className="border border-red-200/70 text-red-50 px-6 py-2.5 rounded-full text-sm hover:bg-red-900/40 transition-colors"
            >
              Ver ejes del plan
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end">
          <div className="relative w-64 h-64 md:w-72 md:h-72 rounded-3xl bg-slate-950/40 border border-red-300/40 shadow-2xl shadow-red-900/40 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,250,252,0.20),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(239,68,68,0.35),_transparent_60%)]" />
            <div className="relative h-full flex flex-col justify-between p-5">
              <div className="flex items-center justify-between text-xs text-red-100/90">
                <span className="px-2 py-1 rounded-full bg-red-900/60 border border-red-500/50">
                  JAHA APP
                </span>
                <span>En línea</span>
              </div>
              <div className="space-y-3 text-xs">
                <p className="text-red-100/90 font-semibold">
                  Gobierno cercano · Barrio por barrio · Campo e industria juntos.
                </p>
                <ul className="space-y-1 text-[11px] text-red-100/80">
                  <li>• Transparencia real con participación ciudadana</li>
                  <li>• Seguridad comunitaria y alumbrado digno</li>
                  <li>• Impulso al sector agrícola e industrial local</li>
                </ul>
              </div>
              <div className="text-[11px] text-red-100/80">
                <p className="font-semibold">Rodrigo Ríos</p>
                <p>Movimiento JAHA · Minga Guazú</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section
        id="participa"
        className="border-t border-red-900/60 bg-slate-950/40 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-red-100/90">
          <p className="text-center md:text-left">
            Este proyecto se construye <span className="font-semibold">con la gente</span>:
            barrios, productores, jóvenes y trabajadores.
          </p>
          <a
            href="#unete"
            className="px-4 py-2 rounded-full border border-red-300/60 hover:bg-red-700/60 transition-colors"
          >
            Quiero sumar mis ideas
          </a>
        </div>
      </section>
    </section>
  )
}

export default HeroSection
