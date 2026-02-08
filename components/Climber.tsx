import { CHARACTERS } from '@/lib/constants';
import { CharacterType } from '@/lib/types';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ClimberProps {
  type: CharacterType;
  avatar?: {
    baseColor: string;
    hat: string;
    gear: string;
  };
  size?: 'sm' | 'md' | 'lg';
  isMoving?: boolean;
}

const getCharacterImage = (type: CharacterType) => {
  const character = CHARACTERS.find(c => c.id === type);
  return character?.image || null;
};

const getEmoji = (type: CharacterType): string => {
  const character = CHARACTERS.find(c => c.id === type);
  return character?.emoji || '🦙';
};

const getSizeStyle = (size: 'sm' | 'md' | 'lg' = 'md') => {
  const sizes = {
    sm: { fontSize: 32, width: 48, height: 48 },
    md: { fontSize: 72, width: 100, height: 100 },
    lg: { fontSize: 120, width: 160, height: 160 }
  };
  return sizes[size];
};

export const Climber: React.FC<ClimberProps> = ({
  type,
  avatar,
  size = 'md',
  isMoving = false
}) => {
  const sizeStyle = getSizeStyle(size);
  const emoji = getEmoji(type);

  const styles = StyleSheet.create({
    container: {
      width: sizeStyle.width,
      height: sizeStyle.height,
      justifyContent: 'center',
      alignItems: 'center',
      transform: isMoving ? [{ scale: 1.1 }] : [{ scale: 1 }],
    },
    emoji: {
      fontSize: sizeStyle.fontSize,
      lineHeight: sizeStyle.fontSize + 10,
    }
  });

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
};
