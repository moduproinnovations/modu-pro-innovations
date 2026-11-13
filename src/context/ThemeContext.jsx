import React, { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} });
const STORAGE_KEY = 'modu-theme';

export function ThemeProvider({ children }) {
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      /* ignore */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#0A1428');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
