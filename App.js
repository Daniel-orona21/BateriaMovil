import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Login from './screens/Login';
import Inicio from './screens/Inicio';
import InformeBateria from './screens/InformeBateria';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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
          backgroundColor: 'rgba(55, 55, 55, 0.3)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0,
          height: 90,
        },
        tabBarItemStyle: {
          marginTop: 5,
        },
        headerStyle: {
          backgroundColor: 'rgba(55, 55, 55, 0.3)',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          elevation: 0,
        },
        headerTitleStyle: {
          color: '#ffffff',
          fontSize: 18,
        },
        headerTransparent: true,
      })}
    >
    <Tab.Screen 
      name="Inicio" 
      component={Inicio}
      options={{
        title: 'Cargando batería...', // temporal, se reemplaza luego
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

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
