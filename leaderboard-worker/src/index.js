// Leaderboard API for Neon Night Market, on Cloudflare Workers + D1.
//   GET  /board?country=taipei  -> { entries: [{ pid, name, score }] }  (top 50)
//   POST /submit { country, score, playerId, name }  -> { ok: true }
// Players are known by a random secret id kept on their device; only a hash of it
// (pid) is stored or shown, so nobody can post scores under someone else's name.

const COUNTRIES = ["taipei", "bangkok", "tokyo", "seoul", "newyork", "paris"]
const BOARD_SIZE = 50
const NAME_MAX = 16
// One night can't plausibly earn more than this; anything above is rejected
const MAX_SCORE = 50_000_000

function cors(env, request) {
  const allowed = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim())
  const origin = request.headers.get("origin") || ""
  const allow = allowed.includes("*") ? "*" : allowed.includes(origin) ? origin : allowed[0]
  return {
    "access-control-allow-origin": allow,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    vary: "origin",
  }
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json" } })
}

async function publicId(secret) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret))
  return Array.from(new Uint8Array(digest).slice(0, 6), (b) => b.toString(16).padStart(2, "0")).join("")
}

function cleanName(name) {
  return String(name).replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, NAME_MAX)
}

export default {
  async fetch(request, env) {
    const headers = cors(env, request)
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers })
    const url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/board") {
      const country = url.searchParams.get("country")
      if (!COUNTRIES.includes(country)) return json({ error: "unknown country" }, 400, headers)
      const { results } = await env.DB.prepare(
        "SELECT pid, name, score FROM scores WHERE country = ? ORDER BY score DESC, updated_at ASC LIMIT ?",
      )
        .bind(country, BOARD_SIZE)
        .all()
      return json({ entries: results }, 200, { ...headers, "cache-control": "public, max-age=30" })
    }

    if (request.method === "POST" && url.pathname === "/submit") {
      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: "bad json" }, 400, headers)
      }
      const { country, score, playerId } = body ?? {}
      const name = cleanName(body?.name ?? "")
      if (!COUNTRIES.includes(country)) return json({ error: "unknown country" }, 400, headers)
      if (!Number.isInteger(score) || score <= 0 || score > MAX_SCORE) return json({ error: "bad score" }, 400, headers)
      if (typeof playerId !== "string" || !/^[0-9a-f]{32}$/.test(playerId)) return json({ error: "bad player" }, 400, headers)
      if (!name) return json({ error: "name required" }, 400, headers)
      const pid = await publicId(playerId)
      await env.DB.prepare(
        `INSERT INTO scores (country, pid, name, score, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT (country, pid) DO UPDATE SET
           name = excluded.name,
           score = MAX(scores.score, excluded.score),
           updated_at = CASE WHEN excluded.score > scores.score THEN excluded.updated_at ELSE scores.updated_at END`,
      )
        .bind(country, pid, name, score, Date.now())
        .run()
      return json({ ok: true }, 200, headers)
    }

    return json({ error: "not found" }, 404, headers)
  },
}
