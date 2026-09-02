# Intraday

Dashboard local para preparar **una operación intradía** a partir de **tres
capturas del mismo activo**: 4H, 1H y 15m. Se cargan los gráficos, la IA lee el
sesgo de cada uno, y la herramienta calcula el sesgo ponderado, coloca entrada,
stop y objetivos sobre el eje de precio real y saca el tamaño de posición.

Una sola página, sin dependencias, sin build y sin servidor: **abre
`index.html` con doble clic** y ya funciona. Todo se queda en tu navegador —
las capturas no se suben a ningún sitio.

## Qué hace

**Flujo.** Al abrir solo se ve la cabecera y los tres huecos: el análisis
llega plegado y se despliega al completar la tercera captura. Arriba,
`nuevo análisis` limpia y vuelve al inicio; `ver el último análisis` reabre el
que hubiera guardado, con sus capturas. Al recargar siempre se arranca en el
inicio, sin perder nada.

**Evidencia.** Tres huecos, uno por peldaño de la escalera: 4H, 1H y 15m. Las
capturas se cargan por clic, arrastre o `ctrl+v`, con lupa
para verlas a tamaño completo. Se reescalan antes de guardarse en el navegador,
y si no caben la página lo dice en vez de fallar en silencio.

**Confluencia.** La escalera del intradía, con el salto de factor 4-6x entre
peldaños del Triple Screen de Elder: **4H** fija la dirección permitida (peso
50), **1H** da la zona donde esperar (30) y **15m** el gatillo (20). De ahí sale
un veredicto de largo, corto o sin sesgo, con el desglose de lo que aporta cada
peldaño y su papel.

4H no vota: **veta**. Si va en contra de la dirección que sale de la suma, no
hay operación por mucho que 1H y 15m se pongan de acuerdo. Por encima de 4H no
se sube, porque una vela diaria no llega a cerrar dentro de una operación que se
abre y se cierra en el día.

Ese sesgo lo pone la IA al analizar las capturas; no se marca a mano. Sin
servidor de IA se queda en neutro, y con él la confluencia y las cuatro
estrategias quedan sin dirección: el resto de la app —niveles, mapa, riesgo,
checklist y plan— sigue funcionando.

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

| Estrategia | Régimen | Qué hace |
|---|---|---|
| Ruptura de rango | tendencia | Entra al superar el techo del rango y proyecta su altura. Acierta poco, pero el ganador medio es varias veces el perdedor medio. |
| Retroceso en tendencia | tendencia | Compra la corrección al primer soporte, con el stop detrás de la siguiente estructura. Es la de mayor porcentaje de aciertos. |
| Barrido de liquidez | cualquiera | Entra en el nivel que acaba de barrer los stops, con el stop pegado bajo la mecha. R:R alto por lo ceñido del stop. |
| Vuelta al rango | rango | Reversión a la media: opera contra el extremo buscando el centro. La dirección la marca la posición del precio, no el sesgo. |

Cada una ocupa una columna con su título y su régimen, el resumen de lo que lee
en tus gráficos, y el veredicto: o la operación completa (dirección, entrada,
stop, objetivo y R:R), o un `no es momento de entrar` con el motivo. Saber
cuándo quedarse fuera vale tanto como la entrada.

Las cuatro se calculan a la escala del intradía, sobre todos los niveles. La
sección marca cuáles encajan con el régimen de ahora mismo: con el sesgo marcado
mandan las de tendencia, y con las temporalidades en desacuerdo mandan las de
reversión.

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
node scripts/build-artifact.mjs   # index.html -> dist/intraday.part.html
```

`index.html` es la fuente; `dist/` no se versiona.

## Diseño

Estética de terminal: solo oscuro, JetBrains Mono en toda la hoja, esquinas de
2px, secciones `▸ título` con comentarios `//`, botones entre corchetes y filas
tipo `diff` para los resultados. Los colores son tokens (`--green` positivo,
`--red` negativo, `--amber` acento, `--orange`/`--blue` para resistencia y
soporte), nunca nombres de color sueltos. Toda animación respeta
`prefers-reduced-motion`.

## Análisis con IA (Abacus RouteLLM)

Sin servidor, la app no mira las capturas: las guarda y las muestra para que
las leas tú, y todo el cálculo sale del sesgo, los niveles y el rango que
introduces, más el precio de Binance.

Con la función desplegada hay dos botones, y hacen cosas distintas.

**`analizar con IA`** hace tres cosas, en este orden.

Primero **refresca el precio en Binance**, porque ese dato entra en los dos
prompts que vienen después. Luego van dos llamadas separadas:

1. **Ver.** Las tres capturas, y ningún formato que cumplir. Se le pide una
   lectura en prosa: estructura de cada gráfico, sesgo, y los niveles con su
   margen de error. Esto último importa más de lo que parece: el eje de precios
   de una captura de TradingView está comprimido, así que una mecha se lee con
   un error de decenas de puntos. El prompt pide el número *y* el margen, y
   permite escribir `NO LEGIBLE` donde no se lee. Un modelo al que se le exige
   rellenar un JSON mientras mira una imagen se inventa los precios que no
   consigue leer; sin campos que rellenar, puede decir que no los ve.
2. **Montar.** Sin imágenes, solo el texto de la anterior más los datos de
   mercado, y `temperature: 0`. Aquí sale el JSON con los sesgos, los niveles y
   la operación. El R:R, el orden de los objetivos y el lado del stop son
   aritmética, no criterio: conviene que salgan iguales dos veces seguidas con
   la misma lectura.

La segunda llamada no lleva imágenes, así que cuesta una fracción de la primera.

De ahí salen los sesgos, las notas y los niveles, que la app aplica y con los
que recalcula la confluencia y las cuatro estrategias.

### Los números que la IA no tiene que adivinar

Todo lo que se pueda pasar como número deja de ser una estimación visual. Los
dos prompts llevan, del ticker de Binance:

- el **precio exacto** de ahora mismo, con el host y la hora, y la instrucción
  de que manda sobre lo que marquen las capturas (que son de hace unos minutos);
- la **variación de 24 h**;
- el **máximo y el mínimo de 24 h**, que es la escala de volatilidad real del
  día y sirve para dimensionar el stop sin deducirlo de los píxeles. El prompt
  traduce ese rango a un orden de magnitud para el stop intradía, y pide que
  cualquier stop muy fuera de esa escala venga justificado.

Si Binance no responde, el prompt lo dice con esas palabras —precio escrito a
mano, sin confirmar— en vez de presentarlo como un dato fiable.

Y además propone **una operación intradía**, decidida con la escalera
4H → 1H → 15m y solo con ella: si 4H va en contra, no hay operación. Trae
entrada, stop, tres objetivos, el disparador que confirma la entrada, la
invalidación que mata la idea y qué hacer si falla. Si es operable se guarda como
una operación normal, así que aparece en el desplegable, se dibuja en el mapa y
se dimensiona con el panel de riesgo como cualquier otra.

El prompt le da permiso explícito para no proponer nada —y le prohíbe colar como
intradía algo que solo tendría sentido a días—: devuelve `no operar` y el
motivo, con la dirección en `null` y
los precios a cero. Un prompt que siempre encuentra un trade encuentra trades
malos.

Los dos primeros objetivos salen de niveles de la lectura. El tercero a veces no
tiene nada enfrente —por encima del máximo no hay estructura que leer—, así que
el prompt permite proyectarlo desde el rango de 24 h siempre que lo declare; en
la tarjeta aparece con un asterisco. Un objetivo proyectado y dicho es honesto;
un nivel inventado para rellenar el hueco, no.

**`pedir opinión sobre la activa`** es la segunda llamada, aparte: coge la
operación que tengas activa —venga de una estrategia, de la IA o montada a
mano— y la valora como lo haría un gestor de riesgo: a favor, con matices o en
contra, con los riesgos concretos y un ajuste. Entra en el plan que copias.

### La clave nunca llega al navegador

`api/analizar.js` es una función de Vercel que hace de puente: el navegador le
manda los mensajes, ella les pone la clave y llama a
[RouteLLM](https://routellm.abacus.ai/v1), que es compatible con OpenAI. La
clave vive solo en las variables de entorno.

Variables en **Vercel → Settings → Environment Variables**:

| Variable | Obligatoria | Para qué |
|---|---|---|
| `ABACUS_API_KEY` | sí | La clave de RouteLLM. |
| `DASHBOARD_CLAVE` | no, pero léete lo de abajo | Contraseña de acceso a la función. |
| `ABACUS_MODELO` | no | Modelo por defecto. Si no, `route-llm`. |
| `ABACUS_URL` | no | Otro endpoint, si Abacus cambia de ruta. |

**El despliegue es público, y ahí está el problema.** Sin `DASHBOARD_CLAVE`,
cualquiera que conozca la URL puede pulsar el botón y gastar tu cuota de
Abacus. Ponla: es una contraseña que te inventas, la escribes una vez en
ajustes y se queda en tu navegador. La app te avisa en rojo mientras no esté.
La alternativa es activar Deployment Protection en Vercel, que pide iniciar
sesión para todo.

`route-llm` deja que Abacus elija el modelo según el prompt; puedes forzar uno
escribiendo su nombre en ajustes. La respuesta dice a cuál enrutó.

Cada análisis consume tu cuota. En un fichero local o dentro del artefacto de
claude.ai no hay servidor, así que el botón queda desactivado y lo dice.

## Móvil

Está pensada para usarse desde el teléfono, que es donde se hacen las capturas.
Auditada y medida a 360, 390 y 430 px: sin desbordamiento horizontal, todos los
objetivos táctiles por encima de 32 px de alto, los seis destinos del pie
alcanzables sin scroll, y los tiradores del mapa arrastrables con el dedo sin
que el mapa secuestre el desplazamiento de la página.

La nota de la temporalidad seleccionada vive bajo la tira de capturas, porque
en una columna de 85 px no habría dónde escribir; se cambia de temporalidad
tocando otra captura. En cada miniatura, el glifo de color indica el sesgo que
leyó la IA.

## Estado

Probado en Chromium: flujo de inicio y despliegue, carga de imágenes, lupa con
salto entre capturas, las cuatro estrategias, operaciones guardadas, arrastre
de los cinco tiradores con ratón, teclado y dedo, cambio entre largo y corto,
parseo de números en formato español (`78.805,24`) y persistencia entre
recargas.
