export default function MovilPanel() {
  return (
    <main className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-md mx-auto">
        <div className="rounded-[30px] border border-cyan-500/10 bg-white/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70 text-center">
            Operación de campo
          </p>
          <h1 className="text-3xl font-black text-center mt-2">Panel Móvil</h1>
          <p className="text-center text-white/55 mt-2">
            Operación rápida del día
          </p>

          <div className="space-y-4 mt-6">
            <button className="w-full bg-green-500 text-black py-4 rounded-2xl font-black">
              Disponible
            </button>

            <button className="w-full bg-cyan-500 text-black py-4 rounded-2xl font-black">
              En ruta
            </button>

            <button className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black">
              En zona
            </button>

            <button className="w-full bg-red-500 py-4 rounded-2xl font-black">
              Finalizar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}