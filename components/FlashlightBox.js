import React, { useEffect, memo, forwardRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, Platform, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTorch } from '@drakexorn/expo-torchstate';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Componente con rotación aplicada directamente en las coordenadas de renderizado 
// para garantizar que siempre se aplique independientemente del ciclo de vida
const FixedRotationIcon = forwardRef(({ name, size, color, style }, ref) => {
  // Forzar renderizado con rotación específica
  const [mounted] = useState(true);
  
  return (
    <View 
      ref={ref}
      style={[
        {
          transform: [{ rotate: '-45deg' }],
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        },
        style
      ]}
      // Clave única para forzar renderizado completo
      key={`fixed-rotation-icon-${name}-${mounted ? 'mounted' : 'unmounted'}`}
    >
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
});

export default function FlashlightBox() {
  const [isTorchOn, setTorchStatus] = useTorch();
  const [renderKey, setRenderKey] = useState(0);

  // Forzar rerenderizado completo cuando el componente se vuelve a montar
  useEffect(() => {
    // Incrementar el renderKey para forzar un renderizado completo
    setRenderKey(prev => prev + 1);
    
    return () => {
      if (isTorchOn) {
        setTorchStatus(false);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFlashlight = () => {
    try {
      setTorchStatus(currentState => !currentState);
    } catch (error) {
      console.error("Error al cambiar estado de la linterna (expo-torchstate):", error);
      Alert.alert('Error', 'No se pudo controlar la linterna.');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.caja}
      onPress={toggleFlashlight}
      key={`flashlight-box-${renderKey}`}
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
        
        {/* Icono de la linterna con rotación fija garantizada */}
        <FixedRotationIcon 
          name={isTorchOn ? "flashlight" : "flashlight-outline"} 
          size={50} 
          color="#fff"
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