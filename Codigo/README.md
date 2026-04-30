# Arcane Assembly

Arcane Assembly es un roguelite de estrategia donde el jugador construye un tablero hexagonal de piezas arcanas antes de cada combate. La resolución del enfrentamiento es automática, así que el valor del juego está en la planeación, las sinergias y la administración de recursos entre nodos de mapa, draft, eventos y tienda.

Dentro de este repositorio, la versión de código vigente está organizada bajo `Codigo/`. El juego cliente vive en `Codigo/Videojuego/ArcaneAsemmbly/`, el backend en `Codigo/Videojuego/ArcaneAsemmbly/server/` y la base de datos en `Codigo/BaseDeDatos/db/`.

## Estado actual del proyecto

- El frontend jugable está implementado con HTML, CSS y JavaScript vanilla.
- El juego incluye flujo de título, login/registro, mapa por nodos, deck builder, combate automático, draft, eventos, tienda, pausa, tutorial y pantalla de fin de run.
- El backend expone una API REST en Express para autenticación, runs, estadísticas de jugador y panel administrativo.
- La base de datos está modelada en MySQL y el esquema vigente del proyecto está en `Codigo/BaseDeDatos/db/schemaV2.sql`.

## Requisitos

| Herramienta | Versión recomendada |
|-------------|---------------------|
| Node.js     | 18 o superior       |
| npm         | 9 o superior        |
| MySQL       | 8 o superior        |

## Estructura relevante

```text
Codigo/
├── README.md
├── BaseDeDatos/
│   └── db/
│       ├── schemaV2.sql
│       ├── seedV2.sql
│       └── consultas.sql
└── Videojuego/
    └── ArcaneAsemmbly/
        ├── index.html
        ├── style.css
        ├── js/
        │   ├── api.js
        │   ├── board.js
        │   ├── combat.js
        │   ├── constants.js
        │   ├── fx.js
        │   ├── game.js
        │   ├── sprites.js
        │   ├── tutorial.js
        │   ├── ui.js
        │   └── utils.js
        ├── assets/
        │   └── sprites/
        └── server/
            ├── server.js
            ├── package.json
            ├── package-lock.json
            ├── .env.example
            ├── db/connection.js
            ├── middleware/auth.js
            └── routes/
                ├── admin.js
                ├── auth.js
                ├── jugador.js
                └── runs.js
```

## Instalación del backend

1. Entra a la carpeta del servidor:

```bash
cd Codigo/Videojuego/ArcaneAsemmbly/server
```

2. Instala dependencias:

```bash
npm install
```

3. Crea la base de datos y carga el esquema vigente:

```bash
mysql -u tu_usuario -p < ../../../BaseDeDatos/db/schemaV2.sql
mysql -u tu_usuario -p arcane_assembly < ../../../BaseDeDatos/db/seedV2.sql
```

4. Crea tu archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Contenido base de `server/.env.example`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_aqui
DB_NAME=arcane_assembly
PORT=3000
JWT_SECRET=cambiar_por_cadena_aleatoria_larga
```

5. Inicia el servidor:

```bash
npm run dev
```

## Ejecución del juego

### Opción recomendada

Con el servidor levantado, abre en tu navegador:

`http://localhost:3000`

Esto sirve el frontend y el backend desde el mismo origen, que es el flujo correcto para que funcionen las rutas `/api/...`

### Ubicación del frontend

El cliente del juego está en:

`Codigo/Videojuego/ArcaneAsemmbly/index.html`

El servidor Express ya está configurado para servir los archivos estáticos desde la raíz de `ArcaneAsemmbly/`, por lo que no hace falta mover el frontend a una carpeta `public/`

## Flujo de juego actual

1. Pantalla de título
2. Inicio de sesión o registro opcional para persistencia
3. Inicio de run
4. Generación del mapa de la zona
5. Selección de nodo
6. Armado de mazo de 5 piezas antes del combate
7. Colocación de piezas en tablero hexagonal
8. Resolución automática del combate por rondas
9. Draft de recompensa al ganar
10. Repetición del ciclo hasta jefe de zona o derrota

La partida completa está organizada para avanzar por 3 zonas

## Mecánicas principales implementadas

- Tablero hexagonal de 5x5 para jugador y enemigo.
- 4 categorías de piezas:
  - `generator`
  - `transformer`
  - `catalyst`
  - `anchor`
- Construcción de mazo previo al combate
- Sinergias por adyacencia
- Impulso para obtener una pieza extra en la ronda
- Eventos con decisiones de riesgo/recompensa
- Tienda limitada por run
- Sistema de Fractura como progresión de dificultad durante la run
- Guardado local de progreso con `localStorage`
- Tutorial interactivo para primer uso

## API disponible

Las rutas principales del backend están organizadas así:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/runs`
- `POST /api/runs`
- `PATCH /api/runs/:id`
- rutas de nodos, combates, inventario y eventos dentro de `routes/runs.js`
- rutas de jugador autenticado en `routes/jugador.js`
- rutas administrativas y estadísticas en `routes/admin.js`

## Tecnologías usadas

- Frontend: HTML5, CSS, JavaScript vanilla, Canvas 2D
- Backend: Node.js, Express, JWT, bcrypt
- Base de datos: MySQL 8
- Persistencia local adicional: `localStorage`

## Equipo

- Josué Gómez
- Nicolás Matamoros
- Luis Felipe Loera
