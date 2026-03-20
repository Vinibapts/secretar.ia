import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // ← ADICIONE
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';

import LoginScreen from './login';
import DashboardScreen from './dashboard';
import ChatScreen from './chat';
import AgendaScreen from './agenda';
import TasksScreen from './tasks';
import FinancesScreen from './finances';
import HabitsScreen from './habits';

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Dashboard: focused ? 'home' : 'home-outline',
            Chat: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
            Agenda: focused ? 'calendar' : 'calendar-outline',
            Tarefas: focused ? 'checkmark-circle' : 'checkmark-circle-outline',
            Finanças: focused ? 'wallet' : 'wallet-outline',
            Hábitos: focused ? 'heart' : 'heart-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Tarefas" component={TasksScreen} />
      <Tab.Screen name="Finanças" component={FinancesScreen} />
      <Tab.Screen name="Hábitos" component={HabitsScreen} />
    </Tab.Navigator>
  );
}

export default function Layout() {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  if (isLoggedIn === null) return null;

  return (
    <SafeAreaProvider> {/* ← WRAP AQUI */}
      <NavigationContainer>
        <StatusBar style="light" />
        {isLoggedIn ? (
          <MainTabs />
        ) : (
          <LoginScreen onLogin={() => setIsLoggedIn(true)} />
        )}
      </NavigationContainer>
    </SafeAreaProvider> 
  );
}
