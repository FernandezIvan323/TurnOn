import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Mail, Phone, Sparkles, ShieldCheck, User, Wrench } from "lucide-react";
import AuthSplitLayout from "../components/auth/AuthSplitLayout";
import { AuthLabel } from "../components/auth/AuthLabel";
import { authInputClassName } from "../components/auth/authInputClassName";
import { useDocumentTitle } from "../lib/useDocumentTitle";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function FieldError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-300">
      {children}
    </p>
  );
}

export default function Contact() {
  useDocumentTitle("Contacto");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const formRef = useRef(null);

  useEffect(() => {
    formRef.current?.querySelector("input")?.focus();
  }, []);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Ingresá tu nombre";
    else if (name.trim().length > 80) e.name = "Máximo 80 caracteres";
    if (!email.trim()) e.email = "Ingresá tu email";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Email inválido";
    if (phone && phone.length > 30) e.phone = "Máximo 30 caracteres";
    if (!message.trim()) e.message = "Contanos en qué te ayudamos";
    else if (message.trim().length < 10) e.message = "Mínimo 10 caracteres";
    return e;
  };

  const submit = async (ev) => {
    ev?.preventDefault();
    if (sending) return;
    if (honeypot) return; // bot
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    // Demo: simular envío. Cuando crezca el proyecto se conecta a un servicio externo.
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setDone(true);
  };

  const reset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setErrors({});
    setDone(false);
  };

  return (
    <AuthSplitLayout
      title="Contacto"
      subtitle="Dejanos tu consulta y te respondemos por correo."
      badge="Hablemos"
      bullets={[
        { icon: Sparkles, text: "Demo del sistema sin costo ni compromiso" },
        { icon: ShieldCheck, text: "Sin instalación: funciona desde el navegador" },
        { icon: Wrench, text: "Te ayudamos a cargar menú y mesas" },
        { icon: Mail, text: "Respuesta directa a contacto@turnon.app" },
      ]}
    >
      <div ref={formRef} className="space-y-5 pt-1">
        {done ? (
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink-900 dark:text-white">
                ¡Gracias por escribirnos!
              </h2>
              <p className="mt-1 text-sm text-ink-600 dark:text-obsidian-300">
                Recibimos tu mensaje y te respondemos a la brevedad.
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="btn-secondary mt-2 w-full"
            >
              Enviar otra consulta
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4" noValidate>
            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <AuthLabel htmlFor="contact-name">Nombre</AuthLabel>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-obsidian-500" aria-hidden="true" />
                  <input
                    id="contact-name"
                    type="text"
                    className={authInputClassName("pl-8")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    placeholder="Tu nombre"
                    autoComplete="name"
                    disabled={sending}
                    aria-invalid={!!errors.name}
                  />
                </div>
                <FieldError>{errors.name}</FieldError>
              </div>

              <div>
                <AuthLabel htmlFor="contact-email">Email</AuthLabel>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-obsidian-500" aria-hidden="true" />
                  <input
                    id="contact-email"
                    type="email"
                    className={authInputClassName("pl-8")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    disabled={sending}
                    aria-invalid={!!errors.email}
                  />
                </div>
                <FieldError>{errors.email}</FieldError>
              </div>
            </div>

            <div>
              <AuthLabel htmlFor="contact-phone">Teléfono (opcional)</AuthLabel>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-obsidian-500" aria-hidden="true" />
                <input
                  id="contact-phone"
                  type="tel"
                  className={authInputClassName("pl-8")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={30}
                  placeholder="+54 11 5555 5555"
                  autoComplete="tel"
                  disabled={sending}
                  aria-invalid={!!errors.phone}
                />
              </div>
              <FieldError>{errors.phone}</FieldError>
            </div>

            <div>
              <AuthLabel htmlFor="contact-message">Mensaje</AuthLabel>
              <textarea
                id="contact-message"
                className={authInputClassName("min-h-[96px] resize-y")}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Contanos sobre tu local o tu consulta..."
                maxLength={1000}
                rows={4}
                disabled={sending}
                aria-invalid={!!errors.message}
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <FieldError>{errors.message}</FieldError>
                <span className="ml-auto text-ink-400 dark:text-obsidian-500">
                  {message.length}/1000
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary flex h-12 w-full items-center justify-center gap-2 text-base"
            >
              {sending ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Enviando…
                </>
              ) : (
                <>
                  Enviar consulta <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="pt-1 text-center text-xs leading-relaxed text-ink-500 dark:text-obsidian-400">
              También podés escribirnos directo a{" "}
              <a
                href="mailto:contacto@turnon.app"
                className="font-medium text-wine-600 hover:underline dark:text-wine-300"
              >
                contacto@turnon.app
              </a>
            </p>
          </form>
        )}
      </div>
    </AuthSplitLayout>
  );
}
