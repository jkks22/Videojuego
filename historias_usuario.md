# Historias de Usuario — Arcane Assembly
**TC2005B Equipo 4**

---

### HU-01 — Experiencia de juego inmersiva con feedback visual claro

| | |
|---|---|
| **ID** | HU-01 |
| **Titulo** | Experiencia de juego inmersiva con feedback visual claro |

**Descripcion:**

> Como **jugador**,
> quiero **que el tablero hexagonal responda visualmente a cada accion que realizo con brillo, conexiones entre piezas y efectos de particulas**,
> para **entender las sinergias de mis piezas sin necesidad de leer instrucciones**.

| Criterio de validacion | | |
|---|---|---|
| • Al seleccionar una pieza, las celdas validas del tablero se iluminan con un resplandor<br>• Las piezas adyacentes compatibles muestran conexiones luminosas de color entre ellas<br>• Al activarse una sinergia CAT+GEN+TRANS, se dispara un efecto de particulas visible<br>• El log de combate muestra el detalle de cada fase de la resolucion (GEN, TRANS, CAT, ANCH)<br>• El juego mantiene al menos 30 FPS con el tablero lleno y los efectos activos | **Valor:** 150 | **Prioridad:** 1 |
| | **Estimacion:** 6h | |

### HU-02 — Efectos de sonido que confirman las acciones del jugador

| | |
|---|---|
| **ID** | HU-02 |
| **Titulo** | Efectos de sonido que confirman las acciones del jugador |

**Descripcion:**

> Como **jugador**,
> quiero **escuchar efectos de sonido distintos para cada accion importante del juego**,
> para **recibir confirmacion auditiva de mis acciones y sentir que el juego responde a lo que hago**.

| Criterio de validacion | | |
|---|---|---|
| • Se escucha un sonido al colocar una pieza en el tablero<br>• Se escucha un sonido distinto al infligir dano al enemigo<br>• Se escucha un sonido de victoria al ganar un combate<br>• Se escucha un sonido de derrota al llegar a Game Over<br>• Los sonidos no enmascaran la musica de fondo cuando suenan al mismo tiempo | **Valor:** 80 | **Prioridad:** 2 |
| | **Estimacion:** 4h | |

---

### HU-03 — Pantalla de titulo con acceso al juego y configuracion

| | |
|---|---|
| **ID** | HU-03 |
| **Titulo** | Pantalla de titulo con acceso al juego y configuracion |

**Descripcion:**

> Como **jugador**,
> quiero **ver una pantalla de titulo con opciones para iniciar una run, ajustar configuracion y salir**,
> para **tener un punto de entrada claro al juego y poder configurarlo antes de jugar**.

| Criterio de validacion | | |
|---|---|---|
| • El boton INICIAR RUN reinicia el estado global y muestra el mapa de la Zona 1<br>• El boton Opciones abre una pantalla de configuracion de volumen<br>• El boton Salir regresa al estado inicial del juego<br>• El fondo hexagonal animado refuerza la estetica visual del juego<br>• El nivel de Fractura acumulado es visible en la pantalla de titulo | **Valor:** 100 | **Prioridad:** 1 |
| | **Estimacion:** 3h | |

### HU-04 — Tutorial de mecanicas para jugadores nuevos

| | |
|---|---|
| **ID** | HU-04 |
| **Titulo** | Tutorial de mecanicas para jugadores nuevos |

**Descripcion:**

> Como **jugador nuevo**,
> quiero **recibir una guia visual de los 4 tipos de pieza y el orden de resolucion la primera vez que juego**,
> para **aprender las mecanicas del juego sin necesidad de leer documentacion externa**.

| Criterio de validacion | | |
|---|---|---|
| • El tutorial se activa automaticamente en la primera run del jugador<br>• Muestra los 4 tipos de pieza (GEN, TRANS, CAT, ANCH) con sus colores e iconos<br>• Explica el orden de resolucion GEN->TRANS->CAT->ANCH con una animacion<br>• El jugador puede saltar el tutorial en cualquier momento con un boton visible<br>• El tutorial no vuelve a aparecer en runs posteriores | **Valor:** 80 | **Prioridad:** 2 |
| | **Estimacion:** 5h | |

### HU-05 — Plataforma web con historial y estadisticas del jugador

| | |
|---|---|
| **ID** | HU-05 |
| **Titulo** | Plataforma web con historial y estadisticas del jugador |

**Descripcion:**

> Como **jugador registrado**,
> quiero **acceder a una plataforma web donde pueda ver mi historial de runs y mis estadisticas de piezas**,
> para **revisar mi progreso entre sesiones y mejorar mi estrategia con base en mis partidas anteriores**.

| Criterio de validacion | | |
|---|---|---|
| • La plataforma tiene una seccion de Historial que muestra mis runs con fecha, zona alcanzada y resultado<br>• La plataforma tiene una seccion de Estadisticas con las piezas que mas he usado<br>• La plataforma tiene una seccion de Perfil con mi nombre y correo<br>• La navegacion entre secciones no recarga la pagina completa<br>• Solo puedo ver mis propias runs, no las de otros jugadores | **Valor:** 100 | **Prioridad:** 2 |
| | **Estimacion:** 10h | |

---

### HU-06 — Registro e inicio de sesion en la plataforma web

| | |
|---|---|
| **ID** | HU-06 |
| **Titulo** | Registro e inicio de sesion en la plataforma web |

**Descripcion:**

> Como **jugador**,
> quiero **crear una cuenta e iniciar sesion en la plataforma web con mi correo y contrasena**,
> para **que mis runs y estadisticas queden guardadas y asociadas a mi perfil**.

| Criterio de validacion | | |
|---|---|---|
| • El formulario de registro valida que el correo no este registrado previamente<br>• La contrasena se almacena de forma segura (nunca en texto plano)<br>• Al iniciar sesion correctamente, accedo a mis secciones personales<br>• Si las credenciales son incorrectas, recibo un mensaje de error sin que se indique cual campo fallo<br>• Mi sesion se mantiene activa al recargar la pagina | **Valor:** 120 | **Prioridad:** 1 |
| | **Estimacion:** 6h | |

### HU-07 — Panel de administrador para monitorear jugadores activos

| | |
|---|---|
| **ID** | HU-07 |
| **Titulo** | Panel de administrador para monitorear jugadores activos |

**Descripcion:**

> Como **administrador**,
> quiero **ver una lista de todos los jugadores con filtros por actividad reciente y zona maxima alcanzada**,
> para **identificar quienes estan jugando activamente y quienes han dejado de jugar**.

| Criterio de validacion | | |
|---|---|---|
| • Solo los usuarios con rol de administrador pueden acceder al panel<br>• El panel muestra nombre, correo, total de runs y fecha de la ultima partida de cada jugador<br>• Existe un filtro para ver jugadores Activos (run en los ultimos 7 dias) e Inactivos<br>• Existe un filtro por zona maxima alcanzada (Zona 1, 2 o 3)<br>• Al hacer clic en un jugador puedo ver el detalle de todas sus runs | **Valor:** 90 | **Prioridad:** 2 |
| | **Estimacion:** 5h | |

---

### HU-08 — Base de datos con multiples tablas y relaciones definidas

| | |
|---|---|
| **ID** | HU-08 |
| **Titulo** | Base de datos con multiples tablas y relaciones definidas |

**Descripcion:**

> Como **desarrollador**,
> quiero **implementar el schema de base de datos con 8 tablas normalizadas, claves primarias, foraneas y restricciones de integridad**,
> para **garantizar que los datos del juego se almacenen de forma consistente y sin redundancia**.

| Criterio de validacion | | |
|---|---|---|
| • Las 8 tablas (JUGADOR, RUN, PIEZA, NODO, ENEMIGO, COMBATE, COLOCACION_TABLERO, EVENTO_NODO) existen en la base de datos<br>• Todas las tablas tienen clave primaria definida explicitamente<br>• Las claves foraneas tienen restricciones ON DELETE y ON UPDATE definidas<br>• El script schema.sql corre sin errores en MySQL<br>• El seed incluye las 15 piezas del catalogo de Arcane Assembly y los 3 enemigos base | **Valor:** 130 | **Prioridad:** 1 |
| | **Estimacion:** 5h | |

### HU-09 — Acceso a datos del juego protegido por autenticacion

| | |
|---|---|
| **ID** | HU-09 |
| **Titulo** | Acceso a datos del juego protegido por autenticacion |

**Descripcion:**

> Como **desarrollador**,
> quiero **que los datos de los jugadores solo sean accesibles a traves de la API con un token valido**,
> para **proteger la informacion de los usuarios y evitar accesos no autorizados**.

| Criterio de validacion | | |
|---|---|---|
| • Todos los endpoints que devuelven datos de jugadores requieren un token valido<br>• Un jugador solo puede consultar sus propias runs<br>• Las contrasenas nunca aparecen en ninguna respuesta de la API<br>• Las peticiones sin token reciben un error 401<br>• Las peticiones de jugador a rutas de administrador reciben un error 403 | **Valor:** 100 | **Prioridad:** 1 |
| | **Estimacion:** 3h | |

### HU-10 — Estadisticas globales del juego para el administrador

| | |
|---|---|
| **ID** | HU-10 |
| **Titulo** | Estadisticas globales del juego para el administrador |

**Descripcion:**

> Como **administrador**,
> quiero **consultar estadisticas globales de todos los jugadores desde un panel**,
> para **identificar que piezas estan siendo mas usadas y en que zona los jugadores tienden a perder**.

| Criterio de validacion | | |
|---|---|---|
| • El panel muestra la tasa de victoria por zona (Zona 1, 2 y 3)<br>• El panel muestra las 10 piezas mas colocadas globalmente<br>• El panel muestra la distribucion de zonas maximas alcanzadas por los jugadores<br>• El panel muestra el promedio de rondas por combate<br>• El panel carga en menos de 2 segundos | **Valor:** 80 | **Prioridad:** 2 |
| | **Estimacion:** 4h | |

### HU-11 — Escalado de dificultad entre runs (Sistema Fractura)

| | |
|---|---|
| **ID** | HU-11 |
| **Titulo** | Escalado de dificultad entre runs (Sistema Fractura) |

**Descripcion:**

> Como **jugador**,
> quiero **que cada nueva run sea mas dificil que la anterior gracias al sistema de Fractura**,
> para **sentir que el juego me reta mas conforme acumulo partidas y tengo motivacion para seguir jugando**.

| Criterio de validacion | | |
|---|---|---|
| • El nivel de Fractura aumenta al terminar cada run y se mantiene entre sesiones<br>• El HP y el numero de piezas del enemigo escalan con el nivel de Fractura acumulado<br>• El nivel de Fractura actual es visible en la pantalla de titulo<br>• Cada nueva run queda registrada en la base de datos con su nivel de Fractura asociado | **Valor:** 90 | **Prioridad:** 2 |
| | **Estimacion:** 4h | |

---

### HU-12 — Combate contra enemigos mediante resolucion automatica del tablero

| | |
|---|---|
| **ID** | HU-12 |
| **Titulo** | Combate contra enemigos mediante resolucion automatica del tablero |

**Descripcion:**

> Como **jugador**,
> quiero **colocar mis piezas en el tablero hexagonal y ver como el sistema resuelve automaticamente el combate**,
> para **experimentar el resultado de mi estrategia de construccion en cada ronda**.

| Criterio de validacion | | |
|---|---|---|
| • El motor ejecuta la cadena GEN->TRANS->CAT->ANCH en el orden correcto cada ronda<br>• El escudo generado por las Anclas bloquea el dano entrante antes de aplicarlo al HP<br>• Las animaciones del protagonista y del enemigo se reproducen en el orden correcto<br>• El log de combate muestra el resultado de cada fase con los valores de dano y escudo<br>• Al llegar a 0 HP el enemigo se activa la pantalla de victoria, y al llegar a 0 HP el jugador se activa Game Over | **Valor:** 150 | **Prioridad:** 1 |
| | **Estimacion:** 10h | |

### HU-13 — Pantalla de pausa durante el combate

| | |
|---|---|
| **ID** | HU-13 |
| **Titulo** | Pantalla de pausa durante el combate |

**Descripcion:**

> Como **jugador**,
> quiero **pausar el juego en cualquier momento durante la fase de construccion del tablero**,
> para **tomar un descanso o revisar mis piezas sin perder el estado de la partida**.

| Criterio de validacion | | |
|---|---|---|
| • La tecla ESC o un boton visible activan la pantalla de pausa<br>• La pausa detiene todos los temporizadores y animaciones activas<br>• La pantalla de pausa ofrece opciones de Continuar, Settings y Volver al Menu<br>• Al reanudar, el tablero y los HP quedan exactamente como se dejaron<br>• No es posible pausar mientras el sistema esta resolviendo una ronda | **Valor:** 60 | **Prioridad:** 2 |
| | **Estimacion:** 3h | |

### HU-14 — Configuracion de volumen de musica y efectos de sonido

| | |
|---|---|
| **ID** | HU-14 |
| **Titulo** | Configuracion de volumen de musica y efectos de sonido |

**Descripcion:**

> Como **jugador**,
> quiero **ajustar el volumen de la musica y de los efectos de sonido de forma independiente**,
> para **personalizar la experiencia de audio segun mis preferencias y mi entorno**.

| Criterio de validacion | | |
|---|---|---|
| • La pantalla de Settings es accesible desde la pantalla de titulo y desde la pausa<br>• Hay controles independientes para el volumen de musica y el volumen de efectos de sonido<br>• Los cambios de volumen se aplican en tiempo real sin necesidad de confirmar<br>• La configuracion se guarda y persiste entre sesiones del navegador | **Valor:** 60 | **Prioridad:** 2 |
| | **Estimacion:** 3h | |

---

### HU-15 — API REST para registrar y consultar runs del jugador

| | |
|---|---|
| **ID** | HU-15 |
| **Titulo** | API REST para registrar y consultar runs del jugador |

**Descripcion:**

> Como **desarrollador**,
> quiero **que el juego y la plataforma web se comuniquen con una API REST que implemente operaciones de creacion, lectura y actualizacion**,
> para **que los datos de cada partida queden persistidos y sean consultables desde la web**.

| Criterio de validacion | | |
|---|---|---|
| • POST /api/auth/register crea un nuevo jugador con contrasena segura<br>• POST /api/auth/login devuelve un token de sesion al autenticarse correctamente<br>• POST /api/runs crea un registro de run al iniciar una partida y devuelve el identificador<br>• PATCH /api/runs/:id actualiza el HP, zona y resultado de una run al terminar<br>• GET /api/runs devuelve el historial de runs del jugador autenticado | **Valor:** 120 | **Prioridad:** 1 |
| | **Estimacion:** 8h | |

### HU-16 — Consultas SQL optimizadas para estadisticas del juego

| | |
|---|---|
| **ID** | HU-16 |
| **Titulo** | Consultas SQL optimizadas para estadisticas del juego |

**Descripcion:**

> Como **desarrollador**,
> quiero **tener consultas SQL predefinidas para obtener estadisticas de piezas, victorias y zonas**,
> para **que la API pueda responder las solicitudes de estadisticas en menos de 2 segundos**.

| Criterio de validacion | | |
|---|---|---|
| • Existe una consulta para obtener el historial de runs de un jugador ordenado por fecha<br>• Existe una consulta para obtener las 10 piezas mas colocadas globalmente<br>• Existe una consulta para obtener la tasa de victoria por zona<br>• Todas las consultas responden en menos de 500ms con los datos de prueba del seed<br>• Las consultas estan documentadas en el repositorio | **Valor:** 80 | **Prioridad:** 2 |
| | **Estimacion:** 3h | |

---

### HU-17 — Jefe final con tablero unico y mecanica distinta al combate normal

| | |
|---|---|
| **ID** | HU-17 |
| **Titulo** | Jefe final con tablero unico y mecanica distinta al combate normal |

**Descripcion:**

> Como **jugador**,
> quiero **enfrentar a un jefe al final de cada zona con un tablero predefinido y una mecanica que lo haga diferente a los combates normales**,
> para **sentir que cada zona tiene un reto mayor y un cierre memorable antes de avanzar**.

| Criterio de validacion | | |
|---|---|---|
| • El tablero del jefe es fijo y predefinido, no generado aleatoriamente<br>• El jefe tiene un HP mayor al de los enemigos normales de su zona<br>• El combate contra el jefe muestra un indicador visual que lo distingue como JEFE<br>• Al derrotar al jefe de la Zona 3 se muestra una pantalla de victoria total distinta al Game Over comun | **Valor:** 130 | **Prioridad:** 1 |
| | **Estimacion:** 5h | |

### HU-18 — Tres jefes con identidad visual y estrategia unica por zona

| | |
|---|---|
| **ID** | HU-18 |
| **Titulo** | Tres jefes con identidad visual y estrategia unica por zona |

**Descripcion:**

> Como **jugador**,
> quiero **enfrentar un jefe diferente en cada una de las 3 zonas con sprite, tablero y musica propios**,
> para **que cada zona se sienta distinta y el juego no se vuelva repetitivo conforme avanzo**.

| Criterio de validacion | | |
|---|---|---|
| • El jefe de Zona 1 (Necromancer) tiene tablero orientado a control con predominio de Anclas<br>• El jefe de Zona 2 (Golem Elite) tiene tablero orientado a ataque con predominio de Transformadores<br>• El jefe de Zona 3 (Mago) tiene tablero orientado a sinergia con combinaciones CAT+GEN+TRANS<br>• Cada jefe tiene sprites de idle, ataque y muerte distintos entre si<br>• La musica cambia o se intensifica al entrar al combate contra el jefe | **Valor:** 100 | **Prioridad:** 2 |
| | **Estimacion:** 6h | |

---

### HU-19 — Servidor local para desarrollo y pruebas del equipo

| | |
|---|---|
| **ID** | HU-19 |
| **Titulo** | Servidor local para desarrollo y pruebas del equipo |

**Descripcion:**

> Como **desarrollador**,
> quiero **poder iniciar el servidor y la base de datos localmente con comandos simples**,
> para **desarrollar y probar el sistema completo sin depender de servicios de nube**.

| Criterio de validacion | | |
|---|---|---|
| • El servidor Node.js se levanta con un solo comando desde la raiz del proyecto<br>• La base de datos se inicializa con un comando que ejecuta el schema y el seed automaticamente<br>• El archivo de variables de entorno de ejemplo documenta todas las claves necesarias<br>• El juego funciona completamente en localhost sin conexion a internet | **Valor:** 100 | **Prioridad:** 1 |
| | **Estimacion:** 4h | |

### HU-20 — Despliegue del servidor en la nube para demostraciones

| | |
|---|---|
| **ID** | HU-20 |
| **Titulo** | Despliegue del servidor en la nube para demostraciones |

**Descripcion:**

> Como **desarrollador**,
> quiero **desplegar el servidor y la base de datos en un servicio de nube accesible publicamente**,
> para **que el socio formador y el equipo puedan probar el sistema completo sin instalar nada localmente**.

| Criterio de validacion | | |
|---|---|---|
| • El servidor esta desplegado en un servicio de nube y responde a peticiones externas<br>• La base de datos en la nube es accesible unicamente desde el servidor desplegado<br>• Las variables de entorno sensibles estan configuradas en el servicio de nube y no en el codigo<br>• El juego puede apuntar al servidor en la nube mediante una variable de configuracion | **Valor:** 90 | **Prioridad:** 2 |
| | **Estimacion:** 5h | |