import React, { createContext, useContext, useState, useEffect } from 'react';

const PrivacyContext = createContext({
  isPrivacyMaskActive: false,
  togglePrivacyMask: () => {},
});

export const PrivacyProvider = ({ children }) => {
  const [isPrivacyMaskActive, setIsPrivacyMaskActive] = useState(() => {
    return localStorage.getItem('richy_privacy_mask') === 'true';
  });

  const togglePrivacyMask = () => {
    setIsPrivacyMaskActive((prev) => {
      const next = !prev;
      localStorage.setItem('richy_privacy_mask', String(next));
      return next;
    });
  };

  // Keyboard shortcut listener: Alt+P or Option+P
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P' || e.code === 'KeyP')) {
        e.preventDefault();
        togglePrivacyMask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <PrivacyContext.Provider value={{ isPrivacyMaskActive, togglePrivacyMask }}>
      {children}
    </PrivacyContext.Provider>
  );
};

export const usePrivacy = () => useContext(PrivacyContext);
