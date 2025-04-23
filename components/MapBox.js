import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, Platform, PermissionsAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import CompassHeading from 'react-native-compass-heading';
import { BlurView } from 'expo-blur';
import { useBattery } from '../context/BatteryContext';

export default function MapBox() {
  const [isMapActive, setIsMapActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const locationWatcher = useRef(null);
  const mapIconRotation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null); // Referencia para el MapView
  const isMapActiveRef = useRef(false); // Para evitar referencias en efectos
  const { registerModuleState } = useBattery();

  // Actualizar la ref cuando cambia isMapActive
  useEffect(() => {
    isMapActiveRef.current = isMapActive;
  }, [isMapActive]);

  // Memoize the registration function to prevent infinite loops
  const registerWithBattery = useCallback((isActive) => {
    registerModuleState('map', isActive);
  }, [registerModuleState]);

  // Register with battery context
  useEffect(() => {
    registerWithBattery(isMapActive);
  }, [isMapActive, registerWithBattery]);

  const requestLocationPermission = useCallback(async () => {
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
  }, []);

  const startSensorsForMap = useCallback(async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    // Iniciar seguimiento de ubicación
    if (!locationWatcher.current) {
      locationWatcher.current = Geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        },
        (error) => console.log('Error Geolocation:', error),
        { enableHighAccuracy: true, distanceFilter: 1, maximumAge: 1000, timeout: 20000 }
      );
    }
  }, [requestLocationPermission]);

  const stopSensorsForMap = useCallback(() => {
    // Detener seguimiento de ubicación
    if (locationWatcher.current) {
      Geolocation.clearWatch(locationWatcher.current);
      locationWatcher.current = null;
    }
  }, []);

  // Manejar efectos de la cámara del mapa solo cuando cambia isMapActive
  useEffect(() => {
    if (isMapActive) {
      startSensorsForMap();
    } else {
      stopSensorsForMap();
    }

    return () => {
      stopSensorsForMap();
    };
  }, [isMapActive, startSensorsForMap, stopSensorsForMap]);

  // Separate effect for compass heading to avoid too many dependencies
  useEffect(() => {
    const handleCompassUpdate = (data) => {
      if (!isMapActiveRef.current) return; // Use ref to check current state
      
      const newHeading = typeof data === 'object' ? data.heading : data;
      if (typeof newHeading === 'number' && !isNaN(newHeading) && newHeading >= 0) {
        setHeading(newHeading);
      }
    };

    // Start compass only when map is active
    if (isMapActive) {
      const degree_update_rate = 1;
      CompassHeading.start(degree_update_rate, handleCompassUpdate)
        .then(() => {
          console.log('CompassHeading started (MapBox)');
        })
        .catch(error => {
          console.error('Error starting CompassHeading (MapBox):', error);
        });
    } else {
      CompassHeading.stop();
    }

    return () => {
      CompassHeading.stop();
    };
  }, [isMapActive]);

  // Separate effect for map camera animation
  useEffect(() => {
    if (isMapActive && mapRef.current && location) {
      try {
        mapRef.current.animateCamera(
          {
            center: {
               latitude: location.latitude,
               longitude: location.longitude,
            },
            heading: heading,
          },
          { duration: 250 }
        );
      } catch (error) {
        console.log('Error animating map camera:', error);
      }
    }
  }, [heading, isMapActive, location]);

  // Icon rotation animation
  useEffect(() => {
    Animated.timing(mapIconRotation, {
      toValue: isMapActive ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, [isMapActive, mapIconRotation]);

  // Memoize the interpolation to prevent recalculation
  const mapIconRotateInterpolate = useMemo(() => {
    return mapIconRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
  }, [mapIconRotation]);

  const handlePress = useCallback(() => {
    setIsMapActive(prev => !prev);
  }, []);

  return (
    <View
      style={[
        styles.caja,
        styles.mapContainer,
        isMapActive && styles.cajaActiva
      ]}
    >
      {!isMapActive && (
        <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      
      {isMapActive && location && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={location}
          showsUserLocation={false}
          followsUserLocation={false}
          showsMyLocationButton={false}
          zoomEnabled={true}
          scrollEnabled={true}
          pitchEnabled={true}
          rotateEnabled={true}
          userInterfaceStyle="dark"
        />
      )}

      <TouchableOpacity
        style={styles.touchableOverlay}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.iconItself, { transform: [{ rotate: mapIconRotateInterpolate }] }]}>
          <Ionicons
            name="location"
            size={50}
            color="#fff"
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: 170,
    height: 170,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  cajaActiva: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  mapContainer: {
    // Estilos específicos si los hubiera, si no, se puede quitar
    // position: 'relative', // Ya está en caja
    // overflow: 'hidden', // Ya está en caja
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  touchableOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 255, 0, 0.2)', // Optional: for debugging visibility
  },
  iconItself: {
    // Icon is centered by the overlay's justifyContent/alignItems
    // Add specific positioning styles here if needed
  },
}); 