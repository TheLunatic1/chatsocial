import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { auth } from './firebase'; // add this
import { signInWithCustomToken } from 'firebase/auth';

export const AuthContext = createContext();

const API_URL = 'http://192.168.0.105:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('userToken');
        const storedUser = await SecureStore.getItemAsync('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (err) {
        console.error('Failed to load auth', err);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/register`, { name, email, password });
      const { token, firebaseToken, user } = res.data;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


      // Sign in to Firebase with custom token
      await signInWithCustomToken(auth, firebaseToken);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/login`, { email, password });
      const { token, firebaseToken, user } = res.data;

      await SecureStore.setItemAsync('userToken', token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));

      setToken(token);
      setUser(user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;


      // Sign in to Firebase with custom token
      await signInWithCustomToken(auth, firebaseToken);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];

    await auth.signOut(); // logout from Firebase
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};