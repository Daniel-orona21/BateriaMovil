import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { useCamera } from './CameraContext';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

// Constantes para cálculos de consumo de batería
// Estos valores representan mAh por hora para cada componente cuando está activo
const BATTERY_CAPACITY = 3877; // mAh para el dispositivo
const CONSUMPTION_RATES = {
  // Consumo base cuando la aplicación está funcionando pero sin módulos activos
  baseline: 450,  // Aumentado de 150 a 450 para un consumo más realista
  // Tasas de consumo adicionales para cada módulo en mAh/hora
  camera: 350,
  compass: 50,
  flashlight: 250,
  map: 300,
  pedometer: 30,
  vibration: 100
};

// Modelo de batería de iones de litio - Basado en ecuaciones diferenciales simplificadas
// Parámetros para un cargador de 20W con batería de 3877mAh
const CHARGE_PARAMS = {
  // Corriente máxima durante la fase de corriente constante (CC)
  maxCurrent: 4000, // 4A máximo para un cargador de 20W (ajustado para coincidir con tiempos reales)
  
  // Umbral donde inicia la fase de voltaje constante (CV) - típicamente 70-80%
  cvThreshold: 80, // Ajustado a 80% según datos reales
  
  // Tasa de eficiencia de carga (pérdidas térmicas, etc.)
  efficiency: 0.92, // Ajustada para tiempos reales
  
  // Constante de tiempo para la fase CV (horas)
  cvTimeConstant: 0.35, // Reducida para acelerar la fase CV (ajustada a datos reales)
  
  // Corriente mínima al final de la carga (porcentaje de la máxima)
  terminationCurrent: 0.1 // 10% de la corriente máxima (ajustado para tiempos reales)
};

// Crear el contexto
const BatteryContext = createContext();

// Componente proveedor
export const BatteryProvider = ({ children }) => {
  // Estado de la batería
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

  // Actualizar estado del módulo basado en isCameraActive desde CameraContext
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

  // Calcular tiempo de carga basado en el modelo de carga CC-CV y el consumo actual
  const calculateChargingTime = useCallback((startLevel, totalConsumption) => {
    // Parámetros del modelo
    const { maxCurrent, cvThreshold, efficiency, cvTimeConstant, terminationCurrent } = CHARGE_PARAMS;
    
    // Corriente efectiva (considerando consumo de dispositivo)
    const effectiveMaxCurrent = Math.max(50, maxCurrent * efficiency - totalConsumption);
    
    // Convertir corriente a tasa de cambio de porcentaje de batería por hora
    const ccRatePerHour = (effectiveMaxCurrent / BATTERY_CAPACITY) * 100;
    
    let timeToFull = 0;
    
    // Si el nivel inicial ya está en o por encima del umbral CV
    if (startLevel >= cvThreshold) {
      // Sólo fase CV (voltaje constante) - la corriente decrece exponencialmente
      // Solución de la ecuación diferencial: dB/dt = k * e^(-t/τ) - d
      // donde B = nivel de batería, k = tasa inicial, τ = constante de tiempo, d = consumo
      
      // Encontrar el tiempo para ir desde el nivel actual hasta 99.5%
      // Usando la aproximación: t = -τ * ln((100 - endLevel) / (100 - startLevel))
      // Con factor de corrección por el consumo
      const remaining = 99.5 - startLevel;
      
      // Ajuste de corriente inicial basado en dónde comienza en la curva CV
      const currentFactor = Math.exp(-(startLevel - cvThreshold) / (100 - cvThreshold) / cvTimeConstant);
      const initialCVRate = ccRatePerHour * currentFactor;
      
      // Tiempo basado en el modelo exponencial
      timeToFull = cvTimeConstant * Math.log(initialCVRate / (terminationCurrent * ccRatePerHour));
      
      // Factor de corrección basado en consumo
      const consumptionFactor = 1 + (totalConsumption / (maxCurrent * efficiency)) * 0.5;
      timeToFull *= consumptionFactor;
    } else {
      // Fase CC: El tiempo es lineal hasta llegar al umbral CV
      const ccTimeToThreshold = (cvThreshold - startLevel) / ccRatePerHour;
      
      // Fase CV: Desde el umbral hasta 99.5%
      // Usando el modelo exponencial de decaimiento de corriente
      const cvTime = cvTimeConstant * Math.log(1 / terminationCurrent);
      
      // Factor de corrección basado en consumo
      const consumptionFactor = 1 + (totalConsumption / (maxCurrent * efficiency)) * 0.5;
      
      // Tiempo total
      timeToFull = ccTimeToThreshold + (cvTime * consumptionFactor);
    }
    
    // Limitar tiempo máximo a algo razonable
    return Math.min(12, Math.max(0.1, timeToFull));
  }, []);

  // Actualizar predicciones cuando cambia el estado de los módulos
  useEffect(() => {
    const totalConsumption = calculateTotalConsumption();
    
    // Convertir mAh/hora a porcentaje/hora
    const consumptionRatePercentPerHour = (totalConsumption / BATTERY_CAPACITY) * 100;
    
    // Calcular tiempo restante hasta agotar (en horas)
    const timeToEmpty = isCharging ? 0 : batteryLevel / consumptionRatePercentPerHour;
    
    // Calcular tiempo hasta carga completa
    const timeToFull = isCharging ? calculateChargingTime(batteryLevel, totalConsumption) : 0;
    
    // Generar puntos para la predicción futura
    const futureLevels = [];
    const now = new Date();
    
    // Agregar el punto actual
    futureLevels.push({
      level: batteryLevel,
      timestamp: now.toISOString(),
      isReal: true
    });
    
    // Generar puntos futuros de predicción
    if (!isCharging) {
      // Modelo de descarga: Linear con tasa constante
      let futureLevel = batteryLevel;
      const stepSizeHours = 0.5; // 30 minutos
      
      for (let i = 1; i <= 24; i++) {
        // Decrementar nivel en base a la tasa de consumo
        futureLevel -= consumptionRatePercentPerHour * stepSizeHours;
        
        // Si la batería se agotaría, agregar el punto final y terminar
        if (futureLevel <= 0) {
          const emptyTime = new Date(now.getTime() + (timeToEmpty * 3600000));
          futureLevels.push({
            level: 0,
            timestamp: emptyTime.toISOString(),
            isReal: false
          });
          break;
        }
        
        // Agregar punto de predicción
        const futureTime = new Date(now.getTime() + i * stepSizeHours * 3600000);
        futureLevels.push({
          level: Math.round(futureLevel),
          timestamp: futureTime.toISOString(),
          isReal: false
        });
      }
    } else {
      // Modelo de carga: CC-CV (Corriente Constante-Voltaje Constante)
      const { cvThreshold } = CHARGE_PARAMS;
      const stepSizeHours = 0.25; // 15 minutos para mayor resolución
      let currentLevel = batteryLevel;
      
      // Calcular la tasa de carga CC (corriente constante) en %/hora
      const effectiveMaxCurrent = Math.max(50, CHARGE_PARAMS.maxCurrent * CHARGE_PARAMS.efficiency - totalConsumption);
      const ccRatePerHour = (effectiveMaxCurrent / BATTERY_CAPACITY) * 100;
      
      // Determinar puntos hasta llegar al 100%
      let timeElapsed = 0;
      let i = 0;
      
      while (currentLevel < 99.5 && i < 48) { // Máximo 12 horas (48 puntos de 15 min)
        i++;
        timeElapsed += stepSizeHours;
        
        // Calcular el nuevo nivel basado en fase de carga
        if (currentLevel < cvThreshold) {
          // Fase CC: incremento lineal
          currentLevel += ccRatePerHour * stepSizeHours;
        } else {
          // Fase CV: incremento exponencial decreciente
          // Implementación de la ecuación diferencial:
          // dB/dt = k * e^(-(B-threshold)/(100-threshold)/τ)
          const progress = (currentLevel - cvThreshold) / (100 - cvThreshold);
          const decayFactor = Math.exp(-progress / CHARGE_PARAMS.cvTimeConstant);
          const cvRate = ccRatePerHour * decayFactor;
          
          // Incremento con tasa variable
          currentLevel += cvRate * stepSizeHours;
        }
        
        // Limitar a 100%
        currentLevel = Math.min(100, currentLevel);
        
        // Agregar punto
        const futureTime = new Date(now.getTime() + timeElapsed * 3600000);
        futureLevels.push({
          level: Math.round(currentLevel),
          timestamp: futureTime.toISOString(),
          isReal: false
        });
        
        // Si alcanzamos 99.5% o más, considerar carga completa
        if (currentLevel >= 99.5) {
          // Reemplazar último punto con exactamente 100%
          futureLevels[futureLevels.length - 1] = {
            level: 100,
            timestamp: new Date(now.getTime() + timeToFull * 3600000).toISOString(),
            isReal: false
          };
          break;
        }
      }
    }
    
    setPredictionData({
      timeToEmpty: parseFloat(timeToEmpty.toFixed(2)),
      timeToFull: parseFloat(timeToFull.toFixed(2)),
      consumptionRate: parseFloat(consumptionRatePercentPerHour.toFixed(2)),
      futureLevels
    });
  }, [activeModules, batteryLevel, isCharging, calculateTotalConsumption, calculateChargingTime]);

  // Obtener nivel de batería regularmente
  useEffect(() => {
    const fetchBatteryInfo = async () => {
      try {
        const level = await DeviceInfo.getBatteryLevel();
        const apiLevelPercent = Math.round(level * 100);
        setBatteryLevel(apiLevelPercent);
        
        const charging = await DeviceInfo.isBatteryCharging();
        setIsCharging(charging);
        
        // Añadir al historial con marca de tiempo
        const timestamp = new Date();
        setBatteryHistory(prev => {
          const lastEntry = prev.length > 0 ? prev[prev.length - 1] : null;
          const shouldAddEntry = !lastEntry || 
                               lastEntry.level !== apiLevelPercent || 
                               lastEntry.isCharging !== charging ||
                               (timestamp - new Date(lastEntry.timestamp)) > 300000; // 5 minutos
          
          if (shouldAddEntry) {
            return [...prev, { 
              level: apiLevelPercent, 
              timestamp: timestamp.toISOString(), 
              isCharging: charging,
              isReal: true 
            }].slice(-60); // Mantener las últimas 60 lecturas para gráficos
          }
          return prev;
        });
      } catch (error) {
        console.error('Error al obtener información de la batería:', error);
      }
    };

    // Obtener información inmediatamente
    fetchBatteryInfo();
    
    // Configurar un intervalo más corto (5 segundos) para actualizar más rápido
    const intervalId = setInterval(fetchBatteryInfo, 5000);
    
    // Configurar un intervalo más frecuente para detectar cambios de estado de carga
    // Esta es una alternativa a los event listeners que no están disponibles
    const chargeDetectionId = setInterval(async () => {
      try {
        const charging = await DeviceInfo.isBatteryCharging();
        
        // Si detectamos un cambio en el estado de carga, actualizar inmediatamente
        if (charging !== isCharging) {
          console.log('Cambio detectado en estado de carga:', charging ? 'Cargando' : 'Desconectado');
          setIsCharging(charging);
          fetchBatteryInfo(); // Actualizar todos los datos
        }
      } catch (error) {
        console.error('Error al verificar estado de carga:', error);
      }
    }, 1000); // Verificar cada segundo para detectar cambios rápidos
    
    // Limpiar los intervalos al desmontar
    return () => {
      clearInterval(intervalId);
      clearInterval(chargeDetectionId);
    };
  }, [isCharging]); // Añadir isCharging como dependencia para que la comparación funcione correctamente

  // Registrar módulos externos (para módulos que no utilizan su propio contexto)
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

  // Valores a exponer a los consumidores
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

// Hook personalizado para usar el contexto
export const useBattery = () => {
  const context = useContext(BatteryContext);
  if (context === undefined) {
    throw new Error('useBattery debe usarse dentro de un BatteryProvider');
  }
  return context;
}; 