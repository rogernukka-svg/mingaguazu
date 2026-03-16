import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoJaha from "../assets/logojahabicolor.png";
import supabase from "../supabaseClient";

async function findConcejal(username, password) {
 const tablesToTry = ["private_users"];
  let lastError = null;

  for (const tableName of tablesToTry) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("id, username, password, role, name, active")
        .eq("username", username)
        .eq("password", password)
        .eq("active", true)
        .eq("role", "concejal")
        .maybeSingle();

      if (!error) {
        return { data, tableName };
      }

      lastError = error;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("No se pudo consultar la tabla de concejales");
}

export default function ConcejalLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("jaha_private_user");
    const user = raw ? JSON.parse(raw) : null;

    if (user && user.role === "concejal") {
      navigate("/concejal", { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const username = form.username.trim();
      const password = form.password.trim();

      if (!username || !password) {
        setError("Completá usuario y contraseña");
        return;
      }

      const { data } = await findConcejal(username, password);

      if (!data) {
        setError("Usuario o contraseña inválidos");
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

      navigate("/concejal", { replace: true });
    } catch (err) {
      console.error("Error login concejal:", err);
      setError("No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,0,110,0.08),transparent_24%),linear-gradient(to_bottom,#030303,#0a0a0a,#000000)]" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <div className="relative z-10 w-full max-w-md rounded-[30px] border border-cyan-400/15 bg-white/[0.04] px-6 py-7 shadow-[0_0_40px_rgba(0,255,255,0.08)]">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-3xl border border-cyan-400/20 bg-white/[0.04] p-3">
            <img src={logoJaha} alt="JAHA" className="w-20 h-20 object-contain" />
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-300/70">
            Acceso concejal
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[0.12em]">
            PANEL <span className="text-cyan-400">CONCEJAL</span>
          </h1>

          <p className="mt-2 text-sm text-white/55">
            Control de coordinadores y gestión territorial
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-7 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
              Usuario
            </label>
            <input
              type="text"
              autoComplete="username"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-white outline-none focus:border-cyan-400/40"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full p-3 rounded-2xl bg-black/50 border border-white/10 text-white outline-none focus:border-cyan-400/40"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black transition disabled:opacity-60"
          >
            {loading ? "INGRESANDO..." : "ENTRAR"}
          </button>
        </form>
      </div>
    </main>
  );
}