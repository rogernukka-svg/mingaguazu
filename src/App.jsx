import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import logoJaha from "./assets/logojahabicolor.png";
import supabase from "./lib/supabase.js";

/* =====================================================
   CENTRO REAL – MINGA GUAZÚ
===================================================== */
const MINGA_GUAZU_CENTER = [-25.4968706, -54.8418689];

/* =====================================================
   PROYECTOS – ACTUALIZADOS EN MINGA GUAZÚ
===================================================== */
const PROJECTS = [
  {
    id: 1,
    name: "Transparencia - rendición de cuentas en tiempo real",
    area: "Dirección de Finanzas",
    progress: 85,
    lat: -25.4978,
    lng: -54.8442,
    radius: 1400,
    description:
      "Sistema de seguimiento financiero con datos públicos y control ciudadano en tiempo real.",
  },
  {
    id: 2,
    name: "Guardería Municipal - Presentación",
    area: "Dirección de Obras",
    progress: 55,
    lat: -25.4939,
    lng: -54.8386,
    radius: 1800,
    description:
      "Proyecto de infraestructura social enfocado en atención infantil y fortalecimiento comunitario.",
  },
  {
    id: 3,
    name: "Iluminaciones de espacio público",
    area: "Seguridad",
    progress: 25,
    lat: -25.5008,
    lng: -54.8483,
    radius: 1300,
    description:
      "Mejora del alumbrado urbano para seguridad, movilidad y recuperación de espacios públicos.",
  },
];

/* =====================================================
   PUNTOS ESTRATÉGICOS – ACTUALIZADOS EN MINGA GUAZÚ
===================================================== */
const MAP_POINTS = [
  {
    id: "seg",
    type: "Seguridad",
    name: "Base Operativa de Seguridad Urbana",
    lat: -25.4952,
    lng: -54.8424,
    radius: 1600,
    color: "#22d3ee",
  },
  {
    id: "traf",
    type: "Tránsito",
    name: "Nodo de Tránsito Inteligente",
    lat: -25.4917,
    lng: -54.8401,
    radius: 1400,
    color: "#60a5fa",
  },
  {
    id: "sal",
    type: "Salud",
    name: "Unidad de Atención Barrial",
    lat: -25.4989,
    lng: -54.8397,
    radius: 1350,
    color: "#34d399",
  },
  {
    id: "edu",
    type: "Educación",
    name: "Complejo Educativo Público",
    lat: -25.4947,
    lng: -54.8468,
    radius: 1450,
    color: "#2dd4bf",
  },
];

const CATEGORY_META = {
  luz: { label: "Luz", icon: "💡" },
  agua: { label: "Agua", icon: "💧" },
  tanque_agua: { label: "Tanque de agua", icon: "🚰" },
  comision_vecinal: { label: "Comisión vecinal", icon: "👥" },
  calle: { label: "Calle", icon: "🚧" },
  basura: { label: "Basura", icon: "🗑️" },
  otro: { label: "Otro", icon: "📍" },
};

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

const STATUS_ORDER = ["pendiente", "en_proceso", "resuelto"];

/* =====================================================
   HELPERS
===================================================== */
function getProgressColor(progress) {
  if (progress >= 80) return "#10b981";
  if (progress >= 40) return "#f59e0b";
  return "#ef4444";
}

function getProgressLabel(progress) {
  if (progress >= 80) return "Avance sólido";
  if (progress >= 40) return "En desarrollo";
  return "Requiere atención";
}

function getStatusMeta(status) {
  return STATUS_META[status] || STATUS_META.pendiente;
}

function getCategoryMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META.otro;
}

function createProjectIcon(progress) {
  const color = getProgressColor(progress);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: ${color};
        border: 3px solid rgba(255,255,255,0.95);
        box-shadow:
          0 0 0 4px rgba(255,255,255,0.08),
          0 0 22px ${color};
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function createStrategicIcon(color) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.95);
        box-shadow:
          0 0 0 4px rgba(255,255,255,0.06),
          0 0 16px ${color};
      "></div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

function createReportIcon(status) {
  const meta = getStatusMeta(status);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 999px;
        background: ${meta.color};
        border: 3px solid rgba(255,255,255,0.95);
        box-shadow:
          0 0 0 4px rgba(255,255,255,0.08),
          0 0 16px ${meta.color};
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
}

function parseRichDescription(description = "") {
  const raw = String(description || "");
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);

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

function getDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/* =====================================================
   UI PIECES
===================================================== */
function TopTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={[
        "min-w-[122px] px-5 py-3 rounded-[24px] text-[15px] font-semibold transition-all duration-200 border backdrop-blur-xl",
        active
          ? "bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 border-teal-300 shadow-[0_12px_30px_rgba(45,212,191,0.24)]"
          : "bg-white/[0.035] text-white/72 border-white/10 hover:bg-white/[0.08] hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function InfoCard({ title, value, subtitle, tone = "cyan" }) {
  const toneStyles =
    tone === "green"
      ? {
          chip: "text-emerald-300",
          glow: "shadow-[0_0_28px_rgba(16,185,129,0.10)]",
        }
      : tone === "amber"
      ? {
          chip: "text-amber-300",
          glow: "shadow-[0_0_28px_rgba(245,158,11,0.10)]",
        }
      : tone === "red"
      ? {
          chip: "text-red-300",
          glow: "shadow-[0_0_28px_rgba(239,68,68,0.10)]",
        }
      : {
          chip: "text-cyan-300",
          glow: "shadow-[0_0_28px_rgba(34,211,238,0.10)]",
        };

  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-4 sm:p-5 ${toneStyles.glow}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
          {title}
        </p>
        <span
          className={`text-[10px] uppercase tracking-[0.18em] ${toneStyles.chip}`}
        >
          activo
        </span>
      </div>

      <p className="mt-3 text-3xl sm:text-4xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm text-white/50 leading-relaxed">{subtitle}</p>
    </div>
  );
}

function SectionShell({ title, subtitle, right, children }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-[0_0_35px_rgba(45,212,191,0.06)]">
      <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-[0.04em]">
            {title}
          </h2>
          {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function TinyLegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="w-3 h-3 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
      <span className="text-sm text-white/75">{label}</span>
    </div>
  );
}

function CategoryPill({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition",
        active
          ? "border-cyan-300/40 bg-cyan-400/10 text-white"
          : "border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08]",
      ].join(" ")}
    >
      <span>{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

function MapClickCapture({ enabled, onPick }) {
  useMapEvents({
    click(e) {
      if (!enabled) return;
      onPick(e.latlng);
    },
  });

  return null;
}

/* =====================================================
   MAIN APP
===================================================== */
export default function App() {
  const [view, setView] = useState("mapa");
  const [activeProject, setActiveProject] = useState(null);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [pickingOnMap, setPickingOnMap] = useState(false);
  const [reportPhotos, setReportPhotos] = useState([]);
  const [duplicateReport, setDuplicateReport] = useState(null);

  const [focusFlash, setFocusFlash] = useState(false);

  const sectionRef = useRef(null);

  const [reportForm, setReportForm] = useState({
    category: "luz",
    title: "",
    description: "",
    barrio: "",
    urgent: false,
    lat: MINGA_GUAZU_CENTER[0],
    lng: MINGA_GUAZU_CENTER[1],
  });

  useEffect(() => {
  let mounted = true;

  const loadSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    console.log("APP getSession:", { data, error });

    if (!mounted) return;

    setSession(data?.session ?? null);
    setAuthLoading(false);
  };

  loadSession();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, newSession) => {
    console.log("APP onAuthStateChange:", event, newSession);

    if (!mounted) return;

    setSession(newSession ?? null);
    setAuthLoading(false);
  });

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    if (!session?.user) return;
    loadReports();
  }, [session]);

  const goToView = (target) => {
    setView(target);

    setTimeout(() => {
      if (sectionRef.current) {
        sectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        setFocusFlash(true);
        setTimeout(() => setFocusFlash(false), 1200);
      }
    }, 80);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const loadReports = async () => {
    try {
      setReportsLoading(true);

      const { data, error } = await supabase
        .from("citizen_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (err) {
      console.error("LOAD REPORTS ERROR:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleReportField = (field, value) => {
    setReportForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReportPhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 4);
    setReportPhotos(files);
  };

  const uploadReportPhotos = async () => {
    if (!reportPhotos.length) return [];

    const uploadedUrls = [];

    for (const file of reportPhotos) {
      const safeName = `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${file.name.replace(/\s+/g, "-")}`;

      const path = `${session.user.id}/${safeName}`;

      const { error } = await supabase.storage
        .from("citizen-reports")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage
        .from("citizen-reports")
        .getPublicUrl(path);

      if (data?.publicUrl) {
        uploadedUrls.push(data.publicUrl);
      }
    }

    return uploadedUrls;
  };

  const findDuplicateReport = (nextForm) => {
    const candidate = reports.find((report) => {
      const sameCategory = report.category === nextForm.category;
      const distance = getDistanceMeters(
        Number(report.lat),
        Number(report.lng),
        Number(nextForm.lat),
        Number(nextForm.lng)
      );

      return sameCategory && distance <= 180;
    });

    return candidate || null;
  };

  const openReportModal = ({
    lat = MINGA_GUAZU_CENTER[0],
    lng = MINGA_GUAZU_CENTER[1],
  } = {}) => {
    const nextForm = {
      ...reportForm,
      lat,
      lng,
    };

    setReportForm(nextForm);
    setDuplicateReport(findDuplicateReport(nextForm));
    setReportModalOpen(true);
  };

  const resetReportForm = () => {
    setReportForm({
      category: "luz",
      title: "",
      description: "",
      barrio: "",
      urgent: false,
      lat: MINGA_GUAZU_CENTER[0],
      lng: MINGA_GUAZU_CENTER[1],
    });
    setReportPhotos([]);
    setDuplicateReport(null);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();

    if (!session?.user) return;

    if (!reportForm.title.trim() || !reportForm.description.trim()) {
      alert("Completá el título y la descripción.");
      return;
    }

    setReportSaving(true);

    try {
      const uploadedPhotoUrls = await uploadReportPhotos();

      const payload = {
        user_id: session.user.id,
        full_name:
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          currentUserName,
        email: session.user.email || "",
        category: reportForm.category,
        title: reportForm.title.trim(),
        description: buildRichDescription({
          barrio: reportForm.barrio,
          urgent: reportForm.urgent,
          description: reportForm.description,
          photoUrls: uploadedPhotoUrls,
          supports: 0,
        }),
        lat: Number(reportForm.lat),
        lng: Number(reportForm.lng),
        status: reportForm.urgent ? "en_proceso" : "pendiente",
      };

      const { data, error } = await supabase
        .from("citizen_reports")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      setReports((prev) => [data, ...prev]);
      resetReportForm();
      setPickingOnMap(false);
      setReportModalOpen(false);
      goToView("mapa");
      alert("Denuncia enviada correctamente.");
    } catch (err) {
      console.error("CREATE REPORT ERROR:", err);
      alert("No se pudo enviar la denuncia.");
    } finally {
      setReportSaving(false);
    }
  };

  const currentUser = session?.user ?? null;
  const currentUserName =
    currentUser?.user_metadata?.name ||
    currentUser?.email?.split("@")[0] ||
    "Ciudadano";
  const currentUserEmail = currentUser?.email || "Sin correo";

  const enrichedReports = useMemo(() => {
    return reports.map((report) => {
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

  const recentCount = enrichedReports.filter((r) => r.status === "pendiente").length;
  const processCount = enrichedReports.filter((r) => r.status === "en_proceso").length;
  const solvedCount = enrichedReports.filter((r) => r.status === "resuelto").length;
  const urgentCount = enrichedReports.filter((r) => r.parsedUrgent).length;

  const topBarrios = useMemo(() => {
    const map = new Map();

    for (const report of enrichedReports) {
      const barrio = report.parsedBarrio?.trim();
      if (!barrio) continue;
      map.set(barrio, (map.get(barrio) || 0) + 1);
    }

    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [enrichedReports]);

  const topCitizens = useMemo(() => {
    const map = new Map();

    for (const report of enrichedReports) {
      const name = report.full_name || "Ciudadano";
      map.set(name, (map.get(name) || 0) + 1);
    }

    return [...map.entries()]
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [enrichedReports]);

  const handleSupportReport = async (report) => {
    try {
      const parsed = parseRichDescription(report.description);

      const nextDescription = buildRichDescription({
        barrio: parsed.barrio,
        urgent: parsed.urgent,
        description: parsed.cleanDescription,
        photoUrls: parsed.photoUrls,
        supports: (parsed.supports || 0) + 1,
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
    } catch (err) {
      console.error("SUPPORT REPORT ERROR:", err);
      alert("No se pudo sumar tu apoyo.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#041018] text-white flex items-center justify-center">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-4 backdrop-blur-xl">
          Cargando sesión...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#041018] text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.14),transparent_22%),linear-gradient(to_bottom,#051019,#07141d,#071018)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:30px_30px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.16),transparent_18%),radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.12),transparent_14%),radial-gradient(circle_at_50%_75%,rgba(16,185,129,0.10),transparent_20%)]" />

      <header className="relative z-[1001] border-b border-white/10 bg-[#07141d]/82 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] px-4 sm:px-5 py-4 shadow-[0_0_40px_rgba(34,211,238,0.10)]">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="rounded-[26px] border border-white/10 bg-white/[0.05] p-2.5 shadow-[0_0_28px_rgba(45,212,191,0.10)]">
                    <img
                      src={logoJaha}
                      alt="JAHA 2041"
                      className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-[30px] sm:text-[44px] leading-none font-black tracking-[0.16em] text-white">
                      JAHA <span className="text-teal-300">2041</span>
                    </h1>
                    <p className="mt-2 text-[11px] sm:text-[15px] uppercase tracking-[0.26em] text-white/45">
                      Plataforma urbana inteligente · Minga Guazú
                    </p>
                  </div>
                </div>

                <div className="max-w-[180px] sm:max-w-[260px] text-right shrink-0 pt-1">
                  <p className="text-lg sm:text-2xl font-black text-white truncate">
                    {currentUserName}
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-white/45 truncate">
                    {currentUserEmail}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <nav className="flex flex-wrap gap-3">
                  <TopTab active={view === "mapa"} onClick={() => goToView("mapa")}>
                    Mapa
                  </TopTab>

                  <TopTab
                    active={view === "proyectos"}
                    onClick={() => goToView("proyectos")}
                  >
                    Proyectos
                  </TopTab>

                  <TopTab
                    active={view === "participar"}
                    onClick={() => goToView("participar")}
                  >
                    Participar
                  </TopTab>

                  <TopTab
                    active={view === "seguimiento"}
                    onClick={() => goToView("seguimiento")}
                  >
                    Seguimiento
                  </TopTab>

                  <TopTab active={view === "perfil"} onClick={() => goToView("perfil")}>
                    Perfil
                  </TopTab>

                  <TopTab
                    active={view === "transparencia"}
                    onClick={() => goToView("transparencia")}
                  >
                    Transparencia
                  </TopTab>
                </nav>

                <div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center rounded-[24px] border border-white/10 bg-white/[0.05] px-5 py-3 text-base font-bold text-white transition hover:bg-white/[0.10]"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5 pb-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InfoCard
            title="Proyectos activos"
            value={PROJECTS.length}
            subtitle="Frentes estratégicos disponibles en el sistema."
            tone="cyan"
          />
          <InfoCard
            title="Denuncias recientes"
            value={recentCount}
            subtitle="Reportes nuevos esperando atención."
            tone="red"
          />
          <InfoCard
            title="En proceso"
            value={processCount}
            subtitle="Casos que ya están siendo trabajados."
            tone="amber"
          />
          <InfoCard
            title="Resueltas"
            value={solvedCount}
            subtitle="Casos cerrados y con avance visible."
            tone="green"
          />
        </div>
      </section>

      <main
        ref={sectionRef}
        className={[
          "relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-6 transition-all duration-500",
          focusFlash
            ? "rounded-[32px] ring-2 ring-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
            : "",
        ].join(" ")}
      >
        {view === "mapa" && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl overflow-hidden shadow-[0_0_35px_rgba(34,211,238,0.08)]">
              <div className="px-5 sm:px-6 py-5 border-b border-white/10 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-[0.04em]">
                    Centro Urbano Inteligente
                  </h2>
                  <p className="mt-1 text-sm text-white/50">
                    Tocá el mapa para reportar. Los colores muestran el estado de las denuncias.
                  </p>
                </div>

                <button
                  onClick={() => goToView("proyectos")}
                  className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-bold shadow-[0_0_24px_rgba(45,212,191,0.22)] hover:scale-[1.02] transition"
                >
                  Ver proyectos
                </button>
              </div>

              <div className="h-[72vh] min-h-[520px] relative">
                <MapContainer
                  center={MINGA_GUAZU_CENTER}
                  zoom={13}
                  maxBounds={[
                    [-25.56, -54.93],
                    [-25.44, -54.76],
                  ]}
                  maxBoundsViscosity={1.0}
                  className="h-full w-full z-0"
                >
                  <MapClickCapture
                    enabled={true}
                    onPick={({ lat, lng }) => {
                      setPickingOnMap(true);
                      openReportModal({ lat, lng });
                    }}
                  />

                  <TileLayer
                    attribution="&copy; OpenStreetMap & Carto"
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />

                  {PROJECTS.map((p) => {
                    const color = getProgressColor(p.progress);
                    const isActive = activeProject === p.id;

                    return (
                      <React.Fragment key={p.id}>
                        {isActive && (
                          <Circle
                            center={[p.lat, p.lng]}
                            radius={p.radius}
                            pathOptions={{
                              color,
                              fillColor: color,
                              fillOpacity: 0.16,
                              weight: 2,
                            }}
                          />
                        )}

                        <Marker
                          position={[p.lat, p.lng]}
                          icon={createProjectIcon(p.progress)}
                          eventHandlers={{
                            click: () => setActiveProject(p.id),
                          }}
                        >
                          <Popup className="jaha-popup">
                            <div className="text-black min-w-[230px]">
                              <div className="font-extrabold text-sm">{p.name}</div>
                              <div className="mt-1 text-xs text-neutral-700">
                                Área: {p.area}
                              </div>
                              <div className="mt-2 text-sm">
                                Avance: <b>{p.progress}%</b>
                              </div>
                              <div className="mt-1 text-xs text-neutral-600">
                                {getProgressLabel(p.progress)}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  })}

                  {!activeProject &&
                    MAP_POINTS.map((p) => (
                      <React.Fragment key={p.id}>
                        <Circle
                          center={[p.lat, p.lng]}
                          radius={p.radius}
                          pathOptions={{
                            color: p.color,
                            fillColor: p.color,
                            fillOpacity: 0.09,
                            weight: 1.5,
                          }}
                        />
                        <Marker position={[p.lat, p.lng]} icon={createStrategicIcon(p.color)}>
                          <Popup className="jaha-popup">
                            <div className="text-black min-w-[220px]">
                              <div className="font-extrabold text-sm">{p.name}</div>
                              <div className="mt-1 text-xs text-neutral-700">
                                Tipo: {p.type}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    ))}

                  {enrichedReports.map((report) => (
                    <Marker
                      key={report.id}
                      position={[Number(report.lat), Number(report.lng)]}
                      icon={createReportIcon(report.status)}
                    >
                      <Popup className="jaha-popup">
                        <div className="text-black min-w-[260px]">
                          <div className="flex items-center gap-2">
                            <span>{report.categoryMeta.icon}</span>
                            <div className="font-extrabold text-sm">{report.title}</div>
                          </div>

                          <div className="mt-1 text-xs text-neutral-700">
                            Categoría: {report.categoryMeta.label}
                          </div>

                          {report.parsedBarrio ? (
                            <div className="mt-1 text-xs text-neutral-700">
                              Barrio: {report.parsedBarrio}
                            </div>
                          ) : null}

                          <div className="mt-2 text-sm text-neutral-800">
                            {report.cleanDescription}
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className="rounded-full px-2 py-1 text-[11px] font-bold"
                              style={{
                                background: report.statusMeta.soft,
                                color: report.statusMeta.color,
                              }}
                            >
                              {report.statusMeta.label}
                            </span>

                            {report.parsedUrgent ? (
                              <span className="rounded-full bg-red-100 px-2 py-1 text-[11px] font-bold text-red-600">
                                Urgente
                              </span>
                            ) : null}

                            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
                              Apoyos: {report.parsedSupports || 0}
                            </span>
                          </div>

                          {report.parsedPhotoUrls?.length ? (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {report.parsedPhotoUrls.slice(0, 3).map((url, index) => (
                                <a
                                  key={`${url}-${index}`}
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block overflow-hidden rounded-xl border border-neutral-200"
                                >
                                  <img
                                    src={url}
                                    alt={`Evidencia ${index + 1}`}
                                    className="h-20 w-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-3 text-xs text-neutral-500">
                            Reportado por: {report.full_name || "Ciudadano"}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSupportReport(report)}
                            className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
                          >
                            Sumarme a este reclamo
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#07141d]/28 to-transparent z-[500]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#07141d]/28 to-transparent z-[500]" />

                <button
                  type="button"
                  onClick={() => {
                    setPickingOnMap(false);
                    openReportModal();
                  }}
                  className="absolute bottom-5 left-5 z-[1200] flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[#041018] shadow-[0_18px_40px_rgba(0,0,0,0.28)] transition hover:scale-[1.03] active:scale-[0.98]"
                  aria-label="Nueva denuncia ciudadana"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#041018] text-white text-xl font-black">
                    +
                  </span>
                  <span className="text-sm font-bold">Reportar</span>
                </button>

                <button
                  onClick={() => goToView("proyectos")}
                  className="sm:hidden absolute bottom-4 right-4 z-[1100] px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black shadow-[0_0_22px_rgba(45,212,191,0.28)]"
                >
                  Ver proyectos
                </button>
              </div>
            </div>

            <aside className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-5 shadow-[0_0_35px_rgba(34,211,238,0.06)]">
              <div className="flex items-center gap-3">
                <div className="rounded-[18px] border border-white/10 bg-white/[0.05] p-2">
                  <img src={logoJaha} alt="JAHA" className="w-12 h-12 object-contain" />
                </div>

                <div>
                  <h3 className="text-lg font-black tracking-[0.04em]">
                    Panel rápido
                  </h3>
                  <p className="text-xs text-white/45 uppercase tracking-[0.16em]">
                    lectura fácil
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                  <p className="text-[11px] uppercase tracking-[0.20em] text-cyan-300/80">
                    Cómo usar
                  </p>
                  <p className="mt-2 text-sm text-white/78 leading-relaxed">
                    Tocá el mapa o el botón <b>Reportar</b>. La denuncia se abre con ubicación automática.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                  <p className="text-sm font-bold text-white mb-3">Estado ciudadano</p>
                  <div className="space-y-3">
                    <TinyLegendDot color="#ef4444" label="Rojo · reciente" />
                    <TinyLegendDot color="#f59e0b" label="Amarillo · en proceso" />
                    <TinyLegendDot color="#10b981" label="Verde · resuelto" />
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                  <p className="text-sm font-bold text-white">Urgencias activas</p>
                  <p className="mt-2 text-2xl font-black text-red-300">{urgentCount}</p>
                  <p className="mt-1 text-sm text-white/55">
                    Casos marcados como prioritarios por vecinos.
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-[#08141d] p-4">
                  <p className="text-sm font-bold text-white">Usuario conectado</p>
                  <p className="mt-2 text-sm text-white/65 leading-relaxed">
                    {currentUserName}
                  </p>
                  <p className="mt-1 text-xs text-white/45">{currentUserEmail}</p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {view === "proyectos" && (
          <div className="space-y-5">
            <SectionShell
              title="Proyectos Estratégicos"
              subtitle="Plan de Desarrollo Municipal · Horizonte 2041"
              right={
                <button
                  onClick={() => goToView("mapa")}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 font-black shadow-[0_0_24px_rgba(45,212,191,0.22)]"
                >
                  Volver al mapa
                </button>
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {PROJECTS.map((p) => {
                  const color = getProgressColor(p.progress);

                  return (
                    <div
                      key={p.id}
                      className="rounded-[28px] border border-white/10 bg-[#08141d]/90 p-5 shadow-[0_0_30px_rgba(34,211,238,0.04)] hover:translate-y-[-2px] transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-black text-white">{p.name}</h3>
                          <p className="text-sm text-white/50 mt-1">{p.area}</p>
                        </div>

                        <span
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{
                            background: color,
                            boxShadow: `0 0 14px ${color}`,
                          }}
                        />
                      </div>

                      <p className="mt-4 text-sm text-white/68 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-sm text-white/60">Avance actual</span>
                        <span className="font-black" style={{ color }}>
                          {p.progress}%
                        </span>
                      </div>

                      <div className="mt-3 h-3 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${p.progress}%`,
                            background: color,
                            boxShadow: `0 0 18px ${color}`,
                          }}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setActiveProject(p.id);
                            goToView("mapa");
                          }}
                          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-sm font-black transition"
                        >
                          Ver en mapa
                        </button>

                        <button className="px-4 py-2 rounded-2xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.08] text-white text-sm font-semibold transition">
                          Ver detalle
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionShell>
          </div>
        )}

        {view === "participar" && (
          <div className="space-y-5">
            <SectionShell
              title="Denuncias Ciudadanas"
              subtitle="Participación real del vecino, con barrio, urgencia y seguimiento."
            >
              <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5">
                <div className="rounded-[28px] border border-white/10 bg-[#08141d]/90 p-5 shadow-[0_0_30px_rgba(34,211,238,0.04)]">
                  <h3 className="text-lg font-black text-white">Nueva denuncia</h3>
                  <p className="mt-2 text-sm text-white/65 leading-relaxed">
                    Elegí una categoría, escribí claro qué está pasando y marcá si es urgente.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {Object.entries(CATEGORY_META).map(([key, meta]) => (
                      <CategoryPill
                        key={key}
                        active={reportForm.category === key}
                        icon={meta.icon}
                        label={meta.label}
                        onClick={() => handleReportField("category", key)}
                      />
                    ))}
                  </div>

                  <form onSubmit={handleCreateReport} className="mt-5 space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-white/75">Barrio</label>
                      <input
                        type="text"
                        value={reportForm.barrio}
                        onChange={(e) => handleReportField("barrio", e.target.value)}
                        placeholder="Ej: Santa Mónica"
                        className="w-full rounded-2xl border border-white/10 bg-[#07141d] px-4 py-3 text-white outline-none placeholder:text-white/30"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/75">
                        Título corto
                      </label>
                      <input
                        type="text"
                        value={reportForm.title}
                        onChange={(e) => handleReportField("title", e.target.value)}
                        placeholder="Ej: En mi barrio no tenemos luz"
                        className="w-full rounded-2xl border border-white/10 bg-[#07141d] px-4 py-3 text-white outline-none placeholder:text-white/30"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-white/75">
                        Descripción
                      </label>
                      <textarea
                        rows={5}
                        value={reportForm.description}
                        onChange={(e) => handleReportField("description", e.target.value)}
                        placeholder="Contá qué pasa, desde cuándo y cómo afecta al barrio."
                        className="w-full rounded-2xl border border-white/10 bg-[#07141d] px-4 py-3 text-white outline-none placeholder:text-white/30 resize-none"
                      />
                    </div>

                    <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reportForm.urgent}
                        onChange={(e) => handleReportField("urgent", e.target.checked)}
                        className="h-4 w-4"
                      />
                      <div>
                        <p className="text-sm font-bold text-white">¿Es urgente?</p>
                        <p className="text-xs text-white/55">
                          Esto ayuda a priorizar casos sensibles.
                        </p>
                      </div>
                    </label>

                    <div>
                      <label className="mb-2 block text-sm text-white/75">
                        Fotos de evidencia
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleReportPhotos}
                        className="block w-full rounded-2xl border border-white/10 bg-[#07141d] px-4 py-3 text-sm text-white"
                      />

                      {reportPhotos.length > 0 ? (
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {reportPhotos.map((file, index) => (
                            <div
                              key={`${file.name}-${index}`}
                              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-24 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm text-white/75">
                          Latitud
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={reportForm.lat}
                          onChange={(e) => handleReportField("lat", e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-[#07141d] px-4 py-3 text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm text-white/75">
                          Longitud
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={reportForm.lng}
                          onChange={(e) => handleReportField("lng", e.target.value)}
                          className="w-full rounded-2xl border border-white/10 bg-[#07141d] px-4 py-3 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-white/75">
                      Podés tocar el mapa y abrir la denuncia automáticamente con la ubicación ya marcada.
                    </div>

                    <button
                      type="submit"
                      disabled={reportSaving}
                      className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-3 font-black text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.22)] transition disabled:opacity-60"
                    >
                      {reportSaving ? "Enviando denuncia..." : "Enviar denuncia"}
                    </button>
                  </form>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#08141d]/90 p-5 shadow-[0_0_30px_rgba(34,211,238,0.04)]">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black text-white">Ranking y comunidad</h3>
                    <button
                      onClick={loadReports}
                      className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white"
                    >
                      Actualizar
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-bold text-white">Barrios más participativos</p>
                      <div className="mt-3 space-y-3">
                        {topBarrios.length === 0 ? (
                          <p className="text-sm text-white/55">Todavía no hay barrios cargados.</p>
                        ) : (
                          topBarrios.map((item, index) => (
                            <div
                              key={item.name}
                              className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2"
                            >
                              <span className="text-sm text-white/80">
                                #{index + 1} {item.name}
                              </span>
                              <span className="text-sm font-black text-cyan-300">
                                {item.total}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-bold text-white">Vecinos activos</p>
                      <div className="mt-3 space-y-3">
                        {topCitizens.length === 0 ? (
                          <p className="text-sm text-white/55">Todavía no hay participación registrada.</p>
                        ) : (
                          topCitizens.map((item, index) => (
                            <div
                              key={`${item.name}-${index}`}
                              className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-3 py-2"
                            >
                              <span className="text-sm text-white/80">
                                #{index + 1} {item.name}
                              </span>
                              <span className="text-sm font-black text-emerald-300">
                                {item.total}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SectionShell>
          </div>
        )}

        {view === "seguimiento" && (
          <div className="space-y-5">
            <SectionShell
              title="Seguimiento ciudadano"
              subtitle="Visibilidad del proceso para generar confianza."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATUS_ORDER.map((status) => {
                  const meta = getStatusMeta(status);
                  const items = enrichedReports.filter((r) => r.status === status);

                  return (
                    <div
                      key={status}
                      className="rounded-[24px] border border-white/10 bg-[#08141d]/90 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{meta.label}</span>
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{
                            background: meta.color,
                            boxShadow: `0 0 12px ${meta.color}`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-3xl font-black text-white">{items.length}</p>
                      <p className="mt-2 text-sm text-white/55">
                        {status === "pendiente" && "Denuncias nuevas cargadas por vecinos."}
                        {status === "en_proceso" && "Casos que ya fueron tomados para acción."}
                        {status === "resuelto" && "Casos cerrados con respuesta visible."}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {enrichedReports.slice(0, 6).map((report) => (
                  <div
                    key={report.id}
                    className="rounded-[24px] border border-white/10 bg-[#08141d]/90 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white flex items-center gap-2">
                          <span>{report.categoryMeta.icon}</span>
                          <span>{report.title}</span>
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          {report.parsedBarrio || "Barrio no especificado"}
                        </p>
                      </div>

                      <span
                        className="rounded-full px-3 py-1 text-[11px] font-bold"
                        style={{
                          background: report.statusMeta.soft,
                          color: report.statusMeta.color,
                        }}
                      >
                        {report.statusMeta.label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/68 leading-relaxed">
                      {report.cleanDescription}
                    </p>

                    {report.parsedUrgent ? (
                      <div className="mt-3 text-xs font-bold text-red-300">
                        Prioridad alta
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </SectionShell>
          </div>
        )}

        {view === "perfil" && (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.06)]">
              <div className="flex flex-col items-center text-center">
                <div className="rounded-[24px] border border-white/10 bg-[#08141d]/90 p-3">
                  <img src={logoJaha} alt="JAHA" className="w-24 h-24 object-contain" />
                </div>

                <h2 className="mt-4 text-xl font-black tracking-[0.04em]">
                  {currentUserName}
                </h2>
                <p className="mt-2 text-sm text-white/55">{currentUserEmail}</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.05] backdrop-blur-xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.06)]">
              <h3 className="text-lg font-black text-white">Sobre la plataforma</h3>

              <p className="mt-3 text-white/68 leading-relaxed">
                JAHA 2041 combina mapa, participación ciudadana, seguimiento municipal
                y transparencia para convertir reclamos en visibilidad pública y acción real.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Acceso a información pública",
                  "Monitoreo de proyectos y obras",
                  "Participación activa ciudadana",
                  "Seguimiento por estado",
                  "Barrios más participativos",
                  "Sesión segura con Supabase",
                  "Transparencia municipal",
                  "Denuncias con fotos",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/10 bg-[#08141d]/90 p-4 text-sm text-white/78"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "transparencia" && (
          <div className="space-y-5">
            <SectionShell
              title="Transparencia Municipal"
              subtitle="Ingresos y egresos explicados de forma clara para el ciudadano."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <InfoCard
                  title="Ingresos tributarios"
                  value="5 áreas"
                  subtitle="Impuesto inmobiliario, patentes, tasas y contribuciones."
                  tone="green"
                />
                <InfoCard
                  title="Ingresos no tributarios"
                  value="2 áreas"
                  subtitle="Multas y concesiones municipales."
                  tone="cyan"
                />
                <InfoCard
                  title="Transferencias"
                  value="3 fuentes"
                  subtitle="Royalties, FONAE y Tesoro Nacional."
                  tone="amber"
                />
                <InfoCard
                  title="Egresos principales"
                  value="4 bloques"
                  subtitle="Personal, servicios, inversión física y transferencias."
                  tone="red"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="rounded-[28px] border border-white/10 bg-[#08141d]/90 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-emerald-300">
                        Ingresos Municipales
                      </h3>
                      <p className="mt-1 text-sm text-white/50">
                        Principales fuentes de ingresos del municipio.
                      </p>
                    </div>

                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      Visible
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 text-sm text-white/75">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-bold text-white">Ingresos tributarios</p>
                      <ul className="mt-3 space-y-2">
                        <li>🏠 Impuesto inmobiliario</li>
                        <li>🚗 Patentes comerciales, profesionales, oficios y rodados</li>
                        <li>🧹 Tasas por limpieza, barrido, residuos, iluminación y mercados</li>
                        <li>🧱 Contribuciones especiales por pavimentación u obras</li>
                      </ul>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-bold text-white">Ingresos no tributarios</p>
                      <ul className="mt-3 space-y-2">
                        <li>⚠️ Multas por infracciones de tránsito o faltas administrativas</li>
                        <li>🏢 Concesiones: estacionamientos, terminales y publicidad</li>
                      </ul>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-bold text-white">Transferencias y otros ingresos</p>
                      <ul className="mt-3 space-y-2">
                        <li>💧 Royalties y compensaciones</li>
                        <li>🍽️ FONAE</li>
                        <li>🏛️ Tesoro Nacional</li>
                        <li>🏗️ Ingresos de capital por venta de activos</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#08141d]/90 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black text-red-300">
                        Egresos Municipales
                      </h3>
                      <p className="mt-1 text-sm text-white/50">
                        Principales categorías de egresos del municipio.
                      </p>
                    </div>

                    <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-red-300">
                      Control
                    </span>
                  </div>

                  <div className="mt-5 space-y-4 text-sm text-white/75">
                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-bold text-white">Servicios personales</p>
                      <ul className="mt-3 space-y-2">
                        <li>👨‍💼 Sueldos y dietas</li>
                        <li>💰 Aguinaldo, bonificaciones y gratificaciones</li>
                        <li>🛠️ Contrataciones técnicas, salud y educación</li>
                      </ul>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-bold text-white">Servicios no personales y bienes</p>
                      <ul className="mt-3 space-y-2">
                        <li>⛽ Combustibles</li>
                        <li>🏗️ Materiales de construcción y suministros</li>
                        <li>🚘 Mantenimiento de vehículos</li>
                        <li>🧾 Limpieza, seguridad y publicidad</li>
                      </ul>
                    </div>

                    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                      <p className="font-bold text-white">Inversión y transferencias</p>
                      <ul className="mt-3 space-y-2">
                        <li>🛣️ Obras públicas: pavimentación, desagües y empedrados</li>
                        <li>🏫 Mejora de escuelas y espacios públicos</li>
                        <li>🎓 Becas y ayudas sociales</li>
                        <li>📉 Servicio de deuda y transferencias</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </SectionShell>
          </div>
        )}
      </main>

      {reportModalOpen && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-white/10 bg-[#07141d] shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#07141d]/95 px-5 py-4 backdrop-blur">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Nueva denuncia ciudadana
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  {pickingOnMap
                    ? "Ubicación tomada desde el mapa automáticamente."
                    : "Contá qué está pasando en tu barrio."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReportModalOpen(false);
                  setPickingOnMap(false);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="px-5 pt-5">
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <CategoryPill
                    key={key}
                    active={reportForm.category === key}
                    icon={meta.icon}
                    label={meta.label}
                    onClick={() => handleReportField("category", key)}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 px-5 py-5">
              {duplicateReport && (
                <div className="rounded-[22px] border border-amber-300/30 bg-amber-400/10 px-4 py-4 text-sm text-white">
                  <p className="font-bold text-amber-200">
                    Ya existe un reporte parecido cerca de esta ubicación.
                  </p>
                  <p className="mt-1 text-white/75">Título: {duplicateReport.title}</p>
                  <p className="mt-1 text-white/60">
                    Podés crear uno nuevo o sumarte al reclamo existente desde el mapa.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-white/75">Barrio</label>
                <input
                  type="text"
                  value={reportForm.barrio}
                  onChange={(e) => handleReportField("barrio", e.target.value)}
                  placeholder="Ej: Santa Mónica"
                  className="w-full rounded-2xl border border-white/10 bg-[#041018] px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/75">
                  Título corto
                </label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => handleReportField("title", e.target.value)}
                  placeholder="Ej: En mi barrio no tenemos luz"
                  className="w-full rounded-2xl border border-white/10 bg-[#041018] px-4 py-3 text-white outline-none placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/75">
                  Descripción
                </label>
                <textarea
                  rows={5}
                  value={reportForm.description}
                  onChange={(e) => handleReportField("description", e.target.value)}
                  placeholder="Contá qué pasa, desde cuándo y cómo afecta al barrio."
                  className="w-full rounded-2xl border border-white/10 bg-[#041018] px-4 py-3 text-white outline-none placeholder:text-white/30 resize-none"
                />
              </div>

              <label className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reportForm.urgent}
                  onChange={(e) => handleReportField("urgent", e.target.checked)}
                  className="h-4 w-4"
                />
                <div>
                  <p className="text-sm font-bold text-white">¿Es urgente?</p>
                  <p className="text-xs text-white/55">
                    Marcá esto si requiere prioridad municipal.
                  </p>
                </div>
              </label>

              <div>
                <label className="mb-2 block text-sm text-white/75">
                  Fotos de evidencia
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReportPhotos}
                  className="block w-full rounded-2xl border border-white/10 bg-[#041018] px-4 py-3 text-sm text-white"
                />

                {reportPhotos.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {reportPhotos.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-24 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm text-white/75">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={reportForm.lat}
                    onChange={(e) => handleReportField("lat", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#041018] px-4 py-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/75">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={reportForm.lng}
                    onChange={(e) => handleReportField("lng", e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#041018] px-4 py-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="rounded-[22px] border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-sm text-white/75">
                Tocá el mapa y la ubicación se carga sola. También podés editar las coordenadas manualmente.
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setReportModalOpen(false);
                    setPickingOnMap(false);
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 font-semibold text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={reportSaving}
                  className="rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 px-5 py-3 font-black text-slate-950 shadow-[0_0_24px_rgba(45,212,191,0.22)] transition disabled:opacity-60"
                >
                  {reportSaving ? "Enviando denuncia..." : "Enviar denuncia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}