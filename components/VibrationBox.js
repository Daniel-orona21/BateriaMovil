import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Vibration, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Ya no necesitamos REPEATING_PATTERN para iOS, definimos el intervalo
const PULSE_INTERVAL_MS = 700; // Intervalo entre vibraciones (ej: 700ms)

export default function VibrationBox() {
  // Estado para controlar el estilo visual (activo/inactivo)
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null); // Ref para guardar el ID del intervalo

  const handlePress = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    // console.log(`VibrationBox: Toggled state to ${nextState}`); 

    if (nextState) {
      // console.log(`VibrationBox: Activating vibration. Platform: ${Platform.OS}`);
      // Vibra una vez inmediatamente al activar
      Vibration.vibrate(); 
      
      // Inicia intervalo para vibraciones repetidas (funciona en ambas plataformas)
      // Limpia cualquier intervalo anterior por si acaso
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        // console.log('VibrationBox: Vibrating via interval');
        Vibration.vibrate();
      }, PULSE_INTERVAL_MS);

    } else {
      // console.log('VibrationBox: Deactivating vibration, calling cancel and clearing interval.'); 
      // Detiene el intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Cancela cualquier vibración física en curso (importante para Android si vibrate(pattern, true) se usara)
      Vibration.cancel();
    }
  };

  // Limpieza: Asegurarse de detener el intervalo si el componente se desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        // console.log('VibrationBox: Cleaning up interval on unmount');
        clearInterval(intervalRef.current);
      }
    };
  }, []); // El array vacío asegura que esto solo se ejecute al montar y desmontar

  return (
    <TouchableOpacity 
      style={[
        styles.caja,
        isActive && styles.cajaActiva // Aplica estilo activo si isActive es true
      ]}
      onPress={handlePress}
    >
      <BlurView intensity={50} tint={isActive ? "light" : "dark"} style={StyleSheet.absoluteFill} />
      <MaterialCommunityIcons 
        name={"vibrate"}
        size={50} 
        color={isActive ? "#000" : "#fff"}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: 170,
    height: 170,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cajaActiva: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // Fondo blanco cuando está activa
  },
}); 