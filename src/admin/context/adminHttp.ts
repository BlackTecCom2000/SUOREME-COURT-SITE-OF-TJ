// SEC-05: single transport for all admin API calls.
// Authentication travels in the httpOnly `cms_token` cookie (credentials:include).
// No JWT is ever kept in sessionStorage/localStorage/JS variables.
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || undefined);
  if (init.body != null && typeof init.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(path, { ...init, headers, credentials: 'include' });
}

export async function apiJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    let detail = '';
    try {
      const data = await res.json();
      detail = (data && (data.error as string)) || '';
    } catch {
      /* non-JSON error */
    }
    throw new Error(detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
