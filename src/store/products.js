import { create } from "zustand";
import api from "../lib/api";

export const useProducts = create((set, get) => ({
  products: [],
  categories: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true });
    const [p, c] = await Promise.all([api.get("/products"), api.get("/categories")]);
    set({ products: p.data, categories: c.data, loading: false });
  },

  saveCategory: async (payload) => {
    if (payload.id) await api.put(`/categories/${payload.id}`, payload);
    else await api.post("/categories", payload);
    await get().fetchAll();
  },

  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`);
    await get().fetchAll();
  },

  saveProduct: async (payload) => {
    if (payload.id) await api.put(`/products/${payload.id}`, payload);
    else await api.post("/products", payload);
    await get().fetchAll();
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    await get().fetchAll();
  },
}));
