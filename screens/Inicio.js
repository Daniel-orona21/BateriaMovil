import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Easing, Platform, PermissionsAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeviceInfo from 'react-native-device-info';
import { accelerometer, setUpdateIntervalForType, SensorTypes, magnetometer } from "react-native-sensors";
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

export default function Inicio({ navigation }) {
  const [isBoxActive, setIsBoxActive] = useState(false);
  const [isMapActive, setIsMapActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const iconPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const velocity = useRef({ x: 0, y: 0 });
  const subscription = useRef(null);
  const locationWatcher = useRef(null);
  const magnetometerSubscription = useRef(null);
  const animationFrame = useRef(null);
  const lastUpdate = useRef(Date.now());
  const springAnimation = useRef(null);
  const mapIconRotation = useRef(new Animated.Value(0)).current;

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Permiso de Ubicación",
          message: "La aplicación necesita acceso a tu ubicación",
          buttonNeutral: "Preguntar luego",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    locationWatcher.current = Geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 10, maximumAge: 1000 }
    );

    if (magnetometerSubscription.current) {
        magnetometerSubscription.current.unsubscribe();
        magnetometerSubscription.current = null;
    }
  };

  const stopLocationTracking = () => {
    if (locationWatcher.current) {
      Geolocation.clearWatch(locationWatcher.current);
      locationWatcher.current = null;
    }
    if (magnetometerSubscription.current) {
      magnetometerSubscription.current.unsubscribe();
      magnetometerSubscription.current = null;
    }
    setLocation(null);
  };

  // Configurar intervalo de actualización del sensor
  setUpdateIntervalForType(SensorTypes.accelerometer, 16); // ~60fps

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

    if (!subscription.current) {
      subscription.current = accelerometer.subscribe(({ x, y }) => {
        // Convertir la inclinación en aceleración
        const sensitivity = 400;
        velocity.current.x += x * sensitivity * 0.036; // 0.016 es aproximadamente 1/60 para 60fps
        velocity.current.y -= y * sensitivity * 0.036; // Invertimos Y para movimiento natural
      });
    }

    updatePosition();
  };

  const stopAccelerometer = () => {
    if (subscription.current) {
      subscription.current.unsubscribe();
      subscription.current = null;
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
      if (subscription.current) {
        subscription.current.unsubscribe();
      }
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (springAnimation.current) {
        springAnimation.current.stop();
      }
    };
  }, [isBoxActive]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const porcentaje = (level * 100).toFixed(0);
        console.log('Nivel de batería raw:', level);
        console.log('Nivel de batería calculado:', porcentaje);
        navigation.setOptions({ title: `Nivel de batería: ${porcentaje}%` });
      } catch (error) {
        console.error('Error al obtener el nivel de batería:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

  useEffect(() => {
    Animated.timing(mapIconRotation, {
      toValue: isMapActive ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [isMapActive]);

  const mapIconRotateInterpolate = mapIconRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.area}>
        <TouchableOpacity 
          style={[
            styles.caja,
            isBoxActive && styles.cajaActiva
          ]}
          onPress={() => setIsBoxActive(!isBoxActive)}
        >
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

        <TouchableOpacity 
          style={[
            styles.caja,
            styles.mapContainer,
            isMapActive && styles.cajaActiva
          ]}
          onPress={() => {
            const newState = !isMapActive;
            setIsMapActive(newState);
            if (newState) {
              startLocationTracking();
            } else {
              stopLocationTracking();
            }
          }}
        >
          {isMapActive && location && (
            <MapView
              style={styles.map}
              initialRegion={location}
              showsUserLocation={false}
              followsUserLocation={false}
              region={location}
              showsMyLocationButton={false}
              zoomEnabled={true}
              scrollEnabled={true}
              pitchEnabled={false}
              rotateEnabled={false}
            />
          )}

          <Animated.View style={[styles.iconOverlay, { transform: [{ rotate: mapIconRotateInterpolate }] }]}>
            <Ionicons 
              name="location" 
              size={50} 
              color={isMapActive ? '#000' : '#fff'}
            />
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.caja}>

        </View>
        <View style={styles.caja}>

        </View>
        <View style={styles.caja}>

        </View>
        <View style={styles.caja}>

        </View>
      </SafeAreaView>
    </View>
  );
}

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
    gap: 10
  },
  caja: {
    backgroundColor: 'rgba(55, 55, 55, 0.3)',
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
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(55, 55, 55, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  mapContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  iconOverlay: {
  },
}); 