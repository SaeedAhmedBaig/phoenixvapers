"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, loginAccount, logoutAccount, refreshSession } from "../../lib/api";

const AdminAuthContext = createContext(null);

const STAFF_ROLES = new Set(["staff", "brand-partner", "super-admin"]);

export function AdminAuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const loadMe = useCallback(async (token) => {
    const me = await getMe(token);
    setUser(me);
    return me;
  }, []);

  useEffect(() => {
    refreshSession()
      .then(async (res) => {
        setAccessToken(res.accessToken);
        await loadMe(res.accessToken);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email, password) {
    const res = await loginAccount({ email, password });
    if (!STAFF_ROLES.has(res.user.role)) {
      throw new Error("This account does not have staff access.");
    }
    setAccessToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }

  async function logout() {
    await logoutAccount().catch(() => undefined);
    setAccessToken(null);
    setUser(null);
  }

  const value = { accessToken, user, ready, login, logout, isStaff: user ? STAFF_ROLES.has(user.role) : false };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

/** Redirects to /admin/login unless a staff-role session is present. */
export function useRequireStaff() {
  const { ready, user, isStaff, accessToken } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && (!user || !isStaff)) {
      router.replace("/admin/login");
    }
  }, [ready, user, isStaff, router]);

  return { ready, user, isStaff, accessToken };
}
