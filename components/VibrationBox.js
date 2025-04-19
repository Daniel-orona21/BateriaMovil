import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Vibration, Platform, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Ya no necesitamos REPEATING_PATTERN para iOS, definimos el intervalo
const PULSE_INTERVAL_MS = 700; // Intervalo entre vibraciones (ej: 700ms)

export default function VibrationBox() {
  // Estado para controlar el estilo visual (activo/inactivo)
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null); // Ref para guardar el ID del intervalo
  const shakeAnimation = useRef(new Animated.Value(0)).current; // Para animación de vibración
  const animationRef = useRef(null); // Ref para almacenar la animación actual

  // Configurar animación de shake (pulso único)
  const doSingleShake = () => {
    // Resetear animación al inicio
    shakeAnimation.setValue(0);
    
    // Crear secuencia de una única vibración rápida
    animationRef.current = Animated.sequence([
      // Shake más rápido (50ms por movimiento)
      Animated.timing(shakeAnimation, {
        toValue: 1.5,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -1.5,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 1,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -1,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0.5,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -0.5,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);
    
    // Iniciar la secuencia
    animationRef.current.start();
  };

  const stopShakeAnimation = () => {
    // Detener la animación y resetear
    if (animationRef.current) {
      animationRef.current.stop();
    }
    shakeAnimation.setValue(0);
  };

  const handlePress = () => {
    const nextState = !isActive;
    setIsActive(nextState);

    if (nextState) {
      // Vibra una vez inmediatamente al activar
      Vibration.vibrate();
      
      // Iniciar animación de shake para el primer pulso
      doSingleShake();
      
      // Inicia intervalo para vibraciones repetidas
      // Limpia cualquier intervalo anterior por si acaso
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        // Vibrar el dispositivo
        Vibration.vibrate();
        
        // Hacer shake en sincronía con cada vibración
        doSingleShake();
      }, PULSE_INTERVAL_MS);

    } else {
      // Detiene el intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Detiene la animación de shake
      stopShakeAnimation();
      // Cancela cualquier vibración física en curso
      Vibration.cancel();
    }
  };

  // Limpieza: Asegurarse de detener el intervalo si el componente se desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Detener cualquier animación al desmontar
      stopShakeAnimation();
    };
  }, []); 

  // Crear transformación de shake (más pronunciada)
  const shakeInterpolation = shakeAnimation.interpolate({
    inputRange: [-1.5, 0, 1.5],
    outputRange: ['-8deg', '0deg', '8deg'],
  });

  return (
    <TouchableOpacity 
      style={[
        styles.caja,
        isActive && styles.cajaActiva
      ]}
      onPress={handlePress}
    >
      <BlurView intensity={50} tint={isActive ? "light" : "dark"} style={StyleSheet.absoluteFill} />
      <Animated.View style={{
        transform: [{ rotate: shakeInterpolation }]
      }}>
        <MaterialCommunityIcons 
          name={"vibrate"}
          size={50} 
          color={isActive ? "#000" : "#fff"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: 170,
    height: 170,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cajaActiva: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
}); 