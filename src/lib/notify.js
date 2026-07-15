const MUTE_KEY = "appturnos_notify_muted";

export function isNotifyMuted() {
  return localStorage.getItem(MUTE_KEY) === "1";
}

export function setNotifyMuted(muted) {
  localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
}

/** Beep corto (Web Audio API). Silencioso si está muteado o el navegador bloquea audio. */
export function playBeep({ frequency = 880, durationMs = 160, volume = 0.12 } = {}) {
  if (isNotifyMuted()) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationMs / 1000);
    osc.stop(now + durationMs / 1000);
    osc.onended = () => {
      try { ctx.close(); } catch { /* ignore */ }
    };
  } catch {
    /* autoplay / contexto no disponible */
  }
}

/**
 * Detecta pedidos nuevos (por id) entre dos listas.
 * @returns {{ added: any[], grew: boolean }}
 */
export function diffNewOrders(prevList, nextList) {
  const prev = new Set((prevList || []).map((o) => o.id));
  const added = (nextList || []).filter((o) => !prev.has(o.id));
  return { added, grew: added.length > 0 };
}
