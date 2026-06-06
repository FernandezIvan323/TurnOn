import { create } from "zustand";
import api from "../lib/api";

export const useTables = create((set) => ({
  tables: [],
  loading: false,
  fetchAll: async () => {
    set({ loading: true });
    const { data } = await api.get("/tables");
    set({ tables: data, loading: false });
  },
  save: async (payload) => {
    if (payload.id) await api.put(`/tables/${payload.id}`, payload);
    else await api.post("/tables", payload);
  },
  remove: async (id) => {
    await api.delete(`/tables/${id}`);
  },
}));

export const useDelivery = create((set, get) => ({
  persons: [],
  fetchAll: async () => {
    const { data } = await api.get("/delivery");
    set({ persons: data });
  },
  save: async (payload) => {
    if (payload.id) await api.put(`/delivery/${payload.id}`, payload);
    else await api.post("/delivery", payload);
    await get().fetchAll();
  },
  remove: async (id) => {
    await api.delete(`/delivery/${id}`);
    await get().fetchAll();
  },
}));

export const useCustomers = create((set, get) => ({
  results: [],
  loading: false,
  search: async (q) => {
    set({ loading: true });
    const { data } = await api.get("/customers", { params: q ? { q } : {} });
    set({ results: data, loading: false });
  },
  create: async (payload) => {
    const { data } = await api.post("/customers", payload);
    return data;
  },
  getOne: async (id) => {
    const { data } = await api.get(`/customers/${id}`);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/customers/${id}`, payload);
    return data;
  },
}));
