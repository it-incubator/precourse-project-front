import { getStoredBaseUrl } from "../store/useBaseUrl";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class HttpError extends Error {
  status: number;
  body?: unknown;
  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** Универсальный запрос с авто baseUrl и обработкой ошибок */
export async function api<T>(
  method: HttpMethod,
  path: string,
  body?: Record<string, unknown> | undefined,
  query?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const base = getStoredBaseUrl().replace(/\/+$/, ""); // trim trailing /
  if (!base) throw new Error("Base URL is empty. Set it in header.");

  const url = new URL(base + path);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  // try to parse json/text for better message
  let payload: unknown = undefined;
  const text = await res.text();
  try { payload = text ? JSON.parse(text) : undefined; } catch { payload = text; }

  if (!res.ok) {
    const msg = typeof payload === "string"
      ? payload
      : (payload && typeof payload === "object" && "error" in payload ? (payload as any).error : res.statusText || "Request error");
    throw new HttpError(res.status, msg as string, payload);
  }

  return (text ? (typeof payload === "string" ? (payload as unknown as T) : (payload as T)) : (undefined as T));
}

export const http = {
  get: <T>(path: string, query?: Record<string, unknown>) => api<T>("GET", path, undefined, query),
  post: <T>(path: string, body?: Record<string, unknown>, query?: Record<string, unknown>) => api<T>("POST", path, body, query),
  put:  <T>(path: string, body?: Record<string, unknown>, query?: Record<string, unknown>) => api<T>("PUT",  path, body, query),
  del:  <T>(path: string, query?: Record<string, unknown>) => api<T>("DELETE", path, undefined, query),
};
