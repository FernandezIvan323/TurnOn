import { create } from "zustand";

const STORAGE_KEY = "turnon.layout";

function getInitial() {
  if (typeof window === "undefined") return "list";
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "grid" || v === "list" ? v : "list";
}

export const useLayout = create((set, get) => ({
  layout: getInitial(),
  set: (layout) => {
    const next = layout === "grid" ? "grid" : "list";
    localStorage.setItem(STORAGE_KEY, next);
    set({ layout: next });
  },
  toggle: () => {
    const next = get().layout === "grid" ? "list" : "grid";
    localStorage.setItem(STORAGE_KEY, next);
    set({ layout: next });
  },
}));