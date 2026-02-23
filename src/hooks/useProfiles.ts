import { useState, useEffect } from 'react';
import { db, Profile } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

let profilesCache: Profile[] | null = null;
let profilesCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const now = Date.now();

        if (profilesCache && now - profilesCacheTime < CACHE_DURATION) {
          setProfiles(profilesCache);
          setLoading(false);
          return;
        }

        const querySnapshot = await getDocs(collection(db, 'profiles'));
        const profilesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Profile));

        profilesCache = profilesList;
        profilesCacheTime = now;

        setProfiles(profilesList);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  return { profiles, loading, error };
}

export function clearProfilesCache() {
  profilesCache = null;
  profilesCacheTime = 0;
}
