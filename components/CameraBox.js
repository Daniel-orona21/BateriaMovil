import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CameraBox() {
  // Estado para controlar el estilo visual (activo/inactivo)
  const [isActive, setIsActive] = useState(false);

  const handlePress = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    
    if (nextState) {
      // Código de activación de cámara iría aquí
      console.log('Cámara activada');
    } else {
      // Código de desactivación de cámara iría aquí
      console.log('Cámara desactivada');
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.caja,
        isActive && styles.cajaActiva
      ]}
      onPress={handlePress}
    >
      <MaterialCommunityIcons 
        name="camera"
        size={60} 
        color={isActive ? "#000" : "#fff"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: 'rgba(55, 55, 55, 0.3)',
    width: 170,
    height: 170,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cajaActiva: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
}); 