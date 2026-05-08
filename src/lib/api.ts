import { clearStoredAuth, getStoredToken } from "./auth";

type ApiFetchOptions = RequestInit & {
  requireAuth?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function apiFetch<T = unknown>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { requireAuth = true, headers, ...rest } = options;
  const token = getStoredToken();
  const requestUrl = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(requestUrl, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(requireAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    }
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "Request failed.";

    if (response.status === 401) {
      clearStoredAuth();
    }

    throw new Error(message);
  }

  return payload as T;
}
