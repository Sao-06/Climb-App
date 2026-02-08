import AsyncStorage from './asyncStorageMock';
import { UserProfile } from './types';

const USER_PROFILE_KEY = 'USER_PROFILE';

const createDefaultProfile = (): UserProfile => ({
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
});

export const getUserProfile = async (): Promise<UserProfile | null> => {
	const raw = await AsyncStorage.getItem(USER_PROFILE_KEY);
	if (!raw) {
		return null;
	}

	try {
		return JSON.parse(raw) as UserProfile;
	} catch (error) {
		console.warn('Failed to parse user profile, returning null', error);
		return null;
	}
};

export const saveUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
	await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
	return profile;
};

export const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
	const existing = await getUserProfile();
	const nextProfile: UserProfile = {
		...createDefaultProfile(),
		...existing,
		...updates,
	};

	await saveUserProfile(nextProfile);
	return nextProfile;
};

export const resetUserProfile = async (): Promise<void> => {
	await AsyncStorage.removeItem(USER_PROFILE_KEY);
};

export const getOrCreateUserProfile = async (): Promise<UserProfile> => {
	const existing = await getUserProfile();
	if (existing) {
		return existing;
	}

	const created = createDefaultProfile();
	await saveUserProfile(created);
	return created;
};

export const __internal = {
	createDefaultProfile,
};
