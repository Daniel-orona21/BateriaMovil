import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { View, StyleSheet, LogBox, Text, Platform } from 'react-native';
import { useEffect } from 'react';
import { Image } from 'expo-image';
import Login from './screens/Login';
import Inicio from './screens/Inicio';
import InformeBateria from './screens/InformeBateria';
import { CameraProvider } from './context/CameraContext';

// Fix font errors by disabling font scaling and applying maximum patches
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
if (Platform.OS === 'ios') {
  Text.defaultProps.maxFontSizeMultiplier = 1.0;
}

// Ignorar todos los warnings
LogBox.ignoreAllLogs();

// Configurar el global cache de expo-image
Image.prefetchPolicy = 'memory-disk';
Image.contentFit = 'cover';
Image.transition = 0; // Desactivar transiciones para prevenir flashes

// Array de imágenes a precargar
const imagesToPreload = [
  require('./assets/IMG_1229.jpg'),
  require('./assets/IMG_1228.png')
];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarBackground = () => {
  return (
    <BlurView 
      tint="dark" 
      intensity={50} 
      style={StyleSheet.absoluteFill}
    />
  );
};

const HeaderBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView 
        tint="dark" 
        intensity={50} 
        style={[StyleSheet.absoluteFill, { borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}
      />
    </View>
  );
};

// Tema super simple sin ninguna referencia a fuentes
const customTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#ffffff',
    background: '#000000',
    card: '#121212',
    text: '#ffffff',
    border: '#272729',
    notification: '#ff453a',
  },
};

// Opciones de pantalla para NO usar fuentes personalizadas
const screenOptions = {
  contentStyle: {
    backgroundColor: '#000', // Fondo negro para prevenir flashes blancos
  }
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Inicio') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'InformeBateria') {
            iconName = focused ? 'battery-full' : 'battery-full-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0,
          height: 90,
        },
        tabBarBackground: TabBarBackground,
        tabBarItemStyle: {
          marginTop: 5,
        },
        headerStyle: {
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0,
        },
        headerTitleStyle: {
          color: '#ffffff',
          fontSize: 18,
          // NO usar fontFamily, solo fontWeight
          fontWeight: 'bold',
        },
        headerTransparent: true,
        headerBackground: HeaderBackground,
        ...screenOptions,
      })}
    >
    <Tab.Screen 
      name="Inicio" 
      component={Inicio}
      options={{
        title: 'Cargando batería...',
        tabBarLabel: 'Componentes',
      }}
    />
      <Tab.Screen 
        name="InformeBateria" 
        component={InformeBateria}
        options={{
          title: 'Informe Batería',
        }}
      />
    </Tab.Navigator>
  );
}

function AppContent() {
  // Precargar imágenes cuando se monta el componente
  useEffect(() => {
    const preloadImages = async () => {
      try {
        await Promise.all(
          imagesToPreload.map(img => Image.prefetch(img))
        );
        console.log('Imágenes precargadas correctamente');
      } catch (error) {
        console.error('Error al precargar imágenes:', error);
      }
    };
    
    preloadImages();
  }, []);

  return (
    <CameraProvider>
      <NavigationContainer theme={customTheme} fallback={<View style={{flex:1, backgroundColor:'#000'}}/>}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            ...screenOptions,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </CameraProvider>
  );
}

export default function App() {
  return <AppContent />;
}
