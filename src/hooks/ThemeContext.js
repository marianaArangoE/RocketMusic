// src/hooks/ThemeContext.js
import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(true);
  const toggle = () => setDark(d => !d);

  // En lugar de JSX, crea el div con createElement:
  return React.createElement(
    ThemeContext.Provider,
    { value: { dark, toggle } },
    React.createElement('div',
      { className: dark ? 'dark-mode' : 'light-mode' },
      children
    )
  );
}
