import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  currentUserRequest,
  loginRequest,
  registerRequest,
} from "../api/auth";

import {
  clearStoredToken,
  getStoredToken,
  storeToken,
} from "../storage/auth-storage";

import type {
  User,
} from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;

  logout: () => Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextValue | null
  >(null);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const restoreSession =
    useCallback(
      async () => {
        try {
          const token =
            await getStoredToken();

          if (!token) {
            setUser(null);
            return;
          }

          const profile =
            await currentUserRequest();

          setUser(
            profile,
          );
        } catch {
          await clearStoredToken();
          setUser(null);
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    const timeoutId =
      setTimeout(() => {
        void restoreSession();
      }, 0);

    return () => {
      clearTimeout(
        timeoutId,
      );
    };
  }, [
    restoreSession,
  ]);

  async function login(
    email: string,
    password: string,
  ) {
    const token =
      await loginRequest(
        email,
        password,
      );

    await storeToken(
      token.access_token,
    );

    const profile =
      await currentUserRequest();

    setUser(profile);
  }

  async function register(
    fullName: string,
    email: string,
    password: string,
  ) {
    await registerRequest(
      fullName,
      email,
      password,
    );

    await login(
      email,
      password,
    );
  }

  async function logout() {
    await clearStoredToken();

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider.",
    );
  }

  return context;
}
