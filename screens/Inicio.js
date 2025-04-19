import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, SafeAreaView, Animated } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useCamera } from '../context/CameraContext';
import { Image } from 'expo-image';

// Importar los nuevos componentes
import CompassBox from '../components/CompassBox'; 
import MapBox from '../components/MapBox';
import FlashlightBox from '../components/FlashlightBox';
import VibrationBox from '../components/VibrationBox';
import PedometerBox from '../components/PedometerBox';
import CameraBox from '../components/CameraBox';

export default function Inicio({ navigation }) {
  const { isCameraActive } = useCamera();
  const device = useCameraDevice('back');
  
  // Animated values for smooth transitions
  const imageOpacity = useRef(new Animated.Value(1)).current;
  const cameraOpacity = useRef(new Animated.Value(0)).current;
  
  // Track camera initialization state
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);
  
  // Handle camera activation state
  useEffect(() => {
    if (isCameraActive) {
      // Camera is requested to be active, but we'll show it only when initialized
      setShowCameraView(true); // Enable the camera component but it will be invisible at first
    } else {
      // When deactivating
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        // Reset camera state after fade out is complete
        setShowCameraView(false);
        setIsCameraInitialized(false);
      });
      
      // Fade out camera immediately
      Animated.timing(cameraOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isCameraActive]);
  
  // Handle camera initialization event
  const handleCameraInitialized = () => {
    if (isCameraActive && showCameraView) {
      // Camera is now ready, mark as initialized
      setIsCameraInitialized(true);
      
      // Start transition animations now that camera is ready
      Animated.parallel([
        // Fade in camera
        Animated.timing(cameraOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        // Fade out background image
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  // useEffect para actualizar el título con el nivel de batería
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const porcentaje = (level * 100).toFixed(0);
        navigation.setOptions({ title: `Batería al ${porcentaje}%` });
      } catch (error) {
        console.error('Error al obtener el nivel de batería:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Cámara sólo se activa cuando se necesita */}
      {device && showCameraView && (
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          { opacity: cameraOpacity }
        ]}>
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={showCameraView}
            photo={false}
            video={false}
            preset="low"
            onInitialized={handleCameraInitialized}
          />
        </Animated.View>
      )}
      
      {/* Imagen de fondo con opacidad controlada */}
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { opacity: imageOpacity }
        ]}
      >
        <Image 
          source={require('../assets/IMG_1225.png')} 
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={0}
        />
      </Animated.View>
      
      <SafeAreaView style={styles.area}>
        {/* Usar los componentes importados */}
        <CompassBox />
        <MapBox />
        <FlashlightBox />
        <VibrationBox />
        <PedometerBox />
        <CameraBox />
      </SafeAreaView>
    </View>
  );
}

// Mantener los estilos generales aquí
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  area: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20
  },
  // Estilo 'caja' general que pueden usar otros componentes o las cajas restantes
  caja: {
    backgroundColor: 'rgba(55, 55, 55, 0.3)',
    width: 170,
    height: 170,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
}); 