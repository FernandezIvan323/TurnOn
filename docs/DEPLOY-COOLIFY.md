# TurnOn en la nube (Coolify) — plan guardado

**Estado:** en pausa (alternativa sin VPS ya lista).  
**Decisión pendiente:** consultar con la familia (papás) si conviene el gasto del VPS.  
**Última actualización:** 2026-07-16  

**Mientras tanto (recomendado para el puesto):** Cloudflare Tunnel sin costo de servidor → ver **`docs/TUNNEL-CLOUDFLARE.md`**.

---

## Para qué sirve (en simple)

Hoy el sistema va por **Wi‑Fi del local (LAN)**. Si el PC se apaga o no hay red del local, los celulares de los meseros no ven los datos.

En la nube (Coolify + VPS):

- URL fija con HTTPS (ej. `https://turnon.tudominio.com`)
- Meseros y cajero entran desde **cualquier red** (datos móviles, otra Wi‑Fi)
- El PC del restaurant **no** tiene que estar encendido
- Sigue siendo **un solo restaurant**: cada quien entra con su usuario (admin / mesero) y ve lo suyo

**Coolify** es un panel gratis (open source) que se instala en un VPS y facilita desplegar la app + PostgreSQL + certificados SSL. El software de Coolify no se paga; se paga el **servidor (VPS)**.

---

## ¿Es buena opción?

**Sí**, para este proyecto (Node + Postgres + UI en el mismo servidor).  
No hace falta multi-tenant ni app nativa para el primer paso.

**No se hace Coolify todavía** hasta decidir presupuesto en pesos.

---

## Costo del VPS en pesos colombianos (COP)

Referencia de cambio (julio 2026): **≈ $3.200 – $3.300 COP por 1 USD**.  
Usamos **~$3.250 COP/USD** para redondear. Los precios de VPS son orientativos y cambian; al contratar, mirar el precio en la web del proveedor.

### Rango típico de VPS (lo que alcanza para TurnOn)

| Tamaño | USD / mes (aprox.) | COP / mes (aprox.) | COP / año (aprox.) | Para qué |
|--------|--------------------|--------------------|--------------------|----------|
| Básico (1–2 GB RAM) | **$4 – $6** | **$13.000 – $19.500** | **$156.000 – $234.000** | Un restaurant, Coolify + app + Postgres |
| Cómodo (2–4 GB RAM) | **$8 – $12** | **$26.000 – $39.000** | **$312.000 – $468.000** | Más holgado, backups y picos |
| Más grande | $20+ | $65.000+ | — | No hace falta al inicio |

### Ejemplos redondeados para hablar en casa

| Concepto | COP aprox. |
|----------|------------|
| **Opción económica** | **$15.000 – $20.000 / mes** |
| **Opción recomendada** | **$25.000 – $40.000 / mes** |
| Dominio `.com` o `.co` (opcional, 1 año) | **$40.000 – $80.000 / año** (varía mucho) |
| Coolify (software) | **$0** |

**Nota:** algunos proveedores (Hetzner, Contabo, DigitalOcean, Oracle Free Tier, etc.) facturan en dólares o euros; el banco o la tarjeta pueden sumar comisión de compra en moneda extranjera (~1–3 % o más). Contar un **margen** encima del número de la tabla.

### Comparación mental (un domingo al mes)

Si el local abre **un domingo al mes**, un VPS de **~$20.000 – $30.000 COP/mes** es el “arriendo” de tener meseros con datos en el celular **todo el mes**, sin depender del PC en LAN.  
Si prefieren **$0 de internet server**, se sigue con LAN como ahora.

---

## Qué se necesitaría cuando digan que sí

1. Contratar un **VPS Linux** (2 GB RAM recomendado).
2. Instalar **Coolify** en ese VPS.
3. Crear **PostgreSQL** en Coolify.
4. Desplegar TurnOn (Dockerfile / Git) con variables de entorno de producción.
5. Dominio o subdominio + HTTPS.
6. Cambiar PINs por defecto y secretos.
7. Backup de la base de datos.
8. Probar en celular con **datos móviles**.

Detalle técnico (cuando se retome):

- `Dockerfile` + `.dockerignore`
- `LAN_MODE=0`, `JWT_SECRET` fuerte, `DB_*` al Postgres de Coolify
- `trust proxy` si hace falta detrás del reverse proxy
- Documentación de env y checklist del domingo

**Fuera de alcance por ahora:** multi-tenant (varios restaurants), app de tienda, offline total sin internet.

---

## Checklist de decisión familiar

- [ ] ¿Vale la pena **~$15.000 – $40.000 COP/mes** para no depender del PC/LAN?
- [ ] ¿Los meseros suelen tener **datos móviles** en el local?
- [ ] ¿Quién paga la tarjeta / VPS y quién hace el deploy si algo se cae?
- [ ] Si la respuesta es no → seguir solo con **LAN** (como ahora).

---

## Arquitectura (cuando se active)

```
Celulares / laptop ──HTTPS──► VPS (Coolify)
                              ├── App TurnOn (Node: UI + API)
                              └── PostgreSQL
```

Una sola base de datos del restaurant. Cada usuario (admin, ivan, maria) con su login y permisos.

---

## Verificación post-deploy (futuro)

1. Abrir la URL en PC y en celular con **datos móviles**.
2. Login admin + mesero en paralelo; mesa → pedido → cobrar.
3. Apagar el PC del local y confirmar que la nube sigue.
4. Probar un backup / restore al menos una vez.

---

## Relación con el uso actual

- **Ahora:** LAN en el PC (`npm run start:lan` / `INICIAR-TURNON.bat`) — sin costo de VPS.
- **Después (si aprueban):** nube con Coolify; idealmente **una sola fuente de verdad** (la nube), no dos bases distintas.
