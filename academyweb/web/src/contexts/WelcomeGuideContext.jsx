import { createContext, useContext, useState, useCallback } from 'react';

const WelcomeGuideContext = createContext(null);

export const useWelcomeGuide = () => {
  const context = useContext(WelcomeGuideContext);
  if (!context) {
    throw new Error('useWelcomeGuide must be used within a WelcomeGuideProvider');
  }
  return context;
};

export const WelcomeGuideProvider = ({ children }) => {
  const [showWelcomeGuide, setShowWelcomeGuide] = useState(false);

  const openWelcomeGuide = useCallback(() => {
    setShowWelcomeGuide(true);
  }, []);

  const closeWelcomeGuide = useCallback(() => {
    setShowWelcomeGuide(false);
  }, []);

  const value = {
    showWelcomeGuide,
    openWelcomeGuide,
    closeWelcomeGuide,
  };

  return (
    <WelcomeGuideContext.Provider value={value}>
      {children}
    </WelcomeGuideContext.Provider>
  );
};

