import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AgendaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📅</Text>
      <Text style={styles.title}>Agenda</Text>
      <Text style={styles.subtitle}>Em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' },
  icon: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1610', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#7A7060' },
});
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';

const SERVICOS = [
  { id: 1, nome: 'Corte clássico', duracao: '45min', preco: 'R$60', icon: '✂️' },
  { id: 2, nome: 'Fade premium', duracao: '60min', preco: 'R$80', icon: '💈' },
  { id: 3, nome: 'Barba luxo', duracao: '30min', preco: 'R$50', icon: '🪒' },
  { id: 4, nome: 'Corte + Barba', duracao: '75min', preco: 'R$120', icon: '✨' },
  { id: 5, nome: 'Skincare facial', duracao: '45min', preco: 'R$90', icon: '🧴' },
  { id: 6, nome: 'Combo Black', duracao: '90min', preco: 'R$180', icon: '👑' },
];

const BARBEIROS = [
  { id: 1, iniciais: 'RM', nome: 'Rafael M.', especialidade: 'Fade · Barba clássica' },
  { id: 2, iniciais: 'TG', nome: 'Thiago S.', especialidade: 'Corte moderno · Skincare' },
  { id: 3, iniciais: 'BK', nome: 'Bruno K.', especialidade: 'Degradê · Navalhado' },
  { id: 4, iniciais: 'LP', nome: 'Lucas P.', especialidade: 'Corte clássico · Infantil' },
  { id: 0, iniciais: '✦', nome: 'Melhor disponível', especialidade: 'IA escolhe o ideal para você' },
];

const DIAS = [
  { data: '14 Abr', dia: 'Seg', slots: ['09:00', '10:00', '14:00', '15:30'] },
  { data: '15 Abr', dia: 'Ter', slots: ['08:30', '09:30', '11:00', '16:00'] },
  { data: '16 Abr', dia: 'Qua', slots: ['10:00', '13:00', '14:30'] },
  { data: '17 Abr', dia: 'Qui', slots: ['09:00', '10:30', '15:00', '17:00'] },
  { data: '18 Abr', dia: 'Sex', slots: ['08:00', '09:00', '11:00', '14:00', '16:30'] },
  { data: '19 Abr', dia: 'Sáb', slots: ['09:00', '10:00', '11:00'] },
];

export default function AgendaScreen() {
  const [etapa, setEtapa] = useState(1);
  const [servico, setServico] = useState<typeof SERVICOS[0] | null>(null);
  const [barbeiro, setBarbeiro] = useState<typeof BARBEIROS[0] | null>(null);
  const [dia, setDia] = useState<typeof DIAS[0] | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  const confirmar = () => {
    Alert.alert(
      'Confirmar agendamento?',
      `${servico?.nome}\n${barbeiro?.nome}\n${dia?.data} às ${horario}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => setConcluido(true) },
      ]
    );
  };

  if (concluido) return (
    <View style={s.concluido}>
      <Text style={s.concluidoIcon}>🎉</Text>
      <Text style={s.concluidoTitle}>Agendado!</Text>
      <View style={s.concluidoCard}>
        <Row label="Serviço" val={servico?.nome || ''} />
        <Row label="Barbeiro" val={barbeiro?.nome || ''} />
        <Row label="Data" val={`${dia?.data} às ${horario}`} />
      </View>
      <Text style={s.concluidoSub}>
        Você receberá uma confirmação via WhatsApp em instantes.
      </Text>
      <TouchableOpacity style={s.btnPrimary}
        onPress={() => { setEtapa(1); setServico(null); setBarbeiro(null); setDia(null); setHorario(null); setConcluido(false); }}>
        <Text style={s.btnPrimaryTxt}>Fazer outro agendamento</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      {/* Stepper */}
      <View style={s.stepper}>
        {['Serviço', 'Barbeiro', 'Data e hora', 'Confirmar'].map((label, i) => {
          const num = i + 1;
          const done = etapa > num;
          const active = etapa === num;
          return (
            <React.Fragment key={label}>
              <View style={s.stepItem}>
                <View style={[s.stepCircle, done && s.stepDone, active && s.stepActive]}>
                  <Text style={[s.stepNum, (done || active) && s.stepNumActive]}>
                    {done ? '✓' : num}
                  </Text>
                </View>
                <Text style={[s.stepLabel, active && s.stepLabelActive]}>{label}</Text>
              </View>
              {i < 3 && <View style={[s.stepLine, done && s.stepLineDone]} />}
            </React.Fragment>
          );
        })}
      </View>

      <ScrollView style={s.content} showsVerticalScrollIndicator={false}>

        {/* ETAPA 1: SERVIÇO */}
        {etapa === 1 && (
          <View>
            <Text style={s.etapaTitle}>Escolha o serviço</Text>
            {SERVICOS.map(sv => (
              <TouchableOpacity key={sv.id} style={[s.svcCard, servico?.id === sv.id && s.svcCardSel]}
                onPress={() => setServico(sv)}>
                <Text style={s.svcIcon}>{sv.icon}</Text>
                <View style={s.svcInfo}>
                  <Text style={s.svcNome}>{sv.nome}</Text>
                  <Text style={s.svcMeta}>{sv.duracao} · {sv.preco}</Text>
                </View>
                {servico?.id === sv.id && <Text style={s.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ETAPA 2: BARBEIRO */}
        {etapa === 2 && (
          <View>
            <Text style={s.etapaTitle}>Escolha o barbeiro</Text>
            {BARBEIROS.map(b => (
              <TouchableOpacity key={b.id} style={[s.barbCard, barbeiro?.id === b.id && s.barbCardSel]}
                onPress={() => setBarbeiro(b)}>
                <View style={[s.barbAvatar, b.id === 0 && s.barbAvatarAI]}>
                  <Text style={s.barbIniciais}>{b.iniciais}</Text>
                </View>
                <View style={s.barbInfo}>
                  <Text style={s.barbNome}>{b.nome}</Text>
                  <Text style={s.barbEsp}>{b.especialidade}</Text>
                </View>
                {barbeiro?.id === b.id && <Text style={s.checkMark}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ETAPA 3: DATA E HORA */}
        {etapa === 3 && (
          <View>
            <Text style={s.etapaTitle}>Escolha a data</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.diasScroll}>
              {DIAS.map(d => (
                <TouchableOpacity key={d.data} style={[s.diaBtn, dia?.data === d.data && s.diaBtnSel]}
                  onPress={() => { setDia(d); setHorario(null); }}>
                  <Text style={[s.diaDia, dia?.data === d.data && s.diaTxtSel]}>{d.dia}</Text>
                  <Text style={[s.diaData, dia?.data === d.data && s.diaTxtSel]}>{d.data.split(' ')[0]}</Text>
                  <Text style={[s.diaMes, dia?.data === d.data && s.diaTxtSel]}>{d.data.split(' ')[1]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {dia && (
              <>
                <Text style={[s.etapaTitle, { marginTop: 16 }]}>Horários disponíveis</Text>
                <View style={s.slotsGrid}>
                  {dia.slots.map(slot => (
                    <TouchableOpacity key={slot} style={[s.slot, horario === slot && s.slotSel]}
                      onPress={() => setHorario(slot)}>
                      <Text style={[s.slotTxt, horario === slot && s.slotTxtSel]}>{slot}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* ETAPA 4: CONFIRMAR */}
        {etapa === 4 && (
          <View>
            <Text style={s.etapaTitle}>Confirme seu agendamento</Text>
            <View style={s.resumoCard}>
              <View style={s.resumoHeader}>
                <Text style={s.resumoIcon}>{servico?.icon}</Text>
                <Text style={s.resumoServico}>{servico?.nome}</Text>
              </View>
              <View style={s.resumoDivider} />
              <Row label="Barbeiro" val={barbeiro?.nome || ''} />
              <Row label="Data" val={dia?.data || ''} />
              <Row label="Horário" val={horario || ''} />
              <Row label="Duração" val={servico?.duracao || ''} />
              <Row label="Valor" val={servico?.preco || ''} bold />
            </View>
            <View style={s.whatsCard}>
              <Text style={s.whatsIcon}>💬</Text>
              <Text style={s.whatsTxt}>
                Você receberá confirmação e lembrete via WhatsApp 1h antes.
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Botões de navegação */}
      <View style={s.navBtns}>
        {etapa > 1 && (
          <TouchableOpacity style={s.btnBack} onPress={() => setEtapa(e => e - 1)}>
            <Text style={s.btnBackTxt}>← Voltar</Text>
          </TouchableOpacity>
        )}
        {etapa < 4 ? (
          <TouchableOpacity
            style={[s.btnNext, !podeContinuar() && s.btnDisabled]}
            disabled={!podeContinuar()}
            onPress={() => setEtapa(e => e + 1)}>
            <Text style={s.btnNextTxt}>Continuar →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={s.btnNext} onPress={confirmar}>
            <Text style={s.btnNextTxt}>Confirmar agendamento</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  function podeContinuar() {
    if (etapa === 1) return servico !== null;
    if (etapa === 2) return barbeiro !== null;
    if (etapa === 3) return dia !== null && horario !== null;
    return true;
  }
}

function Row({ label, val, bold }: { label: string, val: string, bold?: boolean }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowVal, bold && { color: '#B8973A', fontWeight: '700' }]}>{val}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1610', paddingHorizontal: 16, paddingVertical: 14 },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: '#B8973A' },
  stepDone: { backgroundColor: '#2D6E3E' },
  stepNum: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)' },
  stepNumActive: { color: '#1A1610' },
  stepLabel: { fontSize: 8, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 55 },
  stepLabelActive: { color: '#D4AF5A' },
  stepLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  stepLineDone: { backgroundColor: '#2D6E3E' },
  content: { flex: 1, padding: 16 },
  etapaTitle: { fontSize: 17, fontWeight: '700', color: '#1A1610', marginBottom: 14 },

  svcCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E8E2D4', gap: 12 },
  svcCardSel: { borderColor: '#B8973A', borderWidth: 2, backgroundColor: '#FAF0D4' },
  svcIcon: { fontSize: 26, width: 36, textAlign: 'center' },
  svcInfo: { flex: 1 },
  svcNome: { fontSize: 14, fontWeight: '600', color: '#1A1610' },
  svcMeta: { fontSize: 12, color: '#7A7060', marginTop: 2 },
  checkMark: { fontSize: 18, color: '#B8973A', fontWeight: '700' },

  barbCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E8E2D4', gap: 12 },
  barbCardSel: { borderColor: '#B8973A', borderWidth: 2, backgroundColor: '#FAF0D4' },
  barbAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FAF0D4', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D4AF5A' },
  barbAvatarAI: { backgroundColor: '#1A1610' },
  barbIniciais: { fontSize: 13, fontWeight: '700', color: '#B8973A' },
  barbInfo: { flex: 1 },
  barbNome: { fontSize: 14, fontWeight: '600', color: '#1A1610' },
  barbEsp: { fontSize: 11, color: '#7A7060', marginTop: 2 },

  diasScroll: { marginBottom: 4 },
  diaBtn: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginRight: 8, borderWidth: 1, borderColor: '#E8E2D4', minWidth: 58 },
  diaBtnSel: { backgroundColor: '#1A1610', borderColor: '#1A1610' },
  diaDia: { fontSize: 10, color: '#7A7060', fontWeight: '600', textTransform: 'uppercase' },
  diaData: { fontSize: 20, fontWeight: '700', color: '#1A1610', marginVertical: 2 },
  diaMes: { fontSize: 10, color: '#7A7060' },
  diaTxtSel: { color: '#D4AF5A' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8E2D4' },
  slotSel: { backgroundColor: '#B8973A', borderColor: '#B8973A' },
  slotTxt: { fontSize: 14, fontWeight: '500', color: '#1A1610' },
  slotTxtSel: { color: '#1A1610', fontWeight: '700' },

  resumoCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#E8E2D4', marginBottom: 12 },
  resumoHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  resumoIcon: { fontSize: 28 },
  resumoServico: { fontSize: 18, fontWeight: '700', color: '#1A1610', flex: 1 },
  resumoDivider: { height: 1, backgroundColor: '#E8E2D4', marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E8E2D4' },
  rowLabel: { fontSize: 13, color: '#7A7060' },
  rowVal: { fontSize: 13, fontWeight: '600', color: '#1A1610' },
  whatsCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#EAF4ED', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#97C459' },
  whatsIcon: { fontSize: 22 },
  whatsTxt: { fontSize: 12, color: '#2D6E3E', flex: 1, lineHeight: 18 },

  navBtns: { flexDirection: 'row', gap: 10, padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8E2D4' },
  btnBack: { flex: 1, padding: 13, borderRadius: 10, borderWidth: 1, borderColor: '#E8E2D4', alignItems: 'center' },
  btnBackTxt: { fontSize: 14, fontWeight: '500', color: '#7A7060' },
  btnNext: { flex: 2, padding: 13, borderRadius: 10, backgroundColor: '#B8973A', alignItems: 'center' },
  btnNextTxt: { fontSize: 14, fontWeight: '700', color: '#1A1610' },
  btnDisabled: { opacity: 0.4 },

  concluido: { flex: 1, backgroundColor: '#FAFAF8', alignItems: 'center', justifyContent: 'center', padding: 24 },
  concluidoIcon: { fontSize: 56, marginBottom: 12 },
  concluidoTitle: { fontSize: 26, fontWeight: '700', color: '#1A1610', marginBottom: 16 },
  concluidoCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E8E2D4', marginBottom: 16 },
  concluidoSub: { fontSize: 13, color: '#7A7060', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  btnPrimary: { width: '100%', backgroundColor: '#B8973A', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnPrimaryTxt: { fontSize: 15, fontWeight: '700', color: '#1A1610' },
});
