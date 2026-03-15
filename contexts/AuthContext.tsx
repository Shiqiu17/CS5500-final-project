"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthUser = {
  id: string;
  username: string;
  email: string;
  name?: string;
};

type AuthState = {
  isLoggedIn: boolean;
  isLoading: boolean;
  user: AuthUser | null;
};

type AuthContextType = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = "http://localhost:3000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isLoggedIn: true,
          isLoading: false,
          user,
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ isLoggedIn: false, isLoading: false, user: null });
      }
    } else {
      setAuthState({ isLoggedIn: false, isLoading: false, user: null });
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
      }));

      setAuthState({
        isLoggedIn: true,
        isLoading: false,
        user: {
          id: data.user.id.toString(),
          username: data.user.username,
          email: data.user.email,
          name: data.user.name,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string, name?: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, name }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user.id.toString(),
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
      }));

      setAuthState({
        isLoggedIn: true,
        isLoading: false,
        user: {
          id: data.user.id.toString(),
          username: data.user.username,
          email: data.user.email,
          name: data.user.name,
        },
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      isLoggedIn: false,
      isLoading: false,
      user: null,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}