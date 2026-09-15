import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProfile as fetchProfile } from '../services/storage';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  const refreshProfile = useCallback(async () => {
    const p = await fetchProfile();
    setProfile(p);
    return p;
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, refreshProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfileContext must be used within a ProfileProvider');
  return ctx;
}