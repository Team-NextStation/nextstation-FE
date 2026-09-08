import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAccessToken,
  getRole,
  restoreAccessToken,
  subscribeToAccessTokenChange,
} from "@/api/auth";
import {
  AuthContext,
  type AuthContextValue,
  type AuthStatus,
} from "@/contexts/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(() =>
    getAccessToken() ? "authenticated" : "checking",
  );

  useEffect(() => {
    let isCancelled = false;

    const syncStatus = (token: string | null) => {
      if (isCancelled) {
        return;
      }

      setStatus(token ? "authenticated" : "guest");
    };

    const unsubscribe = subscribeToAccessTokenChange(syncStatus);

    void restoreAccessToken().then(syncStatus);

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isLoggedIn: status === "authenticated",
      isChecking: status === "checking",
      isAdmin: status === "authenticated" && getRole() === "ADMIN",
    }),
    [status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
