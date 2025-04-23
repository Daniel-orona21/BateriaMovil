import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useBattery } from '../context/BatteryContext';
import { BlurView } from 'expo-blur';

// Mapa de nombres de módulos a sus iconos
const MODULE_ICONS = {
  camera: {
    component: MaterialCommunityIcons,
    name: 'camera',
  },
  compass: {
    component: Ionicons,
    name: 'compass',
  },
  flashlight: {
    component: Ionicons,
    name: 'flashlight',
  },
  map: {
    component: Ionicons,
    name: 'location',
  },
  pedometer: {
    component: MaterialCommunityIcons,
    name: 'walk',
  },
  vibration: {
    component: MaterialCommunityIcons,
    name: 'vibrate',
  },
};

// Componente para un único elemento de módulo
const ModuleItem = ({ module, isActive, consumption }) => {
  const Icon = MODULE_ICONS[module].component;
  
  return (
    <View style={[
      styles.moduleItem,
      !isActive && styles.moduleInactive
    ]}>
      <Icon 
        name={MODULE_ICONS[module].name}
        size={24}
        color={isActive ? 'white' : '#666'}
        style={styles.moduleIcon}
      />
      <View style={styles.moduleInfo}>
        <Text style={[
          styles.moduleName,
          !isActive && styles.moduleNameInactive
        ]}>
          {module.charAt(0).toUpperCase() + module.slice(1)}
        </Text>
        <Text style={[
          styles.moduleConsumption,
          !isActive && styles.moduleConsumptionInactive
        ]}>
          {isActive ? `${consumption} mAh/h` : 'Inactivo'}
        </Text>
      </View>
      <View style={[
        styles.moduleStatus,
        isActive ? styles.moduleStatusActive : styles.moduleStatusInactive
      ]}>
        <Text style={styles.moduleStatusText}>
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </Text>
      </View>
    </View>
  );
};

export default function ActiveModules() {
  const { activeModules, consumptionRates } = useBattery();
  
  // Preparar datos para FlatList
  const moduleData = Object.keys(activeModules)
    .filter(module => module !== 'baseline')
    .map(module => ({
      id: module,
      name: module,
      isActive: activeModules[module],
      consumption: consumptionRates[module]
    }));

  return (
    <View style={styles.container}>
      <BlurView intensity={50} tint="dark" style={[StyleSheet.absoluteFill, styles.blurView]} />
      <Text style={styles.title}>Estado de los Módulos</Text>
      <FlatList
        data={moduleData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ModuleItem
            module={item.name}
            isActive={item.isActive}
            consumption={item.consumption}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        scrollEnabled={false}
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
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  moduleInactive: {
    opacity: 0.6,
  },
  moduleIcon: {
    marginRight: 12,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  moduleNameInactive: {
    color: '#aaa',
  },
  moduleConsumption: {
    fontSize: 14,
    color: '#aaa',
  },
  moduleConsumptionInactive: {
    color: '#777',
  },
  moduleStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleStatusActive: {
    backgroundColor: 'rgba(76, 217, 100, 0.3)',
  },
  moduleStatusInactive: {
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
  },
  moduleStatusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 2,
  }
}); 