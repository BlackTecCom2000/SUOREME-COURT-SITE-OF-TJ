// Cross-platform HTTP fetch with timeout + size cap (replaces curl.exe).
// M3 (SSRF): redirects are NOT auto-followed. Every hop (including the
// first) is re-validated against the caller's host allowlist and a
// private/loopback/link-local IP guard before the request is sent, so an
// allowlisted host cannot bounce the server to 127.0.0.1/169.254.169.254
// or any other internal address. DNS order (IPv4-first for TJ hosts) is
// set globally in server/index.ts via dns.setDefaultResultOrder.
import dns from 'node:dns';
import net from 'node:net';

const MAX_REDIRECTS = 5;

// True for loopback, RFC1918, link-local (incl. cloud metadata), CGNAT,
// multicast/reserved and IPv6 ULA/link-local/mapped equivalents.
export function isPrivateIp(ip: string): boolean {
  const addr = ip.replace(/^\[|\]$/g, '').toLowerCase();
  if (net.isIPv4(addr)) {
    const parts = addr.split('.').map(Number);
    const [a, b, c] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64/10
    if (a === 169 && b === 254) return true; // link-local + metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16/12
    if (a === 192 && (b === 0 || b === 168)) return true; // 192.0/16 specials + 192.168/16
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
    if (a === 198 && b === 51 && c === 100) return true; // TEST-NET-2
    if (a === 203 && b === 0 && c === 113) return true; // TEST-NET-3
    if (a >= 224) return true; // multicast / reserved / broadcast
    return false;
  }
  if (net.isIPv6(addr)) {
    if (addr === '::' || addr === '::1') return true;
    const v4 = addr.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (v4) return isPrivateIp(v4[1]);
    if (/^f[cd]/.test(addr)) return true; // fc00::/7 ULA
    if (/^fe[89ab]/.test(addr)) return true; // fe80::/10 link-local
    if (addr.startsWith('ff')) return true; // multicast
    return false;
  }
  return true; // unknown family — fail closed
}

// Validates one hop: protocol, host allowlist, resolved addresses public.
// Throws on any failure; returns the parsed URL on success.
export async function assertSafeTarget(rawUrl: string, allowHosts: string[]): Promise<URL> {
  let u: URL;
  try { u = new URL(rawUrl); } catch { throw new Error('Bad url'); }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('Bad protocol');
  const host = u.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  const allowed = allowHosts.some((h) => h.toLowerCase() === host);
  if (!allowed) throw new Error('Host not allowed');
  let addrs: { address: string }[];
  try {
    addrs = await dns.promises.lookup(host, { all: true });
  } catch {
    throw new Error('DNS lookup failed');
  }
  if (!addrs.length) throw new Error('DNS lookup failed');
  for (const a of addrs) {
    if (isPrivateIp(a.address)) throw new Error('Private address');
  }
  return u;
}

export async function fetchCapped(
  url: string,
  opts: { allowHosts: string[]; timeoutMs?: number; maxBytes?: number; headers?: Record<string, string> }
): Promise<Buffer> {
  const timeoutMs = opts.timeoutMs ?? 90000;
  const maxBytes = opts.maxBytes ?? 50 * 1024 * 1024;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let current = url;
    for (let hop = 0; ; hop++) {
      await assertSafeTarget(current, opts.allowHosts);
      const res = await fetch(current, {
        signal: ctrl.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'SUD-TJ/2.1 (+https://sud.tj)', ...(opts.headers || {}) },
      });
      if (res.status >= 300 && res.status < 400) {
        try { await res.body?.cancel(); } catch { /* already drained */ }
        if (hop >= MAX_REDIRECTS) throw new Error('Too many redirects');
        const loc = res.headers.get('location');
        if (!loc) throw new Error('Redirect without location');
        try {
          current = new URL(loc, current).toString();
        } catch {
          throw new Error('Bad redirect location');
        }
        continue;
      }
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
    }
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Fetch timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
