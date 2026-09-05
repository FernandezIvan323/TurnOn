import api from "./api";

/**
 * Configuración del negocio cargada desde /api/settings.
 * Se usa para formateo de moneda y datos del local. Valores por defecto = COP.
 */
let state = {
  business_name: "TurnOn",
  address: null,
  phone: null,
  currency: "COP",
  locale: "es-CO",
  timezone: "America/Mexico_City",
  open_hour: null,
  close_hour: null,
};

export function setSettings(next) {
  if (!next) return;
  state = { ...state, ...next };
}

export function getSettings() {
  return state;
}

let loadingPromise = null;

/** Carga la configuración una vez (cacheada en memoria). */
export function loadSettings(force = false) {
  if (loadingPromise && !force) return loadingPromise;
  loadingPromise = api
    .get("/settings")
    .then(({ data }) => {
      setSettings(data);
      return data;
    })
    .catch(() => state);
  return loadingPromise;
}

export default state;