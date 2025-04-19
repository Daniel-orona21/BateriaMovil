import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTorch } from '@drakexorn/expo-torchstate';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

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
      style={styles.caja}
      onPress={toggleFlashlight}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      
      {/* Contenedor principal que posiciona todos los elementos */}
      <View style={styles.contentContainer}>
        {/* Haz de luz cónico */}
        {isTorchOn && (
          <View style={styles.lightConeWrapper}>
            <View style={styles.lightCone} />
          </View>
        )}
        
        {/* Icono de la linterna */}
        <Ionicons 
          name={isTorchOn ? "flashlight" : "flashlight-outline"} 
          size={50} 
          color="#fff" 
          style={styles.flashlightIcon} 
        />
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
  contentContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  flashlightIcon: {
    transform: [{ rotate: '-45deg' }],
    zIndex: 2,
  },
  lightConeWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  lightCone: {
    position: 'absolute',
    width: 20,
    height: 0,
    borderLeftWidth: 80,
    borderRightWidth: 80,
    borderBottomWidth: 200,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    transform: [
      { rotate: '180deg' },
      { translateY: 100 }
    ],
  },
}); 