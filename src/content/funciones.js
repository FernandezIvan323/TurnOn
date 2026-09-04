import MockLogin from "../components/landing/MockLogin";
import MockMenu from "../components/landing/MockMenu";
import MockInventory from "../components/landing/MockInventory";
import MockTables from "../components/landing/MockTables";
import MockKanban from "../components/landing/MockKanban";
import MockPickup from "../components/landing/MockPickup";
import MockCashier from "../components/landing/MockCashier";
import MockCashierClosing from "../components/landing/MockCashierClosing";
import MockDebts from "../components/landing/MockDebts";
import MockReports from "../components/landing/MockReports";
import MockDriverPhone from "../components/landing/MockDriverPhone";

export const STEPS = [
  {
    id: "login",
    step: "01",
    title: "Acceso con PIN",
    subtitle: "Cada usuario entra con su PIN de 4 dígitos. Sin instalación, sin tarjetas.",
    bullets: [
      "Usuario + PIN. Nada de contraseñas largas ni doble factor complicado",
      "El sistema detecta tu rol para llevarte al panel correcto",
      "Sesiones que duran todo el turno, con cierre automático",
    ],
    MockDevice: MockLogin,
    mockLabel: "Pantalla de acceso",
    mockVariant: "none",
  },
  {
    id: "menu",
    step: "02",
    title: "Definí tu menú",
    subtitle: "Categórias y productos cargados una vez, listos para vender.",
    bullets: [
      "Categorías: Pizzas, Bebidas, Postres, etc.",
      "Precio, stock mínimo y disponibilidad por producto",
      "Los cambios aparecen inmediatamente en la app del mesero y en cocina",
    ],
    MockDevice: MockMenu,
    mockLabel: "Catálogo",
    mockVariant: "laptop",
  },
  {
    id: "inventario",
    step: "03",
    title: "Control de inventario",
    subtitle: "Stock automático que se descuenta al cerrar cada pedido.",
    bullets: [
      "Alerta visual cuando un producto queda por debajo del mínimo",
      "Movimientos automáticos al vender o al trackear una merma",
      "No hace falta contar el stock a mano cada noche",
    ],
    MockDevice: MockInventory,
    mockLabel: "Inventario",
    mockVariant: "laptop",
  },
  {
    id: "mesas",
    step: "04",
    title: "Mesas abiertas",
    subtitle: "El mesero ve las mesas asignadas, el estado y el turno del siguiente pedido.",
    bullets: [
      "Estado: libre, pendiente, cocina, lista para cobrar",
      "Turno FIFO: el siguiente pedido siempre destacado",
      "El mesero opera desde el celular, sin tocar la PC",
    ],
    MockDevice: MockTables,
    mockLabel: "Mesas",
    mockVariant: "laptop",
  },
  {
    id: "domicilios",
    step: "05",
    title: "Pedidos a domicilio",
    subtitle: "Kanban de 5 columnas con asignación libre a repartidores.",
    bullets: [
      "Pendientes → En preparación → Listos → En camino → Entregados",
      "Cada repartidor tiene su propia pantalla con los pedidos que le tocan",
      "'A rendir': al finalizar, el sistema calcula el efectivo a entregar",
    ],
    MockDevice: MockKanban,
    mockLabel: "Kanban de domicilios",
    mockVariant: "laptop",
  },
  {
    id: "pickup",
    step: "06",
    title: "Para llevar",
    subtitle: "Cliente llega, paga y se lleva — sin complicaciones.",
    bullets: [
      "3 columnas claras: pendiente, en preparación, listo para recoger",
      "Contador de tiempo estimado de preparación",
      "Cobro integrado con efectivo, tarjeta o transferencia",
    ],
    MockDevice: MockPickup,
    mockLabel: "Para llevar",
    mockVariant: "laptop",
  },
  {
    id: "caja",
    step: "07",
    title: "Caja y cobro",
    subtitle: "Por cobrar y cobrados separados, métodos de pago claros.",
    bullets: [
      "Filtros por tipo: mesas, domicilios, para llevar",
      "Métodos: efectivo, tarjeta, transferencia y mixto",
      "Ticket de cobro imprimible con un click",
    ],
    MockDevice: MockCashier,
    mockLabel: "Caja",
    mockVariant: "laptop",
  },
  {
    id: "cierre",
    step: "08",
    title: "Cierre del día",
    subtitle: "Arqueo calculado, diferencia detectada, corte final.",
    bullets: [
      "El sistema suma todo automáticamente — vos solo contamos el efectivo",
      "Si no cuadra, el sistema marca la diferencia",
      "El corte es inmutable: una vez cerrado, queda cerrado",
    ],
    MockDevice: MockCashierClosing,
    mockLabel: "Cierre de caja",
    mockVariant: "laptop",
  },
  {
    id: "deudas",
    step: "09",
    title: "Gestión de deudas",
    subtitle: "Pagos pendientes registrados, sin bloquear el flujo del negocio.",
    bullets: [
      "Una deuda no bloquea el corte de caja — se cobra aparte",
      "Filtros por antigüedad (urgentes con más de 3 días)",
      "Cobro de la deuda con un solo click desde la lista",
    ],
    MockDevice: MockDebts,
    mockLabel: "Deudas",
    mockVariant: "laptop",
  },
  {
    id: "reportes",
    step: "10",
    title: "Reportes del negocio",
    subtitle: "Ventas del día, top productos, propinas, todo en un panel.",
    bullets: [
      "Resumen del día: ventas, pedidos, ticket promedio, propinas",
      "Top productos por cantidad y por ingresos",
      "Historial de días anteriores, imprimible como PDF",
    ],
    MockDevice: MockReports,
    mockLabel: "Reportes",
    mockVariant: "laptop",
  },
  {
    id: "repartidor",
    step: "11",
    title: "El repartidor",
    subtitle: "Su propia pantalla: pedidos listos, en camino y dinero a rendir.",
    bullets: [
      "Ve sólo los pedidos que le tocó llevar",
      "Links a Maps y tel para comunicarse con el cliente",
      "Al final del día, 'A rendir' calcula cuánto debe entregar",
    ],
    MockDevice: MockDriverPhone,
    mockLabel: "App domiciliario",
    mockVariant: "phone",
  },
];

export const BUSINESS_TYPES = [
  { key: "restaurante", label: "Restaurante", desc: "Servicio en sala con mesa", icon: "Utensils" },
  { key: "bar", label: "Bar / Café", desc: "Rotación rápida, ticket promedio alto", icon: "ShoppingBag" },
  { key: "acera", label: "Acera y mesas", desc: "Servicio al aire libre con vista en tiempo real", icon: "MonitorSmartphone" },
  { key: "domicilio", label: "Domicilio", desc: "Recepción de llamadas, asignación de repartidores", icon: "Truck" },
  { key: "pickup", label: "Para llevar", desc: "Pedidos con tiempo estimado y cobro en mostrador", icon: "ShoppingBag" },
  { key: "foodtruck", label: "Food truck", desc: "Operación móvil con caja y reportes", icon: "Sparkles" },
];

export const ADVANTAGES = [
  { icon: "Sparkles", title: "$0 de instalación", text: "Sin hardware especial. Entrás desde el navegador.", stat: "$0" },
  { icon: "MonitorSmartphone", title: "3 roles en simultáneo", text: "Cajero, mesero y domiciliario. Misma app, cada uno en su pantalla.", stat: "3 roles" },
  { icon: "Cloud", title: "1 minuto para empezar", text: "Configurás menú, mesas y repartidores. Listo para el turno.", stat: "1 min" },
  { icon: "ShieldCheck", title: "Stock y caja sin Excel", text: "Inventario auto, deudas y corte de caja integrados.", stat: "0 Excel" },
];
