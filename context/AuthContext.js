import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as Crypto from 'expo-crypto';
import {
  getAccount,
  createAccount,
  verifyCredentials,
  getSession,
  setSession,
  clearSession,
} from '../services/storage';

const AuthContext = createContext(null);

async function hashPassword(password) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accountExists, setAccountExists] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      const [account, session] = await Promise.all([getAccount(), getSession()]);
      setAccountExists(!!account);
      if (account && session?.email === account.email) {
        setUser({ name: account.name, email: account.email });
      }
      setInitializing(false);
    })();
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const existing = await getAccount();
    if (existing) {
      throw new Error('An account already exists on this device. Please log in instead.');
    }
    const passwordHash = await hashPassword(password);
    const account = await createAccount({ name: name.trim(), email: email.trim(), passwordHash });
    await setSession({ email: account.email });
    setAccountExists(true);
    setUser({ name: account.name, email: account.email });
    return account;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const passwordHash = await hashPassword(password);
    const account = await verifyCredentials(email, passwordHash);
    if (!account) {
      throw new Error('Incorrect email or password.');
    }
    await setSession({ email: account.email });
    setUser({ name: account.name, email: account.email });
    return account;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn: !!user, accountExists, initializing, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}