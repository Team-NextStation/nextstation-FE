import { createContext } from "react";

export type AuthStatus = "checking" | "authenticated" | "guest";

export interface AuthContextValue {
  status: AuthStatus;
  isLoggedIn: boolean;
  isChecking: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
