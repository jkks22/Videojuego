# **Game Name Here**
Arcane Assembley

## _Game Design Document_

---

##### **Copyright notice / author information / boring legal stuff nobody likes**

##
## _Index_

---

1. [Index](#index)
2. [Game Design](#game-design)
    1. [Summary](#summary)
    2. [Gameplay](#gameplay)
    3. [Mindset](#mindset)
3. [Technical](#technical)
    1. [Screens](#screens)
    2. [Controls](#controls)
    3. [Mechanics](#mechanics)
4. [Level Design](#level-design)
    1. [Themes](#themes)
        1. Ambience
        2. Objects
            1. Ambient
            2. Interactive
        3. Challenges
    2. [Game Flow](#game-flow)
5. [Development](#development)
    1. [Abstract Classes](#abstract-classes--components)
    2. [Derived Classes](#derived-classes--component-compositions)
6. [Graphics](#graphics)
    1. [Style Attributes](#style-attributes)
    2. [Graphics Needed](#graphics-needed)
7. [Sounds/Music](#soundsmusic)
    1. [Style Attributes](#style-attributes-1)
    2. [Sounds Needed](#sounds-needed)
    3. [Music Needed](#music-needed)
8. [Schedule](#schedule)

## _Game Design_

---

### **Summary**

Arcane Assembly es un juego de estrategia en el que el jugador construye y optimiza un tablero hexagonal antes de cada batalla. Durante la fase de preparación, selecciona y posiciona piezas con distintas funciones y sinergias, formando una configuración única que determinará el desarrollo del combate. Una vez iniciada la batalla, la ejecución es automática, por lo que el resultado depende completamente de la planificación previa y de la calidad del diseño estratégico del jugador. Conforme avanza la partida, el jugador expande su mazo, desbloquea nuevas combinaciones y adapta su estrategia a enemigos y desafíos cada vez más complejos. La habilidad del jugador no se basa en reflejos ni rapidez, sino en la toma de decisiones, la optimización de recursos y la construcción inteligente de sinergias.
![alt arcane_asembly](<arcane_asambley.png>)


### **Gameplay**

La jugabilidad de Arcane Assembly se centra en la planificación estratégica y la optimización del tablero hexagonal, donde el jugador debe analizar cuidadosamente la posición de cada pieza, la gestión de recursos y las posibles sinergias antes de cada combate. El objetivo principal es avanzar a través del mapa superando diferentes nodos, enfrentamientos y eventos, hasta llegar al jefe final de la run.

A lo largo de la partida, el jugador deberá enfrentarse a diversos obstáculos, como combinaciones ineficientes, recursos limitados, decisiones de riesgo y enemigos con mecánicas únicas que exigen adaptar constantemente la estrategia. Cada run presenta nuevas oportunidades para experimentar con distintas configuraciones, mejorar el mazo y descubrir sinergias más efectivas.

Para alcanzar la victoria, no basta con reaccionar rápido, sino con diseñar tableros eficientes que maximicen la interacción entre piezas, optimicen el daño, la defensa y la generación de recursos, y permitan responder de forma inteligente a cada desafío.
![alt gameplay](<gameplay.png>)

### **Mindset**

Arcane Assembly está diseñado para que el jugador adopte una mentalidad estratégica y analítica, donde cada decisión requiere observación, planificación y capacidad de adaptación. El objetivo es que el jugador se sienta ingenioso, creativo y satisfecho al descubrir combinaciones eficientes y construir soluciones propias dentro de cada run.

La experiencia busca transmitir una sensación de calma durante la fase de preparación, permitiendo que el jugador piense con libertad y sin presión de reflejos o tiempo limitado. Al mismo tiempo, se genera curiosidad e intriga al observar cómo el diseño del tablero cobra vida durante el combate automático, donde cada decisión previa demuestra su impacto.

Estas emociones surgen de la construcción estratégica del tablero, la exploración de nuevas sinergias y la incertidumbre de cada partida, ya que cada run presenta desafíos distintos que obligan al jugador a aprender, experimentar y mejorar constantemente su enfoque.
## _Technical_

---

### **Screens**

1. Menu
    1. Menu principal ![alt menu principal](<menu-principal.png>)
2.  Iniciar Run ![alt Mapa del pliegue](<iniciar_run.png>)
    1. Combate ![alt Combate](<tablero.png>)
        1. Tablero Jugador: Tablero del jugador registrado
        2. Tablero Enemigo: Tablero Generado de enemigo
        3. Ultimo Evento: Se registra el daño infligido, escudo, y datos del enemigo
        4. Inventario: Aqui se muestra las piezas disponibles del jugador
        5. Hp: La vida del jugador
        6. Fractura: Muestra el nivel de fractura acumulado por el jugador
        7. Impulso: Impulsos que obtenie el jugador
        8. Pausa: Menu de pausa dentro de combate ![alt Pausa](<pausa.png>)
            1. Renaudar: Continua el combate, si el combate esta en ejecuccion no se pausa.
            2. Regresa al mapa: Regresa a mapa de pliegue
            3. Opciones
                1. Volumrn del Juego: Aqui se controla el volumen del juego
                2. Volumen SFX: Aqui se controla volumen de SFX
                3. Tutroial: Aqui se onserva el tutorial del juego ![alt Tutorial](<tutorial.png>)
                4. Volver: Vuleve a 7. Pausa
            4. Guardar Partida: Guarda la partida.
            5. Salir al menu: Se regresa hasta 1. Menu.
    2. Elite ![alt Elite](<elite.png>)
        1. Tablero Jugador: Tablero del jugador registrado
        2. Tablero Enemigo: Tablero Generado de enemigo
        3. Ultimo Evento: Se registra el daño infligido, escudo, y datos del enemigo
        4. Inventario: Aqui se muestra las piezas disponibles del jugador
        5. Hp: La vida del jugador
        6. Fractura: Muestra el nivel de fractura acumulado por el jugador
        7. Impulso: Impulsos que obtenie el jugador
        8. Pausa: Menu de pausa dentro de combate ![alt Pausa](<pausa.png>)
            1. Renaudar: Continua el combate, si el combate esta en ejecuccion no se pausa.
            2. Regresa al mapa: Regresa a mapa de pliegue
            3. Opciones
                1. Volumrn del Juego: Aqui se controla el volumen del juego
                2. Volumen SFX: Aqui se controla volumen de SFX
                3. Tutroial: Aqui se onserva el tutorial del juego ![alt Tutorial](<tutorial.png>)
                4. Volver: Vuleve a 7. Pausa
            4. Guardar Partida: Guarda la partida.
            5. Salir al menu: Se regresa hasta 1. Menu.
    3. Boss ![alt Boss](<boss.png>)
        1. Tablero Jugador: Tablero del jugador registrado
        2. Tablero Enemigo: Tablero Generado de enemigo
        3. Ultimo Evento: Se registra el daño infligido, escudo, y datos del enemigo
        4. Inventario: Aqui se muestra las piezas disponibles del jugador
        5. Hp: La vida del jugador
        6. Fractura: Muestra el nivel de fractura acumulado por el jugador
        7. Impulso: Impulsos que obtenie el jugador
        8. Pausa: Menu de pausa dentro de combate ![alt Pausa](<pausa.png>)
            1. Renaudar: Continua el combate, si el combate esta en ejecuccion no se pausa.
            2. Regresa al mapa: Regresa a mapa de pliegue
            3. Opciones
                1. Volumrn del Juego: Aqui se controla el volumen del juego
                2. Volumen SFX: Aqui se controla volumen de SFX
                3. Tutroial: Aqui se onserva el tutorial del juego ![alt Tutorial](<tutorial.png>)
                4. Volver: Vuleve a 7. Pausa
            4. Guardar Partida: Guarda la partida.
            5. Salir al menu: Se regresa hasta 1. Menu.
    4. Evento ![alt Boss](<boss.png>)
        1. Selecciona una Recompensa ![alt Recompensa](<recompensa.png>)
    5. Tienda ![alt Tienda](<tienda.png>)
3. Entrar ![alt Entrarl](<Entrar.png>)
    1. Login: Si ya tienen cuenta ![alt Login](<login.png>)
    2. Registrarse: Si es un jugador nuevo ![alt Registrarse](<registrarse.png>)
4. Reglas
    1. Reglas del juego ![alt Reglas](<reglas.png>)
5. Opciones ![alt Opciones](<opciones.png>)
    1. Volumrn del Juego: Aqui se controla el volumen del juego
    2. Volumen SFX: Aqui se controla volumen de SFX
    3. Tutroial: Aqui se onserva el tutorial del juego ![alt Tutorial](<tutorial.png>)
    4. Volver: Vuleve a 1. Menu
6. Creditos ![alt Creditos](<creditos.png>)
    1. Creditos: Muestra Creditos
    2. Volver: Vuelve a 1. Menu


### **Controls**

La interacción en Arcane Assembly está centrada completamente en el uso de mouse o trackpad, ya que el juego prioriza la estrategia, la observación y la toma de decisiones sobre la velocidad de reacción. Durante cada run, el jugador construye su tablero, selecciona rutas en el mapa y administra recursos utilizando controles simples pero precisos.

1. Click en el mousepad
    1. Seleccionar una pieza del inventario durante la fase de construcción.
    2. Colocar una pieza en una casilla vacía del tablero hexagonal.
    3. Seleccionar nodos accesibles dentro del mapa de progresión.
    4. Elegir recompensas después de un combate.
    5. Tomar decisiones en eventos especiales.
    6. Interactuar con botones de interfaz
        1. Impulso
        2. Limpiar tablero
        3. Guardar Run
        4. Reanudar
        5. Opciones
        6. Nueva Run
2. Movimiento del cursor (Hover)
    1. Muestrar una previsualización de la casilla donde se colocará la pieza seleccionada.
    2. Resaltar visualmente la celda hexagonal bajo el cursor.
    3. Mostrar tooltips con información detallada de cada pieza.
        1. Nombre
        2. Tipo
        3. Descripción
        4. Generación de daño
        5. Escudo
        6. Regeneración
        7. Reflejo
        8. Multiplicadores o amplificaciones
3. Limpiar tablero
    1. Permite reiniciar por completo la fase de construcción actual.
4. Impulso
    1. Gastar una carga de impulso disponible
    2. Obtener una pieza adicional para esa ronda de construcción
5. Selección de nodo en el mapa
    1. Elegir entre diferentes rutas disponibles
    2. Acceder a combates normales
    3. Entrar a eventos especiales
    4. Visitar tiendas
    5. Enfrentar élites
    6. Avanzar hacia el jefe de zona
6. Resolución automática del combate
    1. Resolver el tablero del jugador
    2. Calcular daño total, escudos y efectos especiales
    3. Ejecutar el turno del enemigo
    4. Mostrar el resultado en el registro de combate
    5. Determinar si continúa la run o si termina el encuentro


### **Mechanics**
Las mecánicas principales de Arcane Assembly están diseñadas alrededor de la planificación táctica, la optimización de sinergias y la progresión roguelite. El jugador no controla ataques directos, sino que construye estratégicamente su tablero para que la resolución automática genere el mejor resultado posible.

1. Sistema de tablero hexagonal
    1. Cada combate utiliza un tablero hexagonal para el jugador y otro para el enemigo.
    2. Las piezas se colocan individualmente en casillas libres durante la fase de construcción.
    3. Cada casilla puede contener únicamente una pieza.
    4. La proximidad entre piezas determina activaciones, bonificaciones y sinergias.
    5. El tablero del enemigo también se genera automáticamente bajo las mismas reglas.
2. Sistema de tipos de piezas
    1. Generadores (GEN)
            1. Producen energía base para activar otras piezas
            2. Son el inicio de la cadena de resolución
            3. Su valor depende de su output individual
    2. Transformadores (TRANS)
            1. Consumen energía de Generadores adyacentes
            2. Convierten esa energía en daño ofensivo
            3. Su efectividad depende del multiplicador de transformación
    3. Catalizadores (CAT)
            1. Amplifican el daño total producido
            2. Otorgan bonificaciones porcentuales según vecinos activos
            3. Pueden activar sinergias especiales entre Generadores y Transformadores
    4. Anclas (ANCH)
            1. Generan escudo defensivo
            2. Pueden otorgar regeneración de vida
            3. Algunas incluyen reflejo de daño hacia el enemigo
3. Detección de vecinos y sinergias
    1. Cada casilla hexagonal revisa hasta 6 vecinos posibles.
    2. Si una pieza compatible se encuentra adyacente, se activa una interacción.
    3. Las sinergias no requieren activación manual
    4. Catalizador detecta simultáneamente un Generador y un Transformador vecinos
            1. Se activa una sinergia especial
            2. Se añade daño adicional
            3. Se incrementa el contador de sinergias del combate
4. Orden de resolución automática por ronda
    1. Generadores
            1. Generadores producen energía disponible para piezas adyacentes.
    2. Transformadores
            1. Los Transformadores consumen la energía vecina y la convierten en daño directo.
    3. Catalizadores
            1. Los Catalizadores aplican multiplicadores de daño y activan bonificaciones de sinergia.
    4. Anclas
            1. Las Anclas generan escudo, regeneración y efectos de reflejo.
    5. Daño final
            1. Daño infligido
            2. Escudo absorbido
            3. Reflejo aplicado
            4. Regeneración posterior
            5. Vida restante de ambos lados
5. Sistema de defensa
    1. Escudo
            1. Absorbe daño enemigo antes de afectar el HP real
    2. Reflejo
            1. Devuelve un porcentaje del daño recibido al enemigo
    3. Regeneración
            1. Cura vida al finalizar un combate victorioso
6. Sistema de Impulso
    1. Gastar una carga disponible
    2. Obtener una pieza adicional en la ronda actual
    3. Ampliar opciones cuando la mano inicial no es suficientemente buena
    4. Características
            1. Tiene usos limitados por run
            2. No puede usarse mientras el combate se está resolviendo
            3. Debe decidirse cuidadosamente en encuentros difíciles
7. Draft de recompensas
    1. Después de ganar un combate, el jugador recibe una recompensa permanente para esa run
            1. Se muestran 3 piezas aleatorias
            2. El jugador selecciona una sola
            3. La pieza elegida se agrega a su colección desbloqueada
    2. Piezas disponibles dependen de:
            1. La zona actual
            2  La rareza mínima permitida
            3. Eventos especiales
            4. Recompensas de tienda
8. Eventos
    1. Curación
    2. Daño inmediato
    3. Drafts especiales de rareza alta
    4. Decisiones de riesgo / recompensa
9. Tienda
    1. Permite obtener piezas de mejor calidad
            1. Rareza poco común o superior
            2. Acceso más controlado a builds específicas
Ambos tienda y eventos  tienen límites de uso por run para evitar abuso estratégico.
9. Progresión por mapa
    1. Combate 
    2. Evento
    3. Elite
    4. Tienda
    5. Jefe de zona
Solo ciertos nodos están desbloqueados según el progreso.
10. Escalado Roguelite — Sistema de Fractura
    1. Fractura 
            1. Al completar runs exitosas, aumenta el nivel de Fractura
            2. Los enemigos obtienen más vida
            3. Aparecen configuraciones más complejas
            4. Los combates requieren builds más optimizadas

## _Level Design_

El diseño de niveles en Arcane Assembly se basa en un sistema de mapa de nodos ramificado, donde el jugador avanza eligiendo su camino en cada run. Cada partida presenta una estructura con múltiples rutas posibles que conectan distintos tipos de encuentros. El jugador comienza en un punto inicial y debe avanzar tomando decisiones que afectan directamente su progreso, recursos y dificultad.
Los nodos pueden ser: Combates normales, Encuentros élite, Eventos, Tiendas, Jefe final.
A medida que el jugador avanza, se desbloquean nuevas rutas hasta llegar al jefe de la zona. Todas las decisiones influyen en la construcción de la estrategia, ya que determinan las piezas obtenidas, la vida restante y los riesgos asumidos. La dificultad incrementa progresivamente conforme se avanza en el mapa, culminando en un combate contra un jefe con mayor resistencia y presión estratégica.

### **Themes**
En Arcane Assembly, la ambientación no depende de biomas tradicionales, sino de una combinación de elementos visuales, interfaz y comportamiento del combate que generan una identidad consistente.

1. Mood
    1. Ambiente oscuro y enfocado en lo estratégico
    2. Sensación de tensión constante durante los combates
    3. Ritmo pausado que permite planear cada movimiento
    4. Énfasis en claridad visual para entender resultados y decisiones
2. Objects
    1. Ambient
        1. Efectos visuales durante el combate (impactos, energía, escudos)
        2. Animaciones de los personajes (ataques, daño, muerte)
        3. Indicadores dinámicos como barras de vida, daño y fases
        4. Fondos que acompañan la acción
    2. Interactive
        1. Piezas del tablero que el jugador coloca estratégicamente
        2. Tablero hexagonal donde ocurre el combate
        3. Nodos del mapa que determinan el progreso
        4. Sistema de recompensas después de cada combate
        5. Decisiones en eventos que modifican el estado del jugador

### **Game Flow**
1. El jugador inicia en el nodo inicial del mapa
2. Se muestran los primeros nodos disponibles (combate o evento)
3. El jugador selecciona un nodo y entra al encuentro correspondiente
4. Si entra a combate:
    1. Se genera el enemigo
    2. Se muestran ambos tableros (jugador y enemigo)
    3. Inicia la fase de construcción
5. El jugador selecciona piezas del inventario
6. Coloca piezas en el tablero hexagonal
7. Observa la previsualización de daño y escudo
8. El jugador decide su estrategia:
    1. Posicionamiento
    2. Sinergias
    3. Uso de impulso (opcional)
9. Una vez colocadas todas las piezas:
    1. Inicia automáticamente la resolución del combate
10. El sistema ejecuta las fases:
    1.  Generación de recursos
    2. Transformación a daño
    3. Amplificación
    4. Aplicación de escudo
11. Se aplica el daño al enemigo y al jugador
12. Se actualizan barras de vida
13. Si el enemigo sobrevive:
    1. Inicia una nueva ronda
    2. El jugador recibe nuevas piezas
    3. El enemigo reorganiza su tablero
14. El ciclo se repite hasta que:
    1. El jugador gana o el jugador pierde
15. Si el jugador gana:
    1. Se muestra una pantalla de recompensa
    2. Elige una pieza entre 3 opciones
    3. La pieza se añade a su colección
16. Dependiendo del nodo:
    1. Puede activarse un evento  o una tienda 
17. El jugador regresa al mapa
18. Se desbloquean nuevos nodos
19. Elige el siguiente camino
20. El jugador avanza a través del mapa
21. Enfrenta combates más difíciles (élite)
22. Optimiza su build con nuevas piezas
23. Finalmente llega al nodo de jefe
24. Enfrenta el combate más difícil de la zona
25. Si gana:
    1. Completa la zona / run
26. Si pierde:
    1. Termina la partida (game over)

## _Development_

---

### **Abstract Classes / Components**

1. PiezaBase
    1. Definie identidad de la pieza (nombre, tipo, rareza)
    2. Contiene propiedades principales 
    3. Interactua con piezas vecinas
    4. Participa en la resolución del tablero
    5. Base generador
        1. Produce recursos base
        2. No depende de otras piezas
        3. Inicia la cadena de generación
    6. BaseTransformador
        1. Consume recursos de piezas adyacentes
        2. Convierte recursos en daño
        3. Depende del posicionamiento en el tablero
    7. BaseCatalizador
        1. Amplifica el resultado de otras piezas
        2. Detecta combinaciones de vecinos
        3. Activa sinergias adicionales
    8. BaseAncla
        1. Proporciona efectos defensivos
        2. Genera escudo
        3.Puede aplicar regeneración o reflejo
2. TableroBase
    1. Mantener la estructura del tablero
    2. Validar colocación de piezas
    3. Detectar vecinos entre casillas
    4. Almacenar el estado del tablero
3. CombateBase
    1. Inicializar el combate
    2. Gestionar rondas
    3. Resolver automáticamente el tablero
    4. Calcular daño, escudo y efectos
    5. Determinar victoria o derrota
4. NodoBase
    1. Definir el tipo de nodo
    2. Controlar accesibilidad
    3.Conectar con otros nodos
    4. Activar el evento correspondiente al ser seleccionado
   
### **Derived Classes / Component Compositions**

1. BaseGenerador
    1. Genera recursos que son utilizados por piezas adyacentes.
    2. GeneradorSimple
        1. Produce una cantidad fija de energía
    3. GeneradorMejorado
        1. Genera más recursos que el básico
    4. GeneradorEscalable
        1. Su output puede aumentar según la zona o condiciones
2. BaseTransformador
    1. Convierte recursos adyacentes en daño.
    2. TransformadorBasico
        1. Convierte energía en daño directo
    3. TransformadorMultiplicador
        1. Aplica un multiplicador mayor al daño generado
    4. TransformadorEficiente  
        1. Optimiza el uso de recursos cercanos
3. BaseCatalizador
    1. Amplifica el resultado de otras piezas cercanas.
    2. CatalizadorBasico
        1. Aumenta el daño total según vecinos
    3. CatalizadorDeSinergia
        1. Otorga bonificaciones adicionales si hay combinación de tipos (GEN + TRANS)
4. BaseAncla
    1. Proporciona efectos defensivos y pasivos.
    2. AnclaDeEscudo
        1. Genera escudo fijo
    3. AnclaDeReflejo
        1. Devuelve parte del daño recibido al enemigo
    4. AnclaDeRegeneracion
        1. Restaura vida al finalizar el combate
5. BaseNodo
    1. Define los tipos de encuentros dentro del mapa.
    2. NodoCombate
        1. Enfrentamiento estándar
    3. NodoElite
        1. Enemigo más fuerte con mayor recompensa
    4. NodoEvento
        1. Presenta decisiones con efectos variables
    5. NodoTienda
        1. Permite obtener piezas con cierta ventaja
    6. NodoJefe
        1. Combate final de la zona con mayor dificultad

## _Graphics_

---

### **Style Attributes**

What kinds of colors will you be using? Do you have a limited palette to work with? A post-processed HSV map/image? Consistency is key for immersion.
Para Arcane Assembly se utiliza una paleta limitada de colores brillantes y contrastantes para diferenciar claramente los tipos de piezas y mantener la legibilidad en combate. Cada tipo de pieza tiene un color principal asociado:
Generador = Azul/teal brillante, 
Transformador = Naranja/dorado, 
Catalizador = Morado, 
Ancla = Verde,

Estos colores no solo identifican las piezas, sino que también se reutilizan en la interfaz (HUD, efectos, texto y feedback visual), reforzando la coherencia del sistema de juego.
El fondo del juego está basado en tonos oscuros azulados , creando un ambiente tecnológico y profundo. Este contraste permite que los colores brillantes de las piezas resalten visualmente sin saturar la pantalla.
Además, los paneles usan variantes más claras del fondo  para separar capas de información, los bordes mantienen una estética limpia y consistente, los efectos visuales reutilizan los mismos colores base para mantener uniformidad

What kind of graphic style are you going for? Cartoony? Pixel-y? Cute? How, specifically? Solid, thick outlines with flat hues? Non-black outlines with limited tints/shades? Emphasize smooth curvatures over sharp angles? Describe a set of general rules depicting your style here.

El estilo visual de Arcane Assembly se define como geométrico, minimalista y funcional, priorizando la claridad sobre el detalle decorativo.
Se basa en una serie de reglas visuales consistentes, 
Formas simples y geométricas:
Todas las piezas están construidas a partir de figuras básicas (hexágonos, líneas, nodos), evitando siluetas complejas. Esto facilita reconocer cada tipo de pieza de inmediato.

Tablero hexagonal flotante:
El campo de juego es limpio y ordenado, con un grid bien definido que refuerza la lógica estratégica. No hay ruido visual innecesario alrededor.

Colores sólidos y contrastantes:
Se utilizan colores brillantes y definidos para las piezas, sin degradados complejos. El fondo es oscuro (azulado) para maximizar el contraste y la legibilidad.

Sinergias visualizadas con energía:
Las interacciones entre piezas se representan con líneas de energía animadas o pulsos luminosos, haciendo evidente cuándo una sinergia está activa.

Efectos claros y directos:
Cada activación genera feedback visual inmediato (destellos, pulsos, vibraciones suaves), evitando efectos caóticos o sobrecargados.

Iluminación tipo “glow” en lugar de outlines pesados:
En vez de usar contornos negros gruesos, los elementos se diferencian mediante brillo, color y contraste. 

Interfaz limpia y legible:
Tipografía futurista, espacios bien definidos y uso consistente del color para comunicar información

Well-designed feedback, both good (e.g. leveling up) and bad (e.g. being hit), are great for teaching the player how to play through trial and error, instead of scripting a lengthy tutorial. What kind of visual feedback are you going to use to let the player know they&#39;re interacting with something? That they \*can\* interact with something?

En arcane Assambley utlizara varios tipos de feedback visuales para indicar acciones e interacciones tales como: coexiones luminosas entre piezas cuando exista una sinergia, un pulso de luz confirmando que tu pieza se activa, un brillo o tal vez un resplandor que indique que tu pieza puede colocarse en una pocision valida, todas estas represntaciones visuales ayudaran al jugador a entender como funciona el juego sin necesidad de explicaciones largas.  

### **Graphics Needed**

1. Tablero
    1. Tablero hexagonal principal (5×5)
    2. Casillas hexagonales individuales
    3. Tablero enemigo (misma estructura visual)
    4. Highlight de casillas válidas para colocar piezas
    5. Highlight de casilla seleccionada
    6. Indicador visual de adyacencia (vecinos activos)
    7. Efecto visual al colocar pieza
2. Piezas (Basadas en CATALOG)
    1. Generadores (color: teal)
        1. Cristal de Energía
        2. Núcleo Térmico
        3. Emisor de Pulso
        4. Grieta del Vacío
    2. Transformadores (color: gold)
        1. Cámara de Corte
        2. Fragua Arcana
        3. Condensador de Tormenta
        4. Aniquilador
    3. Catalizadores (color: purple)
        1. Resonador
        2. Prisma Arcano
        3. Nodo Nexo
    4. Anclas (color: green #56CFB2)
        1. Ancla de Escudo
        2. Ancla de Regeneración
        3. Ancla Reflectora
        4. Ancla Fortaleza
    5. Cada pieza necesita:
        1. Icono ( ⚡ ⚙ ✦ ⬡)
        2. Representación en tablero
        3. Tarjeta en inventario 
        4. Versión para draft
        5. Indicador de rareza 
3. Efectos Visuales (FX)
    1. Líneas de energía entre piezas (sinergias activas)
    2. Animación de activación de piezas 
    3. Efecto de daño 
    4. Efecto de escudo (brillo teal)
    5. Efecto de amplificación 
    6. Efecto de impacto en sprites 
    7. Efectos en canvas (fx-canvas)
    8. Animaciones de cadena de sinergia 
4. Interfaz de Usuario (UI / HUD)
    1. HUD superior
        1. Barra de vida (player/enemy)
        2. Indicador de run
        3. Nivel de fractura
        4. Recursos / estado
        5. Indicador de zona
        6. Sistema de impulso 
    2. Combate
        1. Indicador de fase 
        2. Indicador de ronda
        3. Log de combate   
        4. Indicadores de daño / escudo / sinergia 
    3. Inventario
        1. Cartas de piezas 
        2. Contador de piezas
        3. Estados: seleccionada / usada
    4. Draft
        1. Cartas de selección (
        2. Rareza visible
        3. NPC + burbuja de diálogo
    5. Eventos
        1. Icono del evento
        2. Texto narrativo
        3. Opciones con efectos
5. Personajes / Sprites
    1. Idle
    2. Attack
    3. Hurt/Damaged
    4.Death
6. Mapa de Nodos
    1. Nodos visuales:
        1. Combate
        2. Elite
        3. Evento
        4. Tienda
        5. Jefe
    2. Conexiones entre nodos
    3. Estado del nodo (visitado / disponible / bloqueado)
7. Feedback Visual Importante   
    1. Sinergias visibles 
    2. Colores claros por tipo 
    3. Animaciones rápidas pero claras
    4. Feedback inmediato al colocar piezas
    5. Diferenciación clara entre daño / escudo / buff


## _Sounds/Music_

---

### **Style Attributes**

Again, consistency is key. Define that consistency here. What kind of instruments do you want to use in your music? Any particular tempo, key? Influences, genre? Mood?

La música debe crear una atmósfera etrategíca y sobretodo calmada, para asi el juegador pueda pensar y planificar su tablero. Para lograr esta sensación de calma, se propone un estilo ambiente electronico con sintetizadores y pads sauves, con tempo moderado y que mantenga ligera tension urante el combate, etsa mimsa inspiración puede venir e musica sci-fi, como por ejemplo Space Cruise-Ben Prunty, MilkyWay-Ben Prunty, https://www.youtube.com/watch?v=NC4uZoDg_9k.

Stylistically, what kind of sound effects are you looking for? Do you want to exaggerate actions with lengthy, cartoony sounds (e.g. mario&#39;s jump), or use just enough to let the player know something happened (e.g. mega man&#39;s landing)? Going for realism? You can use the music style as a bit of a reference too.

Los efectos de sonido en Arcane Assembly serán breves, precisos y altamente informativos, evitando sonidos largos o caricaturescos. El enfoque es más cercano a juegos como Mega Man que a estilos exagerados, priorizando claridad sobre espectáculo.

La estética sonora combinará elementos tecnológicos y arcanos, utilizando:

Tonos digitales suaves
Pulsos de energía
Resonancias ligeras
Texturas sintéticas con un toque místico

Cada acción del sistema tendrá un sonido distintivo pero sutil, permitiendo al jugador entender lo que ocurre sin romper su concentración estratégica. 

 Remember, auditory feedback should stand out from the music and other sound effects so the player hears it well. Volume, panning, and frequency/pitch are all important aspects to consider in both music _and_ sounds - so plan accordingly!

### **Sounds Needed**

1. Effects
    1. Colocación de piezas
        1. Sonido digital corto y limpio al colocar una pieza en el tablero.
    2. Selección de pieza 
        1. Feedback sutil al seleccionar una carta del inventario.
    3. Activación de piezas
        1. Sonido breve al activarse durante la resolución.
    4. Pulso de generación de recurso
        1. Pulso energético suave (generadores).
    5. Transformación de recurso 
        1. Sonido de conversión más marcado (transformadores=daño/escudo).
    6. Impacto de energía (daño)
        1.Golpe corto y definido.
    7. Generación de escudo (faltaba)
        1. Sonido brillante/protector.
    8. Amplificación de catalizador
        1. Tono ascendente o resonante.
    9. Activación de ancla
        1.Sonido más estable/grave.
    10. Sinergia entre piezas 
        1. Sonido de conexión energética .
    11. Cadena de activación 
        1. Secuencia rápida cuando varias piezas se activan en orden.
    12. Uso de impulso 
        1. Sonido especial más potente/distintivo.
    13. Reconfiguración del tablero
        1. Sonido suave al reorganizar piezas.
2. Feedback (Jugador / Estado)
    1. Recurso obtenido
        1. Sonido ligero y satisfactorio.
    2. Daño recibido
        1. Pulso corto con tono más grave.
    3. Escudo absorbiendo daño 
        1. Sonido de mitigación.
    4. Victoria
        1. Sonido ascendente, limpio y breve.
    5. Derrota
        1. Sonido descendente, más apagado.
3. UI / Navegación 
    1. Hover de botones
    2. Click de botones
    3. Abrir/cerrar pantallas (mapa, combate, draft, eventos)
    4. Selección en draft
    5. Elección en evento
    6. Error / acción inválida 
### **Music Needed**

1. Tema general de tablero (Música ambiental calmada).
## _Schedule_

---

_(define the main activities and the expected dates when they should be finished. This is only a reference, and can change as the project is developed)_

## Schedule

_(Define the main activities and the expected dates when they should be finished. This is only a reference and may change during development.)_

1. Desarrollo de clases base — Semana 5
    1. PiezaBase
        1. BaseGenerador
        2. BaseTransformador
        3. BaseCatalizador
        4. BaseAncla
    2. TableroBase
        1. Manejo de grid 
        2. Representación interna de casillas
    3. CombateBase
        1. Flujo de ronda
        2. Control de estados (HP, daño, escudo)
    4. NodoBase
        1. Estructura de nodos del mapa
        2. Tipos base de nodo
2. Desarrollo del sistema del tablero — Semana 6
    1. Grid hexagonal (5×5)
    2. Sistema para colocar y remover piezas**
        1. Integración con inventario 
        2. Validación de posiciones
    3. Sistema de detección de vecinos
        1. Cálculo de adyacencia (6 direcciones)
        2. Activación de sinergias
3. Implementación del sistema de combate — Semana 6
    1. Orden de resolución de piezas
        1. Generadores (output)
        2.Transformadores (multiplier)
        3. Catalizadores (amplify)
        4. Anclas (efectos pasivos)
    2. Sistema de cálculo
        1. Daño total
        2. Escudo
        3.Interacciones entre piezas
    3. Registro de combate
        1. Battle log 
        2. Indicadores 
4. Desarrollo de clases derivadas — Semana 6–7
    1. BaseGenerador
        1. GeneradorEnergia
        2. GeneradorCalor
        3. GeneradorPresion
        4. GeneradorCorriente
    2. BaseTransformador
        1. TransformadorDaño
        2. TransformadorEscudo
        3. TransformadorEstado
    3. BaseCatalizador
        1. CatalizadorAmplificador
    4. BaseAncla
        1. AnclaEscudo
        2. AnclaRegeneracion
        3. AnclaReflejo
        4. AnclaFortaleza
5. Desarrollo del sistema de mapa — Semana 7
    1. Generación de nodos
        1. Tipos: combat, elite, boss
    2. Implementación de nodos
        1. NodoCombate
        2. NodoElite
        3. NodoTienda
        4. NodoEvento
        5. NodoJefe
    3. Eventos del juego**
        1. Integración de evento
        2. Sistema de decisiones (choices, effects)
6. Diseño visual y efectos — Semana 7-8
    1. Tablero
        1.  Render en canvas
        2. Casillas hexagonales
    7. Piezas
        1. Uso de colores
        2. Uso de iconos
        3. Visualización en tablero e inventario
    3. Efectos visuales
        1. Líneas de sinergia
        2. Daño 
        3. Escudo
        4. Activación de piezas
    4. Interfaz
        1. HUD (vida, impulso, fractura)
        2. Inventario
        3. Draft
        4. Eventos
7. Diseño de audio — Semana 9
    1. Efectos de sonido
        1. Colocación de piezas
        2. Activación de piezas
        3. Generación de recursos
        4. Daño y escudo
        5. Sinergias
    2. Feedback del sistema
        1. Victoria
        2. Derrota
        3. Interacciones UI
8. Testing, balance y pulido — Semana 9–10
    1. Balance de piezas 
    2. Ajuste de dificultad (enemigos, fractura)
    3. Corrección de bugs
    4. Optimización de rendimiento
    5. Mejora de feedback visual/sonoro
