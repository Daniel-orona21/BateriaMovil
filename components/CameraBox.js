import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCamera } from '../context/CameraContext';
import { Camera } from 'react-native-vision-camera';
import { BlurView } from 'expo-blur';

export default function CameraBox() {
  // Estado para controlar el estilo visual (activo/inactivo)
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { isCameraActive, activateCamera, deactivateCamera } = useCamera();
  
  // Valores de animación para transición de iconos
  const fadeIn = useRef(new Animated.Value(1)).current;
  const fadeOut = useRef(new Animated.Value(0)).current;

  // Solicitar permisos al montar el componente
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      setHasPermission(cameraPermission === 'granted');
    })();
  }, []);

  // Sincronizar estado local con contexto global
  useEffect(() => {
    setIsActive(isCameraActive);
  }, [isCameraActive]);
  
  // Animación cuando cambia el estado
  useEffect(() => {
    if (isActive) {
      // Transición a camera-off
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeOut, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Transición a camera
      Animated.parallel([
        Animated.timing(fadeIn, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeOut, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isActive]);

  const handlePress = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    
    if (nextState) {
      // Activar la cámara
      if (hasPermission) {
        activateCamera();
        console.log('Cámara activada');
      } else {
        console.log('Sin permiso para la cámara');
        // Podrías mostrar una alerta o solicitar permiso de nuevo
      }
    } else {
      // Desactivar la cámara
      deactivateCamera();
      console.log('Cámara desactivada');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.caja}
      onPress={handlePress}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.iconContainer}>
        <Animated.View style={{
          opacity: fadeIn,
          position: 'absolute',
        }}>
          <MaterialCommunityIcons 
            name="camera"
            size={60} 
            color="#fff"
          />
        </Animated.View>
        
        <Animated.View style={{
          opacity: fadeOut,
          position: 'absolute',
        }}>
          <MaterialCommunityIcons 
            name="camera-off"
            size={60} 
            color="#fff"
          />
        </Animated.View>
      </View>
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
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cajaActiva: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
}); 