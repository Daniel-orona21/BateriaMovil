import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useBattery } from '../context/BatteryContext';

const { width } = Dimensions.get('window');

export default function BatteryConsumptionChart() {
  const { batteryHistory, predictionData } = useBattery();
  
  // Combinar el historial real con la predicción futura
  const combinedData = useMemo(() => {
    // Si no hay datos de predicción, usar solo el historial
    if (!predictionData?.futureLevels?.length) {
      return batteryHistory;
    }

    // Filtrar el historial para mostrar solo los puntos más relevantes
    let filteredHistory = [];
    let lastAdded = null;
    
    // Procesar historial real
    batteryHistory.forEach(entry => {
      if (!lastAdded || 
          lastAdded.level !== entry.level || 
          (new Date(entry.timestamp) - new Date(lastAdded.timestamp)) > 300000) {
        filteredHistory.push(entry);
        lastAdded = entry;
      }
    });
    
    // Mostrar máximo 6 puntos históricos recientes
    const historicalPoints = filteredHistory.slice(-6);
    
    // Añadir puntos de predicción, incluyendo un punto final con 0% de batería
    let predictionPoints = [];
    
    // Si estamos descargando, calcular una predicción lineal hacia 0%
    if (predictionData.timeToEmpty > 0) {
      const currentLevel = historicalPoints.length > 0 
        ? historicalPoints[historicalPoints.length - 1].level 
        : predictionData.futureLevels[0].level;
      
      const now = new Date();
      const emptyTime = new Date(now.getTime() + (predictionData.timeToEmpty * 3600000));
      
      // Crear puntos intermedios para una caída suave
      const hoursToEmpty = predictionData.timeToEmpty;
      const numPoints = Math.min(8, Math.ceil(hoursToEmpty)); // No más de 8 puntos
      
      for (let i = 1; i <= numPoints; i++) {
        const fraction = i / numPoints;
        const timeOffset = hoursToEmpty * fraction;
        const pointTime = new Date(now.getTime() + (timeOffset * 3600000));
        
        // Nivel de batería proporcional al tiempo (descenso lineal)
        const pointLevel = Math.max(0, Math.round(currentLevel * (1 - fraction)));
        
        predictionPoints.push({
          level: pointLevel,
          timestamp: pointTime.toISOString(),
          isReal: false
        });
      }
      
      // Asegurar que el último punto sea 0%
      if (predictionPoints.length > 0 && predictionPoints[predictionPoints.length - 1].level > 0) {
        predictionPoints[predictionPoints.length - 1].level = 0;
      }
    } 
    // Si estamos cargando, usar la predicción existente
    else if (predictionData.timeToFull > 0) {
      predictionPoints = predictionData.futureLevels
        .filter(point => !point.isReal)
        .slice(0, 8);
    }
    
    return historicalPoints.concat(predictionPoints);
  }, [batteryHistory, predictionData]);
  
  // We need at least 2 data points for a line chart
  if (combinedData.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Recopilando datos de batería...</Text>
      </View>
    );
  }
  
  // Encontrar el índice donde termina el historial real y comienza la predicción
  const realDataEndIndex = combinedData.findIndex(point => point.isReal === false) - 1;
  
  // Formatear las etiquetas de tiempo para que sean legibles
  const formatTimeLabels = (combinedData) => {
    const totalPoints = combinedData.length;
    // Mostrar máximo 5 etiquetas para evitar solapamiento
    const labelsToShow = Math.min(5, totalPoints);
    const step = Math.max(1, Math.floor(totalPoints / labelsToShow));
    
    return combinedData.map((entry, index) => {
      // Mostrar solo algunas etiquetas para evitar solapamiento
      if (index % step === 0 || index === totalPoints - 1 || index === realDataEndIndex) {
        const time = new Date(entry.timestamp);
        return `${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
      }
      return '';
    });
  };

  // Preparar datos para la gráfica
  const chartData = {
    labels: formatTimeLabels(combinedData),
    datasets: [
      {
        data: combinedData.map(entry => entry.level),
        strokeWidth: 2.5,
        color: (opacity = 1, index) => {
          // Si no hay índice, devolver color predeterminado
          if (index === undefined) return `rgba(0, 122, 255, ${opacity})`;
          
          // Color diferente para historia vs predicción
          if (index <= realDataEndIndex) {
            return `rgba(0, 122, 255, ${opacity})`;  // Azul para histórico
          } else {
            return `rgba(255, 149, 0, ${opacity})`;  // Naranja para predicción
          }
        }
      }
    ],
    legend: ["Nivel de batería (%)"]
  };
  
  // Calcular min/max para el eje Y con margen
  const allLevels = combinedData.map(e => e.level);
  const minY = Math.max(0, Math.min(...allLevels) - 5);
  const maxY = Math.min(100, Math.max(...allLevels) + 5);
  
  // Calcular el ancho del gráfico para que no se desborde
  const chartWidth = width - 50; // Reducir el ancho para evitar desbordamiento
  
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(0, 0, 0, 0.8)',
    backgroundGradientTo: 'rgba(0, 0, 0, 0.8)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: 4,
      strokeWidth: 1,
      stroke: (dataPoint, index) => {
        if (index === undefined) return '#007AFF';
        return index <= realDataEndIndex ? '#007AFF' : '#FF9500';
      }
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      strokeWidth: 0.5,
      stroke: 'rgba(255, 255, 255, 0.1)',
    },
    propsForLabels: {
      fontSize: 9, // Reducir tamaño de fuente para etiquetas
      fontWeight: '300',
    },
    propsForVerticalLabels: {
      rotation: 0,
    },
    yAxisSuffix: '%',
    yAxisInterval: 5,
    segments: 6,
    formatYLabel: (yValue) => Math.round(yValue),
    yAxisMin: minY,
    yAxisMax: maxY
  };

  // Calcular el tiempo restante y nivel mínimo proyectado
  const getProjectionSummary = () => {
    if (predictionData.timeToEmpty > 0) {
      const hours = Math.floor(predictionData.timeToEmpty);
      const mins = Math.round((predictionData.timeToEmpty - hours) * 60);
      
      const timeText = hours > 0 
        ? `${hours} h ${mins > 0 ? mins + ' min' : ''}`
        : `${mins} min`;
      
      return `Predicción: batería agotada en ${timeText}`;
    } else if (predictionData.timeToFull > 0) {
      const hours = Math.floor(predictionData.timeToFull);
      const mins = Math.round((predictionData.timeToFull - hours) * 60);
      
      const timeText = hours > 0 
        ? `${hours} h ${mins > 0 ? mins + ' min' : ''}`
        : `${mins} min`;
      
      return `Predicción: carga completa en ${timeText}`;
    }
    
    return '';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial y Predicción de Batería</Text>
      
      {/* Información de la proyección */}
      <Text style={styles.projectionInfo}>
        {getProjectionSummary()}
      </Text>
      
      {/* Leyenda */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#007AFF' }]} />
          <Text style={styles.legendText}>Histórico</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>Predicción</Text>
        </View>
      </View>
      
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withDots={true}
          withVerticalLabels={true}
          withHorizontalLabels={true}
          yAxisLabel=""
          getDotColor={(_, index) => index <= realDataEndIndex ? '#007AFF' : '#FF9500'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  projectionInfo: {
    fontSize: 14,
    color: '#FF9500',
    textAlign: 'center',
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: 'white',
  },
  chartContainer: {
    alignItems: 'center',
    width: '100%',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    color: 'white',
    textAlign: 'center',
    padding: 20,
  }
}); 