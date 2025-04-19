import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from "react-native-sensors";
import { BlurView } from 'expo-blur';

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

  const updatePosition = () => {
    if (!isBoxActive) return;

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
  };

  const startAccelerometer = () => {
    // Cancelar cualquier animación de spring pendiente
    if (springAnimation.current) {
      springAnimation.current.stop();
    }

    // Mantener la posición actual al activar
    const currentX = iconPosition.x._value;
    const currentY = iconPosition.y._value;
    iconPosition.setValue({ x: currentX, y: currentY });
    
    velocity.current = { x: 0, y: 0 };
    lastUpdate.current = Date.now();

    if (!accelSubscription.current) {
      accelSubscription.current = accelerometer.subscribe(({ x, y }) => {
        // Convertir la inclinación en aceleración
        const sensitivity = 400;
        velocity.current.x += x * sensitivity * 0.036; // 0.016 es aproximadamente 1/60 para 60fps
        velocity.current.y -= y * sensitivity * 0.036; // Invertimos Y para movimiento natural
      });
    }

    updatePosition();
  };

  const stopAccelerometer = () => {
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

    // Guardar la animación de spring para poder cancelarla si es necesario
    springAnimation.current = Animated.spring(iconPosition, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    });
    
    springAnimation.current.start();
  };

  useEffect(() => {
    if (isBoxActive) {
      startAccelerometer();
    } else {
      stopAccelerometer();
    }

    return () => {
      if (accelSubscription.current) {
        accelSubscription.current.unsubscribe();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (springAnimation.current) {
        springAnimation.current.stop();
      }
    };
  }, [isBoxActive]);

  return (
    <TouchableOpacity 
      style={[
        styles.caja,
        isBoxActive && styles.cajaActiva
      ]}
      onPress={() => setIsBoxActive(!isBoxActive)}
    >
      <BlurView intensity={50} tint={isBoxActive ? "light" : "dark"} style={StyleSheet.absoluteFill} />
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
          color={isBoxActive ? "#000" : "#fff"} 
        />
      </Animated.View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  iconContainer: {
    position: 'absolute',
  },
}); 