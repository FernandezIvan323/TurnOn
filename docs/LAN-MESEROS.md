# TurnOn en el local (LAN): PC + celulares de meseros

El **PC del restaurant se enciende y levanta el servidor**. Los meseros entran por la **misma Wi‑Fi** con el navegador del celular. No hace falta internet ni la nube.

## Roles

| Dispositivo | Quién | Login (seed) | Qué hace |
|-------------|--------|--------------|----------|
| PC / portátil | Cajero / dueño | `admin` / `7482` | Caja, domicilios, corte, reportes, personal |
| Celular | Mesero | `ivan` o `maria` / `3197` | Sus mesas, pedidos, menú |

## Arranque manual

En el PC (carpeta del proyecto):

```bash
npm run start:lan
```

Eso:

1. Compila el frontend si no hay `dist/`
2. Arranca API + UI en el puerto **3001** (escucha en toda la red)
3. Muestra la URL para meseros, por ejemplo: `http://192.168.1.56:3001`

**Cajero:** `http://localhost:3001`  
**Meseros:** la URL LAN que imprime el script (mismo Wi‑Fi)

Detener:

```bash
npm run dev:stop
```

## Arranque al encender el PC

Una sola vez:

```bash
npm run startup:install
```

Copia un acceso a la carpeta **Inicio** de Windows. Al iniciar sesión, se ejecuta `INICIAR-TURNON.bat`.

También podés copiar a mano `INICIAR-TURNON.bat` a:

`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`

**Importante:** PostgreSQL debe estar configurado para iniciar con Windows (servicio).

## Firewall de Windows

Si el celular no conecta, permitir el puerto **3001** entrante (TCP) en la red privada:

```powershell
New-NetFirewallRule -DisplayName "TurnOn LAN" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow -Profile Private
```

## Checklist del domingo

1. Encender el PC (y que Postgres + TurnOn arranquen)
2. Confirmar en el PC: `http://localhost:3001` y login admin
3. Anotar la IP que salió en la consola / `start:lan`
4. Meseros: Wi‑Fi del local → esa URL → su usuario y PIN
5. Admin: Personal → Asignaciones (mesas a cada mesero)
6. Al cierre: solo admin hace corte de caja en el PC

## Notas

- La UI y la API van **en el mismo origen** (`http://IP:3001`), así no hay problemas de CORS en el celular.
- No uses `npm run dev` en producción del local; usa `start:lan`.
- Si cambia la IP del PC (DHCP), los meseros tendrán otra URL. Opcional: IP fija en el router.
