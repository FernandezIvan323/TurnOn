import { create } from "zustand";
import api from "../lib/api";

export const useOrders = create((set, get) => ({
  orders: [],
  loading: false,

  fetchAll: async (params = {}) => {
    set({ loading: true });
    const { data } = await api.get("/orders", { params });
    set({ orders: data, loading: false });
  },

  fetchOne: async (id) => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/orders", payload);
    await get().fetchAll();
    return data;
  },

  addItem: async (orderId, item) => {
    await api.post(`/orders/${orderId}/items`, item);
  },

  removeItem: async (orderId, itemId) => {
    await api.delete(`/orders/${orderId}/items/${itemId}`);
  },

  assignDelivery: async (orderId, delivery_person_id) => {
    await api.post(`/orders/${orderId}/assign-delivery`, { delivery_person_id });
    await get().fetchAll();
  },

  setStatus: async (orderId, status, cancel_reason = null) => {
    await api.post(`/orders/${orderId}/status`, { status, cancel_reason });
    await get().fetchAll();
  },

  close: async (orderId, payment_method = "cash") => {
    await api.post(`/orders/${orderId}/close`, { payment_method });
    await get().fetchAll();
  },
}));
