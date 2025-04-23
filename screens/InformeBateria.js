import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Image } from 'expo-image';
import { useBattery } from '../context/BatteryContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import BatterySummary from '../components/BatterySummary';
import BatteryConsumptionChart from '../components/BatteryConsumptionChart';
import ModuleConsumptionChart from '../components/ModuleConsumptionChart';
import ActiveModules from '../components/ActiveModules';
import Calculations from './Calculations';

const BatteryStack = createNativeStackNavigator();

function BatteryReportScreen({ navigation }) {
  const { batteryLevel, isCharging } = useBattery();
  
  // Update the navigation title with battery level
  useEffect(() => {
    navigation.setOptions({
      title: `Batería al ${batteryLevel}%${isCharging ? ' (Cargando)' : ''}`,
    });
  }, [batteryLevel, isCharging, navigation]);

  return (
    <View style={styles.container}>
      {/* Background image */}
      <Image 
        source={require('../assets/IMG_1229.jpg')} 
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={0}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary at the top */}
          <BatterySummary />
          
          {/* Battery consumption chart */}
          <BatteryConsumptionChart />
          
          {/* Module consumption pie chart */}
          <ModuleConsumptionChart />
          
          {/* Active modules list */}
          <ActiveModules />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function InformeBateria() {
  return (
    <BatteryStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#000',
        }
      }}
      initialRouteName="BatteryReport"
    >
      <BatteryStack.Screen 
        name="BatteryReport" 
        component={BatteryReportScreen} 
      />
    </BatteryStack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Mantener fondo negro para prevenir flashes
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50, // Provide space for the header
    paddingBottom: 50,
  }
}); 