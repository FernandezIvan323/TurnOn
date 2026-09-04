import { Link } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import useScrollSpy from "../hooks/useScrollSpy";
import Brand from "../components/Brand";
import DeviceFrame from "../components/landing/DeviceFrame";
import StepSection from "../components/funciones/StepSection";
import StickyNav from "../components/funciones/StickyNav";
import ProgressBar from "../components/funciones/ProgressBar";
import BentoGrid from "../components/funciones/BentoGrid";
import AdvantageRow from "../components/funciones/AdvantageRow";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { STEPS, BUSINESS_TYPES, ADVANTAGES } from "../content/funciones";

const PAD = "px-5 sm:px-8 md:px-12 xl:px-16";
const CONTAINER = "mx-auto w-full max-w-screen-2xl";

export default function Funciones() {
  useDocumentTitle("Funciones | TurnOn");
  const { user } = useAuth();
  const appPath = user ? "/dashboard" : "/login";
  const cta = user ? "Ir al panel" : "Iniciar sesión";

  const ids = ["hero", ...STEPS.map((s) => s.id), "tipos", "ventajas", "cta"];
  const activeId = useScrollSpy(ids);

  const seated = STEPS.filter((s) => s.step === "04");

  return (
    <div className="min-h-svh w-full bg-white text-ink-800 dark:bg-obsidian-950 dark:text-white">
      <ProgressBar />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-paper-300/80 bg-white/95 backdrop-blur dark:border-obsidian-800 dark:bg-obsidian-950/95">
        <div className={`${PAD} ${CONTAINER} flex h-16 items-center justify-between gap-4`}>
          <Link to="/" className="shrink-0">
            <Brand />
          </Link>
          <nav className="hidden items-center gap-6 lg:flex lg:gap-8">
            <Link to="/" className="text-sm font-medium text-ink-700 dark:text-obsidian-200 dark:hover:text-white">
              Inicio
            </Link>
            <Link to="/contacto" className="text-sm font-medium text-ink-700 dark:text-obsidian-200 dark:hover:text-white">
              Contacto
            </Link>
          </nav>
          <Link to={appPath} className="btn-primary h-10 px-4">
            {cta}
          </Link>
        </div>
      </header>

      <main className="w-full">
        {/* La única sección 01 (hello) */}
        <section id="hero" className="border-b border-paper-200 py-14 dark:border-obsidian-800 sm:py-16">
          <div className={`${PAD} ${CONTAINER}`}>
            <p className="text-sm font-bold uppercase tracking-widest text-wine-600 dark:text-wine-300">
              Toda la app explicada
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-ink-950 dark:text-white sm:text-5xl">
              Funciones de TurnOn, paso a paso
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-700 dark:text-obsidian-300">
              10 pasos que cubren desde el acceso hasta el cierre de caja.
              Sin elementos extra, sin configuración complicada, sin Excel.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={appPath} className="btn-primary h-11 px-5">
                {cta} <ArrowRight size={18} />
              </Link>
              <a href="#tipos" className="btn-secondary h-11 px-5">
                ¿Para qué tipo de local?
              </a>
            </div>
          </div>
        </section>

        {/* Layout: índice sticky (izq) + pasos (der) en lg+ */}
        <div className={`${PAD} ${CONTAINER}`}>
          <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-16">
            {/* Pasos */}
            <div className="min-w-0">
              <div className="space-y-16 sm:space-y-20">
                {STEPS.map((step, i) => (
                  <section
                    key={step.id}
                    id={step.id}
                    className="scroll-mt-24 border-b border-paper-200 py-10 last:border-0 dark:border-obsidian-800 sm:py-14"
                  >
                    <StepSection
                      title={`${step.step}. ${step.title}`}
                      subtitle={step.subtitle}
                      bullets={step.bullets}
                      reverse={i % 2 === 1}
                    >
                      {step.mockVariant === "phone" ? (
                        <DeviceFrame variant="phone" label={step.mockLabel}>
                          <step.MockDevice />
                        </DeviceFrame>
                      ) : (
                        <DeviceFrame variant="laptop" label={step.mockLabel}>
                          <step.MockDevice />
                        </DeviceFrame>
                      )}
                    </StepSection>
                  </section>
                ))}

                {/* Tipos de negocio */}
                <section id="tipos" className="scroll-mt-24 border-b border-paper-200 py-10 dark:border-obsidian-800 sm:py-14">
                  <p className="text-sm font-bold uppercase tracking-widest text-wine-600 dark:text-wine-300">
                    Tipos de local
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                    ¿Para qué tipo de local funciona?
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-600 dark:text-obsidian-300">
                    Desde restaurante de barrio hasta food truck. El flujo es el mismo.
                  </p>
                  <div className="mt-8">
                    <BentoGrid items={BUSINESS_TYPES} />
                  </div>
                </section>

                {/* Ventajas */}
                <section id="ventajas" className="scroll-mt-24 py-10 dark:border-obsidian-800 sm:py-14">
                  <p className="text-sm font-bold uppercase tracking-widest text-wine-600 dark:text-wine-300">
                    Ventajas
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 dark:text-white sm:text-4xl">
                    Eh, ¿sin dudas?
                  </h2>
                  <div className="mt-8">
                    <AdvantageRow items={ADVANTAGES} />
                  </div>
                </section>
              </div>

              {/* CTA final */}
              <section id="cta" className="scroll-mt-24 rounded-3xl border border-paper-200 bg-ink-950 text-white dark:border-obsidian-800 dark:bg-obsidian-900">
                <div className="px-6 py-10 sm:px-10 sm:py-16">
                  <p className="text-sm font-bold uppercase tracking-wide text-wine-100">
                    ¿Listo para operar?
                  </p>
                  <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                    Entrá y gestioná el turno de hoy
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
                    Usuario + PIN de 4 dígitos. El mesero opera desde el celular, el cajero cierra en la PC. Los repartidores llevan sus pedidos.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={appPath} className="btn-primary h-11 px-6 text-sm font-semibold">
                      {cta}
                    </Link>
                    <Link
                      to="/contacto"
                      className="btn h-11 border-white/20 px-6 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      Contanos tu caso
                    </Link>
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky índice en desktop */}
            <aside className="mt-8 hidden lg:block">
              <StickyNav items={[...STEPS, { id: "tipos", title: "Tipos de local" }, { id: "ventajas", title: "Ventajas" }]} activeId={activeId} />
            </aside>
          </div>
        </div>
      </main>

      {/* Footer minimalista igual que la landing */}
      <footer className={`border-t border-paper-200 py-8 text-center text-xs text-ink-500 dark:border-obsidian-800 dark:text-obsidian-500 ${PAD}`}>
        © {new Date().getFullYear()} TurnOn · Caja, mesas y repartos sin Excel
      </footer>
    </div>
  );
}
