import { UserProfile } from './types';

/**
 * Simple mock persistence service
 * In a real app, this would use AsyncStorage or a database
 */

export async function getUserProfile(): Promise<UserProfile | null> {
  // Mock implementation - returns a default profile
  // In production, this would load from AsyncStorage
  return {
    name: 'Climber',
    level: 1,
    points: 0,
    climbHeight: 0,
    totalFocusTime: 0,
    selectedCharacter: 'llama',
    avatar: {
      baseColor: '#e2e8f0',
      hat: 'none',
      gear: 'none',
    },
    isDistracted: false,
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  // Mock implementation
  console.log('Saving profile:', profile);
}
