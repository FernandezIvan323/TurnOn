# TurnOn / AppTurnos v1.3.0

**Tag:** `v1.3.0`

## Cambios funcionales

### Mesas (admin / cajero)
- Mesa libre: solo información (nombre, capacidad, estado, mesero). Sin menú ni abrir cuenta.
- Mesa ocupada: cuenta en solo lectura; Cobrar / Deuda si lista para cobrar.
- Tablero agrupado por mesero + sección sin asignar.
- Cada card muestra el mesero asignado.
- API: admin no puede crear pedidos de mesa.

### Mesero
- Mi historial de días trabajados (sidebar).
- API: `GET /api/reports/my-work-days` y `GET /api/reports/my-work-days/:date`.

### Estabilidad UI
- Banner de conexión sin parpadeo (reintento antes de avisar; 2 fallos seguidos).
- Mensaje de desconexión sin fijarse al puerto 3001.

Incluye el baseline v1.2.0 (stock, caja, reportes, ticket, pickup, etc.).
