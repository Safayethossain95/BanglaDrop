export type UserRole = "admin" | "supplier" | "super_admin";

export type AuthUser = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  is_active?: boolean;
};

type AuthState = {
  token: string;
  user: AuthUser;
};

const AUTH_STORAGE_KEY = "bangladrop-auth";

export function getStoredAuth(): AuthState | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function getStoredToken() {
  return getStoredAuth()?.token ?? null;
}

export function getStoredUser() {
  return getStoredAuth()?.user ?? null;
}

export function setStoredAuth(auth: AuthState) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getDefaultRouteForRole(role: UserRole) {
  if (role === "super_admin") return "/admin/dashboard";
  if (role === "supplier") return "/supplier/dashboard";
  return "/dashboard";
}
