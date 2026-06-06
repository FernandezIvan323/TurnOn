import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { Delete } from "lucide-react";

const PIN_LENGTH = 4;

export default function Login() {
  const { login, user, loading, error } = useAuth();
  const [username, setUsername] = useState("admin");
  const [pin, setPin] = useState("");
  const nav = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (user) nav("/", { replace: true });
  }, [user, nav]);

  const submit = async (e) => {
    e?.preventDefault();
    if (!username || pin.length !== PIN_LENGTH) return;
    try {
      await login(username, pin);
    } catch {
      /* error queda en el store */
    }
  };

  const addDigit = (d) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        login(username, next).catch(() => setPin(""));
      }, 120);
    }
  };
  const backspace = () => setPin((p) => p.slice(0, -1));
  const clear = () => setPin("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-100 to-paper-200 dark:from-ink-950 dark:to-ink-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md card p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-3xl bg-paper-50 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 flex items-center justify-center shadow-soft p-3">
            <img src="/favicon.svg" alt="AppTurnos" className="w-full h-full" />
          </div>
          <h1 className="mt-4 text-xl font-semibold text-ink-800 dark:text-ink-100">AppTurnos</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400">Ingresa tu usuario y PIN</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Usuario</label>
            <input
              ref={inputRef}
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              autoComplete="username"
              placeholder="admin o ivan"
            />
          </div>

          <div>
            <label className="label">PIN de {PIN_LENGTH} dígitos</label>
            <div className="flex justify-center gap-3 my-2">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-semibold transition ${
                    pin[i]
                      ? "border-brand-500 text-brand-700 bg-brand-50 dark:bg-brand-900/40 dark:text-brand-300"
                      : "border-paper-300 bg-paper-50 text-ink-300 dark:bg-ink-900 dark:border-ink-700 dark:text-ink-600"
                  }`}
                >
                  {pin[i] ? "•" : ""}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                type="button"
                key={d}
                onClick={() => addDigit(String(d))}
                className="h-14 rounded-xl bg-paper-50 border border-paper-300 text-xl font-semibold text-ink-700 hover:bg-paper-200 active:scale-95 transition dark:bg-ink-900 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={clear}
              className="h-14 rounded-xl bg-paper-200 text-ink-600 font-medium hover:bg-paper-300 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => addDigit("0")}
              className="h-14 rounded-xl bg-paper-50 border border-paper-300 text-xl font-semibold text-ink-700 hover:bg-paper-200 active:scale-95 transition dark:bg-ink-900 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
            >
              0
            </button>
            <button
              type="button"
              onClick={backspace}
              className="h-14 rounded-xl bg-paper-200 text-ink-600 font-medium hover:bg-paper-300 dark:bg-ink-800 dark:text-ink-300 dark:hover:bg-ink-700"
            >
              <Delete size={20} className="mx-auto" />
            </button>
          </div>

          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 text-center dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || pin.length !== PIN_LENGTH}
            className="btn-primary w-full h-12"
          >
            {loading ? "Verificando…" : "Entrar"}
          </button>

          <div className="text-xs text-ink-500 dark:text-ink-400 text-center pt-2 border-t border-paper-200 dark:border-ink-800">
            <div className="font-medium text-ink-600 dark:text-ink-300">Cuentas de prueba</div>
            <div>admin / 1234 · ivan / 0000 · maria / 0000</div>
          </div>
        </form>
      </div>
    </div>
  );
}
