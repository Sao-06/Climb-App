import { COLORS } from '@/lib/constants';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function SocialScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🤝</Text>
        <Text style={styles.title}>Multiplayer Coming Soon</Text>
        <Text style={styles.description}>
          Soon you'll be able to form climbing parties with friends and conquer the world's highest digital peaks together.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 14,
    color: COLORS.slate400,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
    fontWeight: '500',
  },
});
