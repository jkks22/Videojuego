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

Arcane Assembly se basa en un juego estratégico donde el jugador construye un tablero hexagonal antes de cada battala, la ejecución del juego es automática y, conforme el jugador vaya armando su mazo los efectos serán diferentes. La habilidad del juagor no depende de sus reflejos, sino en el diseño.

### **Gameplay**

La jugabilidad se centra en la planificación y la optimización del tablero, donde el jugador debera analizar posiciones y recursos antes del combate. El objetivo de Arcane Assembly es ir avanzando por el mapa hasta llegar a poder derrotar el jefe final, donde se superan obstaculos como lo podrian ser combinaciones ineficientes, limitaciones de piezas y enemigos con mecanicas unicas. Para poder llegar a ganar, el jugador debe experimentar con adapatar su estrategia en cada run y desieñar tableros que maximicen la interaccion entre piezas.

### **Mindset**

Arcane Assembly es un juego para que los jugadores puedan experimentar una cierta mentalidad estrategica y análitica, que el juador se sienta ingenioso y creativo. La intención de Arcane Assembly es que el jugador se sienta tranquilo, pero a la vez curioso e intrigado al ver como su diseño se ejecuta. Estas emociones se provocaran mediante la construcción del tablero y la incertidumbre de cada run.

## _Technical_

---

### **Screens**

1. Title Screen
    1. Options
2. Level Select
3. Game
    1. Inventory
    2. Assessment / Next Level
4. End Credits


_(example)_

### **Controls**

How will the player interact with the game? Will they be able to choose the controls? What kind of in-game events are they going to be able to trigger, and how? (e.g. pressing buttons, opening doors, etc.)


### **Mechanics**

Are there any interesting mechanics? If so, how are you going to accomplish them? Physics, algorithms, etc.

## _Level Design_

---

_(Note : These sections can safely be skipped if they&#39;re not relevant, or you&#39;d rather go about it another way. For most games, at least one of them should be useful. But I&#39;ll understand if you don&#39;t want to use them. It&#39;ll only hurt my feelings a little bit.)_

### **Themes**

1. Forest
    1. Mood
        1. Dark, calm, foreboding
    2. Objects
        1. _Ambient_
            1. Fireflies
            2. Beams of moonlight
            3. Tall grass
        2. _Interactive_
            1. Wolves
            2. Goblins
            3. Rocks
2. Castle
    1. Mood
        1. Dangerous, tense, active
    2. Objects
        1. _Ambient_
            1. Rodents
            2. Torches
            3. Suits of armor
        2. _Interactive_
            1. Guards
            2. Giant rats
            3. Chests

_(example)_

### **Game Flow**

1. Player starts in forest
2. Pond to the left, must move right
3. To the right is a hill, player jumps to traverse it (&quot;jump&quot; taught)
4. Player encounters castle - door&#39;s shut and locked
5. There&#39;s a window within jump height, and a rock on the ground
6. Player picks up rock and throws at glass (&quot;throw&quot; taught)
7. … etc.

_(example)_

## _Development_

---

### **Abstract Classes / Components**

1. PiezaBase
    1. BaseGenerador
    2. BaseTransformador
    3. BaseCatalizador
    4. BaseAncla
2. TableroBase
3. CombateBase
4. NodoBase

_(example)_
Clase: PiezaBase
Propiedades:
  tipo
  rareza
  posicionHex
  tamaño

Métodos:
  activar()
  calcularEfecto()
  obtenerVecinos()

### **Derived Classes / Component Compositions**

1. BaseGenerador
    1. GeneradorEnergia
    2. GeneradorCalor
    3. GenradorPresion
    4. GeneradorCorriente
2. BaseTransformador
    1. TransformadorDaño
    2. TransformadorEscudo
    3. TransformadorEstado
3. BaseCatalizador
    1. CatalizadorAmplificador
4. BaseAncla
    1. AnclaReduceDaño
    2. AnclaReflejaDaño
    3. AnclaRegeneraRecursos
5. BaseNodo
    1. NodoCombate
    2. NodoElite
    3. NodoTienda
    4. NodoEvento
    5. NodoJefe

_(example)_
Clase: GeneradorCalor
Hereda de: BaseGenerador

Recurso generado: Calor
Output: 2 por turno

Método:
  generarRecurso()

## _Graphics_

---

### **Style Attributes**

What kinds of colors will you be using? Do you have a limited palette to work with? A post-processed HSV map/image? Consistency is key for immersion.

Para el juego Arcane Assambley se usara una paleta limitada de colores brillantes y contrastantes para representar los distintos tipos de piezas. Cada pieza tendra un color distinto, Generador:Azul, Transformador: Naranja, Catalizador: Verde, y Ancla: Morado.
Ejemplos:

ancla:![alt ancla](<ancla.png>)
catalizador:![alt ancla](<Catalizador.png>)
generador:![alt ancla](<generaodr.png>)
transformador:![alt ancla](<transformador.png>)

What kind of graphic style are you going for? Cartoony? Pixel-y? Cute? How, specifically? Solid, thick outlines with flat hues? Non-black outlines with limited tints/shades? Emphasize smooth curvatures over sharp angles? Describe a set of general rules depicting your style here.

Basicamente el estilo visual será geométrico y minimalista, donde contara con características principales tales como: un tablero hexagonal flotante, formas geometricas, lineas de energia que conectan piezas cuando exista una sinergia, efectos visuales cuando las piezas son activadas, colores brillantes(piezas) sobre un fondo no tan oscuro(tablero), donde el estilo del juego busca ser claro y legible, de tal manera que el jugador entienda rapidamente las interacciones entre piezas

Well-designed feedback, both good (e.g. leveling up) and bad (e.g. being hit), are great for teaching the player how to play through trial and error, instead of scripting a lengthy tutorial. What kind of visual feedback are you going to use to let the player know they&#39;re interacting with something? That they \*can\* interact with something?

En arcane Assambley utlizara varios tipos de feedback visuales para indicar acciones e interacciones tales como: coexiones luminosas entre piezas cuando exista una sinergia, un pulso de luz confirmando que tu pieza se activa, un brillo o tal vez un resplandor que indique que tu pieza puede colocarse en una pocision valida, todas estas represntaciones visuales ayudaran al jugador a entender como funciona el juego sin necesidad de explicaciones largas.  

### **Graphics Needed**

1. Tablero 
        1. Tablero Hexagonal(grid de 5x5)
        2. Casillas Hexagonales individuales
        3. Tablero hexagonal del enemigo
    
2. Piezas
    1. Generadores
        1. Generador de energía
        2. Generador de calor
        3. Generador de Presión
        4. Generador de Corriente
    2. Transformadores
        1. Transformador de daño
        2. Transformador de escudo
        3. Transformador de estado
    3. Catlizadores
        1. Catalizador Amplificador
    4. Anclas
        1. Ancla de escudo
        2. Ancla de reflejo de daño
        3. Ancla de regeneración de recursos
    
3. Efectos visuales
    1. Lineas de energia entre piezas
    2. Efectos de daño
    3. Efectos de escudo
    4. Animación de activación de piezas
    5. Brillo o resplandor cuando una pieza se activa
 
4. Interfaz de usuario
    1. Iconos de piezas
    2. Indicadores de recursos
    3. Resaltado de casillas donde se pueden colocar piezas
    4. Indicadores de turno o resolución de combate
    5. Indicadores de daño

_(example)_
Pieza: GeneradorCalor
Tipo: Generador
Color: Azul
Recurso: Calor
Output: 2 por turno
Tamaño: 1 hex


## _Sounds/Music_

---

### **Style Attributes**

Again, consistency is key. Define that consistency here. What kind of instruments do you want to use in your music? Any particular tempo, key? Influences, genre? Mood?

La música debe crear una atmósfera etrategíca y sobretodo calmada, para asi el juegador pueda pensar y planificar su tablero. Para lograr esta sensación de calma, se propone un estilo ambiente electronico con sintetizadores y pads sauves, con tempo moderado y que mantenga ligera tension urante el combate, etsa mimsa inspiración puede venir e musica sci-fi, como por ejemplo Space Cruise-Ben Prunty, MilkyWay-Ben Prunty, https://www.youtube.com/watch?v=NC4uZoDg_9k.

Stylistically, what kind of sound effects are you looking for? Do you want to exaggerate actions with lengthy, cartoony sounds (e.g. mario&#39;s jump), or use just enough to let the player know something happened (e.g. mega man&#39;s landing)? Going for realism? You can use the music style as a bit of a reference too.

Los efectos de sonido deben ser breves y claros, con una estética tecnológica y energética. Se usarán sonidos digitales suaves para indicar colocación de piezas, generación de recursos, activación de habilidades y daño. El objetivo es comunicar las acciones del sistema sin distraer al jugador mientras planifica su tablero. 

 Remember, auditory feedback should stand out from the music and other sound effects so the player hears it well. Volume, panning, and frequency/pitch are all important aspects to consider in both music _and_ sounds - so plan accordingly!

### **Sounds Needed**

1. Effects
    1. Colocación de piezas (cuando el jugador coloca una pieza en el tablero)
    2. Activación de piezas (cuando una pieza e activa durante la ronda)
    3. Pulso de generación de recurso (cuando un generador produce recurso)
    4. Impacto de energía (cuando se inflige daño a un enemigo)
    5. Amplificación de catalizador (cuando un catalizador aumenta el efecto de piezas vecinas)
    6. Activación de Ancla (cuando una ancla altera el área: reducir daño, reflejar daño, regenerar recursos o proteger piezas)
    7. Reconfiguración del tablero (cuando el jugador reorganiza piezas)
2. Feedback
    1. Sonido de recurso obtenido (cuando el jugador gana recursos)
    2. Pulso de daño recibido (cuando el jugador recibe daño)
    3. Sonido de victoria (al ganar un combate)
    4. Sonido de derrota (cuando el jugador pierde la run)

_(example)_
Sound: EnergyImpact
Trigger: Cuando el tablero enemigo recibe daño
Duración: 0.7s
Tipo: Impacto energético
Volumen: Alto
### **Music Needed**

1. Tema de planificación del tablero (Música ambiental calmada mientras el jugador coloca y organiza las piezas.)
2. Tema de combate automático (Música electrónica con ligera tensión mientras el sistema ejecuta las rondas.)
3. Tema de mapa / exploración de nodos (Música ambiental suave que acompaña la toma de decisiones entre combates.)
4. Tema de jefe (Música más intensa que aumenta la tensión durante el combate final de la run.)
5. Tema de créditos finales (Música calmada y satisfactoria que cierre la experiencia del juego.)

_(example)_
Track: BossBattleTheme
Situación: Combate contra el jefe final
Estilo: Electrónica intensa
Intensidad: Alta
Loop: Sí

## _Schedule_

---

_(define the main activities and the expected dates when they should be finished. This is only a reference, and can change as the project is developed)_

1. Desarrollo de clases base - Semana 5
    1. Piezabase 
        1. BaseGenerador
        2. BaseTransformador
        3. BaseCatalizador
        4. BaseAncla
    2. TableroBase
    2. TableroBase
    3. CombateBase
    4. NodoBase
2. Desarrollo del sistema del tablero - Semana 5
    1. Grid Hexagonal(5 x 5)
    2. Sistema para colocar y remover piezas 
    3. Sistema de detección de vecinos
3. Implementación del sistema de combate — Semana 6
    1. Orden de resolucion de piezas
        1. Genradores
        2. Transformadores
        3. Catalizadores
        4. Anclas
    2. Sistema de calculo de daño
4. Desarrollo de clases derivadas — Semana 6-7
    1. BaseGenerador
        1. GeneradorEnergia
        2. GeneradorCalor
        3. GenradorPresion
        4. GeneradorCorriente
    2. BaseTransformador
        1. TransformadorDaño
        2. TransformadorEscudo
        3. TransformadorEstado
    3. BaseCatalizador
        1. CatalizadorAmplificador
    4. BaseAncla
        1. AnclaReduceDaño
        2. AnclaReflejaDaño
        3. AnclaRegeneraRecursos
5. Desarrollo del sistema de mapa — Semana 7
    1. Generación nodos del mapa
    2. Implementacion de nodos
        1. NodoCombate
        2. NodoElite
        3. NodoTienda
        4. NodoEvento
        5. NodoJefe
    3. Implementacion de niveles
6. Diseño visual y efectos — Semana 8
    1. Diseño del tablero
    2. Diseño de piezas 
    3. Implementación de efectos visuales
7. Diseño de audio — Semana 8
    1. Diseño de efectos de sonido
    2. Diseño de música ambiental
    3. Integración del audio en el juego

_(example)_
Actividad: Sistema de tablero
Tareas: Grid hexagonal, colocación de piezas, detección de vecinos
Fecha estimada: Semana 5
