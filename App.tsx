import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen      from './src/screens/HomeScreen';
import AgendaScreen    from './src/screens/AgendaScreen';
import NPSScreen       from './src/screens/NPSScreen';
import IndicacaoScreen from './src/screens/IndicacaoScreen';
import GiftCardScreen  from './src/screens/GiftCardScreen';

const Tab = createBottomTabNavigator();

const THEME = {
  gold:    '#B8973A',
  goldL:   '#D4AF5A',
  dark:    '#1A1610',
  dark2:   '#252018',
  surf:    '#FAFAF8',
  white:   '#FFFFFF',
  muted:   '#7A7060',
  bord:    '#E8E2D4',
  green:   '#2D6E3E',
  greenB:  '#EAF4ED',
  red:     '#A32D2D',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary:    THEME.gold,
            background: THEME.surf,
            card:       THEME.white,
            text:       THEME.dark,
            border:     THEME.bord,
            notification: THEME.gold,
          },
        }}
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor:   THEME.gold,
            tabBarInactiveTintColor: THEME.muted,
            tabBarStyle: {
              backgroundColor: THEME.white,
              borderTopColor:  THEME.bord,
              paddingBottom:   8,
              height:          60,
            },
            headerStyle:      { backgroundColor: THEME.dark },
            headerTintColor:  THEME.gold,
            headerTitleStyle: { fontWeight: '600' },
          })}
        >
          <Tab.Screen
            name="Início"
            component={HomeScreen}
            options={{ tabBarIcon: () => <Text style={{fontSize:20}}>🏠</Text> }}
          />
          <Tab.Screen
            name="Agenda"
            component={AgendaScreen}
            options={{ tabBarIcon: () => <Text style={{fontSize:20}}>📅</Text> }}
          />
          <Tab.Screen
            name="Avaliar"
            component={NPSScreen}
            options={{ tabBarIcon: () => <Text style={{fontSize:20}}>⭐</Text> }}
          />
          <Tab.Screen
            name="Indicar"
            component={IndicacaoScreen}
            options={{ tabBarIcon: () => <Text style={{fontSize:20}}>🤝</Text> }}
          />
          <Tab.Screen
            name="Gift Card"
            component={GiftCardScreen}
            options={{ tabBarIcon: () => <Text style={{fontSize:20}}>🎁</Text> }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
