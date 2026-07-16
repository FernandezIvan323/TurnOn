![Build](https://img.shields.io/badge/build-passing-brightgreen?logo=github)
![Version](https://img.shields.io/badge/version-1.3.0-blue?logo=react)
![Node](https://img.shields.io/badge/node-18%2B-339933?logo=nodedotjs)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/postgresql-18%2B-4169E1?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-yellow?logo=opensourceinitiative)

# TurnOn

> Sistema de gestión integral para restaurant con mesas y pedidos a domicilio.

AppTurnos nació para resolver el caos de los pedidos a domicilio de un restaurant de acera: registro de llamadas, asignación de repartidores, seguimiento de pedidos en tiempo real, control de mesas, caja con corte diario, catálogo de productos, inventario y reportes de ventas.

Diseñado para que cualquier persona con una computadora pueda operarlo — sin conocimientos técnicos.

---

## ✨ Funcionalidades

### 🔐 Autenticación y roles
- Login con **usuario + PIN de 4 dígitos** con teclado numérico táctil.
- Roles: **admin (cajero)** y **waiter (mesero)**.
- Tokens JWT con expiración de 12 horas.
- Logout con confirmación modal.
- Creación de meseros desde la interfaz (Personal → Meseros).
- **Cambio de PIN** desde Personal (admin) sin tocar la base de datos.
- **Guard de rutas por rol**: un mesero no puede abrir caja/reportes por URL.

### 📊 Dashboard
- **Admin**: ventas del día, comparativa % vs ayer, ticket promedio, gastos del día.
- **Mesero**: mis mesas asignadas, cuentas abiertas, total en juego, listas para cobrar.
- 6 tarjetas de operación en tiempo real (sin asignar, preparación, en camino, mesas activas, por cobrar, stock bajo).
- Auto-refresca cada 30 segundos.

### 🛵 Pedidos a domicilio (módulo crítico)
- **Tablero Kanban** con 4 columnas: Pendientes → En preparación → En camino → Entregados.
- **Turnos FIFO**: resalta el siguiente pedido con badge y borde especial.
- **Búsqueda predictiva de clientes** por nombre o teléfono con dropdown.
- **Multi-repartidor**: un repartidor puede llevar varios pedidos simultáneamente. Cada uno muestra sus órdenes activas.
- **Historial de entregas** por repartidor con **total acumulado** de dinero entregado.
- Cierre con 2 modalidades:
  - **Cobrar al entregar** (efectivo contra entrega).
  - **Pre-cobrar transferencia** (paga antes, sigue en camino).
- Cancelación con motivo obligatorio.
- Notas de entrega especiales.
- **Propina**: 0%, 10%, 15% o 20% sobre el total.
- **Dividir cuenta**: elige entre cuántas personas dividir y ve el monto por persona.

### 📦 Para llevar (pickup)
- **Tablero Kanban** con 3 columnas: Pendientes → En preparación → Listo para recoger.
- **Creación rápida** desde el catálogo de productos con carrito de compras.
- **Tiempo estimado** configurable por pedido (5, 10, 15, 20, 30 min).
- **Turnos FIFO**: resalta el siguiente pedido con badge y borde especial.
- **Tiempo de espera**: muestra tiempo transcurrido y countdown del estimado.
- **Cobro integrado**: efectivo, tarjeta o transferencia directamente desde la vista.
- **Cancelación** con motivo obligatorio.

### 🪑 Mesas
- Tablero visual con colores: verde (libre), rosa (pendiente), azul (preparando), ámbar (lista para cobrar).
- **Turnos FIFO**: mesas ocupadas ordenadas por antigüedad, badge del siguiente pedido.
- Cada mesa ocupada muestra: total, productos, tiempo transcurrido.
- Apertura de cuenta al agregar el primer producto.
- Botón directo "Ir a cobrar".
- **Historial de pedidos por mesa**.

### 💸 Control de deudas
- **Pedidos no pagados**: marca entregas o cuentas de mesa como "deuda" cuando el cliente no paga.
- **Página dedicada `/debts`**: lista todas las deudas activas con filtro por tipo (delivery/mesa).
- **Antigüedad**: muestra días desde que se registró la deuda con alerta visual a partir de 7 días.
- **Cobro directo**: botón "Cobrar" desde la lista para registrar el pago al instante.
- No bloquea el corte de caja — las deudas se gestionan por separado.

### 💰 Caja / Cobro
- Pedidos pendientes agrupados por antigüedad.
- Filtros: todos / solo mesas / solo domicilios / solo para llevar.
- Métodos de pago: efectivo, tarjeta, transferencia, mixto.
- **Ticket de cobro imprimible** al cerrar (y reimpresión en pedidos cobrados).
- Corte de caja diario (1 por día; **deudas no bloquean** el corte; inmutable).
- Mensajes de error claros (pedido ya cobrado, pendientes al cortar).
- Vista de histórico de cortes.
- Auto-refresco de Caja, Domicilios y Para llevar (~12 s).

### 👥 Clientes
- Búsqueda por nombre o teléfono con debounce.
- Historial de últimos 10 pedidos.
- Edición rápida de datos y dirección.

### 📋 Menú (catálogo)
- CRUD completo de categorías y productos.
- Marcar productos como no disponibles.
- Vista agrupada por categoría.

### 📦 Inventario / Stock
- Control de existencias por producto.
- Stock mínimo con alerta visual.
- **Auto-deducción idempotente**: el stock se descuenta **una sola vez** por pedido (flag `stock_deducted`).
- Movimientos de inventario automáticos al vender/reabrir + entradas/salidas/ajustes manuales.
- Tarjeta de "Stock bajo" en el Dashboard.

### 👨‍🍳 Personal
- Gestión de **repartidores** (nombre, teléfono, órdenes activas).
- Gestión de **mesas** (número, etiqueta, capacidad, activa).
- Gestión de **meseros** (creación con usuario y PIN; **cambiar PIN**).
- **Asignación de mesas** a meseros: pre-selecciona mesas ya asignadas, muestra mesero en tabla de mesas.
- **Historial de mesero**: modal con todos los pedidos, items, totales y propinas.
- **Confirmaciones**: eliminar repartidores y mesas con modal personalizado (sin `confirm()` nativo).

### 📈 Reportes
- **6 tabs**: Resumen, Productos, Clientes, Operación, **Repartidores**, Historial.
- **Rangos**: Hoy, Domingo, 7 días, 30 días o **fechas personalizadas**.
- **Resumen**: ventas, pedidos, ticket promedio, **propinas**, canales con $ + cantidad, gastos/neto (día único).
- **Métodos de pago**: desglose real por efectivo, tarjeta, transferencia y mixto.
- **Top 10 productos** por cantidad o por ingresos.
- **Productos nunca vendidos** (candidatos a retirar).
- **Clientes más frecuentes** (solo domicilio) con gasto total.
- **Operación**: horarios pico (con $) y ventas por categoría.
- **Repartidores**: entregas e ingresos por persona.
- **Historial**: tabla de días con ventas, gastos, neto, tipos (M/D/P) y estado del corte.
- **Imprimir resumen** del período y **reporte diario** (soporta `?date=` desde el historial).
- Día contable alineado con caja: `closed_at` (zona `DB_TZ`).

### 🎨 UI/UX
- **Landing** de presentación + login rediseñado.
- **Modo claro / oscuro** con toggle en el Header (persiste en localStorage, detecta preferencia del SO).
- **Obsidian Wine** en modo oscuro: paleta `#0b090a` → `#ffffff` con acentos vino tinto `#660708` y rojos vívidos `#BA181B` / `#E5383B`.
- **Calcite** en modo claro: grises cálidos, naranja vibrante `#FD7B41` y durazno suave `#EDBF9B` sobre fondo `#DDDCDB`.
- **Aviso sonoro** de pedido nuevo en Domicilios / Para llevar (silenciable).
- Diseño responsive optimizado para laptop y tablet.
- Modales de confirmación personalizados (reemplazan `confirm()` nativo).
- Componentes con Tailwind CSS y lucide-react.

---

## 🖥️ Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React | 19 |
| **Build tool** | Vite | 6 |
| **Estilos** | Tailwind CSS | 3 |
| **Router** | React Router | 7 |
| **Estado** | Zustand | 5 |
| **HTTP** | Axios | 1.17 |
| **Iconos** | lucide-react | 0.460 |
| **Backend** | Node.js + Express | 4.21 |
| **Base de datos** | PostgreSQL | 18+ |
| **Driver BD** | `pg` (node-postgres) | 8.13 |
| **Auth** | jsonwebtoken + bcryptjs | — |

---

## 📁 Estructura del proyecto

```
AppTurnos/
├── scripts/
│   ├── start-detached.ps1        # Arranque en 2ndo plano (Vite + API independientes)
│   ├── stop-server.ps1           # Detiene ambos procesos por PID + puerto
│   └── backup-db.ps1             # Backup PostgreSQL (pg_dump → backups/)
│
├── docs/
│   └── PLAN-COMPLETITUD.md       # Plan bugs → UX → features
│
├── server/                       # API Node + Express + PostgreSQL
│   ├── .env.example              # Plantilla de variables de entorno
│   ├── db.js                     # Conexión PG + auto-creación BD + migraciones + seed
│   ├── schema.sql                # Schema completo (8+ tablas + índices)
│   ├── index.js                  # Punto de entrada del servidor
│   ├── middleware/
│   │   └── auth.js               # JWT middleware + role guard
│   └── routes/
│       ├── auth.js               # /login /me /users
│       ├── categories.js
│       ├── products.js
│       ├── tables.js
│       ├── customers.js
│       ├── delivery.js           # Repartidores + historial de entregas
│       ├── inventory.js          # Stock, movimientos, ajustes
│       ├── orders.js             # Lógica principal de pedidos (18 endpoints)
│       ├── assignments.js        # Asignación mesas ↔ meseros
│       ├── dashboard.js          # KPIs en tiempo real
│       ├── cashClosings.js       # Corte de caja diario
│       ├── expenses.js           # Gastos operativos
│       └── reports.js            # 9 endpoints de reportes (incl. daily-complete, daily-history)
│
├── src/                          # Frontend React
│   ├── App.jsx                   # Router principal (incluye /pickup)
│   ├── main.jsx                  # Entry point
│   ├── index.css                 # Tailwind + componentes + Tokyo Night dark mode
│   ├── lib/
│   │   ├── api.js                # Axios con interceptors, retry, eventos network
│   │   ├── date.js               # Helpers de fecha (todayLocalISO, dateOnlyUTC)
│   │   ├── format.js             # money, formatTime, statusLabels, assignTurns, waitMinutes
│   │   └── notify.js             # Beep + mute de pedidos nuevos
│   ├── store/                    # Zustand stores
│   │   ├── auth.js
│   │   ├── theme.js              # Persistente en localStorage
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── resources.js
│   ├── components/
│   │   ├── Layout.jsx            # Layout principal + ServerStatus
│   │   ├── RequireRole.jsx       # Guard de rutas por rol
│   │   ├── ReceiptTicket.jsx     # Ticket de cobro imprimible
│   │   ├── Brand.jsx / HeroPreview.jsx
│   │   ├── Sidebar.jsx           # Menú lateral con "Para llevar" y dark mode
│   │   ├── Header.jsx            # Header de página + ThemeToggle
│   │   ├── ThemeToggle.jsx       # Botón ☀/🌙
│   │   ├── ServerStatus.jsx      # Banner rojo cuando el server cae
│   │   ├── LogoutConfirm.jsx     # Modal de confirmación de cierre
│   │   └── BarChart.jsx          # Gráfico de barras sin dependencias
│   └── pages/
│       ├── Landing.jsx           # Portada pública
│       ├── Login.jsx             # Login con teclado numérico
│       ├── Dashboard.jsx         # Admin + Waiter dashboard
│       ├── Debts.jsx             # Control de deudas pendientes
│       ├── orders/
│       │   ├── Delivery.jsx      # Kanban + crear pedido + historial
│       │   └── pickup/
│       │       └── PickupPage.jsx # Kanban pickup + creación + cobro
│       ├── tables/
│       │   └── TablesPage.jsx    # Tablero de mesas + historial
│       ├── cashier/
│       │   ├── Cashier.jsx       # Cobro con propina, dividir cuenta y turnos FIFO
│       │   ├── CashClosing.jsx   # Corte de caja diario
│       │   └── ClosingHistory.jsx
│       ├── customers/
│       │   └── Customers.jsx     # Búsqueda + historial (últimos 10)
│       └── admin/
│           ├── Menu.jsx          # CRUD productos
│           ├── Staff.jsx         # Repartidores, meseros, mesas, asignaciones
│           ├── Inventory.jsx     # Control de stock y movimientos
│           ├── DailyReport.jsx   # Reporte diario imprimible/PDF
│           ├── Expenses.jsx      # Gastos operativos
│           └── Reports.jsx       # Reportes avanzados
│
├── .gitignore
├── package.json
├── tailwind.config.js            # Tokio Night + brandDark palette
├── postcss.config.js
├── vite.config.js                # Vite + proxy /api + usePolling
├── LICENSE                       # MIT
└── README.md
```

## 📊 Workflow

```
LLAMADA ENTRANTE (teléfono)
        │
        ▼
┌─────────────────────┐
│  Registrar pedido   │  Delivery → Nuevo pedido
│  a domicilio        │  Buscar cliente o crear
└─────────┬───────────┘  Agregar productos
          │
          ▼
┌─────────────────────┐
│    Pendiente        │  Cocina ve el pedido
│  (no hay cocinero)  │  Mesero/Admin: "En preparación"
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  En preparación     │  Se cocina
│                     │  Admin: asignar repartidor
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    En camino        │  Repartidor en la calle
│                     │  ┌─ Pre-cobrar (transfer)
│                     │  └─ Cobrar al entregar
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Entregado ✅     │  Ciclo cerrado
│  (stock deducido)   │
└─────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MESAS (en el restaurant)

┌─────────────────────┐
│   Mesa libre 🟢     │  Mesero toca → agrega producto
└─────────┬───────────┘  → Se abre cuenta automáticamente
          │
          ▼
┌─────────────────────┐
│  Pendiente / Prep.  │  Mesero: "Lista para cobrar"
│                     │  Cocina prepara
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Lista para cobrar  │  Cajero: "Ir a cobrar"
│        🟠           │  → Elige método de pago
└─────────┬───────────┘  → Propina (0/10/15/20%)
          │               → Dividir cuenta (opcional)
          ▼               → Confirmar
┌─────────────────────┐
│    Pagado ✅        │  Stock deducido automáticamente
└─────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARA LLEVAR (pickup / walk-in)

┌─────────────────────┐
│  Crear pedido       │  Cajero: nuevo pedido pickup
│  (catálogo)         │  Seleccionar productos
└─────────┬───────────┘  Tiempo estimado (5-30 min)
          │
          ▼
┌─────────────────────┐
│    Pendiente 🔢     │  Turno #1, #2, #3...
│  (turno FIFO)       │  Badge del siguiente
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  En preparación 👨‍🍳  │  Cocina prepara
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Listo para recoger │  Cliente llega
│        🟢           │  → Cobrar (efectivo/tarjeta/transfer)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Pagado ✅        │  Stock deducido automáticamente
└─────────────────────┘
```
## 📋 Changelog

### v1.2.0 (2026-07-13) — Completitud operativa (bugs, UX, features)

Listo para el **primer domingo real** en el local: dinero e inventario confiables, reportes correctos y flujos del día a día.

#### Correcciones críticas (caja e inventario)
- **Stock idempotente**: flag `orders.stock_deducted`; no se descuenta dos veces al cerrar/entregar.
- **Movimientos de inventario** automáticos al vender y al reabrir pedidos.
- **Cobro y deuda defensivos**: 409 si el pedido ya está pagado/cancelado/en deuda.
- **Corte de caja**: las **deudas no bloquean** el cierre (alineado con el preview).
- **Encoding UI**: símbolos `✓` y `−` corregidos en Caja, Domicilios, Gastos y Corte.
- **`package.json`**: dependencias de runtime (`express`, `pg`, JWT, etc.) en `dependencies`; eliminado `@heroicons/vue`.

#### Reportes (funcional + UX)
- Métodos de pago en Resumen con montos **reales** (API `/sales`).
- Ticket promedio = ventas ÷ pedidos del período (no promedio de promedios).
- **Reporte diario** respeta `?date=` desde el Historial.
- Día contable con `COALESCE(closed_at, created_at)` y timezone `DB_TZ`.
- Tabs: Resumen, Productos, Clientes, Operación, **Repartidores**, Historial.
- Rangos: Hoy / Domingo / 7d / 30d / **personalizado**.
- StatCards unificados (canales con $ + cantidad), propinas, gastos/neto del día.
- Imprimir resumen del período; empty states y skeletons de carga.
- Labels “Ingresos” (no “Ganancia”); badges M/D/P en historial.

#### UX operativa
- Auto-refresh ~12 s en Domicilios, Para llevar y Caja.
- `RequireRole`: mesero redirigido fuera de rutas de admin.
- Errores de cobro/corte más claros (lista de pendientes al fallar el corte).
- Aviso sonoro + badge de pedidos nuevos (silenciable).

#### Features
- **Ticket de cobro imprimible** (`ReceiptTicket`) tras cobrar y en pedidos cobrados.
- **Cambiar PIN** desde Personal (`PUT /auth/users/:id/pin`, `PUT /auth/me/pin`).
- **Backup** `npm run db:backup` → `scripts/backup-db.ps1`.
- Landing / Brand / HeroPreview y login actualizado (marca del producto).
- Documentación: seed con menú vacío, plan en `docs/PLAN-COMPLETITUD.md`.

### v1.1.4 (2026-06-23) — Pedidos pickup, turnos FIFO, historial mesero
- **Pedidos "Para llevar" (pickup)**: nueva página completa `/pickup` con:
  - Tablero Kanban de 3 columnas (pendiente → preparación → listo para recoger).
  - Creación desde catálogo con carrito, tiempo estimado (5-30 min) y notas por item.
  - Cobro integrado (efectivo, tarjeta, transferencia) directamente desde la vista.
  - Cancelación con motivo obligatorio.
- **Sistema de turnos FIFO**: función `assignTurns()` aplicada en:
  - Domicilios (badge del siguiente pedido con borde especial).
  - Mesas ocupadas (ordenadas por antigüedad).
  - Caja (turno numérico en cada pedido).
  - Pickup (turno y countdown del tiempo estimado).
- **Historial de mesero**: nuevo modal en Staff que muestra pedidos, items, totales y propinas.
- **Endpoint `/reports/waiter-history`**: historial de pedidos por mesero.
- **Reportes rediseñados** con 5 tabs:
  - **Resumen**: 6 StatCards (ventas, pedidos, ticket, domicilios, pickup, mesas), métodos de pago, gráfico de ventas, comparativa.
  - **Productos**: top productos (cantidad/ganancia) + productos nunca vendidos.
  - **Clientes**: top 10 por gasto total.
  - **Operación**: horarios pico (gráfico vertical) + ventas por categoría.
  - **Historial**: tabla de días con ventas, gastos, neto, tipos de pedido y estado del corte de caja.
- **Endpoint `/reports/daily-history`**: historial de días con ventas, gastos y neto (usa `generate_series`).
- **Staff mejorado**:
  - Asignación de mesas: pre-selecciona mesas ya asignadas, muestra mesero en tabla de mesas.
  - ConfirmModal para eliminar repartidores y mesas (reemplaza `confirm()` nativo).
  - Badge "Fuera de turno" en rojo.
- **Reporte diario mejorado**: incluye métodos de pago y conteo de pedidos pickup.
- **BarChart mejorado**: modo vertical, colores personalizados, valores en barras.
- **Dark mode completado**: DailyReport, Inventory, Expenses ahora soportan modo oscuro.
- **Fix Expenses**: resumen de gastos ahora usa la fecha del filtro activo.
- **Fix Asignaciones**: removido `ON CONFLICT DO NOTHING` del INSERT.
- **Fix Encoding**: corregido character corrupto `N°` en tabla de mesas.
- **Backend**: migración `estimate_minutes` en orders, columnas `pickup_orders`/`pickup_count` en reportes.

### v1.1.3 (2026-06-09) — Control de deudas y estabilidad
- **Deudas**: nuevo módulo de control de pedidos no pagados.
  - Botón "Entregado (deuda)" en domicilios (pedidos en camino) y mesas (cuentas listas para cobrar).
  - Nuevo `payment_status = 'debt'` para diferenciar deudas de pedidos activos.
  - Página `/debts` con listado completo, filtro por tipo (delivery/mesa/pickup), antigüedad y botón "Cobrar".
  - Endpoints `POST /orders/:id/mark-delivered` y `POST /orders/:id/pay-debt`.
  - Corte de caja ya no bloquea por deudas pendientes.
- **Historial de repartidor**: muestra el total de dinero entregado por cada repartidor.
- **Modal de confirmación**: componente `ConfirmModal.jsx` reutilizable que reemplaza el `confirm()` nativo del navegador en eliminación de productos y categorías.
- **Eliminada sección "Cómo empezar"** del Dashboard de admin.
- **Fix**: query SQL de historial de entregas corregida (`o.customer_name` → `c.name` con `LEFT JOIN customers`).
- **Fix**: ServerStatus ya no recarga la página al recuperarse de un error transitorio.
- **Fix**: encoding UTF-8 corrupto en toda la UI.
- **Fix**: Kill-Port mata toda la cadena node (hijo + `--watch` padre + huérfanos).

### v1.1.0 (2026-06-09) — Seguridad integral
- **Helmet**: cabeceras HTTP de seguridad (CSP, XSS, HSTS, X-Frame-Options).
- **CORS restringido**: solo orígenes permitidos configurados en `CORS_ORIGINS`.
- **Rate limiting**: máximo 10 intentos de login cada 15 minutos por IP.
- **JWT_SECRET**: secreto criptográfico de 64 bytes (generado con `crypto.randomBytes`).
- **SQL Injection fix**: timezone ahora usa query parametrizada en `withTransaction`.
- **Error handler**: errores 500 no exponen `err.message` interno al cliente.
- **Seed seguro**: PINs por defecto cambiados a `7482` (admin) y `3197` (meseros).
- **Obsidian Wine**: nuevo tema oscuro con paleta vino tinto (fondo `#0b090a`, rojos vívidos).
- **Calcite**: nuevo tema claro con grises cálidos, naranja `#FD7B41` y durazno `#EDBF9B`.
- **Zombie ports**: `Kill-Port` espera hasta 5s sondeando que el puerto esté realmente libre.
- **Puerto 3001**: `server/index.js` reintenta hasta 5 veces si el puerto está ocupado (EADDRINUSE).

### v1.0.1 (2026-06-08)
- Tokyo Night dark mode (colores vibrantes #1A1B26 / #9ECE6A)
- Auto-deducción de inventario al cerrar pedidos
- Propina fija (0/10/15/20%)
- Dividir cuenta equitativamente
- Reporte diario completo imprimible/PDF
- Multi-repartidor (órdenes activas simultáneas)
- Historial de entregas por repartidor
- Historial de pedidos por mesa
- Creación de meseros desde Personal
- Control de stock con movimientos
- Login rediseñado (teclado numérico, backspace, sin auto-submit)
- Logout con confirmación modal
- Banner de servidor caído con reintento

### v1.0.0 (2026-05)
- Lanzamiento inicial
- Gestión de pedidos a domicilio (Kanban)
- Gestión de mesas con tablero visual
- Caja y cobro con métodos de pago
- Corte de caja diario
- CRUD de menú (categorías + productos)
- Gestión de repartidores y meseros
- Asignación de mesas
- Dashboard con KPIs en tiempo real
- Reportes (ventas, top productos, categorías, horarios pico)
- Gastos operativos
- Autenticación con roles (admin/mesero)
- Modo claro/oscuro
- Arranque detachado (sobrevive cierre de terminal)

---

## 📄 Licencia

MIT © 2026 Ivan Fernandez

---

**Hecho con ❤️ para que nunca más se pierda un pedido.**
