import { Climber } from '@/components/Climber';
import { COLORS } from '@/lib/constants';
import { UserProfile } from '@/lib/types';
import React from 'react';
import {
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface StoreProps {
  user: UserProfile;
  onUpdateAvatar: (update: Partial<UserProfile['avatar']>) => void;
  onSpendPoints: (amount: number) => boolean;
}

const ITEMS = [
  { id: 'hat-1', name: 'Mountaineer Hat', type: 'hat', color: '#ef4444', price: 200 },
  { id: 'hat-2', name: 'Winter Beanie', type: 'hat', color: '#3b82f6', price: 350 },
  { id: 'hat-3', name: 'Golden Helmet', type: 'hat', color: '#fbbf24', price: 1000 },
  { id: 'gear-1', name: 'Pro Harness', type: 'gear', color: '#10b981', price: 500 },
  { id: 'gear-2', name: 'Heavy Pack', type: 'gear', color: '#6b7280', price: 400 },
  { id: 'skin-1', name: 'Ice Skin', type: 'baseColor', color: '#93c5fd', price: 600 },
  { id: 'skin-2', name: 'Lava Skin', type: 'baseColor', color: '#f87171', price: 600 },
];

export const Store: React.FC<StoreProps> = ({
  user,
  onUpdateAvatar,
  onSpendPoints
}) => {
  const buyItem = (item: typeof ITEMS[0]) => {
    if (onSpendPoints(item.price)) {
      onUpdateAvatar({ [item.type]: item.color });
      Alert.alert('Success', `Equipped ${item.name}!`);
    } else {
      Alert.alert('Insufficient Points', "Not enough points to reach this peak!");
    }
  };

  const renderPreviewSection = () => (
    <View style={styles.previewSection}>
      <Text style={styles.previewTitle}>Current Style</Text>
      <View style={styles.climberDisplay}>
        <Climber type={user.selectedCharacter} avatar={user.avatar} size="lg" />
      </View>
      <View style={styles.wealthDisplay}>
        <Text style={styles.wealthLabel}>Wealth</Text>
        <Text style={styles.wealthAmount}>{user.points} XP</Text>
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: typeof ITEMS[0] }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => buyItem(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.itemColorBox,
          { backgroundColor: item.color }
        ]}
      />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemType}>{item.type}</Text>
      <TouchableOpacity
        style={styles.itemButton}
        onPress={() => buyItem(item)}
      >
        <Text style={styles.itemPrice}>{item.price} XP</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderPreviewSection()}

        <View style={styles.itemsSection}>
          <Text style={styles.itemsSectionTitle}>Basecamp Outfitters</Text>
          <FlatList
            data={ITEMS}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            scrollEnabled={false}
            nestedScrollEnabled={false}
            contentContainerStyle={styles.itemsGrid}
            columnWrapperStyle={styles.itemsRow}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.slate50,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  previewSection: {
    backgroundColor: COLORS.slate800,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  climberDisplay: {
    marginVertical: 20,
  },
  wealthDisplay: {
    marginTop: 16,
    alignItems: 'center',
  },
  wealthLabel: {
    fontSize: 12,
    color: COLORS.slate400,
    marginBottom: 4,
    fontWeight: '600',
  },
  wealthAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  itemsSection: {
    marginBottom: 24,
  },
  itemsSectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.slate800,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  itemsGrid: {
    gap: 12,
  },
  itemsRow: {
    gap: 12,
    justifyContent: 'space-between',
  },
  itemCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.slate100,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemColorBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.slate800,
    textAlign: 'center',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.slate400,
    letterSpacing: 0.2,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  itemButton: {
    width: '100%',
    paddingVertical: 8,
    backgroundColor: COLORS.slate100,
    borderRadius: 10,
  },
  itemPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.slate600,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
