import React, { createContext, useState, useContext } from 'react';
type LoadingContextType = {
  addressLoaded: boolean;
  setAddressLoaded: (value: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: any) => {
  const [addressLoaded, setAddressLoaded] = useState(false);

  return (
    <LoadingContext.Provider value={{ addressLoaded, setAddressLoaded }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};