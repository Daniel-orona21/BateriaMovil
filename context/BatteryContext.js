import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useCamera } from './CameraContext';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Constants for battery consumption calculations
// These values represent mAh per hour for each component when active
const BATTERY_CAPACITY = 3877; // mAh for the device
const CONSUMPTION_RATES = {
  // Baseline consumption when the app is running but no modules active
  baseline: 450,  // Aumentado de 150 a 450 para un consumo más realista
  // Additional consumption rates for each module in mAh/hour
  camera: 350,
  compass: 50,
  flashlight: 250,
  map: 300,
  pedometer: 30,
  vibration: 100
};

// Charging rates constants
const CHARGING_COEFFICIENT = 0.7; // Efficiency factor
const MAX_CHARGE_RATE = 1500; // mAh per hour at 0% battery
const THERMAL_LOSS = 0.08; // Proportion of charging power lost to heat

// Create the context
const BatteryContext = createContext();

// Provider component
export const BatteryProvider = ({ children }) => {
  // Battery state
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  const [batteryHistory, setBatteryHistory] = useState([]);
  const [predictionData, setPredictionData] = useState({
    timeToEmpty: 0,
    timeToFull: 0,
    consumptionRate: 0,
    // Array de puntos de predicción futura [{ level, timestamp }]
    futureLevels: []
  });
  
  // Módulos activos
  const { isCameraActive } = useCamera();
  const [activeModules, setActiveModules] = useState({
    camera: false,
    compass: false,
    flashlight: false,
    map: false,
    pedometer: false,
    vibration: false
  });

  // Update module state based on isCameraActive from CameraContext
  useEffect(() => {
    if (isCameraActive !== activeModules.camera) {
      setActiveModules(prev => ({
        ...prev,
        camera: isCameraActive
      }));
    }
  }, [isCameraActive, activeModules.camera]);

  // Calcular el consumo total actual basado en módulos activos
  const calculateTotalConsumption = useCallback(() => {
    let consumption = CONSUMPTION_RATES.baseline;
    
    Object.entries(activeModules).forEach(([module, isActive]) => {
      if (isActive && CONSUMPTION_RATES[module]) {
        consumption += CONSUMPTION_RATES[module];
      }
    });
    
    return consumption;
  }, [activeModules]);

  // Actualizar predicciones cuando cambia el estado de los módulos
  useEffect(() => {
    const totalConsumption = calculateTotalConsumption();
    
    // Convertir mAh/hora a porcentaje/hora
    const consumptionRatePercentPerHour = (totalConsumption / BATTERY_CAPACITY) * 100;
    
    // Calcular tiempo restante hasta agotar (en horas)
    const timeToEmpty = isCharging ? 0 : batteryLevel / consumptionRatePercentPerHour;
    
    // Calcular tiempo hasta carga completa
    let timeToFull = 0;
    if (isCharging) {
      // La tasa de carga disminuye a medida que aumenta el nivel de batería
      const currentChargeRate = MAX_CHARGE_RATE * CHARGING_COEFFICIENT * 
        ((100 - batteryLevel) / 100) - (THERMAL_LOSS * MAX_CHARGE_RATE);
      const chargeRatePercentPerHour = (currentChargeRate / BATTERY_CAPACITY) * 100;
      timeToFull = (100 - batteryLevel) / chargeRatePercentPerHour;
    }
    
    // Generar puntos para la predicción futura (próximas 12 horas)
    const futureLevels = [];
    const now = new Date();
    
    // Agregar el punto actual
    futureLevels.push({
      level: batteryLevel,
      timestamp: now.toISOString(),
      isReal: true
    });
    
    // Generar puntos futuros de predicción cada 30 minutos
    if (!isCharging) {
      let futureLevel = batteryLevel;
      for (let i = 1; i <= 24; i++) {
        // Calcular nivel futuro (30 minutos = 0.5 horas)
        futureLevel -= consumptionRatePercentPerHour * 0.5;
        
        // Si la batería se agotaría, agregar el punto final y terminar
        if (futureLevel <= 0) {
          const emptyTime = new Date(now.getTime() + (batteryLevel / consumptionRatePercentPerHour) * 3600000);
          futureLevels.push({
            level: 0,
            timestamp: emptyTime.toISOString(),
            isReal: false
          });
          break;
        }
        
        // Agregar punto de predicción
        const futureTime = new Date(now.getTime() + i * 30 * 60000);
        futureLevels.push({
          level: Math.round(futureLevel),
          timestamp: futureTime.toISOString(),
          isReal: false
        });
      }
    } else {
      // Similar para carga, aumentando en vez de disminuyendo
      let futureLevel = batteryLevel;
      for (let i = 1; i <= 24; i++) {
        const currentChargeRate = MAX_CHARGE_RATE * CHARGING_COEFFICIENT * 
          ((100 - futureLevel) / 100) - (THERMAL_LOSS * MAX_CHARGE_RATE);
        const chargeRatePercentPerHour = (currentChargeRate / BATTERY_CAPACITY) * 100;
        
        // Calcular incremento para 30 minutos
        futureLevel += chargeRatePercentPerHour * 0.5;
        
        // Si la batería se cargaría por completo, agregar el punto final y terminar
        if (futureLevel >= 100) {
          const fullTime = new Date(now.getTime() + (timeToFull * 3600000));
          futureLevels.push({
            level: 100,
            timestamp: fullTime.toISOString(),
            isReal: false
          });
          break;
        }
        
        // Agregar punto de predicción
        const futureTime = new Date(now.getTime() + i * 30 * 60000);
        futureLevels.push({
          level: Math.round(futureLevel),
          timestamp: futureTime.toISOString(),
          isReal: false
        });
      }
    }
    
    setPredictionData({
      timeToEmpty: parseFloat(timeToEmpty.toFixed(2)),
      timeToFull: parseFloat(timeToFull.toFixed(2)),
      consumptionRate: parseFloat(consumptionRatePercentPerHour.toFixed(2)),
      futureLevels
    });
  }, [activeModules, batteryLevel, isCharging, calculateTotalConsumption]);

  // Fetch battery level regularly
  useEffect(() => {
    const fetchBatteryInfo = async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const apiLevelPercent = Math.round(level * 100);
        setBatteryLevel(apiLevelPercent);
        
        const charging = await DeviceInfo.isBatteryCharging();
        setIsCharging(charging);
        
        // Add to history with timestamp
        const timestamp = new Date();
        setBatteryHistory(prev => {
          const lastEntry = prev.length > 0 ? prev[prev.length - 1] : null;
          const shouldAddEntry = !lastEntry || 
                               lastEntry.level !== apiLevelPercent || 
                               (timestamp - new Date(lastEntry.timestamp)) > 300000; // 5 minutos
          
          if (shouldAddEntry) {
            return [...prev, { 
              level: apiLevelPercent, 
              timestamp: timestamp.toISOString(), 
              isCharging: charging,
              isReal: true 
            }].slice(-60); // Keep the last 60 readings for graphs
          }
          return prev;
        });
      } catch (error) {
        console.error('Error fetching battery info:', error);
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchBatteryInfo();
    const intervalId = setInterval(fetchBatteryInfo, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Register external modules (for modules that are not using their own context)
  const registerModuleState = useCallback((moduleName, isActive) => {
    if (CONSUMPTION_RATES[moduleName]) {
      setActiveModules(prevModules => {
        // Si el estado no ha cambiado, no hacer nada para evitar rerenders
        if (prevModules[moduleName] === isActive) {
          return prevModules;
        }
        return {
          ...prevModules,
          [moduleName]: isActive
        };
      });
    }
  }, []);

  // Values to expose to consumers
  const contextValue = {
    batteryLevel,
    isCharging,
    batteryHistory,
    activeModules,
    registerModuleState,
    predictionData,
    consumptionRates: CONSUMPTION_RATES,
    batteryCapacity: BATTERY_CAPACITY
  };

  return (
    <BatteryContext.Provider value={contextValue}>
      {children}
    </BatteryContext.Provider>
  );
};

// Custom hook for using the context
export const useBattery = () => {
  const context = useContext(BatteryContext);
  if (context === undefined) {
    throw new Error('useBattery must be used within a BatteryProvider');
  }
  return context;
}; 