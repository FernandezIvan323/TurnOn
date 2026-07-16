# TurnOn / AppTurnos v1.3.0 — Puesto en la acera (LAN + túnel + mesas)

**Fecha:** 2026-07-16  
**Tag:** `v1.3.0`  
**Pensado para:** puesto en la calle / acera, varios celulares (meseros + admin).

Incluye todo lo de **v1.2.0** y suma operación multi-dispositivo, historial del mesero y acceso por internet sin VPS.

---

## Destacados

### Mesas (admin / cajero)
- Mesa **libre**: solo información (nombre, capacidad, estado, mesero asignado). **Sin menú** ni abrir cuenta.
- Mesa **ocupada**: cuenta en solo lectura; **Cobrar / Deuda** si está lista para cobrar.
- Tablero **agrupado por mesero** + sección **Sin asignar**.
- Cada card muestra quién atiende la mesa.
- API: el admin **no puede** crear pedidos de mesa (`403`).

### Mesero
- **Mi historial** (sidebar, debajo de Catálogo): días trabajados con totales y detalle (mesas, items, propinas, pago).
- API: `GET /api/reports/my-work-days` y `GET /api/reports/my-work-days/:date` (scope del mesero).
- Sigue abriendo mesas y tomando pedidos en las suyas.

### LAN (misma red / hotspot)
- `npm run start:lan` / `INICIAR-TURNON.bat`
- Arranque estable (proceso Node desacoplado, no se cae al cerrar la terminal).
- Docs: `docs/LAN-MESEROS.md`

### Internet en el celular (sin VPS)
- **Cloudflare Quick Tunnel**: `npm run start:tunnel` / `INICIAR-TUNNEL.bat`
- Link `https://….trycloudflare.com` para datos móviles.
- Arranque estable del túnel (`--logfile`, sin deadlock de buffer).
- URL guardada en `tunnel-url.txt` (local, no se sube a Git).
- Docs: `docs/TUNNEL-CLOUDFLARE.md`
- **Nota:** si el portátil no tiene internet, el túnel cae; se puede seguir en LAN/hotspot.

### Coolify / VPS
- Plan documentado y en pausa: `docs/DEPLOY-COOLIFY.md` (costos COP orientativos).

---

## Arranque rápido

```bash
# 1) Servidor local (PC enchufado, Postgres activo)
npm run start:lan
# → http://localhost:3001

# 2) Opcional: celulares con datos (PC con internet)
npm run start:tunnel
# → copiar la URL https://….trycloudflare.com
```

**Logins seed:** `admin` / `7482` · `ivan` o `maria` / `3197`  
(Cambiar PIN en un día real si el túnel está público.)

**Detener:** `npm run dev:stop` · túnel: cerrar `cloudflared` o `Stop-Process -Name cloudflared`

---

## Desde v1.2.0 (resumen de commits)

| Commit | Cambio |
|--------|--------|
| `7a5fcce` | Mesas por mesero, historial mesero, scripts LAN/túnel, docs |
| `6c755a7` | Fix estabilidad LAN + túnel Cloudflare |

Más el baseline v1.2.0: stock idempotente, caja, reportes, ticket, pickup, etc.

---

## Requisitos

- Node 18+
- PostgreSQL 18 (o compatible)
- Windows: scripts `.bat` / PowerShell
- Túnel: `cloudflared` (`winget install --id Cloudflare.cloudflared`)
