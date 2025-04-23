import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useBattery } from '../context/BatteryContext';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');
const cardWidth = width - 32;

export default function Calculations() {
  const { 
    batteryLevel,
    isCharging, 
    predictionData, 
    batteryCapacity,
    consumptionRates,
    activeModules,
    deviceInfo = {
      model: 'iPhone',
      manufacturer: 'Apple',
      batteryTechnology: 'Li-ion',
      maxChargePower: '20W',
      maxChargeCurrent: '3000mA',
    }
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
      {/* Background gradient */}
      <View style={styles.gradientBackground} />
      
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Principios de baterías Li-ion */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={100}
            style={styles.section}
          >
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="battery-charging-100" size={22} color="#4CD964" />
              <Text style={styles.sectionTitle}>Principios de Baterías Li-ion</Text>
            </View>
            
            <View style={styles.liIonContainer}>
              <View style={styles.liIonStages}>
                <View style={styles.stageBox}>
                  <Text style={styles.stageTitle}>Fase CC</Text>
                  <MaterialCommunityIcons name="arrow-up" size={24} color="#4CD964" style={styles.stageIcon} />
                  <Text style={styles.stageDescription}>Corriente Constante (0-80%)</Text>
                </View>
                <View style={styles.stageDivider} />
                <View style={styles.stageBox}>
                  <Text style={styles.stageTitle}>Fase CV</Text>
                  <MaterialCommunityIcons name="arrow-down" size={24} color="#FF9500" style={styles.stageIcon} />
                  <Text style={styles.stageDescription}>Voltaje Constante (80-100%)</Text>
                </View>
              </View>
              
              <Text style={styles.explanationText}>
                Las baterías de iones de litio se cargan en un proceso de dos fases:
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Fase de Corriente Constante (CC)</Text>
                <Text style={styles.infoCardText}>
                  Durante la primera fase (0-80%), el cargador mantiene una corriente constante mientras el voltaje aumenta gradualmente. La batería se carga rápidamente al inicio, absorbiendo la máxima potencia.
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoCardTitle}>Fase de Voltaje Constante (CV)</Text>
                <Text style={styles.infoCardText}>
                  En la segunda fase (80-100%), el voltaje alcanza su máximo y se mantiene constante, mientras la corriente disminuye gradualmente. Esto protege la batería y extiende su vida útil, pero hace que el último 20% se cargue más lentamente.
                </Text>
              </View>
              
              <View style={styles.batterySpecs}>
                <Text style={styles.batterySpecsTitle}>Especificaciones de la batería:</Text>
                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <MaterialCommunityIcons name="battery" size={20} color="#4CD964" />
                    <Text style={styles.specLabel}>Capacidad:</Text>
                    <Text style={styles.specValue}>{batteryCapacity} mAh</Text>
                  </View>
                  <View style={styles.specItem}>
                    <MaterialCommunityIcons name="lightning-bolt" size={20} color="#4CD964" />
                    <Text style={styles.specLabel}>Tecnología:</Text>
                    <Text style={styles.specValue}>{deviceInfo.batteryTechnology}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <MaterialCommunityIcons name="flash" size={20} color="#4CD964" />
                    <Text style={styles.specLabel}>Potencia máx:</Text>
                    <Text style={styles.specValue}>{deviceInfo.maxChargePower}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <MaterialCommunityIcons name="current-ac" size={20} color="#4CD964" />
                    <Text style={styles.specLabel}>Corriente máx:</Text>
                    <Text style={styles.specValue}>{deviceInfo.maxChargeCurrent}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animatable.View>
          
          {/* Sección de modelos matemáticos */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={200}
            style={styles.section}
          >
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="function-variant" size={22} color="#5E5CE6" />
              <Text style={styles.sectionTitle}>Modelos Matemáticos</Text>
            </View>
            
            <View style={styles.modelContainer}>
              <Text style={styles.modelTitle}>Ecuación de Consumo de Batería:</Text>
              <Text style={styles.equation}>dB/dt = -k(∑(Ci * Ai)) - B0</Text>
              
              <View style={styles.equationVisual}>
                <View style={styles.visualBox}>
                  <Text style={styles.visualTitle}>dB/dt</Text>
                  <Text style={styles.visualDescription}>Tasa de cambio del nivel de batería (%/h)</Text>
                </View>
                <MaterialCommunityIcons name="equal" size={24} color="#ccc" />
                <View style={styles.visualBox}>
                  <Text style={styles.visualTitle}>Consumo</Text>
                  <Text style={styles.visualDescription}>Suma de consumos activos + consumo base</Text>
                </View>
              </View>
              
              <Text style={styles.equationExplanation}>
                Esta ecuación diferencial describe cómo cambia el nivel de batería a lo largo del tiempo:
              </Text>
              
              <View style={styles.paramsList}>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>B</Text>
                  <Text style={styles.paramDescription}>Nivel de batería en porcentaje (0-100%)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>t</Text>
                  <Text style={styles.paramDescription}>Tiempo en horas</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>k</Text>
                  <Text style={styles.paramDescription}>Coeficiente de capacidad de batería (ajusta mAh a %)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>Ci</Text>
                  <Text style={styles.paramDescription}>Consumo energético del componente i (mAh/h)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>Ai</Text>
                  <Text style={styles.paramDescription}>Estado de activación del componente i (1=activo, 0=inactivo)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>B0</Text>
                  <Text style={styles.paramDescription}>Consumo base del dispositivo (mAh/h)</Text>
                </View>
              </View>
              
              <Text style={styles.equationNote}>
                La ecuación predice cuánto durará la batería considerando qué componentes están activos. Si todos los módulos están inactivos, solo se considera el consumo base (B0).
              </Text>
            </View>
            
            <View style={styles.modelContainer}>
              <Text style={styles.modelTitle}>Modelo de Carga (Curva CC-CV):</Text>
              
              <View style={styles.chargingEquations}>
                <View style={styles.chargePhase}>
                  <Text style={styles.phaseTitle}>Fase CC (0-80%):</Text>
                  <Text style={styles.equation}>dB/dt = I * η / C</Text>
                  <Text style={styles.phaseDescription}>
                    Carga rápida a corriente constante, donde la tasa de carga es directamente proporcional a la corriente aplicada.
                  </Text>
                </View>
                
                <View style={styles.chargePhase}>
                  <Text style={styles.phaseTitle}>Fase CV (80-100%):</Text>
                  <Text style={styles.equation}>dB/dt = I * e^(-(B-80)/τ) * η / C</Text>
                  <Text style={styles.phaseDescription}>
                    Carga más lenta a voltaje constante, donde la corriente disminuye exponencialmente.
                  </Text>
                </View>
              </View>
              
              <View style={styles.paramsList}>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>I</Text>
                  <Text style={styles.paramDescription}>Corriente máxima de carga (mA)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>η</Text>
                  <Text style={styles.paramDescription}>Eficiencia de carga (92%)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>C</Text>
                  <Text style={styles.paramDescription}>Capacidad de la batería ({batteryCapacity} mAh)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>τ</Text>
                  <Text style={styles.paramDescription}>Constante de tiempo para la fase CV (0.35h)</Text>
                </View>
                <View style={styles.paramRow}>
                  <Text style={styles.paramSymbol}>e^(-x)</Text>
                  <Text style={styles.paramDescription}>Función exponencial decreciente</Text>
                </View>
              </View>
              
              <Text style={styles.equationNote}>
                Este modelo de dos fases explica por qué tu teléfono se carga rápido al principio pero mucho más lento cerca del 100%. Es una característica de diseño para proteger la batería.
              </Text>
            </View>
          </Animatable.View>
          
          {/* Sección de consumo actual */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={300}
            style={styles.section}
          >
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="battery-charging-outline" size={22} color="#FF9500" />
              <Text style={styles.sectionTitle}>Consumo Actual</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.largeStatCard}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="flash-outline" size={32} color="#FF9500" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statLabel}>Consumo total:</Text>
                  <Text style={styles.largeStatValue}>{totalConsumption.toFixed(0)} <Text style={styles.statUnit}>mAh/h</Text></Text>
                  <Text style={styles.statDescription}>
                    Potencia que consume el dispositivo actualmente
                  </Text>
                </View>
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="speedometer" size={24} color="#5E5CE6" />
                  <Text style={styles.statLabel}>Tasa de consumo:</Text>
                  <Text style={styles.statValue}>{predictionData.consumptionRate.toFixed(2)} <Text style={styles.statUnit}>%/h</Text></Text>
                </View>
                
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="battery-50" size={24} color="#4CD964" />
                  <Text style={styles.statLabel}>Nivel actual:</Text>
                  <Text style={styles.statValue}>{batteryLevel}<Text style={styles.statUnit}>%</Text></Text>
                </View>
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
                    <Text style={[
                      styles.componentDescription, 
                      component !== 'baseline' && !activeModules[component] && styles.inactiveText
                    ]}>
                      {getComponentDescription(component)}
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
          </Animatable.View>
          
          {/* Sección de tiempos estimados */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={400}
            style={styles.section}
          >
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="clock-outline" size={22} color="#FF2D55" />
              <Text style={styles.sectionTitle}>Tiempos Estimados</Text>
            </View>
            
            <View style={styles.estimatesContainer}>
              {isCharging ? (
                <>
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-charging" size={34} color="#4CD964" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta carga completa:</Text>
                      <Text style={styles.estimateValue}>{formatTime(predictionData.timeToFull)}</Text>
                      <Text style={styles.estimateDescription}>
                        Estimación basada en la tasa actual de carga y el patrón CC-CV
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-60" size={34} color="#FF9500" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta 80%:</Text>
                      <Text style={styles.estimateValue}>
                        {batteryLevel >= 80 ? 'Ya alcanzado' : 
                          formatTime((80 - batteryLevel) / (predictionData.consumptionRate * (isCharging ? 1 : -1)))}
                      </Text>
                      <Text style={styles.estimateDescription}>
                        El 80% marca el punto donde la carga comienza a desacelerarse
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-outline" size={34} color="#FF3B30" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta agotamiento:</Text>
                      <Text style={styles.estimateValue}>{formatTime(predictionData.timeToEmpty)}</Text>
                      <Text style={styles.estimateDescription}>
                        Estimación basada en el consumo actual de los componentes activos
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.estimateRow}>
                    <MaterialCommunityIcons name="battery-30" size={34} color="#FF9500" style={styles.estimateIcon} />
                    <View style={styles.estimateContent}>
                      <Text style={styles.estimateLabel}>Tiempo hasta 20%:</Text>
                      <Text style={styles.estimateValue}>
                        {batteryLevel <= 20 ? 'Ya alcanzado' : 
                          formatTime((batteryLevel - 20) / predictionData.consumptionRate)}
                      </Text>
                      <Text style={styles.estimateDescription}>
                        El 20% es el nivel donde se activa el modo de bajo consumo
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </Animatable.View>
          
          {/* Sección de ejemplo práctico */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={600} 
            delay={500}
            style={styles.section}
          >
            <BlurView intensity={40} tint="dark" style={[StyleSheet.absoluteFill, styles.sectionBlur]} />
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="lightbulb-on-outline" size={22} color="#FFC107" />
              <Text style={styles.sectionTitle}>Ejemplo Práctico</Text>
            </View>
            
            <Text style={styles.explanationText}>
              Veamos cómo calcular el consumo de batería y tiempo restante con dos módulos activos:
            </Text>
            
            <View style={styles.exampleCard}>
              <Text style={styles.exampleCardTitle}>Escenario: Cámara + GPS activos</Text>
              
              <Text style={styles.equationExplanationText}>
                Aplicaremos la ecuación diferencial que describe el consumo de batería:
              </Text>
              
              <Text style={styles.equationHighlight}>dB/dt = -k(∑(Ci * Ai)) - B0</Text>
              
              <Text style={styles.equationExplanationText}>
                Donde <Text style={styles.equationVariable}>dB/dt</Text> representa la tasa de cambio del nivel de batería con respecto al tiempo, medida en %/h.
              </Text>
              
              <View style={styles.exampleModules}>
                <View style={styles.exampleModule}>
                  <MaterialCommunityIcons name="camera" size={24} color="#4CD964" />
                  <Text style={styles.exampleModuleName}>Cámara</Text>
                  <Text style={styles.exampleModuleRate}>350 mAh/h</Text>
                </View>
                <MaterialCommunityIcons name="plus" size={20} color="#ccc" />
                <View style={styles.exampleModule}>
                  <MaterialCommunityIcons name="map" size={24} color="#4CD964" />
                  <Text style={styles.exampleModuleName}>GPS</Text>
                  <Text style={styles.exampleModuleRate}>300 mAh/h</Text>
                </View>
                <MaterialCommunityIcons name="plus" size={20} color="#ccc" />
                <View style={styles.exampleModule}>
                  <MaterialCommunityIcons name="cellphone" size={24} color="#ccc" />
                  <Text style={styles.exampleModuleName}>Base</Text>
                  <Text style={styles.exampleModuleRate}>500 mAh/h</Text>
                </View>
              </View>
              
              <View style={styles.calculationSteps}>
                <Text style={styles.calculationTitle}>Resolución de la ecuación diferencial:</Text>
                
                <View style={styles.calculationStep}>
                  <Text style={styles.stepNumber}>1</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Identificar las variables de la ecuación</Text>
                    <Text style={styles.stepFormula}>dB/dt = -k(∑(Ci * Ai)) - B0</Text>
                    <Text style={styles.stepExplanation}>
                      • B = nivel de batería (%)
                      {'\n'}• k = factor de conversión (0.01 = 1/{batteryCapacity})
                      {'\n'}• Ci = consumo de cada componente i (mAh/h)
                      {'\n'}• Ai = estado de activación (1=activo, 0=inactivo)
                      {'\n'}• B0 = consumo base ({consumptionRates.baseline} mAh/h)
                    </Text>
                  </View>
                </View>
                
                <View style={styles.calculationStep}>
                  <Text style={styles.stepNumber}>2</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Calcular el sumatorio Σ(Ci * Ai)</Text>
                    <Text style={styles.stepFormula}>Σ(Ci * Ai) = (350 × 1) + (300 × 1) + otros_componentes × 0</Text>
                    <Text style={styles.stepResult}>Σ(Ci * Ai) = 350 + 300 = 650 mAh/h</Text>
                  </View>
                </View>
                
                <View style={styles.calculationStep}>
                  <Text style={styles.stepNumber}>3</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Sustituir en la ecuación diferencial</Text>
                    <Text style={styles.stepFormula}>dB/dt = -k(650) - 500</Text>
                    <Text style={styles.stepFormula}>dB/dt = -(0.01 × 650) - 500 mAh/h</Text>
                    <Text style={styles.stepResult}>dB/dt = -6.5 - 5 = -11.5 %/h</Text>
                  </View>
                </View>
                
                <View style={styles.calculationStep}>
                  <Text style={styles.stepNumber}>4</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Interpretar el resultado</Text>
                    <Text style={styles.stepExplanation}>
                      El signo negativo indica que la batería se está descargando.
                      La tasa de descarga es de 11.5% por hora, lo que significa que perdemos
                      aproximadamente 11.5% de batería cada hora que usamos la cámara y el GPS juntos.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.calculationStep}>
                  <Text style={styles.stepNumber}>5</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Calcular tiempo hasta agotamiento</Text>
                    <Text style={styles.stepFormula}>Tiempo restante = Nivel actual / |dB/dt|</Text>
                    <Text style={styles.stepResult}>Tiempo restante = {batteryLevel}% / 11.5%/h = {(batteryLevel / 11.5).toFixed(2)} horas</Text>
                    <Text style={styles.stepResult}>= {formatTime(batteryLevel / 11.5)}</Text>
                  </View>
                </View>
                
                <View style={styles.calculationStep}>
                  <Text style={styles.stepNumber}>6</Text>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Solución de la ecuación diferencial</Text>
                    <Text style={styles.stepFormula}>B(t) = B₀ - (k·Σ(Ci·Ai) + B0)·t</Text>
                    <Text style={styles.stepExplanation}>
                      Donde B₀ es el nivel inicial de batería y t es el tiempo en horas.
                      Esta ecuación nos permite predecir el nivel de batería en cualquier momento futuro.
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.exampleSummary}>
                <MaterialCommunityIcons name="information-outline" size={20} color="#5E5CE6" />
                <Text style={styles.summaryText}>
                  Esta ecuación diferencial modela el comportamiento lineal de descarga de la batería cuando la tasa de consumo es constante. En la práctica, el consumo puede variar según el uso específico de cada componente y otros factores como la temperatura del dispositivo.
                </Text>
              </View>
            </View>
            
            <View style={styles.tipBox}>
              <MaterialCommunityIcons name="lightbulb-on" size={24} color="#FFC107" style={styles.tipIcon} />
              <Text style={styles.tipText}>
                Si desactivas el GPS (Ai = 0 para GPS), la ecuación se convierte en dB/dt = -k(350) - 500, reduciendo la tasa de descarga a -{((0.01 * 350) + 5).toFixed(1)}%/h, lo que aumenta el tiempo de batería en aproximadamente un 26%.
              </Text>
            </View>
          </Animatable.View>
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

// Función para obtener la descripción del componente
function getComponentDescription(component) {
  const descriptions = {
    camera: 'Sensor de imagen y procesamiento',
    compass: 'Sensores de orientación',
    flashlight: 'LED de alta potencia',
    map: 'GPS y servicios de ubicación',
    pedometer: 'Sensores de movimiento',
    vibration: 'Motor háptico',
    baseline: 'Consumo mínimo del sistema'
  };
  
  return descriptions[component] || '';
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
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    opacity: 0.9,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionBlur: {
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  liIonContainer: {
    marginBottom: 10,
  },
  liIonStages: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  stageBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  stageTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  stageIcon: {
    marginBottom: 8,
  },
  stageDescription: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
  },
  explanationText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#4CD964',
  },
  infoCardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  infoCardText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  batterySpecs: {
    marginTop: 16,
  },
  batterySpecsTitle: {
    color: 'white',
    fontSize: 15,
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  specItem: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 12,
    flexDirection: 'column',
  },
  specLabel: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 4,
  },
  specValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modelContainer: {
    marginBottom: 24,
  },
  modelTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
  },
  equation: {
    fontFamily: 'Courier',
    fontSize: 16,
    color: '#4CD964',
    marginVertical: 8,
  },
  equationVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
  },
  visualBox: {
    flex: 1,
    alignItems: 'center',
  },
  visualTitle: {
    color: '#4CD964',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
  },
  visualDescription: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
  },
  equationExplanation: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
    marginBottom: 12,
  },
  paramsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  paramRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paramSymbol: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5E5CE6',
  },
  paramDescription: {
    flex: 1,
    fontSize: 14,
    color: '#ccc',
  },
  equationNote: {
    color: '#FF9500',
    fontSize: 14,
    marginTop: 16,
    fontStyle: 'italic',
  },
  chargingEquations: {
    marginVertical: 16,
  },
  chargePhase: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  phaseTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  phaseDescription: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  largeStatCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statContent: {
    flex: 1,
  },
  largeStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  statDescription: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statUnit: {
    fontSize: 14,
    color: '#aaa',
  },
  componentsList: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  componentsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  componentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  componentNameContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  componentIcon: {
    marginRight: 8,
    marginBottom: 4,
  },
  componentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  componentDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  rateContainer: {
    width: 90,
    alignItems: 'flex-end',
    marginRight: 8,
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
    paddingVertical: 4,
    borderRadius: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  estimateIcon: {
    marginRight: 16,
  },
  estimateContent: {
    flex: 1,
  },
  estimateLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  estimateValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  estimateDescription: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 4,
  },
  exampleCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  exampleCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  exampleModules: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  exampleModule: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  exampleModuleName: {
    fontSize: 14,
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  exampleModuleRate: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: 'bold',
  },
  calculationSteps: {
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  calculationStep: {
    flexDirection: 'row',
    marginBottom: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#5E5CE6',
    paddingLeft: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#5E5CE6',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 12,
    overflow: 'hidden',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepFormula: {
    fontSize: 14,
    color: '#ccc',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  stepResult: {
    fontSize: 14,
    color: '#4CD964',
    fontWeight: 'bold',
    fontFamily: 'Courier',
  },
  stepExplanation: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginTop: 8,
  },
  exampleSummary: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
  equationExplanationText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  equationHighlight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CD964',
  },
  equationVariable: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#5E5CE6',
  },
}); 