import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import Semaforo from "../components/Semaforo";

/* ==============================
ICONO TECNOLÓGICO JAHA
============================== */
const icono = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        width:18px;
        height:18px;
        border-radius:50%;
        background:${color};
        border:2px solid white;
        box-shadow:0 0 12px ${color};
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });

export default function Mapa() {
  const centroMinga = [-25.5160, -54.6450];

  const proyectos = [
    {
      id: 1,
      name: "Centro de Salud Km 16",
      lat: -25.5165,
      lng: -54.6463,
      estado: "verde",
      avance: 82,
      radio: 900,
      color: "#22c55e",
    },
    {
      id: 2,
      name: "Corredor PY02",
      lat: -25.5148,
      lng: -54.6429,
      estado: "amarillo",
      avance: 57,
      radio: 1200,
      color: "#f59e0b",
    },
    {
      id: 3,
      name: "Conectividad Escolar",
      lat: -25.5186,
      lng: -54.6481,
      estado: "rojo",
      avance: 21,
      radio: 850,
      color: "#ef4444",
    },
    {
      id: 4,
      name: "Nodo Comunitario",
      lat: -25.5156,
      lng: -54.6443,
      estado: "verde",
      avance: 73,
      radio: 700,
      color: "#22c55e",
    },
  ];

  return (
    <div className="h-[520px] w-full rounded-[22px] overflow-hidden border border-red-500/20">
      <MapContainer
        center={centroMinga}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* círculos de influencia */}
        {proyectos.map((p) => (
          <Circle
            key={"c" + p.id}
            center={[p.lat, p.lng]}
            radius={p.radio}
            pathOptions={{
              color: p.color,
              fillColor: p.color,
              fillOpacity: 0.12,
              weight: 2,
            }}
          />
        ))}

        {/* marcadores */}
        {proyectos.map((p) => (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icono(p.color)}
          >
            <Popup className="jaha-popup">
              <b>{p.name}</b>
              <br />
              <Semaforo status={p.estado} />
              <br />
              Avance: {p.avance}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}