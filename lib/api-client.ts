import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiError extends Error {
  status?: number;
  code?: string;
}

async function request<T>(
  path: string,
  options: RequestInit & { method?: HttpMethod } = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    const extraHeaders = options.headers as HeadersInit;
    if (Array.isArray(extraHeaders)) {
      for (const [key, value] of extraHeaders) {
        headers[key] = value;
      }
    } else if (extraHeaders instanceof Headers) {
      extraHeaders.forEach((value, key) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, extraHeaders);
    }
  }

  // Attach auth token from localStorage when available (client-side only)
  if (typeof window !== "undefined") {
    const auth = JSON.parse(
      window.localStorage.getItem("auth_token") as string,
    );
    if (auth) {
      headers.Authorization = `Bearer ${auth.token}`;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const error: ApiError = new Error(
      (data && (data.error as string)) || "Request failed",
    );
    error.status = response.status;
    error.code = data?.code;
    toast.error(
      typeof data.error === "object" && data.error !== null
        ? JSON.stringify(data.error)
        : data.error,
    );
    throw error;
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" as HttpMethod });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  init?: Omit<RequestInit, "method" | "body">,
): Promise<T> {
  return request<T>(path, {
    ...(init || {}),
    method: "PATCH" as HttpMethod,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  } as RequestInit & { method: HttpMethod });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  init?: Omit<RequestInit, "method" | "body">,
): Promise<T> {
  return request<T>(path, {
    ...(init || {}),
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  } as RequestInit & { method: HttpMethod });
}

export function apiPut<T>(
  path: string,
  body?: unknown,
  init?: Omit<RequestInit, "method" | "body">,
): Promise<T> {
  return request<T>(path, {
    ...(init || {}),
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  } as RequestInit & { method: HttpMethod });
}

export function apiDelete<T>(
  path: string,
  init?: Omit<RequestInit, "method">,
): Promise<T> {
  return request<T>(path, {
    ...(init || {}),
    method: "DELETE",
  } as RequestInit & { method: HttpMethod });
}

// SWR-compatible fetcher: key is the path (e.g. "/students?page=1&limit=10")
export function swrFetcher<T>(path: string): Promise<T> {
  return apiGet<T>(path);
}
