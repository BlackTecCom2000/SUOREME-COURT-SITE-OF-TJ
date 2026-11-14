const API_WORKER_ORIGIN = 'https://sud-tj-api.djaborov2000.workers.dev';

export async function onRequest({ request }) {
  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, API_WORKER_ORIGIN);

  return fetch(new Request(upstreamUrl, request));
}
