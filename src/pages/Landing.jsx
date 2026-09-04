import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import Brand from "../components/Brand";
import DeviceFrame from "../components/landing/DeviceFrame";
import MockSystemOverview from "../components/landing/MockSystemOverview";
import MockWaiterPhone from "../components/landing/MockWaiterPhone";
import MockDriverPhone from "../components/landing/MockDriverPhone";
import {
  ArrowRight,
  Bike,
  Mail,
  MonitorSmartphone,
  ShoppingBag,
  Truck,
  Utensils,
  WalletCards,
} from "lucide-react";

const PAD = "px-5 sm:px-8 md:px-12 xl:px-16";
const CONTAINER = "mx-auto w-full max-w-screen-2xl";

const navItems = [
  { href: "/funciones", label: "Funciones" },
  { href: "#dispositivos", label: "Dispositivos" },
  { href: "/contacto", label: "Contacto" },
];

function SectionEyebrow({ children }) {
  return (
    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-wine-600 dark:text-wine-300">
      {children}
    </p>
  );
}

export default function Landing() {
  useDocumentTitle(null);
  const { user } = useAuth();
  const appPath = user ? "/dashboard" : "/login";
  const ctaLabel = user ? "Ir al panel" : "Iniciar sesión";

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
                <Link to="/funciones" className="btn-secondary h-12 px-6 text-base">
                  Ver funciones
                </Link>
              </div>
            </div>
            <div className="device-stage lg:col-span-7">
              <DeviceFrame variant="laptop" tilt="left" float>
                <MockSystemOverview />
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
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-wine-400/60 hover:bg-white/10"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-wine-500/10 blur-2xl transition-opacity duration-300 group-hover:bg-wine-400/20" />
                  <span className="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-wine-500 to-wine-800 text-white shadow-lg shadow-wine-900/40">
                    <Icon size={24} />
                  </span>
                  <p className="relative mt-4 font-semibold text-white">{t}</p>
                  <p className="relative mt-1 text-sm text-white/70">{d}</p>
                </div>
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

            {/* Escenario 3D: laptop + 2 phones, texto debajo de cada uno */}
            <div className="device-stage relative mx-auto mt-12 flex max-w-6xl flex-col items-center justify-center sm:mt-14">
              <div className="flex w-full flex-col items-center gap-8 sm:flex-row sm:items-end sm:gap-4 md:gap-6 lg:gap-8">
                {/* Laptop (caja / admin) */}
                <div className="flex w-full max-w-xl shrink-0 flex-col items-center gap-3 sm:max-w-sm md:max-w-md lg:max-w-lg lg:flex-1">
                  <DeviceFrame
                    variant="laptop"
                    tilt="left"
                    float
                    label="Panel cajero / admin"
                  >
                    <MockSystemOverview compact />
                  </DeviceFrame>
                  <div className="max-w-[16rem] text-center">
                    <h3 className="flex items-center justify-center gap-2 text-base font-bold text-ink-900 dark:text-white">
                      <MonitorSmartphone size={16} className="text-wine-600 dark:text-wine-300" />
                      Para caja y gestión
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-obsidian-300">
                      Dashboard, cobros, deudas, personal, inventario y reportes.
                    </p>
                  </div>
                </div>
                {/* Phone (mesero) */}
                <div className="flex w-[12rem] shrink-0 flex-col items-center gap-3 sm:w-[12rem] md:w-[12rem] lg:flex-1">
                  <DeviceFrame
                    variant="phone"
                    tilt="right"
                    float
                    floatDelay
                    label="App mesero"
                  >
                    <MockWaiterPhone />
                  </DeviceFrame>
                  <div className="max-w-[13rem] text-center">
                    <h3 className="flex items-center justify-center gap-2 text-base font-bold text-ink-900 dark:text-white">
                      <Utensils size={16} className="text-wine-600 dark:text-wine-300" />
                      Para meseros
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-obsidian-300">
                      Mesas asignadas, catálogo e historial de la jornada.
                    </p>
                  </div>
                </div>
                {/* Phone (domiciliario) */}
                <div className="flex w-[12rem] shrink-0 flex-col items-center gap-3 sm:w-[12rem] md:w-[12rem] lg:flex-1">
                  <DeviceFrame
                    variant="phone"
                    tilt="left"
                    float
                    floatDelay
                    label="App domiciliario"
                  >
                    <MockDriverPhone />
                  </DeviceFrame>
                  <div className="max-w-[13rem] text-center">
                    <h3 className="flex items-center justify-center gap-2 text-base font-bold text-ink-900 dark:text-white">
                      <Bike size={16} className="text-wine-600 dark:text-wine-300" />
                      Para domicilarios
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-obsidian-300">
                      Salí con todos y resumen a rendir.
                    </p>
                  </div>
                </div>
              </div>
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
              <Link
                to="/contacto"
                className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-wine-300 hover:text-white"
              >
                <Mail size={18} />
                ¿Tenés dudas? Escribinos por contacto
                <ArrowRight size={20} />
              </Link>
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

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "TurnOn",
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Restaurant Management Software",
            operatingSystem: "Web",
            description:
              "Sistema de gestión para restaurantes con mesas, pedidos a domicilio, para llevar y caja.",
            url: "https://turnon.app/",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            author: {
              "@type": "Person",
              name: "Ivan Fernandez",
            },
          }),
        }}
      />

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
                  <a href="/funciones" className="hover:text-wine-600" aria-label="Ver todas las funciones del producto">
                    Funciones
                  </a>
                </li>
                <li>
                  <a href="#dispositivos" className="hover:text-wine-600" aria-label="Ver dispositivos compatibles">
                    Dispositivos
                  </a>
                </li>
                <li>
                  <Link to="/login" className="hover:text-wine-600" aria-label="Iniciar sesión en TurnOn">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">Acceso</p>
              <ul className="mt-2 space-y-1.5 text-ink-600 dark:text-obsidian-400">
                <li>
                  <Link to={appPath} className="hover:text-wine-600" aria-label={ctaLabel}>
                    {ctaLabel}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">Empresa</p>
              <ul className="mt-2 space-y-1.5 text-ink-600 dark:text-obsidian-400">
                <li>
                  <a href="#" className="cursor-not-allowed opacity-60" aria-label="Acerca de TurnOn (próximamente)">
                    Acerca de
                  </a>
                </li>
                <li>
                  <Link to="/contacto" className="hover:text-wine-600" aria-label="Ir a la página de contacto">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-ink-900 dark:text-white">Legal</p>
              <ul className="mt-2 space-y-1.5 text-ink-600 dark:text-obsidian-400">
                <li>
                  <a href="#" className="cursor-not-allowed opacity-60" aria-label="Términos y condiciones (próximamente)">
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" className="cursor-not-allowed opacity-60" aria-label="Política de privacidad (próximamente)">
                    Privacidad
                  </a>
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
