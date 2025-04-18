import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DeviceInfo from 'react-native-device-info';

export default function Inicio({ navigation }) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const porcentaje = (level * 100).toFixed(0); // Mostramos 2 decimales para mayor precisión
        console.log('Nivel de batería raw:', level);
        console.log('Nivel de batería calculado:', porcentaje);
        navigation.setOptions({ title: `Nivel de batería: ${porcentaje}%` });
      } catch (error) {
        console.error('Error al obtener el nivel de batería:', error);
      }
    }, 1000); // Actualizamos cada segundo para mayor precisión

    return () => clearInterval(interval);
  }, []);
 
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Inicio</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
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
}); 