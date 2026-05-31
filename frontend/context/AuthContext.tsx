"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:50000/api";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  birthday: string | null;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  createdAt: string | null;
};

type LoginPayload = {
  identifier: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  birthday?: string;
};

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

type AuthContextValue = {
  user: AuthUser | null;
  initialized: boolean;
  refreshUser: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<ActionResult<{ user: AuthUser }>>;
  register: (
    payload: RegisterPayload,
  ) => Promise<ActionResult<{ message: string }>>;
  logout: () => Promise<void>;
  resendVerification: (
    identifier: string,
  ) => Promise<ActionResult<{ message: string }>>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseResponse<T>(response: Response): Promise<ActionResult<T>> {
  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error: payload?.error || "Something went wrong.",
      code: payload?.code,
    };
  }

  return {
    ok: true,
    data: payload as T,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initialized, setInitialized] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        credentials: "include",
      });
      const result = await parseResponse<{ user: AuthUser }>(response);
      if (result.ok) {
        setUser(result.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await parseResponse<{ user: AuthUser }>(response);
      if (result.ok) {
        setUser(result.data.user);
      }
      return result;
    } catch {
      return { ok: false as const, error: "Could not connect to the server." };
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return parseResponse<{ message: string }>(response);
    } catch {
      return { ok: false as const, error: "Could not connect to the server." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }, []);

  const resendVerification = useCallback(async (identifier: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      return parseResponse<{ message: string }>(response);
    } catch {
      return { ok: false as const, error: "Could not connect to the server." };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      initialized,
      refreshUser,
      login,
      register,
      logout,
      resendVerification,
    }),
    [
      initialized,
      login,
      logout,
      refreshUser,
      register,
      resendVerification,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
