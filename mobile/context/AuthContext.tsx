import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiError, api } from '@/lib/api';
import type { AppUser, SessionResponse, SharedSpace } from '@/lib/types';

const TOKEN_KEY = 'a-deux.auth-token';

interface AuthContextValue {
  user: AppUser | null;
  space: SharedSpace | null;
  token: string | null;
  ready: boolean;
  bootError: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (firstName: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  createSpace: () => Promise<string>;
  joinSpace: (code: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(data: SessionResponse): { user: AppUser; space: SharedSpace | null; token: string } {
  if (!data.token || !data.user) {
    throw new Error('La réponse du serveur ne contient pas de session valide.');
  }
  return { user: data.user, space: data.space ?? null, token: data.token };
}

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [space, setSpace] = useState<SharedSpace | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const restoreSession = useCallback(async () => {
    setBootError(null);
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!storedToken) return;

      setToken(storedToken);
      const profile = await api.me(storedToken);
      if (!profile.user) throw new Error('Impossible de récupérer votre profil.');
      setUser(profile.user);
      setSpace(profile.space ?? null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setSpace(null);
      } else {
        setBootError(error instanceof Error ? error.message : 'Impossible de restaurer la session.');
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const acceptSession = async (data: SessionResponse) => {
    const session = readSession(data);
    await SecureStore.setItemAsync(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
    setSpace(session.space);
    setBootError(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    const profile = await api.me(token);
    if (!profile.user) throw new Error('Impossible de récupérer votre profil.');
    setUser(profile.user);
    setSpace(profile.space ?? null);
  };

  const login = async (email: string, password: string) => {
    await acceptSession(await api.login(email.trim(), password));
  };

  const signup = async (firstName: string, email: string, password: string) => {
    const response = await api.signup(firstName.trim(), email.trim(), password);
    if (response.needsEmailConfirmation) return true;
    await acceptSession(response);
    return false;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setUser(null);
    setSpace(null);
    setToken(null);
  };

  const createSpace = async () => {
    if (!token) throw new Error('Connectez-vous pour créer un espace.');
    const result = await api.createSpace(token);
    await refreshProfile();
    return result.code;
  };

  const joinSpace = async (code: string) => {
    if (!token) throw new Error('Connectez-vous pour rejoindre un espace.');
    await api.joinSpace(token, code.trim().toUpperCase().replace(/\s/g, ''));
    await refreshProfile();
  };

  const value = useMemo(
    () => ({
      user,
      space,
      token,
      ready,
      bootError,
      login,
      signup,
      logout,
      createSpace,
      joinSpace,
      refreshProfile,
      refreshSession: restoreSession,
    }),
    [user, space, token, ready, bootError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth doit être utilisé dans AuthProvider.');
  return value;
}
