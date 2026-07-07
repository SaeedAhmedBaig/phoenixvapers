"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginAccount, logoutAccount, refreshSession, registerAccount } from "./api";

const UserContext = createContext(null);

// Access tokens expire after 15 minutes (JWT_ACCESS_TTL); refresh well before
// that so long browsing sessions never start failing with 401s mid-action.
const TOKEN_REFRESH_MS = 10 * 60 * 1000;

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refreshSession()
      .then(async (res) => {
        setAccessToken(res.accessToken);
        const me = await getMe(res.accessToken);
        setUser(me);
      })
      .catch(() => {
        setUser(null);
        setAccessToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!accessToken) return undefined;
    const id = setInterval(() => {
      refreshSession()
        .then((res) => setAccessToken(res.accessToken))
        .catch(() => undefined);
    }, TOKEN_REFRESH_MS);
    return () => clearInterval(id);
  }, [accessToken]);

  async function login(email, password) {
    const res = await loginAccount({ email, password });
    setUser(res.user);
    setAccessToken(res.accessToken);
    return res.user;
  }

  async function register(email, password, name, phone) {
    const res = await registerAccount({ email, password, name, phone });
    setUser(res.user);
    setAccessToken(res.accessToken);
    return res.user;
  }

  async function logout() {
    await logoutAccount().catch(() => undefined);
    setUser(null);
    setAccessToken(null);
  }

  return (
    <UserContext.Provider value={{ user, accessToken, ready, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
