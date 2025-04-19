import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTorch } from '@drakexorn/expo-torchstate';
import { BlurView } from 'expo-blur';

export default function FlashlightBox() {
  const [isTorchOn, setTorchStatus] = useTorch();

  const toggleFlashlight = () => {
    try {
      setTorchStatus(currentState => !currentState);
    } catch (error) {
      console.error("Error al cambiar estado de la linterna (expo-torchstate):", error);
      Alert.alert('Error', 'No se pudo controlar la linterna.');
    }
  };

  useEffect(() => {
    return () => {
      if (isTorchOn) {
        setTorchStatus(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTorchOn]);

  return (
    <TouchableOpacity 
      style={[
        styles.caja,
        isTorchOn && styles.cajaActiva
      ]}
      onPress={toggleFlashlight}
    >
      <BlurView intensity={50} tint={isTorchOn ? "light" : "dark"} style={StyleSheet.absoluteFill} />
      <Ionicons 
        name={isTorchOn ? "flashlight" : "flashlight-outline"} 
        size={50} 
        color={isTorchOn ? "#000" : "#fff"} 
        style={{ transform: [{ rotate: '-44deg' }] }} 
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