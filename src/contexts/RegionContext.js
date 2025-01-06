import React, { createContext, useState, useContext, useEffect } from 'react';

const RegionContext = createContext();

export const RegionProvider = ({ children }) => {
  const [selectedRegion, setSelectedRegion] = useState(() => {
    const savedRegion = localStorage.getItem('selectedRegion');
    return savedRegion || 'Region';
  });

  useEffect(() => {
    localStorage.setItem('selectedRegion', selectedRegion);
  }, [selectedRegion]);

  const updateRegion = (region) => {
    setSelectedRegion(region);
  };

  return (
    <RegionContext.Provider value={{ selectedRegion, updateRegion }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (!context) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};