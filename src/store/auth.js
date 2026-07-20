import { create } from "zustand";
import api from "../lib/api";

export const useAuth = create((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  loading: false,
  error: null,

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
