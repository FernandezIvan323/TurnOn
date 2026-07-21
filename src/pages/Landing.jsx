import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import Brand from "../components/Brand";
import DeviceFrame from "../components/landing/DeviceFrame";
import MockDashboard from "../components/landing/MockDashboard";
import MockTables from "../components/landing/MockTables";
import MockKanban from "../components/landing/MockKanban";
import MockWaiterPhone from "../components/landing/MockWaiterPhone";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  MonitorSmartphone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Utensils,
  WalletCards,
} from "lucide-react";

const PAD = "px-5 sm:px-8 md:px-12 xl:px-16";
const CONTAINER = "mx-auto w-full max-w-screen-2xl";

const navItems = [
  { href: "#resuelve", label: "Beneficios" },
  { href: "#funciones", label: "Funciones" },
  { href: "#dispositivos", label: "Dispositivos" },
  { href: "#ventajas", label: "Ventajas" },
];

const businessTypes = [
  "Restaurante",
  "Bar / café",
  "Acera y mesas",
  "Domicilio",
  "Para llevar",
  "Food truck",
];

const advantages = [
  {
    icon: Sparkles,
    title: "Simple y moderno",
    text: "Interfaz clara para cajero y mesero. Menos clics, más operación en el turno.",
  },
  {
    icon: MonitorSmartphone,
    title: "En cualquier dispositivo",
    text: "Celular del mesero, tablet o PC del cajero. Sin hardware especial.",
  },
  {
    icon: Cloud,
    title: "En la nube",
    text: "Entrá desde el navegador. Sin instalar programas en cada máquina.",
  },
  {
    icon: ShieldCheck,
    title: "Roles y control",
    text: "Admin/caja y mesero con PIN. Cada uno ve solo lo que necesita.",
  },
];

function SectionEyebrow({ children }) {
  return (
    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-wine-600 dark:text-wine-300">
      {children}
    </p>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const appPath = user ? "/dashboard" : "/login";
  const ctaLabel = user ? "Ir al panel" : "Probar ahora";

  return (
    <div className="min-h-svh w-full overflow-x-hidden bg-white text-ink-800 dark:bg-obsidian-950 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-paper-300/80 bg-white/95 backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95">
        <div className={`${PAD} ${CONTAINER} flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]`}>
          <Brand />
          <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-700 transition hover:text-wine-600 dark:text-white dark:hover:text-wine-300"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden text-sm font-semibold text-ink-700 hover:text-wine-600 dark:text-white sm:inline"
            >
              Iniciar sesión
            </Link>
            <Link to={appPath} className="btn-primary h-10 px-4">
              {ctaLabel}
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        {/* —— HERO (estilo Fudo) —— */}
        <section className="relative w-full overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper-200/70 via-white to-white dark:from-obsidian-900/50 dark:via-obsidian-950 dark:to-obsidian-950" />
          <div className={`${PAD} ${CONTAINER} relative grid items-center gap-12 py-14 lg:grid-cols-12 lg:gap-10 lg:py-20`}>
            <div className="flex flex-col justify-center lg:col-span-5">
              <SectionEyebrow>Software para restaurantes</SectionEyebrow>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-950 dark:text-white sm:text-5xl xl:text-[3.25rem]">
                Encárgate de la comida.
                <span className="mt-1 block text-wine-600 dark:text-wine-300">
                  TurnOn resuelve el resto.
                </span>
              </h1>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-700 dark:text-obsidian-200">
                Mesas, domicilios, para llevar y caja en un solo sistema. Pensado para el
                ritmo real del local.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link to={appPath} className="btn-primary h-12 px-7 text-base">
                  {ctaLabel}
                  <ArrowRight size={20} />
                </Link>
                <a href="#funciones" className="btn-secondary h-12 px-6 text-base">
                  Ver funciones
                </a>
              </div>
              <ul className="mt-8 space-y-3 text-base font-medium text-ink-700 dark:text-obsidian-200 sm:text-lg">
                {[
                  "Turnos FIFO en mesas y pedidos",
                  "Caja y corte del día sin Excel",
                  "Mesero en el celular, cajero en la PC",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <CheckCircle2 size={22} className="shrink-0 text-wine-600 dark:text-wine-300" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="device-stage lg:col-span-7">
              <DeviceFrame variant="laptop" tilt="left" float>
                <MockDashboard />
              </DeviceFrame>
            </div>
          </div>
        </section>

        {/* —— Franja resuelve —— */}
        <section
          id="resuelve"
          className={`border-y border-paper-200 bg-ink-950 py-14 text-white dark:border-obsidian-800 sm:py-16 ${PAD}`}
        >
          <div className={`${CONTAINER} grid gap-10 lg:grid-cols-2 lg:items-center`}>
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-wine-300">
                TurnOn resuelve
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Administrá el negocio desde un solo panel
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Menos papel, menos errores y el turno cerrado con números claros.
                Ideal para restaurantes con mesas y operación a domicilio.
              </p>
              <Link
                to={appPath}
                className="btn mt-8 h-12 bg-white px-6 font-semibold text-ink-950 hover:bg-paper-100"
              >
                Entrar al sistema
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Utensils, t: "Mesas", d: "Estado visual y cobro al instante" },
                { icon: Truck, t: "Domicilios", d: "Kanban y repartidores" },
                { icon: ShoppingBag, t: "Para llevar", d: "Cola con tiempo estimado" },
                { icon: WalletCards, t: "Caja", d: "Cobros, deudas y corte Z" },
              ].map(({ icon: Icon, t, d }) => (
                <div
                  key={t}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <Icon size={22} className="text-wine-300" />
                  <p className="mt-3 font-semibold text-white">{t}</p>
                  <p className="mt-1 text-sm text-white/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* —— Funciones alternadas (Fudo style) —— */}
        <section id="funciones" className="w-full">
          {/* A: Domicilios */}
          <div className={`${PAD} border-b border-paper-200 py-16 dark:border-obsidian-800 sm:py-20`}>
            <div className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
              <div>
                <SectionEyebrow>Pedidos a domicilio</SectionEyebrow>
                <h2 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                  Impulsá tus domicilios y simplificá el seguimiento
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-700 dark:text-obsidian-200">
                  Tablero Kanban con turnos FIFO, asignación de repartidores y cobro al
                  entregar o pre-cobro por transferencia.
                </p>
                <ul className="mt-6 space-y-3 text-base text-ink-700 dark:text-obsidian-200">
                  {[
                    "Columnas: pendientes → preparación → en camino → entregados",
                    "Multi-repartidor con historial de entregas",
                    "Notas, propina y división de cuenta",
                  ].map((x) => (
                    <li key={x} className="flex gap-3">
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-wine-600" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <DeviceFrame variant="laptop">
                <MockKanban />
              </DeviceFrame>
            </div>
          </div>

          {/* B: Mesas */}
          <div className={`${PAD} border-b border-paper-200 bg-paper-50 py-16 dark:border-obsidian-800 dark:bg-obsidian-900/40 sm:py-20`}>
            <div className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
              <div className="order-2 lg:order-1">
                <DeviceFrame variant="laptop">
                  <MockTables />
                </DeviceFrame>
              </div>
              <div className="order-1 lg:order-2">
                <SectionEyebrow>Servicio en sala</SectionEyebrow>
                <h2 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                  Cargá pedidos y visualizá mesas en segundos
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-700 dark:text-obsidian-200">
                  Colores por estado, turno del siguiente pedido y acceso directo a cobrar.
                  El mesero opera desde el celular; el cajero cierra en caja.
                </p>
                <ul className="mt-6 space-y-3 text-base text-ink-700 dark:text-obsidian-200">
                  {[
                    "Libre · pendiente · cocina · lista para cobrar",
                    "Asignación de mesas por mesero",
                    "Historial de trabajo por jornada",
                  ].map((x) => (
                    <li key={x} className="flex gap-3">
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-wine-600" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* C: Caja / resultados */}
          <div className={`${PAD} border-b border-paper-200 py-16 dark:border-obsidian-800 sm:py-20`}>
            <div className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-2 lg:gap-16`}>
              <div>
                <SectionEyebrow>Mejores resultados</SectionEyebrow>
                <h2 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                  Registrá ventas, gastos y el corte del día
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-700 dark:text-obsidian-200">
                  Dashboard en tiempo real, deudas, inventario y reportes imprimibles.
                  El corte de caja avisa si hay pedidos pendientes.
                </p>
                <ul className="mt-6 space-y-3 text-base text-ink-700 dark:text-obsidian-200">
                  {[
                    "Efectivo, tarjeta, transferencia y mixto",
                    "Corte Z con arqueo y hoja imprimible",
                    "Reportes y top de productos",
                  ].map((x) => (
                    <li key={x} className="flex gap-3">
                      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-wine-600" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <DeviceFrame variant="laptop">
                <MockDashboard compact />
              </DeviceFrame>
            </div>
          </div>
        </section>

        {/* —— Tipos de negocio —— */}
        <section className={`${PAD} py-14 sm:py-16`}>
          <div className={`${CONTAINER} text-center`}>
            <SectionEyebrow>Para tu tipo de local</SectionEyebrow>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
              Una solución para operar mesas y pedidos a domicilio
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-ink-700 dark:text-obsidian-200">
              ¿Restaurante de acera, sala con mesas o solo delivery? TurnOn se adapta al flujo
              de tu equipo.
            </p>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
              {businessTypes.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-paper-300 bg-paper-50 px-4 py-2 text-sm font-semibold text-ink-800 dark:border-obsidian-700 dark:bg-obsidian-900 dark:text-white"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* —— Dispositivos (phone + laptop, juntos + 3D) —— */}
        <section
          id="dispositivos"
          className={`${PAD} border-y border-paper-200 bg-paper-50 py-16 dark:border-obsidian-800 dark:bg-obsidian-900/40 sm:py-20`}
        >
          <div className={CONTAINER}>
            <div className="mx-auto max-w-2xl text-center">
              <SectionEyebrow>En el local y en movimiento</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                Gestioná pedidos desde tablet, PC o smartphone
              </h2>
              <p className="mt-4 text-base text-ink-700 dark:text-obsidian-200">
                El mesero toma mesas en el celular. El cajero cobra y cierra en la
                pantalla grande. Misma app, roles distintos.
              </p>
            </div>

            {/* Escenario 3D: laptop + phone juntos */}
            <div className="device-stage relative mx-auto mt-12 flex max-w-4xl flex-col items-center justify-center sm:mt-14">
              <div className="relative flex w-full items-end justify-center gap-2 sm:gap-3 md:gap-4">
                {/* Laptop (caja) — atrás un poco a la izquierda */}
                <div className="w-[min(100%,28rem)] shrink-0 sm:w-[min(72%,32rem)] md:w-[34rem]">
                  <DeviceFrame variant="laptop" tilt="left" float label="Panel cajero / admin">
                    <MockDashboard compact />
                  </DeviceFrame>
                </div>
                {/* Phone (mesero) — adelante, solapa un poco el laptop */}
                <div className="relative z-10 -ml-6 w-[min(42%,11rem)] shrink-0 sm:-ml-10 sm:w-[12rem] md:-ml-14 md:w-[13.5rem]">
                  <DeviceFrame
                    variant="phone"
                    tilt="right"
                    float
                    floatDelay
                    label="App mesero"
                  >
                    <MockWaiterPhone />
                  </DeviceFrame>
                </div>
              </div>

              <div className="mt-8 grid w-full max-w-xl gap-4 text-center sm:grid-cols-2 sm:gap-6">
                <div>
                  <h3 className="font-semibold text-ink-900 dark:text-white">Para caja y gestión</h3>
                  <p className="mt-1 text-sm text-ink-600 dark:text-obsidian-300">
                    Dashboard, cobros, deudas, personal, inventario y reportes.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-ink-900 dark:text-white">Para meseros</h3>
                  <p className="mt-1 text-sm text-ink-600 dark:text-obsidian-300">
                    Mesas asignadas, catálogo y historial de la jornada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* —— Ventajas —— */}
        <section id="ventajas" className={`${PAD} py-16 sm:py-20`}>
          <div className={CONTAINER}>
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <SectionEyebrow>Ventajas</SectionEyebrow>
              <h2 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                Un sistema pensado para el día a día
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {advantages.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-paper-300 bg-paper-50 p-6 shadow-card transition hover:border-wine-400 dark:border-obsidian-700 dark:bg-obsidian-900 dark:hover:border-wine-500/40"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-wine-50 text-wine-600 dark:bg-wine-900/40 dark:text-wine-300">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-obsidian-200">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* —— CTA final —— */}
        <section className={`${PAD} bg-ink-950 py-16 text-white sm:py-20`}>
          <div
            className={`${CONTAINER} flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center`}
          >
            <div className="max-w-xl">
              <p className="text-sm font-bold uppercase tracking-widest text-wine-300">
                Listo para operar
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Entrá y gestioná el turno de hoy
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/80">
                Acceso con usuario y PIN de 4 dígitos. El panel queda listo para mesas,
                pedidos y caja.
              </p>
            </div>
            <Link
              to={appPath}
              className="btn h-12 shrink-0 bg-wine-600 px-8 text-base font-semibold text-white hover:bg-wine-700"
            >
              {ctaLabel}
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t border-paper-200 bg-white py-10 dark:border-obsidian-800 dark:bg-obsidian-950 ${PAD}`}>
        <div className={`${CONTAINER} flex flex-col gap-8 sm:flex-row sm:justify-between`}>
          <div>
            <Brand />
            <p className="mt-3 max-w-xs text-sm text-ink-600 dark:text-obsidian-400">
              Sistema de gestión para restaurantes: mesas, domicilios, caja y reportes.
            </p>
          </div>
          <div className="flex flex-wrap gap-8 text-sm">
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">Producto</p>
              <ul className="mt-2 space-y-1.5 text-ink-600 dark:text-obsidian-400">
                <li>
                  <a href="#funciones" className="hover:text-wine-600">
                    Funciones
                  </a>
                </li>
                <li>
                  <a href="#dispositivos" className="hover:text-wine-600">
                    Dispositivos
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-wine-600">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">Acceso</p>
              <ul className="mt-2 space-y-1.5 text-ink-600 dark:text-obsidian-400">
                <li>
                  <Link to={appPath} className="hover:text-wine-600">
                    {ctaLabel}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={`${CONTAINER} mt-8 border-t border-paper-200 pt-6 text-xs text-ink-500 dark:border-obsidian-800 dark:text-obsidian-500`}>
          © {new Date().getFullYear()} TurnOn. Gestión del restaurant.
        </div>
      </footer>
    </div>
  );
}
