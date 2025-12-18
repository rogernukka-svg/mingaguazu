import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Semaforo from "../components/Semaforo";

export default function Mapa() {
  const proyectos = [
    {
      id: 1,
      name: "Centro Salud Zona 2",
      lat: -25.509,
      lng: -54.635,
      estado: "verde",
      avance: 82,
    },
    {
      id: 2,
      name: "Ciclovía Norte",
      lat: -25.503,
      lng: -54.640,
      estado: "amarillo",
      avance: 57,
    },
    {
      id: 3,
      name: "Conectividad Escolar",
      lat: -25.515,
      lng: -54.642,
      estado: "rojo",
      avance: 21,
    },
  ];

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[-25.509, -54.635]}
        zoom={13}
        className="w-full h-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {proyectos.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <b>{p.name}</b> <br />
              <Semaforo status={p.estado} /> <br />
              Avance: {p.avance}%
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
