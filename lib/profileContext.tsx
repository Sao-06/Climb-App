import React, { createContext, useContext, useEffect, useState } from 'react';
import { getOrCreateUserProfile, saveUserProfile } from './persistenceService';
import { UserProfile } from './types';

interface ProfileContextValue {
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
}

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const p = await getOrCreateUserProfile();
      setProfile(p);
      setLoading(false);
    };
    void load();
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const next = await saveUserProfile({
      ...(profile ?? (await getOrCreateUserProfile())),
      ...updates,
    });
    setProfile(next);
    return next;
  };

  return (
    <ProfileContext.Provider value={{ profile, loading, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextValue => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
