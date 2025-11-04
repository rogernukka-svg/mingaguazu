import React from 'react'

function Navbar() {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-red-900">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-red-700 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-red-900/40">
            J
          </div>
          <div>
            <p className="font-bold leading-tight">JAHA APP</p>
            <p className="text-xs text-red-200 leading-tight">
              El movimiento que camina contigo
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-sm">
          <a href="#ejes" className="hover:text-red-300 transition-colors">
            Ejes
          </a>
          <a href="#participa" className="hover:text-red-300 transition-colors">
            Participá
          </a>
          <a href="#contacto" className="hover:text-red-300 transition-colors">
            Contacto
          </a>
          <a
            href="#unete"
            className="bg-red-600 hover:bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow shadow-red-900/40 transition-colors"
          >
            Únete
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
