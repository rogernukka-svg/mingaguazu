import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function CentralMoviles() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from("moviles")
        .select("*")
        .order("id", { ascending: true });

      if (!error) setRows(data || []);
    };

    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Operación en ruta
            </p>
            <h1 className="text-3xl font-black">Móviles</h1>
            <p className="text-white/55 mt-1">Control rápido del movimiento operativo</p>
          </div>

          <Link
            to="/central"
            className="px-5 py-3 rounded-2xl bg-cyan-500 text-black font-black"
          >
            Volver
          </Link>
        </div>

        <div className="mt-6 rounded-[30px] border border-cyan-500/10 overflow-hidden bg-white/[0.04]">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-white/55">
              <tr>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Móvil</th>
                <th className="text-left p-4">Chofer</th>
                <th className="text-left p-4">Coordinador</th>
                <th className="text-left p-4">Operación</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-t border-white/10">
                  <td className="p-4">
                    {m.online ? (
                      <span className="text-green-400 font-bold">● En línea</span>
                    ) : (
                      <span className="text-gray-500 font-bold">● Offline</span>
                    )}
                  </td>
                  <td className="p-4">{m.nombre}</td>
                  <td className="p-4">{m.chofer}</td>
                  <td className="p-4">{m.coordinador}</td>
                  <td className="p-4">{m.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}