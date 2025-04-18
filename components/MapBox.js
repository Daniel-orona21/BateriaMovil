import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Easing, Platform, PermissionsAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import CompassHeading from 'react-native-compass-heading';

export default function MapBox() {
  const [isMapActive, setIsMapActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);
  const locationWatcher = useRef(null);
  const mapIconRotation = useRef(new Animated.Value(0)).current;
  const mapRef = useRef(null); // Referencia para el MapView

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

  const startSensorsForMap = async () => {
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
  };

  const stopSensorsForMap = () => {
    // Detener seguimiento de ubicación
    if (locationWatcher.current) {
      Geolocation.clearWatch(locationWatcher.current);
      locationWatcher.current = null;
    }
  };

  useEffect(() => {
    if (isMapActive) {
      startSensorsForMap();
    } else {
      stopSensorsForMap();
    }

    // Asegurarse de detener los sensores (Geolocation) cuando el componente se desmonte
    return () => {
      stopSensorsForMap();
    };
  }, [isMapActive]);

  useEffect(() => {
    const handleCompassUpdate = (data) => {
      const newHeading = typeof data === 'object' ? data.heading : data;
      if (typeof newHeading === 'number' && !isNaN(newHeading) && newHeading >= 0) {
        setHeading(newHeading);
      } else {
        // console.log("Invalid compass data received:", data);
      }
    };

    if (isMapActive) {
      startSensorsForMap();

      const degree_update_rate = 1;
      CompassHeading.start(degree_update_rate, handleCompassUpdate)
        .then(() => {
          console.log('CompassHeading started (MapBox)');
        })
        .catch(error => {
          console.error('Error starting CompassHeading (MapBox):', error);
        });

    } else {
      stopSensorsForMap();
      CompassHeading.stop();
      console.log('CompassHeading stopped (MapBox)');
    }

    // Función de limpieza original para desmontaje del componente
    return () => {
      stopSensorsForMap();
      CompassHeading.stop();
      console.log('Sensors cleaned up on unmount (MapBox)');
    };
  }, [isMapActive]);

  useEffect(() => {
    if (isMapActive && mapRef.current && location) {
      mapRef.current.animateCamera(
        {
          center: {
             latitude: location.latitude,
             longitude: location.longitude,
          },
          heading: heading,
          // pitch: 45,
          // zoom: 18,
        },
        { duration: 250 }
      );
    }
  }, [heading, isMapActive, location]);

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

  const handlePress = () => {
    setIsMapActive(!isMapActive);
  };

  return (
    <View
      style={[
        styles.caja,
        styles.mapContainer,
        isMapActive && styles.cajaActiva
      ]}
    >
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
            color={isMapActive ? '#000' : '#fff'}
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: 'rgba(55, 55, 55, 0.3)',
    width: 170,
    height: 170,
    borderRadius: 25,
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