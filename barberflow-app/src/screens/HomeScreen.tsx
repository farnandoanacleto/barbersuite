import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ navigation }: any) {
  const [cliente, setCliente] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) return;

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
        .eq('auth_id', authData.user.id)
        .single();

      setCliente(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator color="#B8973A" style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      {/* Card do Clube */}
      <View style={styles.clubeCard}>
        <Text style={styles.planoLabel}>
          ★ {cliente?.assinaturas?.[0]?.planos_clube?.nome || 'Sem plano'}
        </Text>
        <Text style={styles.nomeText}>
          Olá, {cliente?.nome?.split(' ')[0] ?? 'Cliente'}!
        </Text>
        <Text style={styles.clubeDesc}>Seu clube está ativo</Text>
      </View>

      {/* Grid de Ações Rápidas */}
      <View style={styles.quickGrid}>
        {[
          { label: 'Agendar',  icon: '📅', screen: 'Agenda'    },
          { label: 'Avaliar',  icon: '⭐', screen: 'Avaliar'   },
          { label: 'Indicar',  icon: '🤝', screen: 'Indicar'   },
          { label: 'Gift Card',icon: '🎁', screen: 'Gift Card' },
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
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  clubeCard: {
    backgroundColor: '#1A1610', margin: 16, borderRadius: 18,
    padding: 20, borderWidth: 1, borderColor: 'rgba(184,151,58,0.3)',
  },
  planoLabel: {
    color: '#D4AF5A', fontSize: 11, fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  },
  nomeText:   { color: '#FFFFFF', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  clubeDesc:  { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  quickGrid:  { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  quickBtn:   {
    width: '22%', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#E8E2D4',
  },
  quickIcon:  { fontSize: 22, marginBottom: 4 },
  quickLabel: { fontSize: 9, color: '#7A7060', textAlign: 'center', fontWeight: '500' },
});
