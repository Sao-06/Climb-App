import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isFocusModeEnabled, addFocusModeListener } from '@/lib/focusModeService';
import { COLORS } from '@/lib/constants';

const GlobalFocusIndicator: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const v = await isFocusModeEnabled();
        if (mounted) setEnabled(v);
      } catch (e) {}
    })();

    const unsubscribe = addFocusModeListener((v) => {
      if (mounted) setEnabled(v);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (!enabled) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.text}>Focus Mode ON</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 12,
    zIndex: 9999,
  },
  badge: {
    backgroundColor: 'rgba(15,118,110,0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  text: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },
});

export default GlobalFocusIndicator;
