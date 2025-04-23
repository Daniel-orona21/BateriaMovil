import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBattery } from '../context/BatteryContext';
import { BlurView } from 'expo-blur';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function BatterySummary() {
  const { 
    batteryLevel, 
    rawBatteryLevel,
    isCharging, 
    predictionData, 
    batteryCapacity,
    activeModules,
    consumptionRates
  } = useBattery();
  
  const navigation = useNavigation();
  
  // Formatear tiempo restante a formato legible por humanos
  const formatTimeRemaining = (hours) => {
    if (hours === 0) return '-';
    
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    
    if (hrs === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hrs} h`;
    } else {
      return `${hrs} h ${mins} min`;
    }
  };
  
  // Contar módulos activos
  const activeCount = Object.values(activeModules).filter(isActive => isActive).length;
  
  // Determinar el icono de batería según nivel y estado de carga
  const getBatteryIcon = () => {
    if (isCharging) {
      return 'battery-charging';
    } else if (batteryLevel <= 0.25) {
      return 'battery-dead';
    } else if (batteryLevel <= 0.5) {
      return 'battery-half';
    } else if (batteryLevel <= 0.75) {
      return 'battery-half';
    } else {
      return 'battery-full';
    }
  };
  
  // Determinar color basado en el nivel de batería
  const getBatteryColor = () => {
    if (batteryLevel <= 0.2) {
      return '#FF3B30'; // Rojo para batería baja
    } else if (batteryLevel <= 0.5) {
      return '#FF9500'; // Naranja para batería media
    } else {
      return '#4CD964'; // Verde para batería alta
    }
  };

  // Modificar la navegación para que use CommonActions para asegurar navegación a nivel raíz
  const handleNavigateToCalculations = () => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Calculations'
      })
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, styles.blurView]} />
      <View style={styles.header}>
        <Ionicons
          name={getBatteryIcon()}
          size={24}
          color={getBatteryColor()}
          style={styles.icon}
        />
        <View style={styles.headerText}>
          <Text style={styles.batteryLevel}>{batteryLevel}%</Text>
          <Text style={styles.batteryState}>
            {isCharging ? 'Cargando' : 'Descargando'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <BlurView intensity={30} tint="dark" style={[StyleSheet.absoluteFill, styles.detailsBlur]} />
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Consumo actual:</Text>
          <Text style={styles.detailValue}>
            {predictionData.consumptionRate} %/h ({(predictionData.consumptionRate * batteryCapacity / 100).toFixed(0)} mAh/h)
          </Text>
        </View>
        
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Tiempo restante:</Text>
          <Text style={styles.detailValue}>
            {isCharging 
              ? formatTimeRemaining(predictionData.timeToFull) + ' para cargar'
              : formatTimeRemaining(predictionData.timeToEmpty) + ' para agotar'
            }
          </Text>
        </View>
        
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Capacidad de batería:</Text>
          <Text style={styles.detailValue}>{batteryCapacity} mAh</Text>
        </View>
        
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Módulos activos:</Text>
          <Text style={styles.detailValue}>{activeCount}</Text>
        </View>
        
        {activeCount > 0 && (
          <View style={styles.activeModulesContainer}>
            <Text style={styles.activeModulesTitle}>Desglose de consumo:</Text>
            {Object.entries(activeModules).map(([name, isActive]) => {
              if (isActive) {
                const moduleConsumption = consumptionRates[name];
                return (
                  <View key={name} style={styles.moduleItem}>
                    <Text style={styles.moduleName}>{name}</Text>
                    <Text style={styles.moduleConsumption}>
                      {moduleConsumption} mAh/h ({((moduleConsumption / batteryCapacity) * 100).toFixed(1)}%)
                    </Text>
                  </View>
                );
              }
              return null;
            })}
            <View style={styles.moduleItem}>
              <Text style={styles.moduleName}>Consumo base</Text>
              <Text style={styles.moduleConsumption}>
                {consumptionRates.baseline} mAh/h ({((consumptionRates.baseline / batteryCapacity) * 100).toFixed(1)}%)
              </Text>
            </View>
          </View>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.calculationsButton}
        onPress={handleNavigateToCalculations}
      >
        <BlurView intensity={30} tint="dark" style={[StyleSheet.absoluteFill, styles.calculationsBlur]} />
        <Text style={styles.calculationsButtonText}>Ver cálculos <Ionicons name="chevron-forward" size={14} /></Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  batteryLevel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  batteryState: {
    fontSize: 16,
    color: '#aaa',
  },
  detailsContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  detailsBlur: {
    borderRadius: 12,
  },
  detail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  equationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    overflow: 'hidden',
  },
  equationBlur: {
    borderRadius: 12,
  },
  equationHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  equation: {
    fontSize: 14,
    fontFamily: 'Courier',
    color: '#4cd964',
    marginVertical: 4,
  },
  equationExplanation: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 8,
  },
  activeModulesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeModulesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#aaa',
    marginBottom: 8,
  },
  moduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  moduleName: {
    fontSize: 13,
    color: 'white',
    textTransform: 'capitalize',
  },
  moduleConsumption: {
    fontSize: 13,
    color: '#FF9500',
  },
  calculationsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  calculationsBlur: {
    borderRadius: 12,
  },
  calculationsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
}); 