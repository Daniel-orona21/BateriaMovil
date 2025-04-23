import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useBattery } from '../context/BatteryContext';

const { width } = Dimensions.get('window');

// Define colors for each module
const MODULE_COLORS = {
  baseline: '#808080', // Gray
  camera: '#FF6384',   // Red
  compass: '#36A2EB',  // Blue
  flashlight: '#FFCE56', // Yellow
  map: '#4BC0C0',      // Turquoise
  pedometer: '#9966FF', // Purple
  vibration: '#FF9F40'  // Orange
};

// Define friendly names for each module
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
  
  // Prepare data for the chart
  const chartData = [];
  
  // Always include baseline
  chartData.push({
    name: MODULE_NAMES.baseline,
    consumption: consumptionRates.baseline,
    color: MODULE_COLORS.baseline,
    legendFontColor: '#FFF',
    legendFontSize: 12
  });
  
  // Add active modules
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
  
  // If no modules are active, show all modules in an "inactive" state
  if (chartData.length === 1) {
    Object.entries(consumptionRates).forEach(([module, rate]) => {
      if (module !== 'baseline') {
        chartData.push({
          name: `${MODULE_NAMES[module]}`,
          consumption: 0,
          color: MODULE_COLORS[module] + '40', // Add transparency
          legendFontColor: '#999',
          legendFontSize: 12
        });
      }
    });
  }
  
  // Convert consumption to percentages for the pie chart
  const data = chartData.map(item => ({
    ...item,
    population: item.consumption, // The PieChart component uses 'population' as the value
    legendFontColor: item.legendFontColor,
    legendFontSize: item.legendFontSize,
    color: item.color,
    name: item.name
  }));

  return (
    <View style={styles.container}>
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
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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