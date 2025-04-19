import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Platform, Animated, Easing } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { BlurView } from 'expo-blur';

export default function PedometerBox() {
  const [isActive, setIsActive] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  
  // Referencias
  const intervalRef = useRef(null);
  const accelSubscription = useRef(null);
  const startTimeRef = useRef(null);
  const initialStepCountRef = useRef(0);
  const tempStepCountRef = useRef(0);
  const lastStepsRef = useRef(0);
  const movementThreshold = 1.1; // Umbral de movimiento para detectar pasos

  // Animaciones
  const iconSizeAnim = useRef(new Animated.Value(60)).current;
  const iconPositionAnim = useRef(new Animated.Value(0)).current;
  const numberOpacityAnim = useRef(new Animated.Value(0)).current;
  const numberScaleAnim = useRef(new Animated.Value(0.5)).current;

  // Comprobar disponibilidad al inicio
  useEffect(() => {
    checkAvailability();
    
    return () => {
      stopPedometer();
    };
  }, []);
  
  // Reset animaciones cuando cambia el estado
  useEffect(() => {
    // Resetear animaciones antes de iniciar nuevas
    if (isActive) {
      // Resetear el estado de las animaciones para asegurar sincronización
      numberOpacityAnim.setValue(0);
      numberScaleAnim.setValue(0.5);
      
      // Iniciar todas las animaciones simultáneamente
      Animated.parallel([
        // Animar icono
        Animated.timing(iconSizeAnim, {
          toValue: 30,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(iconPositionAnim, {
          toValue: 50,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        
        // Animar número - exactamente al mismo tiempo
        Animated.timing(numberOpacityAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(numberScaleAnim, {
          toValue: 1.3,
          duration: 500,
          easing: Easing.out(Easing.cubic), // Usar la misma curva que el icono
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Resetear para desactivación
      Animated.parallel([
        // Animar icono - volver a la posición original
        Animated.timing(iconSizeAnim, {
          toValue: 60,
          duration: 500, 
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(iconPositionAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        
        // Animar número - simultáneamente (ahora con el mismo easing que el icono)
        Animated.timing(numberOpacityAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic), // Cambio de in a out para coincidir
          useNativeDriver: true
        }),
        Animated.timing(numberScaleAnim, {
          toValue: 0.5,
          duration: 500,
          easing: Easing.out(Easing.cubic), // Cambio de in a out para coincidir
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isActive]);
  
  const checkAvailability = async () => {
    try {
      const available = await Pedometer.isAvailableAsync();
      setIsPedometerAvailable(available);
    } catch (error) {
      console.log('Error al verificar disponibilidad del podómetro:', error);
      setIsPedometerAvailable(false);
    }
  };

  // Función para obtener el recuento de pasos entre dos fechas
  const getStepsBetweenDates = async (start, end) => {
    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result?.steps || 0;
    } catch (error) {
      console.log('Error al obtener pasos:', error);
      return 0;
    }
  };
  
  // Suscribirse al acelerómetro para detectar movimiento
  const subscribeToAccelerometer = () => {
    // Configurar el intervalo de actualización
    Accelerometer.setUpdateInterval(200); // 200ms = 5 veces por segundo
    
    accelSubscription.current = Accelerometer.addListener(data => {
      // Detectar movimiento significativo
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      
      // Si tenemos una aceleración significativa (diferente de la gravedad)
      // y superior a nuestro umbral, consideramos que está caminando
      if (magnitude > movementThreshold) {
        if (!isWalking) {
          setIsWalking(true);
          // Incrementar un contador temporal para feedback visual inmediato
          tempStepCountRef.current += 1;
          setStepCount(prevCount => tempStepCountRef.current);
        }
      } else {
        // No hay movimiento significativo
        setIsWalking(false);
      }
    });
  };
  
  // Cancelar suscripción al acelerómetro
  const unsubscribeFromAccelerometer = () => {
    if (accelSubscription.current) {
      accelSubscription.current.remove();
      accelSubscription.current = null;
    }
  };

  // Iniciar el contador de pasos
  const startPedometer = async () => {
    if (!isPedometerAvailable) return;
    
    try {
      // Guardar la hora de inicio exacta
      startTimeRef.current = new Date();
      tempStepCountRef.current = 0;
      
      // Obtener el número de pasos en los últimos 5 minutos como línea base
      const now = new Date();
      const fiveMinutesAgo = new Date(now);
      fiveMinutesAgo.setMinutes(now.getMinutes() - 5);
      
      const initialSteps = await getStepsBetweenDates(fiveMinutesAgo, now);
      initialStepCountRef.current = initialSteps;
      lastStepsRef.current = 0;
      
      // Iniciar con cero
      setStepCount(0);
      
      // Iniciar la detección de movimiento inmediata con el acelerómetro
      subscribeToAccelerometer();
      
      // Consultar el podómetro cada 200ms para detectar cambios oficiales
      intervalRef.current = setInterval(async () => {
        if (!startTimeRef.current) return;
        
        const currentTime = new Date();
        const checkTime = new Date(currentTime);
        checkTime.setMinutes(currentTime.getMinutes() - 5);
        
        // Obtener pasos totales desde el sistema
        const totalSteps = await getStepsBetweenDates(checkTime, currentTime);
        const stepsSinceStart = totalSteps - initialStepCountRef.current;
        
        // Solo actualizar si hay cambios reales desde el sistema
        if (stepsSinceStart > 0 && stepsSinceStart !== lastStepsRef.current) {
          lastStepsRef.current = stepsSinceStart;
          tempStepCountRef.current = stepsSinceStart; // Sincronizar el contador temporal
          setStepCount(stepsSinceStart);
        }
      }, 200);
      
    } catch (error) {
      console.log('Error al iniciar el podómetro:', error);
    }
  };

  // Detener el contador
  const stopPedometer = () => {
    // Detener el intervalo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Detener el acelerómetro
    unsubscribeFromAccelerometer();
    
    // Limpiar referencias
    startTimeRef.current = null;
    setIsWalking(false);
  };

  // Manejar activación/desactivación
  const handlePress = () => {
    const nextState = !isActive;
    setIsActive(nextState);

    if (nextState) {
      startPedometer();
    } else {
      stopPedometer();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.caja}
      onPress={handlePress}
    >
      <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.container}>
        {/* Número con animación de opacidad y escala */}
        <Animated.Text 
          style={[
            styles.counterText,
            { 
              opacity: numberOpacityAnim,
              transform: [{ scale: numberScaleAnim }]
            }
          ]}
        >
          {stepCount}
        </Animated.Text>
        
        {/* Icono con animación de tamaño y posición */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { translateY: iconPositionAnim },
                { scale: iconSizeAnim.interpolate({
                  inputRange: [30, 60],
                  outputRange: [0.5, 1]
                })}
              ]
            }
          ]}
        >
          <MaterialCommunityIcons 
            name="walk" 
            size={60}
            color="#fff" 
          />
        </Animated.View>
      </View>
      
      {!isPedometerAvailable && isPedometerAvailable !== null && (
        <View style={styles.notAvailableContainer}>
          <Text style={styles.notAvailableText}>No disponible</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caja: {
    width: 170,
    height: 170,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  cajaActiva: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#ffff',
  },
  iconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notAvailableContainer: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
    padding: 5,
    borderRadius: 10,
  },
  notAvailableText: {
    color: '#FFFFFF',
    fontSize: 12,
  }
}); 