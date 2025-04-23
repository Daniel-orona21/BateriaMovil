import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from "react-native-sensors";
import { BlurView } from 'expo-blur';
import { useBattery } from '../context/BatteryContext';

// Configurar intervalo de actualización de sensores fuera del componente
setUpdateIntervalForType(SensorTypes.accelerometer, 16); // ~60fps

export default function CompassBox() {
  const [isBoxActive, setIsBoxActive] = useState(false);
  const iconPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const velocity = useRef({ x: 0, y: 0 });
  const accelSubscription = useRef(null);
  const animationFrame = useRef(null);
  const lastUpdate = useRef(Date.now());
  const springAnimation = useRef(null);
  const isActiveRef = useRef(false); // Para evitar referencias en efectos
  const { registerModuleState } = useBattery();

  // Actualizar la ref cuando cambia el estado
  useEffect(() => {
    isActiveRef.current = isBoxActive;
  }, [isBoxActive]);

  // Memoize the registration function to prevent infinite loops
  const registerWithBattery = useCallback((isActive) => {
    registerModuleState('compass', isActive);
  }, [registerModuleState]);

  // Register with battery context - use isBoxActive in useEffect dependency, not a function that uses it
  useEffect(() => {
    registerWithBattery(isBoxActive);
  }, [isBoxActive, registerWithBattery]);

  // Memoize the position calculation to prevent recreations
  const updatePosition = useCallback(() => {
    if (!isActiveRef.current) return;

    const now = Date.now();
    const dt = (now - lastUpdate.current) / 1000; // tiempo en segundos
    lastUpdate.current = now;

    // Actualizar posición basada en velocidad
    const currentX = iconPosition.x._value;
    const currentY = iconPosition.y._value;
    
    // Límites de la caja (considerando el tamaño del ícono)
    const maxOffset = 65;

    // Actualizar posición
    let newX = currentX + velocity.current.x * dt;
    let newY = currentY + velocity.current.y * dt;

    // Rebote en los bordes
    if (Math.abs(newX) > maxOffset) {
      newX = Math.sign(newX) * maxOffset;
      velocity.current.x *= -0.5; // Rebote con pérdida de energía
    }
    if (Math.abs(newY) > maxOffset) {
      newY = Math.sign(newY) * maxOffset;
      velocity.current.y *= -0.5; // Rebote con pérdida de energía
    }

    // Aplicar fricción
    const friction = 0.98;
    velocity.current.x *= friction;
    velocity.current.y *= friction;

    iconPosition.setValue({ x: newX, y: newY });
    
    animationFrame.current = requestAnimationFrame(updatePosition);
  }, [iconPosition]);

  // Iniciar acelerómetro y animación
  const startAccelerometer = useCallback(() => {
    // Cancelar cualquier animación de spring pendiente
    if (springAnimation.current) {
      springAnimation.current.stop();
    }

    // Siempre empezar desde el centro al activar
    iconPosition.setValue({ x: 0, y: 0 });
    
    velocity.current = { x: 0, y: 0 };
    lastUpdate.current = Date.now();

    // Iniciar la suscripción al acelerómetro
    if (!accelSubscription.current) {
      accelSubscription.current = accelerometer.subscribe(({ x, y }) => {
        // Solo procesar si el componente está activo (usar ref para evitar dependencias)
        if (!isActiveRef.current) return;
        
        // Convertir la inclinación en aceleración
        const sensitivity = 400;
        velocity.current.x += x * sensitivity * 0.036;
        velocity.current.y -= y * sensitivity * 0.036; // Invertimos Y para movimiento natural
      });
    }

    // Iniciar el loop de animación
    updatePosition();
  }, [iconPosition, updatePosition]);

  // Detener acelerómetro y animación
  const stopAccelerometer = useCallback(() => {
    if (accelSubscription.current) {
      accelSubscription.current.unsubscribe();
      accelSubscription.current = null;
    }

    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
      animationFrame.current = null;
    }

    // Resetear velocidad
    velocity.current = { x: 0, y: 0 };

    // Volver al centro con animación
    springAnimation.current = Animated.spring(iconPosition, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    });
    
    springAnimation.current.start();
  }, [iconPosition]);

  // Efecto para manejar activación/desactivación
  useEffect(() => {
    if (isBoxActive) {
      startAccelerometer();
    } else {
      stopAccelerometer();
    }

    // Limpieza al desmontar
    return () => {
      if (accelSubscription.current) {
        accelSubscription.current.unsubscribe();
        accelSubscription.current = null;
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
      if (springAnimation.current) {
        springAnimation.current.stop();
      }
    };
  }, [isBoxActive, startAccelerometer, stopAccelerometer]);

  // Manejar pulsación con useCallback para estabilidad
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
        style={[
          styles.iconContainer,
          {
            transform: [
              { translateX: iconPosition.x },
              { translateY: iconPosition.y }
            ]
          }
        ]}
      >
        <Ionicons 
          name="compass" 
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
  iconContainer: {
    position: 'absolute',
  },
}); 