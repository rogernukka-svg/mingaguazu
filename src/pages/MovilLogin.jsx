import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoJaha from "../assets/logojahabicolor.png";
import supabase from "../supabaseClient";

export default function MovilLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("private_users")
        .select("id, username, password, role, name, active")
        .eq("username", form.username.trim())
        .eq("password", form.password.trim())
        .eq("role", "movil")
        .eq("active", true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setError("Acceso inválido");
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "jaha_private_user",
        JSON.stringify({
          id: data.id,
          username: data.username,
          role: data.role,
          name: data.name,
        })
      );

      navigate("/movil");
    } catch (err) {
      console.error(err);
      setError("No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[30px] border border-cyan-400/15 bg-white/[0.05] backdrop-blur-xl p-6 shadow-[0_0_50px_rgba(0,255,255,0.07)]">
        <div className="text-center">
          <img src={logoJaha} alt="JAHA" className="w-24 h-24 object-contain mx-auto" />
          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-300/70">
            Operación móvil
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-[0.12em]">
            LOGIN MÓVIL
          </h1>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="Usuario"
            className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 focus:border-cyan-400/40 outline-none"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 focus:border-cyan-400/40 outline-none"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error ? (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-black"
          >
            {loading ? "INGRESANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </main>
  );
}