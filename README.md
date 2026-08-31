# Dashboard Trading Operation

Dashboard local para preparar una operación a partir de **cuatro capturas del
mismo activo en distintas temporalidades**. Se cargan los gráficos, se marca el
sesgo de cada uno, y la herramienta calcula el sesgo ponderado, coloca entrada,
stop y objetivos sobre el eje de precio real y saca el tamaño de posición.

Una sola página, sin dependencias, sin build y sin servidor: **abre
`index.html` con doble clic** y ya funciona. Todo se queda en tu navegador —
las capturas no se suben a ningún sitio.

## Qué hace

**Flujo.** Al abrir solo se ve la cabecera y los cuatro huecos: el análisis
llega plegado y se despliega al completar la cuarta captura. Arriba,
`nuevo análisis` limpia y vuelve al inicio; `ver el último análisis` reabre el
que hubiera guardado, con sus capturas. Al recargar siempre se arranca en el
inicio, sin perder nada.

**Evidencia.** Cuatro huecos, uno por temporalidad (1D / 4H / 1H / 15m, o las
que quieras). Las capturas se cargan por clic, arrastre o `ctrl+v`, con lupa
para verlas a tamaño completo. Se reescalan antes de guardarse en el navegador,
y si no caben la página lo dice en vez de fallar en silencio.

**Confluencia.** Cada temporalidad vota en una escala de cinco
(`↓↓ ↓ = ↑ ↑↑`) y pesa según su altura: 40/30/20/10. De ahí sale un veredicto
de largo, corto o sin sesgo, con el desglose de lo que aporta cada una.

**Plegado.** Niveles y Mapa de operación se abren y cierran desde el triángulo
de su cabecera, y recuerdan cómo los dejaste. Niveles llega plegada: se
consulta de vez en cuando, no en cada trade. Con el mapa cerrado, su cabecera
resume la operación en una línea (`largo · 2,33 R`).

**Niveles.** Una línea por nivel: el precio y su temporalidad. Si es soporte o
resistencia no se marca, se deduce de su posición respecto al precio —así no se
queda desfasado cuando el precio se mueve— y se ve como una letra de color.

**Mapa de operación.** Entrada, stop y tres objetivos dibujados sobre el eje de
precio, arrastrables con el ratón o con el teclado (flechas, `shift` para
saltos de diez) e imantados a los niveles cercanos. El R:R y los recorridos en
porcentaje se recalculan mientras arrastras.

**Riesgo.** El tamaño de posición sale del stop, nunca al revés. Avisa cuando
el margen no cabe en la cuenta o cuando el riesgo pasa del 2 %, y desglosa el
resultado de cada escenario. La divisa y el símbolo base se leen del par:
`BTC/USDT` da tamaño en BTC y cifras en USDT.

**Activo y precio.** Un desplegable con los veinte pares en USDT de mayor
volumen de Binance, cada uno con su precio y su variación del día. Al abrir la
página se pide el precio del par elegido a la API pública de Binance, en una
sola petición para los veinte. Se prueban cuatro hosts en orden
(`data-api.binance.vision` primero, que es el de datos públicos y el menos
restringido), porque el bloqueo suele ser de un dominio concreto y no de
Binance entera; si ninguno responde, el aviso dice por qué —bloqueo por
región, acceso denegado, sin conexión— en vez de repetir el error del
navegador. Si no hay conexión —o si la página se abre como
artefacto de claude.ai, cuya CSP bloquea las peticiones a dominios externos— se
conserva el último precio guardado y se avisa; el campo de precio sigue siendo
editable a mano. La última opción del desplegable, `otro par…`, abre un campo para escribir
cualquier par que no esté en la lista —un futuro, un cruce raro—; de ese no
habrá precio automático y se escribe a mano.

**Avisos de coherencia.** La página no puede leer lo que pone dentro de un PNG,
así que no adivina qué activo muestra una captura. Lo que sí hace es recordar
con qué par estaba seleccionado cuando se soltó cada una, y avisar si luego se
cambia de activo. Avisa también cuando el precio se sale por completo del rango
de niveles cargados, que es la señal de que los niveles son de otro activo o de
otra época.

**Estrategias.** Cuatro botones que releen los mismos niveles de cuatro
maneras distintas y guardan cada resultado como una operación con su hora, para
poder saltar de una a otra en el desplegable y comparar:

| Estrategia | Horizonte | Régimen | Qué hace |
|---|---|---|---|
| Ruptura de rango | swing | tendencia | Entra al superar el techo del rango y proyecta su altura. Acierta poco, pero el ganador medio es varias veces el perdedor medio. |
| Retroceso en tendencia | swing | tendencia | Compra la corrección al primer soporte, con el stop detrás de la siguiente estructura. Es la de mayor porcentaje de aciertos. |
| Barrido de liquidez | intradía | cualquiera | Entra en el nivel que acaba de barrer los stops, con el stop pegado bajo la mecha. R:R alto por lo ceñido del stop. |
| Vuelta al rango | intradía | rango | Reversión a la media: opera contra el extremo buscando el centro. La dirección la marca la posición del precio, no el sesgo. |

Cada una ocupa una columna con su título, su horizonte y su régimen, el
resumen de lo que lee en tus gráficos, y el veredicto: o la operación completa
(dirección, entrada, stop, objetivo y R:R), o un `no es momento de entrar` con
el motivo. Saber cuándo quedarse fuera vale tanto como la entrada.

Las de swing usan solo los niveles de temporalidad alta (4H en adelante) y un
rango de vela tres veces mayor; las de intradía usan todos. La sección marca
cuáles encajan con el régimen de ahora mismo: con el sesgo marcado mandan las
de tendencia, y con las temporalidades en desacuerdo mandan las de reversión.

Las cifras de referencia salen de backtests publicados, no de uno propio: son
un punto de partida razonable, no una promesa de resultados.

**Validación y plan.** Nueve puntos de checklist, de los que seis se marcan
solos a partir de los datos ya introducidos: si la temporalidad mayor acompaña,
si hay tres a favor, si el R:R llega a 1,5, si el margen cabe. El resultado es
un plan en texto listo para copiar al diario.

## Uso

```bash
# opción 1: abrir el fichero directamente
open index.html          # macOS
xdg-open index.html      # Linux

# opción 2: servirlo, si prefieres una URL
python3 -m http.server 8000   # luego http://localhost:8000
```

No hace falta instalar nada. El único script del repo genera el fragmento que
se publica como artefacto en claude.ai:

```bash
node scripts/build-artifact.mjs   # index.html -> dist/dashboard-trading-operation.part.html
```

`index.html` es la fuente; `dist/` no se versiona.

## Diseño

Estética de terminal: solo oscuro, JetBrains Mono en toda la hoja, esquinas de
2px, secciones `▸ título` con comentarios `//`, botones entre corchetes y filas
tipo `diff` para los resultados. Los colores son tokens (`--green` positivo,
`--red` negativo, `--amber` acento, `--orange`/`--blue` para resistencia y
soporte), nunca nombres de color sueltos. Toda animación respeta
`prefers-reduced-motion`.

## Lo que la app NO hace

No analiza las capturas. No hay lectura de gráficos, ni OCR, ni modelo de
visión: las cuatro imágenes se guardan y se muestran para que las mires tú.
Todo lo que calcula sale de lo que introduces —el sesgo de cada temporalidad,
los niveles, el rango de vela— más el precio de Binance. Las estrategias son
aritmética sobre esos números. Es una calculadora disciplinada, no un analista:
el criterio lo pones tú, y lo que aporta es no dejarte saltar pasos ni mentirte
con el tamaño de posición.

## Móvil

Está pensada para usarse desde el teléfono, que es donde se hacen las capturas.
Auditada y medida a 360, 390 y 430 px: sin desbordamiento horizontal, todos los
objetivos táctiles por encima de 32 px de alto, los seis destinos del pie
alcanzables sin scroll, y los tiradores del mapa arrastrables con el dedo sin
que el mapa secuestre el desplazamiento de la página.

Dos controles viven fuera de su tarjeta porque en una columna de 85 px no
serían tocables: el sesgo y la nota de la temporalidad seleccionada están bajo
la tira de capturas, y se cambia de temporalidad tocando otra captura.

## Estado

Probado en Chromium: flujo de inicio y despliegue, carga de imágenes, lupa con
salto entre capturas, las cuatro estrategias, operaciones guardadas, arrastre
de los cinco tiradores con ratón, teclado y dedo, cambio entre largo y corto,
parseo de números en formato español (`78.805,24`) y persistencia entre
recargas.
