import { CharacterType } from '@/lib/types';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

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
  const images: Record<CharacterType, any> = {
    llama: require('@/assets/images/lama.png'),
    leopard: require('@/assets/images/jaguar.png'),
    guineapig: require('@/assets/images/guinea pig.png'),
    elephant: require('@/assets/images/elephant.png')
  };
  return images[type];
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
  const characterImage = getCharacterImage(type);

  const styles = StyleSheet.create({
    container: {
      width: sizeStyle.width,
      height: sizeStyle.height,
      justifyContent: 'center',
      alignItems: 'center',
      transform: isMoving ? [{ scale: 1.1 }] : [{ scale: 1 }],
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'contain',
    }
  });

  return (
    <View style={styles.container}>
      <Image source={characterImage} style={styles.image} />
    </View>
  );
};
