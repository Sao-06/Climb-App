import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/lib/constants';

interface XPPopupProps {
  amount: number;
  visible: boolean;
  onComplete?: () => void;
}

const XPPopup: React.FC<XPPopupProps> = ({ amount, visible, onComplete }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) {
      // Reset values
      translateY.setValue(0);
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }

    // Animate the popup
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onComplete?.();
    });
  }, [visible, translateY, opacity, scale, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [
            { translateY },
            { scale },
          ],
        },
      ]}
    >
      <View style={styles.badge}>
        <Text style={styles.text}>+{amount}</Text>
        <Text style={styles.label}>XP</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -40,
    marginTop: -30,
    zIndex: 1000,
  },
  badge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 28,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

export default XPPopup;
