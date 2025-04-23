import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { Image } from 'expo-image';
import { useBattery } from '../context/BatteryContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const handleLogout = () => {
    // Navegar a la pantalla de login usando la navegación raíz
    const rootNavigation = navigation.getParent();
    if (rootNavigation) {
      rootNavigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } else {
      // Fallback por si no podemos acceder a la navegación raíz
      navigation.navigate('Login');
    }
  };

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
          
          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons name="logout" size={20} color="#FF3B30" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
          
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
  },
  logoutButton: {
    marginTop: 0,
    marginBottom: 20,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 0,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    position: 'relative',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 