"use client";
import { useEffect, useState } from "react";

/**
 * Saves and retrieves a cache snapshot of pilot legality stats to handle offline views seamlessly.
 */
export function useOfflineCache<T>(key: string, initialData: T): [T, (data: T) => void] {
  const [cachedData, setCachedData] = useState<T>(initialData);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setCachedData(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Offline cache failed to load:", e);
    }
  }, [key]);

  const updateCache = (newData: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(newData));
      setCachedData(newData);
    } catch (e) {
      console.warn("Offline cache failed to write:", e);
    }
  };

  return [cachedData, updateCache];
}
