import { Climber } from '@/components/Climber';
import { CHARACTERS, COLORS } from '@/lib/constants';
import { CharacterType } from '@/lib/types';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface CharacterSelectProps {
  selected: CharacterType;
  onSelect: (type: CharacterType) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selected,
  onSelect
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {CHARACTERS.map(char => (
        <TouchableOpacity
          key={char.id}
          onPress={() => onSelect(char.id)}
          style={[
            styles.card,
            selected === char.id && styles.selectedCard
          ]}
          activeOpacity={0.7}
        >
          {selected === char.id && (
            <View style={styles.checkmark}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
          )}

          <View style={styles.characterContainer}>
            <Climber type={char.id} size="md" />
          </View>

          <Text style={styles.name}>{char.name}</Text>
          <Text style={styles.emoji}>{char.emoji}</Text>
          <Text style={styles.description}>{char.description}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>Stamina: HIGH</Text>
            <Text style={styles.stat}>Focus: ULTRA</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  card: {
    width: 200,
    marginHorizontal: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.slate100,
    padding: 16,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  characterContainer: {
    marginVertical: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.slate800,
    marginTop: 8,
    textAlign: 'center',
  },
  emoji: {
    fontSize: 24,
    marginVertical: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.slate500,
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 4,
  },
  statsRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.slate100,
    width: '100%',
  },
  stat: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: 2,
  }
});
