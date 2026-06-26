import { getMetaDashboard } from "../../../lib/meta";
import manual from "../../../data/manual.json";

// Más tiempo de ejecución (muchas APIs externas). Hobby admite hasta 60s.
export const maxDuration = 60;

// Devuelve los últimos N meses (incluido el actual) como { key, since, until }.
function lastMonths(n) {
  const out = [];
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const p = (x) => String(x).padStart(2, "0");
  const ymd = (d) => `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
  for (let i = n - 1; i >= 0; i--) {
    const start = new Date(Date.UTC(y, m - i, 1));
    const end = new Date(Date.UTC(y, m - i + 1, 1));
    out.push({ key: `${start.getUTCFullYear()}-${p(start.getUTCMonth() + 1)}`, since: ymd(start), until: ymd(end) });
  }
  return out;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Caché en memoria para no golpear las APIs en cada visita.
let _cache = { at: 0, data: null };
const CACHE_MS = Number(process.env.DASHBOARD_CACHE_MS || 600000); // 10 min

export async function GET() {
  const now = Date.now();
  if (_cache.data && now - _cache.at < CACHE_MS) {
    return Response.json(_cache.data, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const months = lastMonths(Number(process.env.SOCIAL_MONTHS || 6));

    // Tierra Calma: solo Meta (Instagram orgánico + Meta Ads + mejores anuncios).
    const meta = await getMetaDashboard(months);

    const result = {
      updatedAt: new Date().toISOString(),
      months: meta.months,
      instagram: meta.instagram,
      ads: meta.ads,
      bestAds: meta.bestAds || null,
      manual: manual || null,
      errors: {
        ...meta.errors,
      },
    };

    // Solo cachea si al menos una fuente vino bien (no cachear fallos totales/transitorios).
    const anyOk = meta.instagram || meta.ads;
    if (anyOk) {
      _cache = { at: Date.now(), data: result };
      return Response.json(result, { headers: { "Cache-Control": "no-store" } });
    }
    if (_cache.data) {
      return Response.json({ ..._cache.data, stale: true }, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (_cache.data) {
      return Response.json({ ..._cache.data, stale: true }, { headers: { "Cache-Control": "no-store" } });
    }
    return Response.json(
      { error: String(err && err.message ? err.message : err) },
      { status: 500 }
    );
  }
}
