import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    if (!username || pin.length !== PIN_LENGTH || loading) return;
    try {
      await login(username, pin);
    } catch {
      setPin("");
    }
  };

  const handlePinChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH);
    setPin(val);
  };

  return (
    <div className="min-h-screen bg-paper-100 dark:bg-obsidian-950 flex flex-col relative">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium text-ink-500 dark:text-obsidian-400 hover:text-brand-700 dark:hover:text-wine-300 transition"
      >
        <ArrowLeft size={18} />
        Volver al inicio
      </Link>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-paper-50 dark:bg-obsidian-900 border border-paper-300 dark:border-obsidian-800 rounded-2xl shadow-card p-8">
          <div className="flex flex-col items-center mb-8">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-paper-300 bg-paper-50 p-2.5 shadow-soft dark:border-obsidian-700 dark:bg-obsidian-900 mb-4">
              <img src="/favicon.svg" alt="AppTurnos" className="h-full w-full" />
            </span>
            <h1 className="text-xl font-bold text-ink-900 dark:text-white">AppTurnos</h1>
            <p className="text-sm text-ink-500 dark:text-obsidian-400 mt-1">Ingresa tu usuario y PIN</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-obsidian-200 mb-1.5">Usuario</label>
              <input
                ref={inputRef}
                type="text"
                className="input w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                autoComplete="username"
                placeholder="Tu usuario"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-obsidian-200 mb-1.5">PIN de {PIN_LENGTH} dígitos</label>
              <input
                type="password"
                inputMode="numeric"
                className="input w-full text-center text-lg tracking-[0.5em]"
                value={pin}
                onChange={handlePinChange}
                maxLength={PIN_LENGTH}
                placeholder="• • • •"
                autoComplete="one-time-code"
                disabled={loading}
              />
              <div className="flex justify-center gap-2 mt-3">
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      pin[i]
                        ? "bg-brand-600 scale-110 dark:bg-wine-500"
                        : "bg-paper-300 dark:bg-obsidian-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-center dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username || pin.length !== PIN_LENGTH}
              className="btn-primary w-full h-12 text-base flex items-center justify-center gap-2"
            >
              {loading ? "Verificando..." : "Entrar"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
