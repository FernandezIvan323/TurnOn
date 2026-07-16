# TurnOn por internet (Cloudflare Tunnel) — sin VPS

**Estado:** listo para usar (Quick Tunnel).  
**Costo del túnel:** $0 (Cloudflare free).  
**Requisito:** el **portátil** tiene internet (datos, hotspot, etc.) **y** TurnOn + Postgres corriendo en él.

---

## ¿Cómo funciona?

```
Celulares (4G) ──HTTPS──► Cloudflare ──túnel──► Portátil
                                              └── TurnOn :3001 + Postgres
```

- Meseros y admin abren un link `https://….trycloudflare.com` en el **navegador**.
- **No** hace falta la misma Wi‑Fi entre ellos.
- Los datos del negocio siguen en el **portátil** (Postgres local).

---

## Pregunta importante: ¿y si el portátil no tiene internet?

| Situación | ¿Meseros? | ¿Admin en otro celular? |
|-----------|-----------|-------------------------|
| Portátil **con** internet + túnel activo | Sí, con **datos móviles** vía URL `https://…` | Sí, misma URL |
| Portátil **sin** internet (túnel caído) | **Solo si** están en la **misma red local** (hotspot del papá / MiFi / Wi‑Fi del puesto) con `http://IP-DEL-PC:3001` | Igual: **misma red local** |
| Portátil sin internet **y** celulares solo en 4G (sin Wi‑Fi del puesto) | **No** — no hay camino hasta el PC | **No** |

En resumen:

1. **Túnel** = el portátil **necesita internet**. Sin internet del PC, no hay link público.
2. **LAN / hotspot** = el portátil **no** necesita internet de la calle; solo que PC y celulares compartan la misma Wi‑Fi local.
3. Podés combinar: si cae el túnel, pasás al modo hotspot y seguís el domingo.

Admin en **otro celular** (no en el portátil): sí, siempre que use la **URL del túnel** (con internet en el PC) o la **IP LAN** (misma red local).

---

## Arranque el día del puesto

### 1. Portátil listo

- [ ] Cargador conectado  
- [ ] Ventilado / sombra (no al sol)  
- [ ] Windows: con enchufe → **no suspender** (Opciones de energía)  
- [ ] PostgreSQL corriendo  
- [ ] Internet en el portátil (hotspot Movistar, SIM, etc.)

### 2. TurnOn

```bat
INICIAR-TURNON.bat
```

o:

```bash
npm run start:lan
```

Probar en el PC: http://localhost:3001

### 3. Túnel

```bat
INICIAR-TUNNEL.bat
```

o:

```bash
npm run start:tunnel
```

La primera vez hace falta **cloudflared**:

```powershell
winget install --id Cloudflare.cloudflared
```

Cerrar y reabrir la terminal, luego otra vez `npm run start:tunnel`.

### 4. Compartir la URL

En la ventana del túnel aparece algo como:

`https://random-words-xxxx.trycloudflare.com`

Esa URL va a WhatsApp de los meseros / admin.

**Nota:** cada vez que reiniciás el Quick Tunnel, la URL **cambia**. Hay que reenviar el link.

### 5. Al cerrar el puesto

1. `Ctrl+C` en la ventana del túnel (o cerrarla).  
2. Opcional: `npm run dev:stop` para apagar TurnOn.  
3. No hace falta dejar el túnel abierto de noche.

---

## Fallback sin internet en el PC (LAN)

1. Hotspot del celular del papá (o MiFi).  
2. PC y todos los celulares en esa Wi‑Fi.  
3. TurnOn ya en `start:lan`.  
4. URL: la IP que imprime el script, ej. `http://192.168.1.56:3001`.

Distancia corta (~5–15 m). Ver también `docs/LAN-MESEROS.md`.

---

## Seguridad

Mientras el túnel está activo, **cualquiera con el link** puede intentar entrar.

- Cambiá los PIN de prueba en un día real.  
- Cerrá el túnel al terminar.  
- No subas `server/.env` a Git.

---

## Túnel con URL fija (opcional, después)

Si molesta que la URL cambie: cuenta Cloudflare + túnel con nombre + subdominio.  
Quick Tunnel alcanza para el puesto y las pruebas.

---

## Checklist de verificación

1. PC: http://localhost:3001 → login admin.  
2. Túnel arriba → copiar HTTPS.  
3. Celular con **datos** (sin Wi‑Fi del PC) → login mesero → mesa → pedido.  
4. Otro celular (admin) con la misma HTTPS → mesas en vivo.  
5. Apagar túnel → celulares en 4G dejan de ver; en LAN/hotspot siguen si están en la misma red.
