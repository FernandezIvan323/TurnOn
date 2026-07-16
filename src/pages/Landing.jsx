import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import Brand from "../components/Brand";
import HeroPreview from "../components/HeroPreview";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Utensils,
  WalletCards,
} from "lucide-react";

const PAD = "px-6 md:px-10 xl:px-16";
const CONTAINER = "mx-auto w-full max-w-screen-2xl";

const navItems = [
  { href: "#resuelve", label: "Beneficios" },
  { href: "#modulos", label: "Módulos" },
  { href: "#flujo", label: "Uso" },
];

const benefits = [
  {
    icon: Utensils,
    title: "Mesas con turnos claros",
    text: "Sabés qué mesa sigue sin discusiones ni papeles.",
  },
  {
    icon: Truck,
    title: "Domicilio y para llevar",
    text: "Kanban de pedidos: pendiente, en camino o listo.",
  },
  {
    icon: WalletCards,
    title: "Caja del día confiable",
    text: "Cobros, gastos y corte sin perder el control.",
  },
  {
    icon: BarChart3,
    title: "Reportes al cierre",
    text: "Ventas, productos y horarios pico en un vistazo.",
  },
];

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    text: "Ventas, ticket y operación del día en tiempo real.",
  },
  {
    icon: Truck,
    title: "Domicilios",
    text: "Asigná repartidores y seguí cada entrega.",
  },
  {
    icon: ShoppingBag,
    title: "Para llevar",
    text: "Pedidos rápidos con tiempo estimado y cobro.",
  },
  {
    icon: Utensils,
    title: "Mesas",
    text: "Estado visual, cuentas abiertas y cobro directo.",
  },
  {
    icon: WalletCards,
    title: "Caja",
    text: "Efectivo, tarjeta, transferencia o mixto + corte.",
  },
  {
    icon: BarChart3,
    title: "Reportes",
    text: "Resumen, top productos y reporte diario imprimible.",
  },
];

const steps = [
  {
    n: "01",
    title: "Entrá con tu PIN",
    text: "Cada rol ve solo lo que necesita operar.",
    benefit: "Menos errores de acceso",
    icon: ShieldCheck,
  },
  {
    n: "02",
    title: "Operá el turno",
    text: "Mesas, domicilios o para llevar según el flujo.",
    benefit: "Todo queda registrado",
    icon: Clock3,
  },
  {
    n: "03",
    title: "Cobra y cierra",
    text: "Cerrá cuentas, registrá gastos y hacé el corte.",
    benefit: "Caja alineada al final del día",
    icon: CreditCard,
  },
  {
    n: "04",
    title: "Revisá reportes",
    text: "Mirá ventas y productos antes del próximo turno.",
    benefit: "Decisiones con números claros",
    icon: ReceiptText,
  },
];

function SectionHead({ eyebrow, title, text, align = "center" }) {
  const alignCls = align === "left" ? "text-left" : "mx-auto text-center";
  return (
    <div className={`mb-8 max-w-2xl ${alignCls}`}>
      <p className="mb-2 text-sm font-bold uppercase tracking-widest text-wine-600 dark:text-wine-300">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {text && (
        <p className="mt-3 text-base leading-relaxed text-ink-700 dark:text-white sm:text-lg">
          {text}
        </p>
      )}
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const appPath = user ? "/dashboard" : "/login";
  const ctaLabel = user ? "Ir al panel" : "Entrar al sistema";

  return (
    <div className="min-h-svh w-full overflow-x-hidden bg-white text-ink-800 dark:bg-obsidian-950 dark:text-white">
      <header className="sticky top-0 z-40 w-full border-b border-paper-300/80 bg-white/95 backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95">
        <div className={`${PAD} ${CONTAINER} flex h-16 items-center justify-between gap-4 sm:h-20`}>
          <Brand />
          <nav className="hidden items-center gap-6 md:flex lg:gap-8">
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
          <Link to={appPath} className="btn-primary h-10 px-4">
            {ctaLabel}
          </Link>
        </div>
      </header>

      <main className="w-full">
        {/* Hero */}
        <section className="relative flex w-full min-h-[calc(100svh-5rem)] items-center">
          <div className={`${PAD} ${CONTAINER} grid w-full items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20`}>
            <div className="flex flex-col justify-center space-y-6 lg:col-span-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-wine-200 bg-wine-50 px-3 py-1 text-sm font-semibold text-wine-700 dark:border-wine-500/40 dark:bg-wine-900/40 dark:text-wine-300">
                <Clock3 size={16} className="shrink-0 text-wine-600 dark:text-wine-300" />
                Turnos · mesas · cobros
              </div>

              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-950 dark:text-white sm:text-5xl xl:text-6xl">
                Cada turno, mesa y cobro en{" "}
                <span className="text-wine-600 dark:text-wine-300">un solo lugar</span>
              </h1>

              <p className="max-w-xl text-lg font-light leading-relaxed text-ink-700 dark:text-white sm:text-xl">
                Mesas, domicilios y caja del restaurante, sin hojas sueltas.
              </p>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                <Link to={appPath} className="btn-primary h-12 px-6 text-base">
                  {ctaLabel}
                  <ArrowRight size={20} />
                </Link>
                <a href="#modulos" className="btn-secondary h-12 px-6 text-base">
                  Ver módulos
                </a>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-medium text-ink-700 dark:text-white">
                {["Mesas", "Domicilios", "Caja diaria"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2">
                    <CheckCircle2 size={18} className="shrink-0 text-wine-600 dark:text-wine-300" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* Qué resuelve */}
        <section
          id="resuelve"
          className={`w-full border-y border-paper-200 bg-paper-50 py-14 dark:border-obsidian-800 dark:bg-obsidian-900/50 sm:py-16 ${PAD}`}
        >
          <div className={CONTAINER}>
            <SectionHead
              eyebrow="Qué resuelve"
              title="Menos caos, más control del turno"
              text="Un panel para quien atiende, cobra y cierra el día."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-paper-300 bg-paper-50 p-5 shadow-card transition-colors hover:border-wine-400 dark:border-obsidian-700 dark:bg-obsidian-900 dark:hover:border-wine-500/40"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-wine-50 text-wine-600 dark:bg-wine-900/40 dark:text-wine-300">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-white">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Módulos */}
        <section id="modulos" className={`w-full py-14 sm:py-16 ${PAD}`}>
          <div className={CONTAINER}>
            <SectionHead
              eyebrow="Módulos"
              title="Lo esencial del restaurante"
              text="Seis bloques para el día a día. Menú, clientes e inventario también están en el panel."
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-paper-300 bg-paper-50 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-wine-400 dark:border-obsidian-700 dark:bg-obsidian-900 dark:hover:border-wine-500/40"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-600 dark:bg-wine-900/40 dark:text-wine-300">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-lg font-semibold text-ink-900 dark:text-white">{title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-700 dark:text-white">{text}</p>
                </article>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-ink-600 dark:text-white">
              También: Menú · Clientes · Inventario · Deudas · Personal
            </p>
          </div>
        </section>

        {/* Flujo */}
        <section
          id="flujo"
          className={`w-full border-y border-paper-200 bg-paper-50 py-14 dark:border-obsidian-800 dark:bg-obsidian-900/50 sm:py-16 ${PAD}`}
        >
          <div className={CONTAINER}>
            <SectionHead
              eyebrow="Cómo se usa"
              title="Del login al corte, en cuatro pasos"
              text="Un flujo simple para operar y cerrar sin perder información."
            />
            <ol className="grid grid-cols-1 gap-0 md:grid-cols-4 md:gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;
                return (
                  <li key={step.n} className="relative flex gap-4 md:flex-col md:gap-0">
                    {!isLast && (
                      <div
                        className="absolute bottom-0 left-[1.15rem] top-11 w-px bg-wine-300/60 dark:bg-wine-500/30 md:hidden"
                        aria-hidden
                      />
                    )}
                    <div className="relative z-10 mb-0 flex shrink-0 items-center gap-2 md:mb-4">
                      <span className="flex size-10 items-center justify-center rounded-full border-2 border-wine-500/50 bg-paper-50 text-sm font-bold tabular-nums text-wine-700 dark:border-wine-400/50 dark:bg-obsidian-950 dark:text-wine-300 md:size-11">
                        {step.n}
                      </span>
                      {!isLast && (
                        <>
                          <div
                            className="ml-1 hidden h-px flex-1 bg-gradient-to-r from-wine-400/60 to-wine-200/20 dark:from-wine-400/40 dark:to-wine-900/10 md:block"
                            aria-hidden
                          />
                          <ChevronRight
                            className="hidden size-4 shrink-0 text-wine-400 dark:text-wine-400/50 md:block"
                            aria-hidden
                          />
                        </>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 pb-7 last:pb-0 md:pb-0">
                      <div className="h-full rounded-2xl border border-paper-300 bg-paper-50 p-5 transition-colors hover:border-wine-400 dark:border-obsidian-700 dark:bg-obsidian-900 dark:hover:border-wine-500/40">
                        <div className="mb-2.5 flex items-center gap-2.5">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-wine-200 bg-wine-50 dark:border-wine-500/20 dark:bg-wine-900/30">
                            <Icon className="size-4 text-wine-600 dark:text-wine-300" />
                          </span>
                          <h3 className="text-base font-semibold leading-snug text-ink-900 dark:text-white">
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed text-ink-700 dark:text-white">
                          {step.text}
                        </p>
                        <div className="mt-3 rounded-lg border border-wine-200 bg-wine-50/80 px-3 py-2.5 dark:border-wine-500/25 dark:bg-wine-900/25">
                          <p className="text-xs font-bold uppercase tracking-wide text-wine-800 dark:text-wine-300">
                            Por qué importa
                          </p>
                          <p className="mt-1 text-sm leading-snug text-ink-800 dark:text-white">
                            {step.benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* CTA final */}
        <section className={`w-full bg-ink-950 py-14 text-white ${PAD}`}>
          <div
            className={`${CONTAINER} flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center`}
          >
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-wine-200">
                Listo para operar
              </p>
              <h2 className="mt-2 text-3xl font-bold text-white">
                Entrá y gestioná el turno actual
              </h2>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white">
                Acceso con usuario y PIN. El panel queda listo para mesas, pedidos y caja.
              </p>
            </div>
            <Link
              to={appPath}
              className="btn h-12 shrink-0 bg-white px-6 text-base font-semibold text-ink-950 hover:bg-paper-100"
            >
              {ctaLabel}
              <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
