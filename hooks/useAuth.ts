import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function useAuth() {
  const store = useAuthStore();

  useEffect(() => {
    if (!store.initialized && !store.loading) {
      store.initialize();
    }
  }, [store.initialized, store.loading]);

  return store;
}