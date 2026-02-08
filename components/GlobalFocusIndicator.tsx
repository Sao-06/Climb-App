import React, { useEffect, useRef, useState } from 'react';
import { Animated, View, Text, StyleSheet, Easing } from 'react-native';
import { isFocusModeEnabled, addFocusModeListener } from '@/lib/focusModeService';
import { COLORS } from '@/lib/constants';

const GlobalFocusIndicator: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(false);

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

  const combinedScale = Animated.multiply(baseScale, pulseScale) as Animated.AnimatedMultiplication; // type hint

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.badge, { transform: [{ scale: combinedScale }] }]}>
        <Text style={styles.text}>Focus Mode ON</Text>
      </Animated.View>
    </Animated.View>
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
