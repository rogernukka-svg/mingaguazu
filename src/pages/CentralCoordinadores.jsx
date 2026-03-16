import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../supabaseClient";

export default function CentralCoordinadores() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase
        .from("coordinadores")
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
              Gestión central
            </p>
            <h1 className="text-3xl font-black">Coordinadores</h1>
            <p className="text-white/55 mt-1">Vista tecnológica, simple y rápida</p>
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
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Zona</th>
                <th className="text-left p-4">Teléfono</th>
                <th className="text-left p-4">Concejal</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="p-4">
                    {c.online ? (
                      <span className="text-green-400 font-bold">● En línea</span>
                    ) : (
                      <span className="text-gray-500 font-bold">● Offline</span>
                    )}
                  </td>
                  <td className="p-4">{c.nombre}</td>
                  <td className="p-4">{c.zona}</td>
                  <td className="p-4">{c.telefono}</td>
                  <td className="p-4">{c.concejal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}