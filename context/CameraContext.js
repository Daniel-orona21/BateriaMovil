import React, { createContext, useState, useContext } from 'react';

// Crear el contexto
const CameraContext = createContext();

// Proveedor del contexto
export const CameraProvider = ({ children }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Funciones para activar y desactivar la cámara
  const activateCamera = () => {
    setIsCameraActive(true);
  };

  const deactivateCamera = () => {
    setIsCameraActive(false);
  };

  // Exponer los valores y funciones para los componentes
  const value = {
    isCameraActive,
    activateCamera,
    deactivateCamera,
  };

  return (
    <CameraContext.Provider value={value}>
      {children}
    </CameraContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useCamera = () => {
  const context = useContext(CameraContext);
  if (context === undefined) {
    throw new Error('useCamera debe usarse dentro de un CameraProvider');
  }
  return context;
}; 