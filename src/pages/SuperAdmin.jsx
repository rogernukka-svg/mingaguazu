import React, { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import supabase from "../lib/supabase.js";
import logoJaha from "../assets/logojahabicolor.png";

const STATUS_META = {
  pendiente: {
    label: "Reciente",
    color: "#ef4444",
    soft: "rgba(239,68,68,0.16)",
  },
  en_proceso: {
    label: "En proceso",
    color: "#f59e0b",
    soft: "rgba(245,158,11,0.16)",
  },
  resuelto: {
    label: "Resuelto",
    color: "#10b981",
    soft: "rgba(16,185,129,0.16)",
  },
};

const CATEGORY_META = {
  luz: { label: "Luz", icon: "💡" },
  agua: { label: "Agua", icon: "💧" },
  tanque_agua: { label: "Tanque de agua", icon: "🚰" },
  comision_vecinal: { label: "Comisión vecinal", icon: "👥" },
  calle: { label: "Calle", icon: "🚧" },
  basura: { label: "Basura", icon: "🗑️" },
  otro: { label: "Otro", icon: "📍" },
};

const PROJECTS_FALLBACK = [
  {
    id: 1,
    name: "Transparencia - rendición de cuentas en tiempo real",
    area: "Dirección de Finanzas",
    progress: 85,
    description:
      "Sistema de seguimiento financiero con datos públicos y control ciudadano en tiempo real.",
  },
  {
    id: 2,
    name: "Guardería Municipal - Presentación",
    area: "Dirección de Obras",
    progress: 55,
    description:
      "Proyecto de infraestructura social enfocado en atención infantil y fortalecimiento comunitario.",
  },
  {
    id: 3,
    name: "Iluminaciones de espacio público",
    area: "Seguridad",
    progress: 25,
    description:
      "Mejora del alumbrado urbano para seguridad, movilidad y recuperación de espacios públicos.",
  },
];

const TRANSPARENCY_FALLBACK = [
  {
    id: "ingresos",
    title: "Ingresos municipales",
    amount: "Gs. 2.480.000.000",
    trend: "+12%",
    detail: "Tributarios, royalties, tasas y transferencias.",
  },
  {
    id: "egresos",
    title: "Egresos ejecutados",
    amount: "Gs. 1.930.000.000",
    trend: "+8%",
    detail: "Obras, servicios, mantenimiento y operación.",
  },
  {
    id: "inversion",
    title: "Inversión social y urbana",
    amount: "Gs. 890.000.000",
    trend: "+21%",
    detail: "Barrios, iluminación, agua, espacios públicos.",
  },
];

function parseRichDescription(description = "") {
  const raw = String(description || "");
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  let barrio = "";
  let urgent = false;
  let supports = 0;
  let photoUrls = [];
  const cleanLines = [];

  for (const line of lines) {
    if (line.startsWith("[BARRIO]")) {
      barrio = line.replace("[BARRIO]", "").trim();
      continue;
    }

    if (line.startsWith("[URGENTE]")) {
      urgent = line.replace("[URGENTE]", "").trim().toLowerCase() === "si";
      continue;
    }

    if (line.startsWith("[SUPPORTS]")) {
      supports = Number(line.replace("[SUPPORTS]", "").trim()) || 0;
      continue;
    }

    if (line.startsWith("[PHOTO_URLS]")) {
      const rawUrls = line.replace("[PHOTO_URLS]", "").trim();
      photoUrls = rawUrls
        ? rawUrls.split("|").map((url) => url.trim()).filter(Boolean)
        : [];
      continue;
    }

    cleanLines.push(line);
  }

  return {
    barrio,
    urgent,
    supports,
    photoUrls,
    cleanDescription: cleanLines.join("\n").trim(),
  };
}

function buildRichDescription({
  barrio,
  urgent,
  description,
  photoUrls = [],
  supports = 0,
}) {
  const parts = [];

  if (barrio?.trim()) parts.push(`[BARRIO] ${barrio.trim()}`);
  parts.push(`[URGENTE] ${urgent ? "si" : "no"}`);
  parts.push(`[SUPPORTS] ${Number(supports) || 0}`);
  parts.push(`[PHOTO_URLS] ${(photoUrls || []).join("|")}`);
  parts.push((description || "").trim());

  return parts.join("\n");
}

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.pendiente;
}

function getCategoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.otro;
}

function getProgressColor(progress) {
  if (progress >= 80) return "#10b981";
  if (progress >= 40) return "#f59e0b";
  return "#ef4444";
}

function formatGs(value) {
  if (typeof value === "string") return value;

  const num = Number(value || 0);
  return `Gs. ${num.toLocaleString("es-PY")}`;
}

function ShellCard({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-[30px] border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_0_35px_rgba(34,211,238,0.05)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function StatCard({ title, value, subtitle, tone = "cyan" }) {
  const tones = {
    cyan: "text-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.10)]",
    green: "text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.10)]",
    amber: "text-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.10)]",
    red: "text-red-300 shadow-[0_0_30px_rgba(239,68,68,0.10)]",
    violet: "text-violet-300 shadow-[0_0_30px_rgba(139,92,246,0.10)]",
  };

  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.05] p-5 ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          {title}
        </p>
        <span className="text-[10px] uppercase tracking-[0.16em] text-white/40">
          live
        </span>
      </div>

      <p className="mt-3 text-3xl sm:text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function SectionHeader({ title, subtitle, right = null }) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl sm:text-2xl font-black tracking-[0.04em] text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-white/50">{subtitle}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

function StatusPill({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold"
      style={{
        background: meta.soft,
        color: meta.color,
      }}
    >
      {meta.label}
    </span>
  );
}

function MiniBar({ value, color }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/8">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.max(0, Math.min(100, Number(value) || 0))}%`,
          background: color,
          boxShadow: `0 0 18px ${color}`,
        }}
      />
    </div>
  );
}

export default function SuperAdmin() {
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

 const [reports, setReports] = useState([]);
const [reportsLoading, setReportsLoading] = useState(true);
const [projects, setProjects] = useState(PROJECTS_FALLBACK);
const [transparency, setTransparency] = useState(TRANSPARENCY_FALLBACK);
const [users, setUsers] = useState([]);

  const [tab, setTab] = useState("dashboard");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [savingReportId, setSavingReportId] = useState(null);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

 useEffect(() => {
  if (!session?.user) return;
  loadAll();
}, [session]);

// 🔥 REALTIME 
useEffect(() => {
  if (!session?.user) return;

  const channel = supabase
    .channel("reports-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "citizen_reports",
      },
      () => {
        loadAll(); // recarga automática
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [session]);
const loadAll = async () => {
  setReportsLoading(true);

  try {
    const reportsPromise = supabase
      .from("citizen_reports")
      .select("*")
      .order("created_at", { ascending: false });

   const projectsPromise = supabase
  .from("jaha_projects")
  .select("*")
  .order("progress", { ascending: false });

const transparencyPromise = Promise.resolve({
  data: [],
  error: null,
});

    const usersPromise = supabase
      .from("users_profile")
      .select("*")
      .order("created_at", { ascending: false });

    const [reportsRes, projectsRes, transparencyRes, usersRes] =
      await Promise.allSettled([
        reportsPromise,
        projectsPromise,
        transparencyPromise,
        usersPromise,
      ]);

    if (reportsRes.status === "fulfilled" && !reportsRes.value.error) {
      setReports(reportsRes.value.data || []);
    }

    if (projectsRes.status === "fulfilled" && !projectsRes.value.error) {
      const data = projectsRes.value.data || [];
      if (data.length) setProjects(data);
    }

    if (
      transparencyRes.status === "fulfilled" &&
      !transparencyRes.value.error
    ) {
      const data = transparencyRes.value.data || [];
      if (data.length) setTransparency(data);
    }

   if (usersRes.status === "fulfilled") {
  console.log("USERS PROFILE RESULT:", usersRes.value);

  if (usersRes.value.error) {
    console.error("USERS PROFILE ERROR:", usersRes.value.error);
    setUsers([]);
  } else {
    const safeUsers = Array.isArray(usersRes.value.data)
      ? usersRes.value.data
      : [];
    setUsers(safeUsers);
  }
} else {
  console.error("USERS PROFILE PROMISE ERROR:", usersRes.reason);
  setUsers([]);
}
  } catch (error) {
    console.error("SUPER ADMIN LOAD ERROR:", error);
  } finally {
    setReportsLoading(false);
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const enrichedReports = useMemo(() => {
    return (reports || []).map((report) => {
      const parsed = parseRichDescription(report.description);

      return {
        ...report,
        parsedBarrio: parsed.barrio,
        parsedUrgent: parsed.urgent,
        parsedSupports: parsed.supports,
        parsedPhotoUrls: parsed.photoUrls,
        cleanDescription: parsed.cleanDescription,
        statusMeta: getStatusMeta(report.status),
        categoryMeta: getCategoryMeta(report.category),
      };
    });
  }, [reports]);

  const filteredReports = useMemo(() => {
    return enrichedReports.filter((report) => {
      const statusOk = statusFilter === "all" ? true : report.status === statusFilter;
      const categoryOk =
        categoryFilter === "all" ? true : report.category === categoryFilter;

      return statusOk && categoryOk;
    });
  }, [enrichedReports, statusFilter, categoryFilter]);

  const selectedReport =
    filteredReports.find((item) => item.id === selectedReportId) || null;

  const totalReports = enrichedReports.length;
  const pendingCount = enrichedReports.filter((r) => r.status === "pendiente").length;
  const processCount = enrichedReports.filter((r) => r.status === "en_proceso").length;
  const solvedCount = enrichedReports.filter((r) => r.status === "resuelto").length;
  const urgentCount = enrichedReports.filter((r) => r.parsedUrgent).length;
  const supportTotal = enrichedReports.reduce(
    (acc, item) => acc + (Number(item.parsedSupports) || 0),
    0
  );

  const topBarrios = useMemo(() => {
    const map = new Map();

    for (const report of enrichedReports) {
      const barrio = (report.parsedBarrio || "Sin barrio").trim();
      map.set(barrio, (map.get(barrio) || 0) + 1);
    }

    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [enrichedReports]);

  const topCategories = useMemo(() => {
    const map = new Map();

    for (const report of enrichedReports) {
      const key = report.category || "otro";
      map.set(key, (map.get(key) || 0) + 1);
    }

    return [...map.entries()]
      .map(([key, total]) => ({
        key,
        total,
        ...getCategoryMeta(key),
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [enrichedReports]);

  const avgProjectProgress = useMemo(() => {
  if (!projects.length) return 0;
  const total = projects.reduce(
    (acc, item) => acc + (Number(item.progress) || 0),
    0
  );
  return Math.round(total / projects.length);
}, [projects]);

const totalUsers = users.length;
const superAdminsCount = users.filter(
  (item) => String(item.role || "").toLowerCase().trim() === "superadmin"
).length;

  const handleChangeReportStatus = async (report, nextStatus) => {
    if (!report?.id) return;

    setSavingReportId(report.id);

    try {
      const parsed = parseRichDescription(report.description);

      const nextDescription = buildRichDescription({
        barrio: parsed.barrio,
        urgent: parsed.urgent,
        description: parsed.cleanDescription,
        photoUrls: parsed.photoUrls,
        supports: parsed.supports || 0,
      });

      const { data, error } = await supabase
        .from("citizen_reports")
        .update({
          status: nextStatus,
          description: nextDescription,
        })
        .eq("id", report.id)
        .select()
        .single();

      if (error) throw error;

      setReports((prev) =>
        prev.map((item) => (item.id === report.id ? data : item))
      );
    } catch (error) {
      console.error("UPDATE REPORT STATUS ERROR:", error);
      alert("No se pudo actualizar el estado.");
    } finally {
      setSavingReportId(null);
    }
  };

  const handleToggleUrgent = async (report) => {
    if (!report?.id) return;

    setSavingReportId(report.id);

    try {
      const parsed = parseRichDescription(report.description);

      const nextDescription = buildRichDescription({
        barrio: parsed.barrio,
        urgent: !parsed.urgent,
        description: parsed.cleanDescription,
        photoUrls: parsed.photoUrls,
        supports: parsed.supports || 0,
      });

      const { data, error } = await supabase
        .from("citizen_reports")
        .update({
          description: nextDescription,
        })
        .eq("id", report.id)
        .select()
        .single();

      if (error) throw error;

      setReports((prev) =>
        prev.map((item) => (item.id === report.id ? data : item))
      );
    } catch (error) {
      console.error("TOGGLE URGENT ERROR:", error);
      alert("No se pudo cambiar la prioridad.");
    } finally {
      setSavingReportId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#041018] text-white flex items-center justify-center">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-4 backdrop-blur-xl">
          Cargando panel ejecutivo...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  const currentUser = session?.user ?? null;

const matchedProfile =
  users.find(
    (item) => String(item.id || "").trim() === String(currentUser?.id || "").trim()
  ) ||
  users.find(
    (item) =>
      String(item.email || "").trim().toLowerCase() ===
      String(currentUser?.email || "").trim().toLowerCase()
  ) ||
  null;

const currentUserName =
  matchedProfile?.full_name ||
  currentUser?.user_metadata?.full_name ||
  currentUser?.user_metadata?.name ||
  currentUser?.email?.split("@")[0] ||
  "Administrador";

const role =
  matchedProfile?.role ||
  currentUser?.user_metadata?.role ||
  currentUser?.app_metadata?.role ||
  "normal";

const normalizedRole = String(role || "").toLowerCase().trim();

/*
  IMPORTANTE:
  Esperamos a que termine la carga inicial de users_profile
  antes de decidir si redirigir o no.
*/
if (reportsLoading) {
  return (
    <div className="min-h-screen bg-[#041018] text-white flex items-center justify-center">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-4 backdrop-blur-xl">
        Verificando acceso ejecutivo...
      </div>
    </div>
  );
}

if (!["superadmin"].includes(normalizedRole)) {
  return <Navigate to="/app" replace />;
}

  return (
    <div className="min-h-screen bg-[#041018] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.14),transparent_22%),linear-gradient(to_bottom,#051019,#07141d,#071018)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_18%_18%,rgba(45,212,191,0.16),transparent_18%),radial-gradient(circle_at_82%_12%,rgba(34,211,238,0.14),transparent_14%),radial-gradient(circle_at_55%_78%,rgba(16,185,129,0.12),transparent_20%)]" />

      <header className="relative z-20 border-b border-white/10 bg-[#07141d]/82 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 sm:px-5 py-4 shadow-[0_0_40px_rgba(34,211,238,0.10)]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-2.5 shadow-[0_0_28px_rgba(45,212,191,0.10)]">
                    <img
                      src={logoJaha}
                      alt="JAHA 2041"
                      className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-[26px] sm:text-[40px] leading-none font-black tracking-[0.15em] text-white">
                      SUPER <span className="text-teal-300">ADMIN</span>
                    </h1>
                    <p className="mt-2 text-[11px] sm:text-[14px] uppercase tracking-[0.24em] text-white/45">
                      Centro ejecutivo inteligente · intendente Rodrigo
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <div className="rounded-[22px] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/80">
                      Usuario activo
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {currentUserName}
                    </p>
                    <p className="text-xs text-white/45 uppercase tracking-[0.14em]">
                      {role}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate("/app")}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition hover:bg-white/[0.10]"
                    >
                      Ver app ciudadana
                    </button>

                    <button
                      onClick={handleLogout}
                      className="rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.22)]"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {[
  ["dashboard", "Dashboard"],
  ["denuncias", "Denuncias"],
  ["proyectos", "Proyectos"],
  ["transparencia", "Transparencia"],
  ["usuarios", "Usuarios"],
].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTab(key)}
                    className={[
                      "min-w-[120px] rounded-[24px] border px-5 py-3 text-[14px] font-semibold transition-all duration-200 backdrop-blur-xl",
                      tab === key
                        ? "bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 border-teal-300 shadow-[0_12px_30px_rgba(45,212,191,0.24)]"
                        : "bg-white/[0.035] text-white/72 border-white/10 hover:bg-white/[0.08] hover:text-white",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

     <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3">
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
    <StatCard
      title="Total denuncias"
      value={totalReports}
      subtitle="Lectura general del municipio."
      tone="cyan"
    />
    <StatCard
      title="Urgentes"
      value={urgentCount}
      subtitle="Casos con prioridad alta."
      tone="red"
    />
    <StatCard
      title="En proceso"
      value={processCount}
      subtitle="Casos ya en gestión."
      tone="amber"
    />
    <StatCard
      title="Resueltas"
      value={solvedCount}
      subtitle="Casos cerrados y visibles."
      tone="green"
    />
    <StatCard
      title="Usuarios"
      value={totalUsers}
      subtitle="Usuarios registrados en la plataforma."
      tone="cyan"
    />
    <StatCard
      title="Super admins"
      value={superAdminsCount}
      subtitle="Usuarios con acceso ejecutivo."
      tone="violet"
    />
  </div>
</section>

      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-8">
        {tab === "dashboard" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
            <div className="space-y-5">
              <ShellCard>
                <SectionHeader
                  title="Radar ejecutivo"
                  subtitle="Vista rápida para decisión política y operativa."
                />
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Flujo general
                    </p>
                    <div className="mt-4 space-y-4">
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-white/65">Recientes</span>
                          <span className="font-black text-red-300">{pendingCount}</span>
                        </div>
                        <MiniBar
                          value={totalReports ? (pendingCount / totalReports) * 100 : 0}
                          color="#ef4444"
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-white/65">En proceso</span>
                          <span className="font-black text-amber-300">{processCount}</span>
                        </div>
                        <MiniBar
                          value={totalReports ? (processCount / totalReports) * 100 : 0}
                          color="#f59e0b"
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-white/65">Resueltas</span>
                          <span className="font-black text-emerald-300">{solvedCount}</span>
                        </div>
                        <MiniBar
                          value={totalReports ? (solvedCount / totalReports) * 100 : 0}
                          color="#10b981"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Participación ciudadana
                    </p>
                    <p className="mt-4 text-4xl font-black text-white">
                      {supportTotal.toLocaleString("es-PY")}
                    </p>
                    <p className="mt-2 text-sm text-white/55 leading-relaxed">
                      Apoyos acumulados por vecinos en todos los reclamos.
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                          Barrios activos
                        </p>
                        <p className="mt-2 text-2xl font-black text-cyan-300">
                          {topBarrios.length}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-white/45">
                          Categorías activas
                        </p>
                        <p className="mt-2 text-2xl font-black text-teal-300">
                          {topCategories.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ShellCard>

              <ShellCard>
                <SectionHeader
                  title="Barrios más afectados"
                  subtitle="Dónde conviene enfocar respuesta, presencia y obra."
                />
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topBarrios.length ? (
                      topBarrios.map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="rounded-[24px] border border-white/10 bg-[#08141d] p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-lg font-black text-white">{item.name}</p>
                              <p className="text-sm text-white/50">
                                Concentración de reclamos
                              </p>
                            </div>
                            <div className="rounded-full bg-cyan-400/10 px-4 py-2 text-cyan-300 font-black">
                              {item.total}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-5 text-white/55">
                        Todavía no hay denuncias suficientes para medir barrios.
                      </div>
                    )}
                  </div>
                </div>
              </ShellCard>
            </div>

            <div className="space-y-5">
              <ShellCard>
                <SectionHeader
                  title="Top categorías"
                  subtitle="Qué está pidiendo más atención municipal."
                />
                <div className="p-5 space-y-3">
                  {topCategories.length ? (
                    topCategories.map((item) => (
                      <div
                        key={item.key}
                        className="rounded-[22px] border border-white/10 bg-[#08141d] p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl">{item.icon}</span>
                            <div className="min-w-0">
                              <p className="font-black text-white truncate">{item.label}</p>
                              <p className="text-sm text-white/45">
                                Demanda ciudadana detectada
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-sm font-black text-cyan-300">
                            {item.total}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[22px] border border-white/10 bg-[#08141d] p-4 text-white/55">
                      Sin datos todavía.
                    </div>
                  )}
                </div>
              </ShellCard>

              <ShellCard>
                <SectionHeader
                  title="Acceso rápido"
                  subtitle="Movimientos directos del super admin."
                />
                <div className="p-5 grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setTab("denuncias")}
                    className="rounded-[22px] bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-4 text-left font-black text-slate-950 shadow-[0_0_22px_rgba(45,212,191,0.22)]"
                  >
                    Ir a gestión de denuncias
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("proyectos")}
                    className="rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4 text-left font-bold text-white hover:bg-white/[0.08]"
                  >
                    Ir a proyectos estratégicos
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("transparencia")}
                    className="rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-4 text-left font-bold text-white hover:bg-white/[0.08]"
                  >
                    Ir a transparencia pública
                  </button>
                </div>
              </ShellCard>
            </div>
          </div>
        )}

        {tab === "denuncias" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
            <ShellCard>
              <SectionHeader
                title="Gestión de denuncias"
                subtitle="Filtrá, priorizá y mové estados en tiempo real."
                right={
                  <button
                    type="button"
                    onClick={loadAll}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white hover:bg-white/[0.08]"
                  >
                    Recargar
                  </button>
                }
              />

              <div className="p-5">
                <div className="mb-5 flex flex-col gap-3 md:flex-row">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-[#08141d] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="pendiente">Reciente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="resuelto">Resuelto</option>
                  </select>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-2xl border border-white/10 bg-[#08141d] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="all">Todas las categorías</option>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {reportsLoading ? (
                    <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-5 text-white/55">
                      Cargando denuncias...
                    </div>
                  ) : filteredReports.length ? (
                    filteredReports.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => setSelectedReportId(report.id)}
                        className={[
                          "w-full rounded-[24px] border p-4 text-left transition",
                          selectedReportId === report.id
                            ? "border-cyan-300/40 bg-cyan-400/10"
                            : "border-white/10 bg-[#08141d] hover:bg-white/[0.06]",
                        ].join(" ")}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span>{report.categoryMeta.icon}</span>
                              <p className="font-black text-white truncate">
                                {report.title}
                              </p>
                            </div>

                            <p className="mt-1 text-sm text-white/50">
                              {report.parsedBarrio || "Sin barrio"} ·{" "}
                              {report.categoryMeta.label}
                            </p>

                            <p className="mt-2 line-clamp-2 text-sm text-white/68">
                              {report.cleanDescription || "Sin descripción."}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <StatusPill status={report.status} />
                            {report.parsedUrgent ? (
                              <span className="rounded-full bg-red-500/15 px-3 py-1 text-[11px] font-bold text-red-300">
                                Urgente
                              </span>
                            ) : null}
                            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-bold text-white/70">
                              Apoyos {report.parsedSupports || 0}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-5 text-white/55">
                      No hay denuncias con esos filtros.
                    </div>
                  )}
                </div>
              </div>
            </ShellCard>

            <ShellCard>
              <SectionHeader
                title="Ficha ejecutiva"
                subtitle="Acción rápida para el intendente y el equipo."
              />

              <div className="p-5">
                {selectedReport ? (
                  <div className="space-y-4">
                    <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">
                              {selectedReport.categoryMeta.icon}
                            </span>
                            <h3 className="text-lg font-black text-white">
                              {selectedReport.title}
                            </h3>
                          </div>

                          <p className="mt-2 text-sm text-white/50">
                            {selectedReport.full_name || "Ciudadano"} ·{" "}
                            {selectedReport.parsedBarrio || "Sin barrio"}
                          </p>
                        </div>

                        <StatusPill status={selectedReport.status} />
                      </div>

                      <p className="mt-4 text-sm leading-relaxed text-white/72">
                        {selectedReport.cleanDescription || "Sin descripción."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/70">
                          Categoría: {selectedReport.categoryMeta.label}
                        </span>
                        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-white/70">
                          Apoyos: {selectedReport.parsedSupports || 0}
                        </span>
                        {selectedReport.parsedUrgent ? (
                          <span className="rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-300">
                            Prioridad alta
                          </span>
                        ) : null}
                      </div>

                      {selectedReport.parsedPhotoUrls?.length ? (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {selectedReport.parsedPhotoUrls.map((url, index) => (
                            <a
                              key={`${url}-${index}`}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block overflow-hidden rounded-2xl border border-white/10"
                            >
                              <img
                                src={url}
                                alt={`Evidencia ${index + 1}`}
                                className="h-32 w-full object-cover"
                              />
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                        Acciones rápidas
                      </p>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <button
                          type="button"
                          disabled={savingReportId === selectedReport.id}
                          onClick={() =>
                            handleChangeReportStatus(selectedReport, "pendiente")
                          }
                          className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-left font-bold text-red-200 hover:bg-red-500/15 disabled:opacity-60"
                        >
                          Marcar como reciente
                        </button>

                        <button
                          type="button"
                          disabled={savingReportId === selectedReport.id}
                          onClick={() =>
                            handleChangeReportStatus(selectedReport, "en_proceso")
                          }
                          className="rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-left font-bold text-amber-200 hover:bg-amber-500/15 disabled:opacity-60"
                        >
                          Pasar a en proceso
                        </button>

                        <button
                          type="button"
                          disabled={savingReportId === selectedReport.id}
                          onClick={() =>
                            handleChangeReportStatus(selectedReport, "resuelto")
                          }
                          className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-left font-bold text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60"
                        >
                          Marcar como resuelto
                        </button>

                        <button
                          type="button"
                          disabled={savingReportId === selectedReport.id}
                          onClick={() => handleToggleUrgent(selectedReport)}
                          className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-left font-bold text-cyan-200 hover:bg-cyan-400/15 disabled:opacity-60"
                        >
                          {selectedReport.parsedUrgent
                            ? "Quitar prioridad urgente"
                            : "Marcar como urgente"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-5 text-white/55">
                    Seleccioná una denuncia para ver su ficha completa.
                  </div>
                )}
              </div>
            </ShellCard>
          </div>
        )}

        {tab === "proyectos" && (
          <ShellCard>
            <SectionHeader
              title="Proyectos estratégicos"
              subtitle="Panel inteligente de lectura política y operativa."
            />
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
              {projects.map((project, index) => {
                const progress = Number(project.progress) || 0;
                const color = getProgressColor(progress);

                return (
                  <div
                    key={project.id || index}
                    className="rounded-[28px] border border-white/10 bg-[#08141d] p-5 shadow-[0_0_28px_rgba(34,211,238,0.04)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-black text-white">
                          {project.name || "Proyecto estratégico"}
                        </h3>
                        <p className="mt-1 text-sm text-white/50">
                          {project.area || "Área municipal"}
                        </p>
                      </div>

                      <span
                        className="h-4 w-4 rounded-full shrink-0"
                        style={{
                          background: color,
                          boxShadow: `0 0 14px ${color}`,
                        }}
                      />
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-white/68">
                      {project.description || "Sin descripción."}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm text-white/60">Avance actual</span>
                      <span className="font-black" style={{ color }}>
                        {progress}%
                      </span>
                    </div>

                    <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background: color,
                          boxShadow: `0 0 18px ${color}`,
                        }}
                      />
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[11px] uppercase tracking-[0.15em] text-white/45">
                        Lectura smart
                      </p>
                      <p className="mt-2 text-sm text-white/70">
                        {progress >= 80
                          ? "Proyecto bien posicionado. Conviene comunicarlo fuerte."
                          : progress >= 40
                          ? "Proyecto avanzando. Requiere seguimiento y visibilidad."
                          : "Proyecto sensible. Necesita empuje político y operativo."}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ShellCard>
        )}

        {tab === "transparencia" && (
          <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5">
            <ShellCard>
              <SectionHeader
                title="Transparencia ejecutiva"
                subtitle="Lo que la ciudadanía debería ver claro y ordenado."
              />
              <div className="p-5 space-y-4">
                {transparency.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-[24px] border border-white/10 bg-[#08141d] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-black text-white">
                          {item.title || "Dato público"}
                        </p>
                        <p className="mt-1 text-sm text-white/50">
                          {item.detail || "Información consolidada"}
                        </p>
                      </div>

                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-black text-emerald-300">
                        {item.trend || "+0%"}
                      </span>
                    </div>

                    <p className="mt-4 text-3xl font-black text-cyan-300">
                      {formatGs(item.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </ShellCard>

            <ShellCard>
              <SectionHeader
                title="Mensaje institucional sugerido"
                subtitle="Texto guía para comunicar gestión con claridad."
              />
              <div className="p-5">
                <div className="rounded-[26px] border border-white/10 bg-[#08141d] p-5">
                  <p className="text-sm leading-relaxed text-white/74">
                    Este panel permite ver en tiempo real dónde están los reclamos,
                    cómo avanzan los proyectos y cuál es el estado general del
                    municipio. La idea no es solamente mostrar números, sino
                    convertir los datos en decisiones más rápidas, más justas y más
                    visibles para la ciudadanía.
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-white/74">
                    Cuando una denuncia cambia de estado aquí, también mejora la
                    percepción pública allá afuera. Por eso este centro ejecutivo no
                    compite con la app ciudadana: la alimenta, la ordena y le da
                    coherencia.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                        Enfoque
                      </p>
                      <p className="mt-2 font-bold text-white">Rápido</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                        Estilo
                      </p>
                      <p className="mt-2 font-bold text-white">Tecnológico</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                        Resultado
                      </p>
                      <p className="mt-2 font-bold text-white">Inteligente</p>
                    </div>
                  </div>
                </div>
              </div>
            </ShellCard>
          </div>
        )}
                {tab === "usuarios" && (
          <ShellCard>
            <SectionHeader
              title="Usuarios registrados"
              subtitle="Vista rápida de ciudadanos y roles del sistema."
              right={
                <button
                  type="button"
                  onClick={loadAll}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white hover:bg-white/[0.08]"
                >
                  Recargar
                </button>
              }
            />

            <div className="p-5">
              <div className="grid grid-cols-1 gap-3">
                {users.length ? (
                  users.map((item) => {
                    const itemRole = String(item.role || "normal")
                      .toLowerCase()
                      .trim();

                    return (
                      <div
                        key={item.id}
                        className="rounded-[24px] border border-white/10 bg-[#08141d] p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-lg font-black text-white truncate">
                              {item.full_name || "Sin nombre"}
                            </p>
                            <p className="mt-1 text-sm text-white/50 truncate">
                              {item.email || "Sin correo"}
                            </p>
                            <p className="mt-2 text-xs uppercase tracking-[0.14em] text-white/35">
                              ID: {item.id}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={[
                                "rounded-full px-3 py-1 text-[11px] font-bold",
                                itemRole === "superadmin"
                                  ? "bg-cyan-400/10 text-cyan-300"
                                  : "bg-white/[0.06] text-white/70",
                              ].join(" ")}
                            >
                              {itemRole}
                            </span>

                            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-bold text-white/70">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString("es-PY")
                                : "Sin fecha"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-5 text-white/55">
                    Todavía no hay usuarios cargados en users_profile.
                  </div>
                )}
              </div>
            </div>
          </ShellCard>
        )}
      </main>
    </div>
  );
}