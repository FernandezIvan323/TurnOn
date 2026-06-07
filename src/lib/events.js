// Bus minimalista de eventos para señales globales del cliente.
// Usado para que ServerStatus se entere de errores de axios en cualquier
// pagina, no solo de sus propios pings.

const subs = new Set();

export const serverEvents = {
  on(fn) {
    subs.add(fn);
    return () => subs.delete(fn);
  },
  emit(event) {
    for (const fn of subs) {
      try { fn(event); } catch (_) { /* ignore */ }
    }
  },
  NETWORK_DOWN: "network:down",
  NETWORK_UP: "network:up",
};
