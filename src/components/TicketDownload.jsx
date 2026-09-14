import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";
import api from "../lib/api";
import { money, typeLabels, formatTime, payMethodLabel } from "../lib/format";
import { loadSettings, getSettings } from "../lib/settings";
import { toast } from "../store/toast";
import { Download, X, Loader2 } from "lucide-react";

/**
 * Ticket de cobro con diseño minimalista propio de TurnOn.
 * Muestra toda la info del pedido y permite descargar el ticket como imagen PNG.
 */
export default function TicketDownload({ order, onClose }) {
  const [detail, setDetail] = useState(order);
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState(getSettings());
  const ticketRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadSettings()
      .then((s) => {
        if (!cancelled && s) setSettings(s);
      })
      .catch(() => {});
    if (order?.items?.length) {
      setDetail(order);
      return;
    }
    api
      .get(`/orders/${order.id}`)
      .then(({ data }) => {
        if (!cancelled) setDetail(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [order?.id]);

  const items = detail?.items || [];
  const tip = Number(detail?.tip || 0);
  const total = Number(detail?.total || 0);
  const grand = total + tip;
  const typeLabel = typeLabels[detail?.type] || detail?.type;
  const when = detail?.closed_at
    ? new Date(detail.closed_at).toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const download = async () => {
    if (!ticketRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(ticketRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.download = `ticket-${detail?.id || "pedido"}.png`;
      a.href = dataUrl;
      a.click();
      toast.success("Ticket descargado");
    } catch (e) {
      toast.error("No se pudo generar la imagen");
    } finally {
      setBusy(false);
    }
  };

  const brand = settings.business_name || "TurnOn";
  const contact = [settings.address, settings.phone].filter(Boolean).join(" · ");

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header (fuera del snapshot) */}
        <div className="flex items-center justify-between border-b border-paper-200 px-4 py-3">
          <h2 className="text-base font-bold text-ink-900">Ticket de cobro</h2>
          <button type="button" onClick={onClose} className="btn-ghost h-9 w-9 p-0" aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Vista previa del ticket (se captura como PNG) */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-paper-100 p-4">
          <div
            ref={ticketRef}
            className="mx-auto overflow-hidden bg-white"
            style={{ width: 340, borderRadius: 16, boxShadow: "0 2px 12px rgb(0 0 0 / 0.08)" }}
          >
            {/* Marca */}
            <div className="bg-wine-600 px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-white/15">
                  <img src="/favicon.svg" alt="" className="h-6 w-6 object-cover" />
                </div>
                <span className="text-lg font-bold tracking-tight">{brand}</span>
              </div>
              <div className="mt-0.5 text-[11px] uppercase tracking-widest text-white/80">
                Comprobante de cobro
              </div>
            </div>

            {/* Cuerpo */}
            <div className="px-5 py-4">
              <div className="flex items-end justify-between border-b border-dashed border-ink-200 pb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wide text-ink-400">Pedido</div>
                  <div className="font-mono text-sm font-bold text-ink-900">#{detail?.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wide text-ink-400">{typeLabel}</div>
                  <div className="text-xs font-semibold text-ink-700">{when}</div>
                </div>
              </div>

              {detail?.type === "table" && (
                <div className="mt-2 flex items-center justify-between text-xs text-ink-600">
                  <span>Mesa</span>
                  <b>{detail?.table_number}{detail?.table_label ? ` · ${detail.table_label}` : ""}</b>
                </div>
              )}
              {detail?.customer_name && (
                <div className="mt-1 flex items-center justify-between text-xs text-ink-600">
                  <span>Cliente</span>
                  <b>{detail.customer_name}</b>
                </div>
              )}
              <div className="mt-1 flex items-center justify-between text-xs text-ink-600">
                <span>Hora pedido</span>
                <b>{detail?.created_at ? formatTime(detail.created_at) : "—"}</b>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-ink-600">
                <span>Pago</span>
                <b>{detail?.payment_method ? payMethodLabel(detail.payment_method) : "—"}</b>
              </div>

              {/* Items */}
              <div className="mt-3 border-t border-ink-100 pt-3">
                {items.length === 0 ? (
                  <div className="py-3 text-center text-xs text-ink-400">Sin detalle de productos</div>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((it, i) => (
                      <div key={it.id ?? i} className="flex items-start justify-between gap-2 text-xs">
                        <div className="min-w-0">
                          <div className="font-semibold text-ink-900">
                            <span className="mr-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded bg-wine-50 px-1 text-[10px] font-bold tabular-nums text-wine-700">
                              {it.quantity}
                            </span>
                            {it.name_snapshot}
                          </div>
                          {it.notes && <div className="pl-5 text-[10px] text-ink-400">{it.notes}</div>}
                        </div>
                        <span className="shrink-0 font-semibold tabular-nums text-ink-900">
                          {money(Number(it.unit_price) * Number(it.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="mt-3 space-y-1 border-t border-ink-100 pt-3 text-sm">
                <div className="flex justify-between text-xs text-ink-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{money(total)}</span>
                </div>
                {tip > 0 && (
                  <div className="flex justify-between text-xs text-ink-600">
                    <span>Propina</span>
                    <span className="tabular-nums">{money(tip)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 text-base font-bold text-wine-700">
                  <span>Total</span>
                  <span className="tabular-nums">{money(grand)}</span>
                </div>
              </div>

              {/* Pie */}
              <div className="mt-4 border-t border-dashed border-ink-200 pt-3 text-center">
                <div className="text-xs font-semibold text-ink-800">
                  {settings.ticket_footer || "¡Gracias por su preferencia!"}
                </div>
                {contact && <div className="mt-1 text-[10px] text-ink-400">{contact}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="border-t border-paper-200 px-4 py-3">
          <button type="button" onClick={download} disabled={busy} className="btn-primary w-full">
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Descargar imagen
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}