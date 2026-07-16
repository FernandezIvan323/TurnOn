import axios from "axios";
import { serverEvents } from "./events";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Reintento 1x para errores transitorios de red o 5xx. No reintenta 4xx
// (es responsabilidad del cliente: 400, 401, 403, 404, 409...).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MAX_RETRIES = 1;
const RETRY_DELAY = 1500;
const NETWORK_ERR_CODES = new Set([
  "ERR_NETWORK",
  "ECONNABORTED",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "ENOTFOUND",
]);

api.interceptors.response.use(
  (r) => {
    serverEvents.emit(serverEvents.NETWORK_UP);
    return r;
  },
  async (err) => {
    const config = err?.config;
    const status = err?.response?.status;
    const isNetwork = !err?.response || NETWORK_ERR_CODES.has(err?.code);
    const is5xx = status >= 500 && status < 600;
    const canRetry = isNetwork || is5xx;

    // Reintentar ANTES de avisar "sin servidor" — evita el banner rojo
    // parpadeando cada 1–2s cuando el túnel o la red fallan un instante.
    if (config && canRetry && !config.__retried) {
      config.__retried = true;
      await sleep(RETRY_DELAY);
      return api.request(config);
    }

    if (isNetwork || is5xx) {
      serverEvents.emit(serverEvents.NETWORK_DOWN);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (location.pathname !== "/login") location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Limite de retries por instancia (algunos pages usan api directo, no el wrapper)
export const MAX_RETRIES_GLOBAL = MAX_RETRIES;

export default api;
