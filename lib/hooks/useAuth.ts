'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { api } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, space, token, setUser, setSpace, setToken, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await api.auth.me();
          setUser(response.data.user);
          if (response.data.space) {
            setSpace(response.data.space);
          }
        } catch (error) {
          console.error('Auth failed:', error);
          localStorage.removeItem('auth_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setUser, setSpace, setToken, setLoading]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.auth.login(email, password);
      const { token, user, space } = response.data;
      
      localStorage.setItem('auth_token', token);
      setToken(token);
      setUser(user);
      if (space) {
        setSpace(space);
      }
      
      router.push(space ? '/dashboard' : '/auth/create-space');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, firstName: string) => {
    setLoading(true);
    try {
      const response = await api.auth.signup(email, password, firstName);
      const { token, user } = response.data;
      
      localStorage.setItem('auth_token', token);
      setToken(token);
      setUser(user);
      
      router.push('/auth/create-space');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setSpace(null);
      router.push('/');
    }
  };

  const createSpace = async () => {
    setLoading(true);
    try {
      const response = await api.spaces.create();
      const { code } = response.data;
      return code;
    } finally {
      setLoading(false);
    }
  };

  const joinSpace = async (code: string) => {
    setLoading(true);
    try {
      const response = await api.spaces.join(code);
      const { space } = response.data;
      setSpace(space);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    space,
    token,
    isAuthenticated: !!token,
    login,
    signup,
    logout,
    createSpace,
    joinSpace,
  };
}

export function useRequireAuth() {
  const { user, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      router.push('/auth/login');
    }
  }, [token, router]);

  return { user, token, isAuthenticated: !!token };
}

export function useRequireSpace() {
  const { space } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!space && typeof window !== 'undefined') {
      router.push('/auth/create-space');
    }
  }, [space, router]);

  return { space, hasSpace: !!space };
}
