# AppTurnos 🍔

> Sistema de gestión integral para restaurant con acera, mesas y pedidos a domicilio.

AppTurnos está diseñado para resolver el caos de los pedidos a domicilio de un restaurant de acera: registro de llamadas, asignación de repartidores, seguimiento de pedidos en tiempo real, control de mesas, caja, catálogo de productos y reportes de ventas.

---

## ✨ Funcionalidades principales

### 🔐 Autenticación
- Login con **usuario + PIN de 4 dígitos** (rápido para meseros).
- Roles: **admin (cajero)** y **waiter (mesero)**.
- Tokens JWT con expiración de 12 horas.

### 📊 Resumen (Dashboard)
- Ventas del día con **comparativa % vs ayer**.
- Ticket promedio.
- 5 KPIs en tiempo real (auto-refresca cada 30s):
  - **Sin asignar** (domicilios esperando repartidor)
  - **En preparación** (cocinándose)
  - **En camino** (repartidor en la calle)
  - **Mesas activas** (con clientes en la acera)
  - **Por cobrar** (cuentas listas)

### 🛵 Pedidos a domicilio (módulo crítico)
- **Tablero Kanban** con 4 columnas: Pendientes → En preparación → En camino → Entregados.
- **Búsqueda predictiva de clientes** por nombre o teléfono con dropdown de sugerencias.
- Asignación de repartidor con control automático de disponibilidad (no se asigna si está ocupado).
- Cierre/cobro con 2 opciones:
  - **Cobrar al entregar** (efectivo contra entrega).
  - **Pre-cobrar transferencia** (marca pagado pero el pedido sigue en camino).
- Cancelación con motivo obligatorio.
- Notas de entrega especiales ("tocar timbre 2 veces", etc.).

### 🪑 Mesas
- Tablero visual de mesas en tiempo real (verde = libre, rosa = ocupada, ámbar = lista para cobrar).
- Cada mesa ocupada muestra: total actual, cantidad de productos, tiempo transcurrido desde apertura.
- Apertura de cuenta al agregar el primer producto.
- Botón directo "Ir a cobrar" cuando la cuenta está lista.

### 💰 Caja / Cobro
- Vista de pedidos pendientes de cobro con resumen: mesas pendientes, domicilios pendientes, total a cobrar.
- Filtros por tipo (Todos / Solo mesas / Solo domicilios).
- Métodos de pago: efectivo, tarjeta, transferencia, mixto.
- Ordenado por antigüedad (más antiguas primero).

### 👥 Clientes
- Búsqueda por nombre o teléfono.
- Historial completo de pedidos por cliente.
- Edición rápida de datos de contacto y dirección.

### 📋 Menú (catálogo)
- CRUD completo de **categorías** y **productos**.
- Marcar productos como no disponibles.
- Vista agrupada por categoría.

### 👨‍🍳 Personal y mesas (gestión)
- CRUD de **repartidores** (nombre, teléfono, estado).
- CRUD de **mesas** (número, etiqueta, capacidad, activa).

### 📈 Reportes
- **Sección A — Resumen de ventas:** ventas del período, comparativa vs período anterior, ticket promedio, ganancias de domicilios, gráfico de ventas por día.
- **Sección B — Top 10 productos:** por cantidad o por ganancia, con categoría y número de pedidos.
- **Sección C — Métricas adicionales:**
  - **Horarios pico** (gráfico de 24 horas).
  - **Clientes más frecuentes** (top 10 por gasto).
  - **Productos nunca vendidos** (candidatos a retirar del menú).
  - **Comparativa** con período anterior.
  - **Ventas por categoría**.
  - **Domicilios por repartidor** (cantidad de entregas y ganancia generada).
- Selector de rango: Hoy / Semana / Mes / Año / Personalizado.

### 🎨 UI/UX
- **Modo claro / oscuro** con toggle en el Header (persiste en localStorage, detecta preferencia del SO).
- Paleta de colores suave (slate + emerald).
- Diseño responsive optimizado para laptop y celular.
- Componentes con Tailwind CSS, sin librerías de UI pesadas.
- Iconografía con `lucide-react`.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| **Frontend** | React | 19 |
| **Build tool** | Vite | 6 |
| **Estilos** | Tailwind CSS | 3 |
| **Router** | React Router | 7 |
| **Estado** | Zustand | 5 |
| **HTTP** | Axios | 1.17 |
| **Iconos** | lucide-react | 0.460 |
| **Backend** | Node.js + Express | 4.21 |
| **Base de datos** | PostgreSQL | 18+ |
| **ORM/Query** | `pg` (node-postgres) con queries SQL nativas | 8.13 |
| **Auth** | jsonwebtoken + bcryptjs | — |

---

## 📁 Estructura del proyecto

```
AppTurnos/
├── server/                          # API Node + Express + PostgreSQL
│   ├── .env.example                 # Plantilla de variables de entorno
│   ├── db.js                        # Conexión PG + auto-creación de BD + seed
│   ├── schema.sql                   # 8 tablas + índices
│   ├── index.js                     # Arranque del servidor
│   ├── middleware/
│   │   └── auth.js                  # JWT + role guard
│   └── routes/
│       ├── auth.js                  # /login /me /users
│       ├── categories.js
│       ├── products.js
│       ├── tables.js
│       ├── customers.js
│       ├── delivery.js
│       ├── orders.js                # Lógica más importante
│       ├── dashboard.js
│       └── reports.js               # 7 endpoints de reportes
│
├── src/                             # Frontend React
│   ├── App.jsx                      # Router principal
│   ├── main.jsx                     # Entry point
│   ├── index.css                    # Tailwind + componentes + dark mode
│   ├── lib/
│   │   ├── api.js                   # Axios + interceptors JWT
│   │   └── format.js                # Helpers (money, formatTime, etc.)
│   ├── store/                       # Zustand stores
│   │   ├── auth.js
│   │   ├── theme.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── resources.js
│   ├── components/
│   │   ├── Layout.jsx               # Layout principal
│   │   ├── Sidebar.jsx              # Menú lateral con dark mode
│   │   ├── Header.jsx               # Header de página + theme toggle
│   │   ├── ThemeToggle.jsx          # Botón ☀/🌙
│   │   └── BarChart.jsx             # Gráfico de barras sin dependencias
│   └── pages/
│       ├── Login.jsx
│       ├── Dashboard.jsx
│       ├── orders/
│       │   └── Delivery.jsx         # Kanban + creación de pedidos
│       ├── tables/
│       │   └── TablesPage.jsx       # Tablero de mesas
│       ├── cashier/
│       │   └── Cashier.jsx          # Cierre de pedidos
│       ├── customers/
│       │   └── Customers.jsx        # Búsqueda + historial
│       └── admin/
│           ├── Menu.jsx             # CRUD productos
│           ├── Staff.jsx            # CRUD repartidores/mesas
│           └── Reports.jsx          # 3 secciones de reportes
│
├── .gitignore                       # Ignora node_modules, .env, logs
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js                   # Vite + proxy a /api
└── README.md
```

---

## 🗄️ Modelo de base de datos

8 tablas con sus relaciones:

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema (admin/mesero) con username + PIN hasheado |
| `categories` | Categorías del menú (Bebidas, Platos fuertes, etc.) |
| `products` | Productos del menú con precio, categoría, disponibilidad |
| `tables` | Mesas del restaurant (número, etiqueta, capacidad) |
| `customers` | Clientes de domicilio con teléfono único, dirección, notas |
| `delivery_persons` | Repartidores (nombre, teléfono, estado) |
| `orders` | Pedidos: type (table/delivery/pickup), status, payment_status, total |
| `order_items` | Items de cada pedido con snapshot de nombre y precio |

### Estados de pedido (`orders.status`)
- `pending` → recién creado, sin asignar (solo domicilios)
- `preparing` → en preparación
- `on_the_way` → repartidor asignado y salió
- `delivered` → entregado (ciclo cerrado)
- `ready_to_pay` → lista para cobrar (mesas)
- `paid` → cobrada
- `cancelled` → cancelada (con motivo)

### Estados de pago (`orders.payment_status`)
- `pending` → sin pagar
- `paid` → pagado (con método)

### Estados de repartidor (`delivery_persons.status`)
- `available` → disponible
- `busy` → en un domicilio
- `offduty` → fuera de turno

---

## 🚀 Instalación y ejecución

### Prerrequisitos
- **Node.js** 18+ y **npm**
- **PostgreSQL** 14+ corriendo localmente

### 1. Clonar el repositorio
```bash
git clone https://github.com/FernandezIvan323/AppTurnos.git
cd AppTurnos
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear `server/.env` a partir del ejemplo:
```bash
cp server/.env.example server/.env
```

Editar `server/.env` con tus credenciales de PostgreSQL:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD
DB_NAME=appturnos
PORT=3001
JWT_SECRET=cambia-esto-en-produccion
```

### 4. Ejecutar (frontend + backend en paralelo)
```bash
npm run dev
```

Esto levanta:
- **Frontend** (Vite) en `http://localhost:5180`
- **Backend** (Express) en `http://localhost:3001`

> Si quieres cambiar el puerto del frontend, edita `vite.config.js` (variable `port`).

### 5. Primer arranque
- La base de datos `appturnos` se crea automáticamente si no existe.
- Las migraciones (8 tablas) se aplican al arrancar.
- El seed inserta 5 categorías, 14 productos, 9 mesas, 3 repartidores y 3 usuarios de prueba.

### 6. Acceder
Abre `http://localhost:5180` y loguéate con:
| Usuario | PIN | Rol |
|---------|-----|-----|
| `admin` | `1234` | Cajero / Administrador |
| `ivan`  | `0000` | Mesero |
| `maria` | `0000` | Mesera |

---

## 📱 Acceso desde celular (red local del restaurant)

1. En la laptop del restaurant, ejecuta `npm run dev`.
2. Averigua la IP de la laptop en la red local (ej. `192.168.0.105`).
3. Desde el celular, conectado al mismo WiFi, abre `http://192.168.0.105:5180`.
4. Vite ya está configurado con `host: true` para aceptar conexiones externas.

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` → `{ username, pin }` → `{ token, user }`
- `GET  /api/auth/me` → usuario actual
- `GET  /api/auth/users` (admin) → lista de usuarios
- `POST /api/auth/users` (admin) → crear usuario

### Catálogo
- `GET/POST/PUT/DELETE /api/categories`
- `GET/POST/PUT/DELETE /api/products`

### Mesas
- `GET    /api/tables` → lista con info de orden activa
- `POST   /api/tables` (admin)
- `PUT    /api/tables/:id` (admin)
- `DELETE /api/tables/:id` (admin)

### Clientes
- `GET    /api/customers?q=` → búsqueda por nombre o teléfono
- `GET    /api/customers/:id` → cliente + historial
- `POST   /api/customers`
- `PUT    /api/customers/:id`

### Repartidores
- `GET/POST/PUT/DELETE /api/delivery`

### Pedidos
- `GET    /api/orders?type=&status=&payment=&from=&to=` → filtros
- `GET    /api/orders/:id` → pedido + items
- `POST   /api/orders` → crear pedido
- `POST   /api/orders/:id/items` → agregar item
- `DELETE /api/orders/:id/items/:itemId` → quitar item
- `POST   /api/orders/:id/assign-delivery` (admin) → asignar repartidor
- `POST   /api/orders/:id/status` (admin) → cambiar estado
- `POST   /api/orders/:id/close` (admin) → cerrar y cobrar
- `POST   /api/orders/:id/prepay` (admin) → pre-cobrar transferencia

### Dashboard
- `GET /api/dashboard/summary` → ventas hoy + KPIs operación

### Reportes (todos requieren rol admin)
- `GET /api/reports/sales?from=&to=` → ventas con comparativa
- `GET /api/reports/top-products?from=&to=&by=qty|revenue&limit=`
- `GET /api/reports/by-category?from=&to=`
- `GET /api/reports/peak-hours?from=&to=`
- `GET /api/reports/top-customers?from=&to=&limit=`
- `GET /api/reports/never-sold`
- `GET /api/reports/delivery-by-person?from=&to=`

---

## 🧰 Scripts disponibles

```bash
npm run dev      # Levanta frontend (Vite) + backend (Node --watch) en paralelo
npm run dev:web  # Solo frontend
npm run dev:api  # Solo backend
npm run build    # Compila el frontend para producción (carpeta dist/)
npm run preview  # Sirve la build de producción
```

---

## 🔒 Notas de seguridad

- El archivo `server/.env` contiene contraseñas y **NUNCA debe subirse a git** (ya está en `.gitignore`).
- En producción, **cambiar `JWT_SECRET`** por un valor aleatorio largo.
- **Cambiar las contraseñas del seed** (`admin/1234`, `ivan/0000`, `maria/0000`) antes de exponer el sistema.
- El sistema no implementa HTTPS — usar un proxy reverso (nginx, Caddy) en producción.

---

## 📋 Próximas mejoras

- [ ] Imprimir ticket térmico al cobrar (vía `escpos` o similar).
- [ ] Notificación sonora cuando entra un pedido nuevo.
- [ ] WhatsApp automático al cliente con resumen del pedido.
- [ ] App PWA para que se instale en el celular del restaurant.
- [ ] Multi-sucursal.
- [ ] Respaldo automático de la BD.
- [ ] Historial de auditoría (quién canceló qué pedido y por qué).

---

## 📄 Licencia

Proyecto privado desarrollado para un restaurant familiar.

---

**Hecho con ❤️ para que tu papá nunca más pierda un pedido.**
