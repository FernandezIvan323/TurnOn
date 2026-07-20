import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, ChevronRight, Utensils } from "lucide-react";
import api from "../../lib/api";
import Header from "../../components/Header";
import { money, formatTime } from "../../lib/format";
import { todayLocalISO } from "../../lib/date";

function formatDayLabel(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function payLabel(method) {
  if (method === "cash") return "Efectivo";
  if (method === "card") return "Tarjeta";
  if (method === "transfer") return "Transferencia";
  if (method === "mixed") return "Mixto";
  return method || "—";
}

export default function MyWorkHistory() {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadDays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/reports/my-work-days");
      setDays(data || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  const openDay = async (date) => {
    setSelectedDate(date);
    setDetail(null);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/reports/my-work-days/${date}`);
      setDetail(data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDay = () => {
    setSelectedDate(null);
    setDetail(null);
  };

  const isToday = selectedDate === todayLocalISO();

  if (selectedDate) {
    return (
      <div>
        <Header
          title={isToday ? "Hoy" : formatDayLabel(selectedDate)}
          subtitle="Detalle de tu jornada"
          right={
            <button type="button" onClick={closeDay} className="btn-secondary h-9">
              <ArrowLeft size={16} /> Días
            </button>
          }
        />

        {detailLoading && (
          <div className="text-sm text-ink-500">Cargando detalle…</div>
        )}

        {detail && !detailLoading && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="card p-3">
                <div className="text-[11px] text-ink-500">Cuentas</div>
                <div className="text-xl font-bold text-ink-900 dark:text-white">
                  {detail.summary.orders_count}
                </div>
              </div>
              <div className="card p-3">
                <div className="text-[11px] text-ink-500">Vendido</div>
                <div className="text-xl font-bold text-ink-900 dark:text-white">
                  {money(detail.summary.total_sales)}
                </div>
              </div>
              <div className="card p-3">
                <div className="text-[11px] text-ink-500">Propinas</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                  {money(detail.summary.total_tips)}
                </div>
              </div>
              <div className="card p-3">
                <div className="text-[11px] text-ink-500">Mesas</div>
                <div className="text-xl font-bold text-ink-900 dark:text-white">
                  {detail.summary.tables_served}
                </div>
              </div>
            </div>

            {detail.orders.length === 0 ? (
              <div className="card p-8 text-center text-sm text-ink-500">
                Sin pedidos este día.
              </div>
            ) : (
              <div className="space-y-3">
                {detail.orders.map((o) => (
                  <div
                    key={o.id}
                    className="overflow-hidden rounded-xl border border-paper-300 dark:border-obsidian-700"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-200 bg-white px-3 py-2 text-xs font-medium text-ink-800 dark:border-obsidian-600 dark:bg-white dark:text-ink-900">
                      <span>
                        {formatTime(o.created_at)}
                        {o.closed_at ? ` → ${formatTime(o.closed_at)}` : ""}
                      </span>
                      <span
                        className={`badge text-[10px] ${
                          o.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : o.payment_status === "debt"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        }`}
                      >
                        {o.payment_status === "paid"
                          ? "Pagado"
                          : o.payment_status === "debt"
                            ? "Deuda"
                            : o.payment_status === "pending"
                              ? "Pendiente"
                              : o.payment_status}
                      </span>
                    </div>
                    <div className="space-y-1.5 px-3 py-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-obsidian-50">
                        <Utensils size={14} className="shrink-0 text-wine-600" />
                        {o.type === "table"
                          ? `Mesa ${o.table_number ?? "?"}${o.table_label ? ` · ${o.table_label}` : ""}`
                          : o.type === "pickup"
                            ? "Para llevar"
                            : "Domicilio"}
                        {o.customer_name && (
                          <span className="font-normal text-ink-500">· {o.customer_name}</span>
                        )}
                      </div>
                      {o.items?.length > 0 && (
                        <div className="space-y-0.5 text-xs text-ink-600 dark:text-obsidian-200">
                          {o.items.map((item, i) => (
                            <div key={i} className="flex justify-between gap-2">
                              <span>
                                {item.quantity}× {item.name_snapshot}
                                {item.notes ? ` (${item.notes})` : ""}
                              </span>
                              <span className="tabular-nums shrink-0">
                                {money(Number(item.unit_price) * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between border-t border-paper-200 pt-1.5 text-sm dark:border-obsidian-700">
                        <span className="text-xs text-ink-500">{payLabel(o.payment_method)}</span>
                        <div className="text-right">
                          <span className="font-bold text-ink-900 dark:text-white">
                            {money(o.total)}
                          </span>
                          {Number(o.tip) > 0 && (
                            <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                              +{money(o.tip)} propina
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Mi historial"
        subtitle="Días trabajados — cuentas, mesas y propinas"
      />

      {error && (
        <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-ink-500">Cargando historial…</div>
      ) : days.length === 0 ? (
        <div className="card border-dashed p-10 text-center">
          <CalendarDays size={32} className="mx-auto mb-2 text-ink-400" />
          <div className="font-semibold text-ink-800 dark:text-white">
            Aún no hay días registrados
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Cuando atiendas mesas y se cobren cuentas, aparecerán aquí por día.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {days.map((d) => {
            const today = d.date === todayLocalISO();
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => openDay(d.date)}
                className="card flex w-full items-center gap-3 p-4 text-left transition hover:border-wine-400 hover:shadow-pop dark:hover:border-wine-500"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-wine-50 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300">
                  <CalendarDays size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold capitalize text-ink-900 dark:text-white">
                      {formatDayLabel(d.date)}
                    </span>
                    {today && (
                      <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Hoy
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-500 dark:text-obsidian-400">
                    {d.orders_count} cuenta{d.orders_count === 1 ? "" : "s"}
                    {" · "}
                    {d.tables_served} mesa{d.tables_served === 1 ? "" : "s"}
                    {" · "}
                    Propina {money(d.total_tips)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold tabular-nums text-ink-900 dark:text-white">
                    {money(d.total_sales)}
                  </div>
                  <ChevronRight size={16} className="ml-auto mt-0.5 text-ink-400" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
