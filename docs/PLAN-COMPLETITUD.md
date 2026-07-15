# AppTurnos — Plan de completitud (bugs → UX → features)

## Context

**Proyecto:** `C:\Users\USUARIO\ProyectosIA\AppTurnos` (v1.1.4)  
**Para quién:** negocio de comidas del padre del autor; **solo abre domingos**; sin historial digital previo.  
**Uso real:** aún **no** se ha usado en el entorno de trabajo del domingo; solo pruebas locales del autor.  
**Cambios recientes del autor (no tocar en bugs de backend salvo lo listado):** Landing, Brand, HeroPreview, Login, Sidebar/App.jsx (marca/UX).  
**Orden acordado:** 1) Bugs → 2) UX → 3) Features.  
**Estado:** plan en revisión actualizada (incluye fallos de **Reportes** backend + frontend).  
**Copia deseada en repo:** `docs/PLAN-COMPLETITUD.md` (crear al ejecutar / al salir de plan mode).  
**Implementación:** Fases 1, 2 y 3 (features + UX reportes) hechas. Diferidos: KDS, Docker, suite de tests.

---

## Objetivo

Dejar el sistema **completo y confiable** para el primer domingo real: dinero e inventario correctos, **reportes con números verdaderos**, pantallas sincronizadas, sin bugs que rompan el cierre del día.

---

## Fase 1 — Bugs críticos (prioridad alta)

### 1.1 Doble descuento de inventario
- **Problema:** `deductStockForOrder` en `status=delivered`, `close` y `mark-delivered` sin flag; se puede descontar 2 veces.
- **Archivos:** `server/routes/orders.js`, `server/db.js`
- **Solución:**
  - Migración: `orders.stock_deducted BOOLEAN NOT NULL DEFAULT FALSE`
  - Deducción solo si `stock_deducted = false`; luego marcarlo `true`
  - Al reabrir (`reopen`): restaurar solo si estaba descontado; poner `false`
  - Registrar `stock_movements` tipo `exit`/`entry` con motivo `Pedido #id`

### 1.2 Corte de caja bloquea por deudas (inconsistencia)
- **Problema:** preview excluye `debt`; el `POST` del cierre **no**.
- **Archivo:** `server/routes/cashClosings.js`
- **Solución:** mismo filtro que preview: `AND o.payment_status <> 'debt'` (deudas se gestionan aparte)

### 1.3 Cierre de pedido no idempotente
- **Problema:** `close` no valida si ya está pagado/cancelado; doble click = riesgo de stock/estado raro.
- **Archivo:** `server/routes/orders.js` (`POST /:id/close`, `mark-delivered`, `status`)
- **Solución:**
  - `close`: rechazar 409 si `payment_status === 'paid'` o `status === 'cancelled'`
  - `mark-delivered`: rechazar si ya entregado/pagado/cancelado
  - `status → delivered`: no descontar de más (cubierto por flag)

### 1.4 `package.json` — deps de producción mal ubicadas
- **Problema:** `express`, `pg`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv` en `devDependencies`; `@heroicons/vue` sobra en React.
- **Archivo:** `package.json`
- **Solución:** mover runtime a `dependencies`; quitar `@heroicons/vue`; dejar build tools en `devDependencies`

### 1.5 Encoding roto en UI
- **Archivos y strings:**
  - `src/pages/orders/Delivery.jsx` → `✓ Pagado`
  - `src/pages/cashier/Cashier.jsx` → `✓ Pagado`
  - `src/pages/cashier/CashClosing.jsx` → `−` (menos)
  - `src/pages/admin/Expenses.jsx` → `−` entre ventas y gastos
- **Solución:** reemplazar mojibake por caracteres UTF-8 correctos

### 1.6 Alinear seed vs README (documentación menor)
- Seed ya no inserta menú; README aún habla de categorías/productos de ejemplo.
- **Archivos:** `README.md` (y comentario en `server/db.js` si hace falta)
- **Solución:** documentar que el menú se carga vacío a propósito

### 1.7 Reportes — métodos de pago en Resumen siempre en $0 (bug)
- **Problema:** `Reports.jsx` (tab Resumen) suma `d.payment_methods` por día, pero `GET /reports/sales` **no devuelve** ese campo. La UI muestra $0 y engaña.
- **Archivos:** `server/routes/reports.js` (`/sales`), opcionalmente `src/pages/admin/Reports.jsx`
- **Solución (recomendada):**
  - En `/sales`, agregar desglose por método de pago del período (y/o por día en cada row de `days`)
  - Alinear el front para leer la estructura real del API
  - Alternativa mínima: quitar el bloque hasta que el API lo soporte (peor UX)

### 1.8 Reportes — DailyReport ignora `?date=` (bug frontend)
- **Problema:** Historial navega a `/reports/daily?date=YYYY-MM-DD` pero `DailyReport.jsx` solo usa `todayLocalISO()`. Siempre muestra el día de hoy.
- **Archivo:** `src/pages/admin/DailyReport.jsx`
- **Solución:** leer `date` de `useSearchParams()` / query string; fallback a hoy; recargar al cambiar `date`; título con la fecha elegida

### 1.9 Reportes — ticket promedio mal agregado (bug backend)
- **Problema:** en `/sales`, `avg_ticket` es promedio de promedios diarios, no `SUM(total)/COUNT(*)`.
- **Archivo:** `server/routes/reports.js`
- **Solución:** calcular ticket global del período con una query agregada o `current.sales / current.orders`

### 1.10 Reportes — label “Ganancia” engañoso (bug frontend copy)
- **Problema:** en tab Productos, el toggle dice “Ganancia” pero es **ingresos** (revenue), no margen.
- **Archivo:** `src/pages/admin/Reports.jsx`
- **Solución:** renombrar a **“Ingresos”** (o “Ventas $”)

**Criterio de done Fase 1:**  
- Pedido cerrado 2 veces no mueve stock 2 veces; deudas no bloquean corte; encoding OK; deps de API en `dependencies`.  
- Resumen muestra **métodos de pago reales** (no $0 falsos).  
- Desde Historial, abrir un día pasado muestra **ese día** en Diario.  
- Ticket promedio coherente; copy de productos correcto.

---

## Fase 2 — UX (prioridad media)

### 2.1 Auto-refresh en pantallas operativas
- Hoy: Dashboard 30s, Mesas 20s; **Delivery, Pickup, Caja no refrescan solos**
- **Archivos:** `src/pages/orders/Delivery.jsx`, `src/pages/pickup/PickupPage.jsx`, `src/pages/cashier/Cashier.jsx`
- **Solución:** `setInterval` 10–15s + cleanup (mismo patrón que Mesas/Dashboard)

### 2.2 Guard de rol en frontend
- Sidebar oculta rutas; un mesero puede abrir `/cashier` por URL
- **Archivos:** `src/components/Layout.jsx` o wrapper en `App.jsx`
- **Solución:** redirigir a `/dashboard` si el rol no tiene permiso

### 2.3 Mensajes de error de negocio más claros en caja/corte
- Mostrar el mensaje 409 del API en UI (no fallo genérico)

### 2.4 Reportes — consistencia de StatCards (frontend)
- **Problema:** Domicilios muestra **$**, Pickup y Mesas solo **conteo** → comparación confusa.
- **Archivo:** `src/pages/admin/Reports.jsx`
- **Solución:** unificar (p. ej. todos con $ + sub de cantidad, o todos con cantidad + sub de $) usando datos de `/sales`

### 2.5 Reportes — propinas (y opcional gastos) en tab Resumen
- **Problema:** propinas solo en DailyReport; Resumen no las muestra.
- **Archivos:** `server/routes/reports.js` (incluir tips en `/sales` o endpoint), `Reports.jsx`
- **Solución:** StatCard de propinas del período; opcional: gastos del día si el rango es un solo día

### 2.6 Reportes — selector de fechas en tabs principales (frontend)
- **Problema:** tabs Resumen/Productos/Clientes/Operación fijos a “Hoy”; solo Historial tiene semana/mes/año.
- **Archivo:** `src/pages/admin/Reports.jsx`
- **Solución:** chips Hoy / Este domingo / Semana / Mes / rango custom reutilizando `from`/`to` del API (hoy `range` está hardcodeado)

### 2.7 Reportes — tipos de pedido en Historial sin emojis (frontend)
- **Problema:** 🪑🛵📦 poco profesional y mal al imprimir.
- **Archivo:** `src/pages/admin/Reports.jsx`
- **Solución:** texto corto o badges (`M` / `D` / `P` o iconos lucide)

### 2.8 Reportes — alinear fecha contable (backend, opcional pero recomendado)
- **Problema:** reportes usan `DATE(created_at)`; corte usa `closed_at` + timezone México. Pueden descuadrar.
- **Archivos:** `server/routes/reports.js` (y alinear con `cashClosings.js`)
- **Solución:** una convención documentada — preferible `closed_at` (o `COALESCE(closed_at, created_at)`) con `AT TIME ZONE` de `DB_TZ` para pedidos pagados

### 2.9 Reportes — timezone consistente en SQL
- **Problema:** `DATE(created_at)` sin timezone vs `DB_TZ`.
- **Archivo:** `server/routes/reports.js`
- **Solución:** `DATE(col AT TIME ZONE 'America/Mexico_City')` o valor de env

### 2.10 Checklist flujo domingo (manual)
- abrir → menú/stock → mesas + pickup + 1 delivery → cobros → deudas → corte → reportes

**Criterio de done Fase 2:**  
pantallas operativas refrescan; mesero no entra a admin por URL; errores de caja claros; Reportes con métricas consistentes, fechas elegibles, Diario/Historial alineados, menos ruido visual.

---

## Fase 3 — Features de completitud (prioridad media-baja)

| # | Feature | Para qué |
|---|---------|----------|
| 3.1 | Ticket de cobro imprimible (navegador) | Cliente / comprobante del domingo |
| 3.2 | Sonido o badge al pedido nuevo | No perder pedidos en el caos |
| 3.3 | Cambiar PIN desde Personal | Sin tocar BD |
| 3.4 | Backup PG documentado/script | No perder historial de domingos |
| 3.5 | Vista cocina simple (KDS) | Si cocina y caja son pantallas distintas |
| 3.6 | Docker Compose (opcional) | Arranque en otra PC |
| 3.7 | Tests API flujo crítico (3–5) | No romper stock/caja |
| 3.8 | Reportes: tab o bloque **repartidores** | API `/delivery-by-person` ya existe, no se muestra |
| 3.9 | Reportes: nota en Clientes “solo domicilio” | Claridad (mesas/pickup sin customer) |

**No prioritario primer domingo:** multi-sucursal, facturación fiscal, app nativa, pagos online, costo/margen real por plato.

---

## Archivos críticos

### Fase 1

| Archivo | Cambios |
|---------|---------|
| `server/db.js` | Migración `stock_deducted` |
| `server/routes/orders.js` | Stock idempotente + validaciones + movements |
| `server/routes/cashClosings.js` | Excluir deudas del bloqueo de corte |
| `server/routes/reports.js` | payment_methods en `/sales`; fix avg_ticket |
| `package.json` | Dependencies correctas |
| `src/pages/orders/Delivery.jsx` | Encoding |
| `src/pages/cashier/Cashier.jsx` | Encoding |
| `src/pages/cashier/CashClosing.jsx` | Encoding |
| `src/pages/admin/Expenses.jsx` | Encoding |
| `src/pages/admin/DailyReport.jsx` | Leer `?date=` |
| `src/pages/admin/Reports.jsx` | Consumir payment_methods; label Ingresos |
| `README.md` | Seed vacío (opcional F1) |

### Fase 2 (Reportes + UX)

| Archivo | Cambios |
|---------|---------|
| `Delivery.jsx`, `PickupPage.jsx`, `Cashier.jsx` | Auto-refresh |
| `Layout.jsx` / `App.jsx` | Guard de rol |
| `Reports.jsx` | StatCards unificados, fechas, propinas UI, badges tipos |
| `reports.js` | tips en sales; timezone / closed_at |

**Reutilizar:** `withTransaction`, `HttpError` (`server/db.js`); `stock_movements` en `inventory.js`; `pendingOrdersFor` en cashClosings; `todayLocalISO` / `date.js`; patrón DailyReport de métodos de pago.

**No modificar en Fase 1:** Landing, Brand, HeroPreview, Login rediseñado (salvo si un bug lo exige).

---

## Orden de ejecución

1. Migración + stock idempotente + movements (`orders.js`)  
2. Validaciones `close` / `mark-delivered`  
3. Fix corte + deudas  
4. `package.json`  
5. Encoding UI  
6. **Reportes 1.7–1.10** (sales payment_methods, DailyReport date, avg_ticket, label)  
7. README seed (opcional)  
8. Verificación manual  
9. Fase 2 (UX + polish reportes)  
10. Fase 3 (features)

---

## Verificación

### Fase 1 — Caja / stock
1. `npm run dev` + PostgreSQL + `server/.env`  
2. Pedido mesa → cerrar → stock −1 vez  
3. Cerrar de nuevo → 409, stock igual  
4. Delivery deuda → stock −1; reabrir → stock +  
5. Deuda abierta → **sí** se puede cortar caja  
6. UI: “✓ Pagado” y “−” legibles  
7. Login/Landing intactos  

### Fase 1 — Reportes
8. Con ventas en efectivo/tarjeta: tab Resumen muestra montos **≠ $0** por método  
9. Historial → clic día pasado → Diario muestra **esa fecha** y sus números  
10. Ticket promedio = ventas / pedidos del período  
11. Toggle productos dice **Ingresos**, no “Ganancia”

### Fase 2 — Reportes / UX
12. Cambiar rango de fechas refresca tabs  
13. StatCards de canal consistentes  
14. Auto-refresh en Delivery/Pickup/Caja  

---

## Referencia rápida — mapa de Reportes (sin re-analizar)

| Tab / pantalla | API principal |
|----------------|---------------|
| Resumen | `GET /reports/sales` |
| Productos | `/top-products`, `/never-sold` |
| Clientes | `/top-customers` |
| Operación | `/peak-hours`, `/by-category` |
| Historial | `/daily-history` + `/cash-closings` |
| Diario PDF | `/daily-complete` |
| No usado en UI aún | `/delivery-by-person` (→ F3.8) |

---

## Cómo retomar

Decir: **“ejecuta Fase 1”** o **“implementa el plan”**.  
Skills: developer / diagnose si algo falla.
