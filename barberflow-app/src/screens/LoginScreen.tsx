import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert
} from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zfcflcetvrbfoklnkxhj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmY2ZsY2V0dnJiZm9rbG5reGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2NTY0ODIsImV4cCI6MjA5MTIzMjQ4Mn0.cwWtpmXaN2sy5MlgtSIKbcpYNk2jsuyvsoqjd1vE-Yc'
);

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fazerLogin() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }

    setLoading(true);
    console.log('🔐 Fazendo login...', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha
      });

      if (error) {
        console.error('❌ Erro login:', error);
        Alert.alert('Erro', 'Email ou senha incorretos');
        setLoading(false);
        return;
      }

      console.log('✅ Login sucesso!', data.user?.email);
      
      // ✅ NAVEGAÇÃO ADICIONADA!
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });

    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      Alert.alert('Erro', 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={s.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.logo}>💈</Text>
          <Text style={s.brand}>BarberFlow</Text>
          <Text style={s.tagline}>Gran Cavalheiro</Text>
        </View>

        <View style={s.form}>
          <Text style={s.title}>Entrar</Text>
          <Text style={s.subtitle}>Acesse sua conta</Text>

          <Text style={s.label}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="seu@email.com"
            placeholderTextColor="#B4AFA5"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={s.label}>Senha</Text>
          <View style={s.passwordContainer}>
            <TextInput
              style={s.inputPassword}
              placeholder="••••••••"
              placeholderTextColor="#B4AFA5"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity 
              style={s.eyeBtn}
              onPress={() => setMostrarSenha(!mostrarSenha)}
            >
              <Text style={s.eyeIcon}>{mostrarSenha ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.forgotBtn}>
            <Text style={s.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={s.loginBtn}
            onPress={fazerLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={s.loginBtnText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <View style={s.signupRow}>
            <Text style={s.signupLabel}>Ainda não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={s.signupLink}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF8' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 60, marginBottom: 8 },
  brand: { fontSize: 28, fontWeight: '700', color: '#1A1610', marginBottom: 4 },
  tagline: { fontSize: 13, color: '#B8973A', letterSpacing: 2 },
  form: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#E8E2D4' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1610', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#7A7060', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#1A1610', marginBottom: 8 },
  input: { backgroundColor: '#FAFAF8', borderWidth: 1, borderColor: '#E8E2D4', borderRadius: 12, padding: 14, fontSize: 14, color: '#1A1610', marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAF8', borderWidth: 1, borderColor: '#E8E2D4', borderRadius: 12, marginBottom: 8 },
  inputPassword: { flex: 1, padding: 14, fontSize: 14, color: '#1A1610' },
  eyeBtn: { padding: 14 },
  eyeIcon: { fontSize: 20 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 12, color: '#B8973A', fontWeight: '600' },
  loginBtn: { backgroundColor: '#B8973A', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20 },
  loginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupLabel: { fontSize: 13, color: '#7A7060' },
  signupLink: { fontSize: 13, color: '#B8973A', fontWeight: '700' },
});
