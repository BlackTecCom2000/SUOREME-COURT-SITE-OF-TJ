// Cross-platform HTTP fetch with timeout + size cap (replaces curl.exe).
// Redirects are followed by undici; DNS order (IPv4-first for TJ hosts)
// is set globally in server/index.ts via dns.setDefaultResultOrder.
export async function fetchCapped(
  url: string,
  opts: { timeoutMs?: number; maxBytes?: number; headers?: Record<string, string> } = {}
): Promise<Buffer> {
  const timeoutMs = opts.timeoutMs ?? 90000;
  const maxBytes = opts.maxBytes ?? 50 * 1024 * 1024;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'SUD-TJ/2.1 (+https://sud.tj)', ...(opts.headers || {}) },
    });
    if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        try { await reader.cancel(); } catch {}
        throw new Error('Response too large');
      }
      chunks.push(value);
    }
    const out = Buffer.allocUnsafe(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.byteLength;
    }
    return out;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Fetch timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
