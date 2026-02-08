import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, Easing, Modal, Pressable } from 'react-native';
import { isFocusModeEnabled, addFocusModeListener } from '@/lib/focusModeService';
import { COLORS } from '@/lib/constants';

const GlobalFocusIndicator: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);
  const [showTip, setShowTip] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;
  const baseScale = useRef(new Animated.Value(0.9)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);

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

  // Animate when enabled toggles
  useEffect(() => {
    if (enabled) {
      // enter animation
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.spring(baseScale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      ]).start(() => {
        // start pulsing
        pulseAnimation.current = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseScale, { toValue: 1.06, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
            Animated.timing(pulseScale, { toValue: 1, duration: 700, useNativeDriver: true, easing: Easing.inOut(Easing.quad) }),
          ])
        );
        pulseAnimation.current.start();
      });
    } else {
      // stop pulsing and exit
      if (pulseAnimation.current) {
        pulseAnimation.current.stop();
        pulseAnimation.current = null;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
        Animated.timing(baseScale, { toValue: 0.9, duration: 250, useNativeDriver: true, easing: Easing.in(Easing.quad) }),
      ]).start();
    }
  }, [enabled, opacity, baseScale, pulseScale]);

  if (!enabled) return null;

  const combinedScale = Animated.multiply(baseScale, pulseScale);

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, { opacity }]}> 
        <Pressable onPress={() => setShowTip(true)} accessible accessibilityLabel="Focus Mode Info">
          <Animated.View style={[styles.badge, { transform: [{ scale: combinedScale }] }]}>
            <Text style={styles.text}>Focus Mode ON</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>

      <Modal visible={showTip} transparent animationType="fade" onRequestClose={() => setShowTip(false)}>
        <View style={styles.tipOverlay}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Focus Mode</Text>
            <Text style={styles.tipText}>
              When enabled, the app monitors if you leave during Pomodoro sessions and shows warnings. It helps track distracted time and protects team streaks.
            </Text>
            <Pressable style={styles.tipClose} onPress={() => setShowTip(false)}>
              <Text style={styles.tipCloseText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  wrapper: {
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
  tipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tipCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    maxWidth: 420,
    width: '100%',
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.slate900,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.slate700,
    lineHeight: 20,
    marginBottom: 16,
  },
  tipClose: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipCloseText: {
    color: COLORS.white,
    fontWeight: '800',
  },
});

export default GlobalFocusIndicator;
