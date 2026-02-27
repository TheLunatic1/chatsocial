import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Load saved preference
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem('isDark');
        if (saved !== null) {
          setIsDark(JSON.parse(saved));
        }
      } catch (e) {}
    };
    load();
  }, []);

  const toggleDarkMode = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    try {
      await AsyncStorage.setItem('isDark', JSON.stringify(newValue));
    } catch (e) {}
  };

  const theme = {
    isDark,
    colors: isDark
      ? {
          background: '#121212',
          card: '#1e1e1e',
          text: '#e0e0e0',
          textSecondary: '#b0b0b0',
          primary: '#bb86fc',
          accent: '#03dac6',
          error: '#cf6679',
          border: '#333333',
          header: '#1f1f1f',
          tabActive: '#bb86fc',
          fab: '#03dac6',
        }
      : {
          background: '#f8f9fa',
          card: '#ffffff',
          text: '#212529',
          textSecondary: '#6c757d',
          primary: '#6f42c1',
          accent: '#20c997',
          error: '#dc3545',
          border: '#dee2e6',
          header: '#6f42c1',
          tabActive: '#6f42c1',
          fab: '#20c997',
        },
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};