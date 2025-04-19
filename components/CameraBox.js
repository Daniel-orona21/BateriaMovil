import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCamera } from '../context/CameraContext';
import { Camera } from 'react-native-vision-camera';
import { BlurView } from 'expo-blur';

export default function CameraBox() {
  // Estado para controlar el estilo visual (activo/inactivo)
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { isCameraActive, activateCamera, deactivateCamera } = useCamera();

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
      style={[
        styles.caja,
        isActive && styles.cajaActiva
      ]}
      onPress={handlePress}
    >
      <BlurView intensity={50} tint={isActive ? "light" : "dark"} style={StyleSheet.absoluteFill} />
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