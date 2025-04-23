import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useBattery } from '../context/BatteryContext';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

// Definir colores para cada módulo
const MODULE_COLORS = {
  baseline: '#808080', // Gris
  camera: '#FF6384',   // Rojo
  compass: '#36A2EB',  // Azul
  flashlight: '#FFCE56', // Amarillo
  map: '#4BC0C0',      // Turquesa
  pedometer: '#9966FF', // Púrpura
  vibration: '#FF9F40'  // Naranja
};

// Definir nombres amigables para cada módulo
const MODULE_NAMES = {
  baseline: 'Base',
  camera: 'Cámara',
  compass: 'Brújula',
  flashlight: 'Linterna',
  map: 'Mapa',
  pedometer: 'Podómetro',
  vibration: 'Vibración'
};

export default function ModuleConsumptionChart() {
  const { activeModules, consumptionRates } = useBattery();
  
  // Preparar datos para el gráfico
  const chartData = [];
  
  // Siempre incluir línea base
  chartData.push({
    name: MODULE_NAMES.baseline,
    consumption: consumptionRates.baseline,
    color: MODULE_COLORS.baseline,
    legendFontColor: '#FFF',
    legendFontSize: 12
  });
  
  // Añadir módulos activos
  Object.entries(activeModules).forEach(([module, isActive]) => {
    if (isActive && module !== 'baseline') {
      chartData.push({
        name: MODULE_NAMES[module],
        consumption: consumptionRates[module],
        color: MODULE_COLORS[module],
        legendFontColor: '#FFF',
        legendFontSize: 12
      });
    }
  });
  
  // Si no hay módulos activos, mostrar todos los módulos en estado "inactivo"
  if (chartData.length === 1) {
    Object.entries(consumptionRates).forEach(([module, rate]) => {
      if (module !== 'baseline') {
        chartData.push({
          name: `${MODULE_NAMES[module]}`,
          consumption: 0,
          color: MODULE_COLORS[module] + '40', // Añadir transparencia
          legendFontColor: '#999',
          legendFontSize: 12
        });
      }
    });
  }
  
  // Convertir consumo a porcentajes para el gráfico circular
  const data = chartData.map(item => ({
    ...item,
    population: item.consumption, // El componente PieChart usa 'population' como valor
    legendFontColor: item.legendFontColor,
    legendFontSize: item.legendFontSize,
    color: item.color,
    name: item.name
  }));

  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, styles.blurView]} />
      <Text style={styles.title}>Consumo por Módulo</Text>
      <PieChart
        data={data}
        width={width - 40}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute={false}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
  },
  blurView: {
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
}); 