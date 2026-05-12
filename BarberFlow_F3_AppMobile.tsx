// ============================================================
//  BarberFlow — App Mobile React Native (Expo)
//  Estrutura base pronta para desenvolvimento
//  Instale: npx create-expo-app barberflow-app --template blank-typescript
//  Depois copie este arquivo como App.tsx
// ============================================================

// ESTRUTURA DE ARQUIVOS RECOMENDADA:
// barberflow-app/
// ├── App.tsx                    ← este arquivo
// ├── app.json                   ← config Expo
// ├── src/
// │   ├── screens/
// │   │   ├── HomeScreen.tsx
// │   │   ├── AgendaScreen.tsx
// │   │   ├── NPSScreen.tsx
// │   │   ├── IndicacaoScreen.tsx
// │   │   └── GiftCardScreen.tsx
// │   ├── components/
// │   │   ├── ClubCard.tsx
// │   │   ├── ProximaVisita.tsx
// │   │   └── HistoricoItem.tsx
// │   ├── lib/
// │   │   └── supabase.ts        ← mesma lógica do web
// │   └── theme.ts               ← tokens de design
// └── assets/

// ─── DEPENDÊNCIAS ─────────────────────────────────────────────
// npm install @supabase/supabase-js
// npm install @react-navigation/native @react-navigation/bottom-tabs
// npm install react-native-screens react-native-safe-area-context
// npm install expo-notifications expo-sharing expo-clipboard

// ─── APP.TSX (estrutura principal) ───────────────────────────

/*
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import HomeScreen     from './src/screens/HomeScreen';
import AgendaScreen   from './src/screens/AgendaScreen';
import NPSScreen      from './src/screens/NPSScreen';
import IndicacaoScreen from './src/screens/IndicacaoScreen';
import GiftCardScreen from './src/screens/GiftCardScreen';

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
*/

// ─── HomeScreen.tsx (exemplo completo) ───────────────────────
/*
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }) {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('usuarios')
        .select(`
          nome, telefone, aniversario,
          assinaturas (
            status, uso_mes_atual,
            planos_clube ( nome, preco_mensal )
          ),
          crm_preferencias ( nps_ultimo )
        `)
        .eq('auth_id', user.user.id)
        .single();

      setCliente(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator color="#B8973A" style={{flex:1}} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.clubeCard}>
        <Text style={styles.planoLabel}>
          ★ {cliente?.assinaturas?.[0]?.planos_clube?.nome || 'Sem plano'}
        </Text>
        <Text style={styles.nomeText}>Olá, {cliente?.nome?.split(' ')[0]}!</Text>
        <Text style={styles.clubeDesc}>Seu clube está ativo</Text>
      </View>

      <View style={styles.quickGrid}>
        {[
          { label: 'Agendar',  icon: '📅', screen: 'Agenda'   },
          { label: 'Avaliar',  icon: '⭐', screen: 'Avaliar'  },
          { label: 'Indicar',  icon: '🤝', screen: 'Indicar'  },
          { label: 'Gift Card',icon: '🎁', screen: 'Gift Card'},
        ].map(q => (
          <TouchableOpacity
            key={q.screen}
            style={styles.quickBtn}
            onPress={() => navigation.navigate(q.screen)}
          >
            <Text style={styles.quickIcon}>{q.icon}</Text>
            <Text style={styles.quickLabel}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#FAFAF8' },
  clubeCard:  {
    backgroundColor: '#1A1610', margin: 16, borderRadius: 18,
    padding: 20, borderWidth: 1, borderColor: 'rgba(184,151,58,0.3)'
  },
  planoLabel: { color: '#D4AF5A', fontSize: 11, fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  nomeText:   { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  clubeDesc:  { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  quickGrid:  {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 8
  },
  quickBtn:   {
    width: '22%', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#E8E2D4'
  },
  quickIcon:  { fontSize: 22, marginBottom: 4 },
  quickLabel: { fontSize: 9, color: '#7A7060', textAlign: 'center', fontWeight: '500' },
});
*/

// ─── INTEGRAÇÃO COM SUPABASE ─────────────────────────────────
// O arquivo src/lib/supabase.ts é idêntico ao da versão web,
// mas use @supabase/supabase-js com AsyncStorage para React Native:

/*
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
*/

// ─── NOTIFICAÇÕES PUSH (Expo) ────────────────────────────────
/*
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registrarNotificacoes(cliente_id: string) {
  if (!Device.isDevice) return;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // salva o token no Supabase para envio via backend
  await supabase.from('usuarios').update({
    push_token: token
  }).eq('id', cliente_id);
}

// Lembrete 1h antes do agendamento (disparado pelo backend via Edge Function)
// Indicação convertida → notificação push automática
// NPS pós-atendimento → notificação 2h após conclusão
*/

export default {};
