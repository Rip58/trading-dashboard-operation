/**
 * Puente entre el navegador y la API RouteLLM de Abacus.
 *
 * Existe por una razón: la clave vive en las variables de entorno de Vercel y
 * no debe bajar nunca al navegador. El cliente manda los mensajes aquí, esta
 * función les pone la clave y reenvía la llamada.
 *
 * Variables de entorno (Vercel → Settings → Environment Variables):
 *   ABACUS_API_KEY    obligatoria. La clave de RouteLLM.
 *   ABACUS_MODELO     opcional. Modelo por defecto; si no, "route-llm".
 *   ABACUS_URL        opcional. Endpoint completo; si no, el de RouteLLM.
 *   DASHBOARD_CLAVE   opcional pero MUY recomendable. Si está puesta, hay que
 *                     mandarla en la cabecera x-clave. Sin ella, cualquiera
 *                     que conozca la URL gasta de tu cuenta de Abacus.
 *
 * CommonJS a propósito: el proyecto no tiene package.json y así Vercel lo
 * detecta como función sin necesidad de configurar nada.
 */

// Se lee en cada petición, no al cargar el módulo: así el entorno siempre
// manda, y se puede apuntar a otro endpoint para probar sin tocar el código.
function urlAbacus(){
  return process.env.ABACUS_URL || "https://routellm.abacus.ai/v1/chat/completions";
}
const LIMITE_CUERPO = 12 * 1024 * 1024;   // cuatro capturas en base64 caben de sobra

module.exports = async function handler(req, res) {
  res.setHeader("cache-control", "no-store");

  // Estado: le dice al cliente si el servidor está listo, sin revelar nada.
  if (req.method === "GET") {
    return res.status(200).json({
      listo: Boolean(process.env.ABACUS_API_KEY),
      modelo: process.env.ABACUS_MODELO || "route-llm",
      protegido: Boolean(process.env.DASHBOARD_CLAVE),
    });
  }

  if (req.method !== "POST") {
    res.setHeader("allow", "GET, POST");
    return res.status(405).json({ error: "usa GET para el estado o POST para analizar" });
  }

  const clave = process.env.ABACUS_API_KEY;
  if (!clave) {
    return res.status(503).json({
      error: "el servidor no tiene ABACUS_API_KEY configurada en Vercel",
    });
  }

  // Puerta opcional. Comparación de longitud constante para no filtrar el
  // secreto por el tiempo de respuesta.
  const esperada = process.env.DASHBOARD_CLAVE;
  if (esperada) {
    const dada = String(req.headers["x-clave"] || "");
    if (!igual(dada, esperada)) {
      return res.status(401).json({ error: "clave de acceso incorrecta o ausente" });
    }
  }

  let cuerpo = req.body;
  if (typeof cuerpo === "string") {
    try { cuerpo = JSON.parse(cuerpo); } catch { cuerpo = null; }
  }
  if (!cuerpo || !Array.isArray(cuerpo.messages) || !cuerpo.messages.length) {
    return res.status(400).json({ error: "faltan los mensajes" });
  }
  if (JSON.stringify(cuerpo).length > LIMITE_CUERPO) {
    return res.status(413).json({ error: "la petición pesa demasiado: reduce las capturas" });
  }

  const peticion = {
    model: cuerpo.model || process.env.ABACUS_MODELO || "route-llm",
    messages: cuerpo.messages,
    max_tokens: Math.min(Number(cuerpo.max_tokens) || 3000, 8000),
  };

  // La app manda temperature 0 en el paso que construye el JSON: ahí no
  // queremos creatividad, queremos aritmética repetible. Se reenvía solo si
  // viene un número válido, para no romper modelos que no lo acepten.
  const temp = Number(cuerpo.temperature);
  if (Number.isFinite(temp) && temp >= 0 && temp <= 2) peticion.temperature = temp;

  // Un análisis con cuatro imágenes puede tardar; se corta antes de que lo
  // haga la plataforma, para poder devolver un error legible.
  const corte = new AbortController();
  const alarma = setTimeout(() => corte.abort(), 55000);

  try {
    const r = await fetch(urlAbacus(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + clave,
      },
      body: JSON.stringify(peticion),
      signal: corte.signal,
    });
    clearTimeout(alarma);

    const texto = await r.text();
    if (!r.ok) {
      return res.status(r.status).json({
        error: recorta(texto) || "Abacus respondió " + r.status,
      });
    }
    try {
      return res.status(200).json(JSON.parse(texto));
    } catch {
      return res.status(502).json({ error: "Abacus devolvió algo que no es JSON" });
    }
  } catch (e) {
    clearTimeout(alarma);
    const motivo = e && e.name === "AbortError"
      ? "Abacus tardó más de 55 segundos"
      : (e && e.message) || "no se pudo conectar con Abacus";
    return res.status(504).json({ error: motivo });
  }
};

function igual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// El error de Abacus puede traer JSON anidado; se busca un mensaje legible.
function recorta(t) {
  try {
    const j = JSON.parse(t);
    const m = (j.error && (j.error.message || j.error)) || j.message || j.detail;
    if (m) return String(m).slice(0, 300);
  } catch { /* texto plano */ }
  return String(t || "").slice(0, 300);
}
