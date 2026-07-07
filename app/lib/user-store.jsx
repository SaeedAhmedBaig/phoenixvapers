"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getMe, loginAccount, logoutAccount, refreshSession, registerAccount } from "./api";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refreshSession()
      .then(async () => {
        const me = await getMe();
        setUser(me);
      })
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    const res = await loginAccount({ email, password });
    setUser(res.user);
    return res.user;
  }

  async function register(email, password, name, phone) {
    const res = await registerAccount({ email, password, name, phone });
    setUser(res.user);
    return res.user;
  }

  async function logout() {
    await logoutAccount().catch(() => undefined);
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
