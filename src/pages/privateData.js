export const PRIVATE_USERS = [
  {
    id: 1,
    username: "rodrigo",
    password: "2041",
    role: "superadmin",
    name: "Rodrigo Ríos",
  },
  {
    id: 2,
    username: "concejal1",
    password: "2041",
    role: "concejal",
    name: "Concejal Zona Norte",
  },
  {
    id: 3,
    username: "coord1",
    password: "2041",
    role: "coordinador",
    name: "Coordinador 1",
  },
  {
    id: 4,
    username: "movil1",
    password: "2041",
    role: "movil",
    name: "Móvil 1",
  },
];

export const COORDINADORES = [
  {
    id: 1,
    nombre: "Carlos Benítez",
    zona: "Zona Norte",
    telefono: "0981 111111",
    concejal: "Concejal Zona Norte",
    estado: "Activo",
    online: true,
    lat: -25.5095,
    lng: -54.6117,
  },
  {
    id: 2,
    nombre: "María González",
    zona: "Zona Sur",
    telefono: "0982 222222",
    concejal: "Concejal Zona Sur",
    estado: "Activo",
    online: false,
    lat: -25.5212,
    lng: -54.6231,
  },
  {
    id: 3,
    nombre: "Luis Ferreira",
    zona: "Zona Este",
    telefono: "0983 333333",
    concejal: "Concejal Zona Este",
    estado: "Activo",
    online: true,
    lat: -25.5142,
    lng: -54.5986,
  },
];

export const MOVILES = [
  {
    id: 1,
    nombre: "Móvil 01",
    chofer: "Juan López",
    coordinador: "Carlos Benítez",
    estado: "En recorrido",
    online: true,
    lat: -25.5123,
    lng: -54.6051,
  },
  {
    id: 2,
    nombre: "Móvil 02",
    chofer: "Pedro Martínez",
    coordinador: "María González",
    estado: "En base",
    online: false,
    lat: -25.5198,
    lng: -54.6197,
  },
  {
    id: 3,
    nombre: "Móvil 03",
    chofer: "Diego Acosta",
    coordinador: "Luis Ferreira",
    estado: "Operativo",
    online: true,
    lat: -25.5164,
    lng: -54.6012,
  },
];

export const CENTRAL_MAP_CENTER = [-25.5148, -54.611];