# Dashboard Trading Operation

Dashboard local para preparar una operación a partir de **cuatro capturas del
mismo activo en distintas temporalidades**. Se cargan los gráficos, se marca el
sesgo de cada uno, y la herramienta calcula el sesgo ponderado, coloca entrada,
stop y objetivos sobre el eje de precio real y saca el tamaño de posición.

Una sola página, sin dependencias, sin build y sin servidor: **abre
`index.html` con doble clic** y ya funciona. Todo se queda en tu navegador —
las capturas no se suben a ningún sitio.

## Qué hace

**Evidencia.** Cuatro huecos, uno por temporalidad (1D / 4H / 1H / 15m, o las
que quieras). Las capturas se cargan por clic, arrastre o `ctrl+v`, con lupa
para verlas a tamaño completo. Se reescalan antes de guardarse en el navegador,
y si no caben la página lo dice en vez de fallar en silencio.

**Confluencia.** Cada temporalidad vota en una escala de cinco
(`↓↓ ↓ = ↑ ↑↑`) y pesa según su altura: 40/30/20/10. De ahí sale un veredicto
de largo, corto o sin sesgo, con el desglose de lo que aporta cada una.

**Niveles.** Tabla editable de soportes y resistencias que alimenta al resto.

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
sola petición para los veinte. Si no hay conexión —o si la página se abre como
artefacto de claude.ai, cuya CSP bloquea las peticiones a dominios externos— se
conserva el último precio guardado y se avisa; el campo de precio sigue siendo
editable a mano. Con `[otro]` se puede escribir cualquier par que no esté en la
lista.

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

## Estado

Probado en Chromium: carga de imágenes, lupa, arrastre de los cinco tiradores,
control por teclado, cambio entre largo y corto, sugerencia automática desde
los niveles, parseo de números en formato español (`78.805,24`), persistencia
entre recargas y sin desbordamiento horizontal a 390 px de ancho.
