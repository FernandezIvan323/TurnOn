import { create } from "zustand";
import api from "../lib/api";

function storedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export const useAuth = create((set) => ({
  user: storedUser(),
  loading: false,
  error: null,
  // Indica si ya se validó (o no hay) sesión al arrancar. Evita el flash
  // de contenido incorrecto (dashboard) antes de redirigir al login.
  ready: !localStorage.getItem("token"),

  init: async () => {
    if (!localStorage.getItem("token")) {
      set({ ready: true });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, ready: true });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ user: null, ready: true });
    }
  },

  login: async (username, pin) => {
    set({ loading: true, error: null });
    try {
      const u = String(username || "").trim().toLowerCase();
      const p = String(pin || "").replace(/\D/g, "").slice(0, 4);
      const { data } = await api.post("/auth/login", { username: u, pin: p });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user, loading: false });
      return data.user;
    } catch (e) {
      const msg = e.response?.data?.error || "Error de inicio de sesión";
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null });
  },
}));