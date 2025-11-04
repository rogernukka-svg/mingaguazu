import React from 'react'

const EJES = [
  {
    title: 'Transparencia y Gobierno Abierto',
    desc: 'Cuentas claras, portal público, participación real en las decisiones y control ciudadano.',
  },
  {
    title: 'Seguridad Ciudadana y Comunitaria',
    desc: 'Barrios iluminados, presencia coordinada con la comunidad y enfoque preventivo.',
  },
  {
    title: 'Desarrollo Social e Inclusión',
    desc: 'Oportunidades para jóvenes, mujeres, adultos mayores y personas con discapacidad.',
  },
  {
    title: 'Sector Agrícola y Producción Local',
    desc: 'Apoyo técnico, ferias, mercado municipal y caminos dignos para llegar con lo que producimos.',
  },
  {
    title: 'Industria, Empleo y Emprendimiento',
    desc: 'Vínculo entre industria, comercio y talento local para generar más trabajo en Minga Guazú.',
  },
  {
    title: 'Participación Ciudadana',
    desc: 'Cabildos, consultas digitales y JAHA APP como puente directo con la gente.',
  },
]

function EjesGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {EJES.map((eje) => (
        <article
          key={eje.title}
          className="rounded-2xl border border-red-100/70 bg-red-50/60 hover:bg-red-100/70 transition-colors shadow-sm hover:shadow-md"
        >
          <div className="p-5 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-red-800 mb-2">
                {eje.title}
              </h3>
              <p className="text-sm text-red-900/80">{eje.desc}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default EjesGrid
