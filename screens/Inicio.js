import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DeviceInfo from 'react-native-device-info';

// Importar los nuevos componentes
import CompassBox from '../components/CompassBox'; 
import MapBox from '../components/MapBox';
import FlashlightBox from '../components/FlashlightBox';
import VibrationBox from '../components/VibrationBox';
import PedometerBox from '../components/PedometerBox';
import CameraBox from '../components/CameraBox';

export default function Inicio({ navigation }) {

  // useEffect para actualizar el título con el nivel de batería
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const porcentaje = (level * 100).toFixed(0);
        navigation.setOptions({ title: `Nivel de batería: ${porcentaje}%` });
      } catch (error) {
        console.error('Error al obtener el nivel de batería:', error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [navigation]); // Añadir navigation a las dependencias

  return (
    <View style={styles.container}>
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
  // Estilos que ya no son necesarios aquí porque se movieron a los componentes específicos
  // cajaActiva: { ... },
  // iconContainer: { ... },
  // mapContainer: { ... },
  // map: { ... },
  // iconOverlay: { ... },
  // logoutButton: { ... }, // Si no se usa aquí, considerar mover o eliminar
  // logoutText: { ... }, // Si no se usa aquí, considerar mover o eliminar
}); 