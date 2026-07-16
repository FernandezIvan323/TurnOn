# Despliegue web (Render)

Todo en el navegador: meseros y cajero abren un `https://…` sin instalar nada.  
App + Postgres viven en el servicio (no en el portátil).

## Render (recomendado para empezar)

1. Cuenta en [render.com](https://render.com) (GitHub).
2. **New → Blueprint** → repo `FernandezIvan323/TurnOn` (o el tuyo).
3. Usa el `render.yaml` del repo (web + Postgres free).
4. Deploy. La URL queda tipo `https://turnon-xxxx.onrender.com`.
5. Abrí en el celular (datos o Wi‑Fi) → login.

### Variables (las pone el blueprint)

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | del Postgres de Render |
| `JWT_SECRET` | generado |
| `LAN_MODE` | `0` |
| `TRUST_PROXY` | `1` |
| `DB_TZ` | `America/Bogota` (o tu zona) |

### Logins seed (primera vez)

| Usuario | PIN |
|---------|-----|
| admin | 7482 |
| ivan / maria | 3197 |

Cambiá los PIN en un día real.

### Notas free tier

- El plan free de Render **puede dormir** el servicio tras inactividad (~15 min). El primer acceso tarda 30–60 s en “despertar”.
- Para el puesto sin dormirse: plan de pago mínimo o Railway/Fly con always-on.
- Free Postgres en Render a veces tiene límites; si el blueprint falla al crear DB, creá un Postgres free a mano y enlazá `DATABASE_URL`.

## Alternativas

| Servicio | Notas |
|----------|--------|
| **Railway** | Muy simple; tarifa de uso; Postgres + web |
| **Fly.io** | Docker; buen rendimiento |
| **Vercel** | No ideal para este Express+Postgres monólito |

## Local vs nube

- Nube: una sola URL HTTPS; cada quien con sus datos móviles.
- El PC del puesto **no** tiene que estar encendido.
