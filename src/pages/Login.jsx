import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { ArrowRight } from "lucide-react";
import AuthSplitLayout from "../components/auth/AuthSplitLayout";
import { AuthLabel } from "../components/auth/AuthLabel";
import { authInputClassName } from "../components/auth/authInputClassName";

const PIN_LENGTH = 4;

export default function Login() {
  const { login, user, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const nav = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) nav("/dashboard", { replace: true });
  }, [user, nav]);

  const submit = async (e) => {
    e?.preventDefault();
    const u = username.trim().toLowerCase();
    const p = pin.replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!u || p.length !== PIN_LENGTH || loading) return;
    try {
      await login(u, p);
    } catch {
      setPin("");
    }
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(val);
  };

  return (
    <AuthSplitLayout
      title="Iniciar sesión"
      subtitle="Ingresá tu usuario y PIN de 4 dígitos para entrar al panel."
      badge="Acceso al sistema"
    >
      <form onSubmit={submit} className="space-y-5 pt-1">
        <div>
          <AuthLabel htmlFor="username">Usuario</AuthLabel>
          <input
            id="username"
            ref={inputRef}
            type="text"
            className={authInputClassName()}
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            inputMode="text"
            placeholder="Tu usuario (ej. maria)"
            disabled={loading}
          />
        </div>

        <div>
          <AuthLabel htmlFor="pin">PIN de {PIN_LENGTH} dígitos</AuthLabel>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            className={authInputClassName("text-center text-lg tracking-[0.5em]")}
            value={pin}
            onChange={handlePinChange}
            maxLength={PIN_LENGTH}
            placeholder="• • • •"
            autoComplete="one-time-code"
            disabled={loading}
          />
          <div className="mt-3 flex justify-center gap-2">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`h-3 w-3 rounded-full transition-all duration-200 ${
                  pin[i]
                    ? "scale-110 bg-wine-600 dark:bg-wine-500"
                    : "bg-paper-300 dark:bg-obsidian-700"
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-center text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-white">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !username || pin.length !== PIN_LENGTH}
          className="btn-primary flex h-12 w-full items-center justify-center gap-2 text-base"
        >
          {loading ? "Verificando..." : "Entrar al panel"}
          {!loading && <ArrowRight size={20} />}
        </button>
      </form>
    </AuthSplitLayout>
  );
}
