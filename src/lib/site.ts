/**
 * Sitenin kök adresi. Öncelik sırası:
 * 1. NEXT_PUBLIC_SITE_URL (elle verilirse)
 * 2. Vercel'in üretim alan adı (VERCEL_PROJECT_PRODUCTION_URL — Vercel otomatik verir)
 * 3. Vercel önizleme adresi (VERCEL_URL)
 * 4. Yerel geliştirme
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const preview = process.env.VERCEL_URL
  const raw =
    explicit ||
    (production ? `https://${production}` : '') ||
    (preview ? `https://${preview}` : '') ||
    `http://localhost:${process.env.PORT || 3000}`
  return new URL(raw)
}
