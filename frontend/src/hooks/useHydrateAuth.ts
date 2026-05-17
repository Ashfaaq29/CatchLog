import { useEffect } from 'react';
import { useAuthStore } from '../context/authStore';
import { fetchMe } from '../services/auth.service';

export function useHydrateAuth(): void {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    let cancelled = false;
    async function hydrate(): Promise<void> {
      if (!token) {
        setHydrating(false);
        return;
      }
      try {
        const user = await fetchMe();
        if (!cancelled) {
          setUser(user);
          setHydrating(false);
        }
      } catch {
        if (!cancelled) logout();
      }
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [token, setUser, setHydrating, logout]);
}
