# AppTurnos v1.2.0 — Completitud operativa

**Fecha:** 2026-07-13  
**Tag:** `v1.2.0`  
**Commit:** `1092a7f`

Listo para el **primer domingo real** en el local: dinero e inventario confiables, reportes correctos y flujos del día a día.

## Correcciones críticas

- **Stock idempotente** — flag `stock_deducted`; no se descuenta dos veces al cerrar/entregar
- **Movimientos de inventario** automáticos al vender y al reabrir
- **Cobro y deuda defensivos** — 409 si el pedido ya está pagado/cancelado/en deuda
- **Corte de caja** — las deudas **no bloquean** el cierre
- **Encoding UI** — símbolos `✓` y `−` corregidos
- **package.json** — dependencias de runtime en el lugar correcto

## Reportes

- Métodos de pago con montos reales
- Ticket promedio = ventas ÷ pedidos del período
- Diario respeta `?date=` desde el Historial
- Día contable alineado con caja (`closed_at` + `DB_TZ`)
- 6 tabs: Resumen, Productos, Clientes, Operación, **Repartidores**, Historial
- Rangos: Hoy / Domingo / 7d / 30d / personalizado
- Imprimir resumen, propinas, gastos/neto del día, empty states

## UX operativa

- Auto-refresh ~12 s en Domicilios, Para llevar y Caja
- Guard de rutas por rol (mesero no entra a admin por URL)
- Errores claros en cobro y corte
- Aviso sonoro + badge de pedidos nuevos (silenciable)

## Features nuevas

- **Ticket de cobro imprimible** tras cobrar y en pedidos cobrados
- **Cambiar PIN** desde Personal
- **Backup** `npm run db:backup` → `backups/`
- Landing / marca / login actualizado

## Instalación / actualización

```bash
git fetch --tags
git checkout v1.2.0
npm install
npm run dev
```

Backup recomendado después de cada domingo:

```bash
npm run db:backup
```

## Publicar el Release en GitHub (si falta la página)

```bash
gh auth login
gh release create v1.2.0 --title "v1.2.0 — Completitud operativa" --notes-file docs/RELEASE-v1.2.0.md
```

O desde la web: **Releases → Draft a new release → elegir tag `v1.2.0`**.
