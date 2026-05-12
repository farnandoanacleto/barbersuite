import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NPSScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⭐</Text>
      <Text style={styles.title}>Avaliação</Text>
      <Text style={styles.subtitle}>Em desenvolvimento...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' },
  icon:      { fontSize: 48, marginBottom: 12 },
  title:     { fontSize: 24, fontWeight: '700', color: '#1A1610', marginBottom: 8 },
  subtitle:  { fontSize: 14, color: '#7A7060' },
});
