import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBattery } from '../context/BatteryContext';
import { useNavigation } from '@react-navigation/native';

export default function Calculations() {
  const { 
    batteryLevel,
    isCharging, 
    predictionData, 
    batteryCapacity,
    consumptionRates,
    activeModules
  } = useBattery();
  const navigation = useNavigation();
  
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerBackVisible: true,
      headerBackTitle: "Volver"
    });
  }, [navigation]);
  
  // Calcular consumo actual total
  const totalConsumption = Object.entries(activeModules)
    .filter(([_, isActive]) => isActive)
    .reduce((sum, [module, _]) => sum + (consumptionRates[module] || 0), consumptionRates.baseline);
  
  return (
    <View style={styles.fullContainer}>
      
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Sección de modelos matemáticos */}
          <View style={styles.section}>
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <Text style={styles.sectionTitle}>Modelos Matemáticos</Text>
            
            <View style={styles.modelContainer}>
              <Text style={styles.modelTitle}>Consumo de Batería:</Text>
              <Text style={styles.equation}>dB/dt = -k(∑(Ci * Ai)) - B0</Text>
              <Text style={styles.equationExplanation}>
                Donde:
              </Text>
              <View style={styles.paramsList}>
                <Text style={styles.paramItem}>• B = nivel de batería (%)</Text>
                <Text style={styles.paramItem}>• t = tiempo (horas)</Text>
                <Text style={styles.paramItem}>• k = coeficiente de batería</Text>
                <Text style={styles.paramItem}>• Ci = consumo del componente i (mAh/h)</Text>
                <Text style={styles.paramItem}>• Ai = componente i activo (0/1)</Text>
                <Text style={styles.paramItem}>• B0 = consumo base (mAh/h)</Text>
              </View>
            </View>
            
            <View style={styles.modelContainer}>
              <Text style={styles.modelTitle}>Modelo de Carga (CC-CV):</Text>
              <Text style={styles.equation}>dB/dt = k1 * (1 - e^(-(80-B)/τ))</Text>
              <Text style={styles.equationExplanation}>
                Para corriente constante (B ≤ 80%):
              </Text>
              <Text style={styles.equation}>dB/dt = I * η / C</Text>
              
              <Text style={styles.equationExplanation}>
                Para voltaje constante (B {'>'} 80%):
              </Text>
              <Text style={styles.equation}>dB/dt = I * e^(-(B-80)/τ) * η / C</Text>
              
              <Text style={styles.equationExplanation}>
                Donde:
              </Text>
              <View style={styles.paramsList}>
                <Text style={styles.paramItem}>• I = corriente máxima (4000 mA)</Text>
                <Text style={styles.paramItem}>• η = eficiencia de carga (92%)</Text>
                <Text style={styles.paramItem}>• C = capacidad de batería ({batteryCapacity} mAh)</Text>
                <Text style={styles.paramItem}>• τ = constante de tiempo (0.35 h)</Text>
              </View>
            </View>
          </View>
          
          {/* Sección de consumo actual */}
          <View style={styles.section}>
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <Text style={styles.sectionTitle}>Consumo Actual</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Consumo total:</Text>
                <Text style={styles.statValue}>{totalConsumption.toFixed(0)} mAh/h</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tasa de consumo:</Text>
                <Text style={styles.statValue}>{predictionData.consumptionRate.toFixed(2)} %/h</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Nivel actual:</Text>
                <Text style={styles.statValue}>{batteryLevel}%</Text>
              </View>
            </View>
            
            <View style={styles.componentsList}>
              <Text style={styles.componentsTitle}>Desglose de Componentes:</Text>
              
              {Object.entries(consumptionRates).map(([component, rate]) => (
                <View key={component} style={styles.componentRow}>
                  <View style={styles.componentNameContainer}>
                    {component === 'baseline' ? (
                      <MaterialCommunityIcons name="cellphone" size={18} color="#ccc" style={styles.componentIcon} />
                    ) : (
                      <MaterialCommunityIcons 
                        name={getComponentIcon(component)} 
                        size={18} 
                        color={activeModules[component] ? "#4CD964" : "#666"} 
                        style={styles.componentIcon} 
                      />
                    )}
                    <Text style={[
                      styles.componentName, 
                      component !== 'baseline' && !activeModules[component] && styles.inactiveText
                    ]}>
                      {formatComponentName(component)}
                    </Text>
                  </View>
                  <View style={styles.rateContainer}>
                    <Text style={[
                      styles.rateValue,
                      component !== 'baseline' && !activeModules[component] && styles.inactiveText
                    ]}>
                      {rate} mAh/h
                    </Text>
                    <Text style={[
                      styles.ratePercent,
                      component !== 'baseline' && !activeModules[component] && styles.inactiveText
                    ]}>
                      {((rate / batteryCapacity) * 100).toFixed(2)}%/h
                    </Text>
                  </View>
                  {component !== 'baseline' && (
                    <View style={[
                      styles.statusBadge,
                      activeModules[component] ? styles.activeBadge : styles.inactiveBadge
                    ]}>
                      <Text style={styles.statusText}>
                        {activeModules[component] ? 'ACTIVO' : 'INACTIVO'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
          
          {/* Sección de tiempos estimados */}
          <View style={styles.section}>
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <Text style={styles.sectionTitle}>Tiempos Estimados</Text>
            
            <View style={styles.estimatesContainer}>
              {isCharging ? (
                <>
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-charging" size={24} color="#4CD964" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta carga completa:</Text>
                      <Text style={styles.estimateValue}>{formatTime(predictionData.timeToFull)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-60" size={24} color="#FF9500" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta 80%:</Text>
                      <Text style={styles.estimateValue}>
                        {batteryLevel >= 80 ? 'Ya alcanzado' : 
                          formatTime((80 - batteryLevel) / (predictionData.consumptionRate * (isCharging ? 1 : -1)))}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-outline" size={24} color="#FF3B30" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta agotamiento:</Text>
                      <Text style={styles.estimateValue}>{formatTime(predictionData.timeToEmpty)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-30" size={24} color="#FF9500" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta 20%:</Text>
                      <Text style={styles.estimateValue}>
                        {batteryLevel <= 20 ? 'Ya alcanzado' : 
                          formatTime((batteryLevel - 20) / predictionData.consumptionRate)}
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// Función para obtener el icono de cada componente
function getComponentIcon(component) {
  const icons = {
    camera: 'camera',
    compass: 'compass',
    flashlight: 'flashlight',
    map: 'map',
    pedometer: 'walk',
    vibration: 'vibrate',
    baseline: 'cellphone'
  };
  
  return icons[component] || 'cellphone-settings';
}

// Función para formatear el nombre del componente
function formatComponentName(component) {
  if (component === 'baseline') return 'Consumo base';
  return component.charAt(0).toUpperCase() + component.slice(1);
}

// Función para formatear el tiempo en formato legible
function formatTime(hours) {
  if (hours === 0) return '-';
  
  const hrs = Math.floor(hours);
  const mins = Math.round((hours - hrs) * 60);
  
  if (hrs === 0) {
    return `${mins} minutos`;
  } else if (mins === 0) {
    return `${hrs} hora${hrs > 1 ? 's' : ''}`;
  } else {
    return `${hrs} hora${hrs > 1 ? 's' : ''} y ${mins} minutos`;
  }
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  sectionBlur: {
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  modelContainer: {
    marginBottom: 20,
  },
  modelTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  equation: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: '#4CD964',
    marginVertical: 8,
  },
  equationExplanation: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  paramsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  paramItem: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  componentsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  componentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 12,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  componentNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  componentIcon: {
    marginRight: 8,
  },
  componentName: {
    fontSize: 14,
    color: 'white',
  },
  rateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: 'bold',
  },
  ratePercent: {
    fontSize: 12,
    color: '#aaa',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(76, 217, 100, 0.3)',
  },
  inactiveBadge: {
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  inactiveText: {
    opacity: 0.6,
  },
  estimatesContainer: {
    marginTop: 8,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
  },
  estimateIcon: {
    marginRight: 12,
  },
  estimateContent: {
    flex: 1,
  },
  estimateLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  estimateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
}); 