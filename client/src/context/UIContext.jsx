import { createContext, useMemo, useState } from 'react';

export const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const value = useMemo(
    () => ({
      isMenuOpen,
      openMenu: () => setIsMenuOpen(true),
      closeMenu: () => setIsMenuOpen(false),
      toggleMenu: () => setIsMenuOpen((state) => !state),
    }),
    [isMenuOpen]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};