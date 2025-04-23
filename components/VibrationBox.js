import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useBattery } from '../context/BatteryContext';

export default function VibrationBox() {
  const [isBoxActive, setIsBoxActive] = useState(false);
  const isBoxActiveRef = useRef(false);
  const animation = useRef(new Animated.Value(0)).current;
  const animationTimeout = useRef(null);
  const vibrationPattern = [100, 200, 300, 400];
  const patternIndex = useRef(0);
  const { registerModuleState } = useBattery();

  // Mantener la ref actualizada con el estado
  useEffect(() => {
    isBoxActiveRef.current = isBoxActive;
  }, [isBoxActive]);

  // Memoize the registration function to prevent infinite loops
  const registerWithBattery = useCallback((isActive) => {
    registerModuleState('vibration', isActive);
  }, [registerModuleState]);

  // Register with battery context when state changes
  useEffect(() => {
    registerWithBattery(isBoxActive);
  }, [isBoxActive, registerWithBattery]);

  // Animar el icono y producir vibraciones
  const startAnimation = useCallback(() => {
    if (!isBoxActiveRef.current) return;

    // Resetear animación
    animation.setValue(0);

    // Crear secuencia de animación
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      easing: Easing.elastic(1.2),
      useNativeDriver: true,
    }).start(() => {
      // Vibrar con el patrón actual
      Vibration.vibrate(vibrationPattern[patternIndex.current]);
      
      // Avanzar al siguiente patrón de vibración
      patternIndex.current = (patternIndex.current + 1) % vibrationPattern.length;
      
      // Programar la siguiente animación/vibración
      if (isBoxActiveRef.current) {
        animationTimeout.current = setTimeout(startAnimation, 1000);
      }
    });
  }, [animation, vibrationPattern]);

  // Detener animación y vibraciones
  const stopAnimation = useCallback(() => {
    animation.stopAnimation();
    Vibration.cancel();
    
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
      animationTimeout.current = null;
    }
    
    patternIndex.current = 0;
  }, [animation]);

  // Efecto para gestionar la activación/desactivación
  useEffect(() => {
    if (isBoxActive) {
      startAnimation();
    } else {
      stopAnimation();
    }

    // Limpieza al desmontar
    return () => {
      Vibration.cancel();
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
    };
  }, [isBoxActive, startAnimation, stopAnimation]);

  // Calcular transformaciones para la animación
  const iconScale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1]
  });

  const iconRotate = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '15deg', '0deg']
  });

  // Manejar toques con useCallback para evitar recreaciones
  const handlePress = useCallback(() => {
    setIsBoxActive(prev => !prev);
  }, []);

  return (
    <TouchableOpacity 
      style={styles.caja}
      onPress={handlePress}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <Animated.View
        style={{
          transform: [
            { scale: iconScale },
            { rotate: iconRotate }
          ]
        }}
      >
        <Ionicons 
          name="notifications" 
          size={50} 
          color="#fff" 
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