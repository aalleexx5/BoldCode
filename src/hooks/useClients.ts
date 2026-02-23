import { useState, useEffect } from 'react';
import { db, Client } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

let clientsCache: Client[] | null = null;
let clientsCacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export function useClients() {
  const [clients, setClients] = useState<Client[]>(clientsCache || []);
  const [loading, setLoading] = useState(!clientsCache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const now = Date.now();

        if (clientsCache && now - clientsCacheTime < CACHE_DURATION) {
          setClients(clientsCache);
          setLoading(false);
          return;
        }

        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'clients'));
        const clientsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Client));

        clientsCache = clientsList;
        clientsCacheTime = now;

        setClients(clientsList);
        setError(null);
      } catch (err) {
        console.error('Error loading clients:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const refreshClients = async () => {
    clientsCache = null;
    clientsCacheTime = 0;
    setLoading(true);

    try {
      const querySnapshot = await getDocs(collection(db, 'clients'));
      const clientsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));

      clientsCache = clientsList;
      clientsCacheTime = Date.now();

      setClients(clientsList);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { clients, loading, error, refreshClients };
}

export function clearClientsCache() {
  clientsCache = null;
  clientsCacheTime = 0;
}
