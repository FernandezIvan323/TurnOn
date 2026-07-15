import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import Brand from "../components/Brand";
import HeroPreview from "../components/HeroPreview";
import {
  ArrowRight,
  BarChart3,
  Bike,
  BookOpen,
  Calculator,
  CheckCircle2,
  ChefHat,
  Clock3,
  CreditCard,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";

const navItems = [
  { href: "#funcionalidades", label: "Funcionalidades" },
  { href: "#publico", label: "Publico" },
  { href: "#uso", label: "Uso" },
];

const audience = [
  {
    icon: Store,
    title: "Restaurantes pequenos y medianos",
    text: "Centraliza comedor, acera, pedidos para llevar y domicilios sin depender de hojas sueltas.",
  },
  {
    icon: Calculator,
    title: "Cajeros y administradores",
    text: "Controla ventas, gastos, caja, deudas, inventario y reportes desde un mismo panel.",
  },
  {
    icon: Utensils,
    title: "Meseros y equipo operativo",
    text: "Ordena mesas asignadas, cuentas abiertas, pedidos listos para cobrar y turnos de atencion.",
  },
  {
    icon: Bike,
    title: "Repartidores",
    text: "Permite ver pedidos activos, historial de entregas y montos pendientes por entregar.",
  },
];

const solves = [
  "Pedidos con turnos FIFO para saber que sigue sin discusiones.",
  "Caja diaria con metodos de pago, gastos y cortes inmutables.",
  "Mesas, domicilios y pickup trabajando en paralelo.",
  "Inventario con alertas de stock bajo y descuento automatico.",
  "Deudas separadas del corte para no frenar la operacion.",
  "Reportes claros para decidir que vender, comprar o retirar.",
];

const modules = [
  { icon: LayoutDashboard, title: "Dashboard", text: "Resumen del dia, ventas, gastos, ticket promedio y operacion en tiempo real." },
  { icon: Truck, title: "Domicilios", text: "Kanban de pendientes, preparacion, camino y entregados con repartidores activos." },
  { icon: ShoppingBag, title: "Para llevar", text: "Creacion rapida de pedidos, tiempos estimados y cobro directo." },
  { icon: Utensils, title: "Mesas", text: "Estado visual de mesas, cuentas abiertas, historial y acceso inmediato a cobrar." },
  { icon: WalletCards, title: "Caja", text: "Cobros en efectivo, tarjeta, transferencia o mixto, mas cierre diario controlado." },
  { icon: Users, title: "Clientes", text: "Busqueda por nombre o telefono, direccion e historial de pedidos." },
  { icon: BookOpen, title: "Menu", text: "Categorias, productos, disponibilidad y catalogo para venta diaria." },
  { icon: Package, title: "Inventario", text: "Existencias, minimos, movimientos y alertas visibles desde el dashboard." },
  { icon: BarChart3, title: "Reportes", text: "Ventas, productos top, clientes frecuentes, horarios pico y reporte diario imprimible." },
];

const steps = [
  { icon: ShieldCheck, title: "Inicia sesion", text: "Cada usuario entra con nombre y PIN segun su rol." },
  { icon: ChefHat, title: "Opera pedidos", text: "Registra mesas, domicilios o pedidos para llevar desde el modulo correcto." },
  { icon: CreditCard, title: "Cobra y registra", text: "Cierra cuentas con el metodo de pago adecuado o marca deuda si aplica." },
  { icon: ReceiptText, title: "Cierra caja", text: "Revisa pendientes, gastos y ventas antes del corte diario." },
  { icon: BarChart3, title: "Consulta reportes", text: "Analiza productos, clientes, categorias y comportamiento de la operacion." },
];

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-wine-300">{eyebrow}</p>
      <h2 className="text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-base leading-7 text-ink-600 dark:text-obsidian-300">{text}</p>}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-2xl border border-paper-300 bg-paper-50 p-5 shadow-card dark:border-obsidian-800 dark:bg-obsidian-900">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-wine-900/40 dark:text-wine-300">
        <Icon size={22} />
      </div>
      <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-obsidian-300">{text}</p>
    </article>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const appPath = user ? "/dashboard" : "/login";
  const ctaLabel = user ? "Ir al panel" : "Entrar al sistema";

  return (
    <div className="min-h-screen bg-paper-100 text-ink-800 dark:bg-obsidian-950 dark:text-obsidian-50">
      <header className="sticky top-0 z-40 border-b border-paper-200 bg-paper-100/95 backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-ink-600 transition hover:text-brand-700 dark:text-obsidian-300 dark:hover:text-wine-300">
                {item.label}
              </a>
            ))}
          </nav>
          <Link to={appPath} className="btn-primary h-10 px-4">
            {ctaLabel}
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 dark:border-wine-900 dark:bg-wine-900/30 dark:text-wine-200">
              <Clock3 size={16} />
              Orden para cada turno, pedido y cobro
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink-950 dark:text-white sm:text-5xl lg:text-6xl">
              AppTurnos
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-600 dark:text-obsidian-300">
              Sistema integral para restaurantes que necesitan controlar mesas, domicilios, pedidos para llevar, caja, inventario, clientes y reportes desde una sola pantalla de trabajo.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={appPath} className="btn-primary h-12 px-5 text-base">
                {ctaLabel}
                <ArrowRight size={20} />
              </Link>
              <a href="#funcionalidades" className="btn-secondary h-12 px-5 text-base">
                Ver funcionalidades
              </a>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
              {["Mesas", "Domicilios", "Caja diaria"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-ink-600 dark:text-obsidian-300">
                  <CheckCircle2 size={18} className="shrink-0 text-brand-700 dark:text-wine-300" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <HeroPreview />
        </section>

        <section id="publico" className="border-y border-paper-200 bg-paper-50 py-16 dark:border-obsidian-800 dark:bg-obsidian-900/55">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Para quien es"
              title="Pensado para equipos que atienden mientras venden"
              text="AppTurnos organiza la operacion diaria de restaurantes donde el comedor, el telefono, la caja y la cocina se mueven al mismo tiempo."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audience.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-wine-300">Que resuelve</p>
              <h2 className="text-3xl font-bold text-ink-900 dark:text-white sm:text-4xl">Menos caos operativo, mas control de caja</h2>
              <p className="mt-4 text-base leading-7 text-ink-600 dark:text-obsidian-300">
                El sistema pone cada pedido, mesa, cobro y movimiento en su lugar para que el equipo pueda atender sin perder informacion importante.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {solves.map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-paper-300 bg-paper-50 p-4 dark:border-obsidian-800 dark:bg-obsidian-900">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-brand-700 dark:text-wine-300" />
                  <p className="text-sm leading-6 text-ink-700 dark:text-obsidian-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="border-y border-paper-200 bg-paper-50 py-16 dark:border-obsidian-800 dark:bg-obsidian-900/55">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Funcionalidades"
              title="Los modulos principales del restaurante en una sola app"
              text="Cada modulo cubre una parte concreta de la operacion diaria y se conecta con ventas, caja, inventario y reportes."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((item) => (
                <FeatureCard key={item.title} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section id="uso" className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Como se usa"
              title="Un flujo diario simple para operar y cerrar"
              text="Desde el inicio de sesion hasta el reporte diario, el objetivo es que cada accion quede registrada y lista para revisar."
            />
            <div className="grid gap-4 md:grid-cols-5">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <article key={step.title} className="rounded-2xl border border-paper-300 bg-paper-50 p-5 dark:border-obsidian-800 dark:bg-obsidian-900">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-wine-900/40 dark:text-wine-300">
                        <Icon size={22} />
                      </div>
                      <span className="text-sm font-semibold text-ink-400 dark:text-obsidian-500">0{index + 1}</span>
                    </div>
                    <h3 className="text-base font-semibold text-ink-900 dark:text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-600 dark:text-obsidian-300">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-ink-950 py-14 text-white dark:bg-black">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-wine-300">Listo para operar</p>
              <h2 className="mt-2 text-3xl font-bold">Entra al sistema y gestiona el turno actual.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-obsidian-300">
                La landing no requiere conexion al backend. El acceso operativo sigue protegido por usuario y PIN.
              </p>
            </div>
            <Link to={appPath} className="btn h-12 bg-white px-5 text-base text-ink-950 hover:bg-paper-100">
              {ctaLabel}
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
