# Terminal de Confluencia

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
node scripts/build-artifact.mjs   # index.html -> dist/terminal-confluencia.part.html
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
