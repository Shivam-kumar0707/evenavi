/**
 * useDebouncedSave.js
 * Debounces autosave by 800ms to localStorage and Firestore.
 * Skips saving when viewing demo plans.
 */

import { useEffect, useRef } from 'react';
import { usePlanStore, saveToLocalStorage } from '../lib/planStore.js';
import { savePlanToFirestore, isConfigured } from '../lib/firebase.js';

export function useDebouncedSave() {
  const currentPlan = usePlanStore((state) => state.currentPlan);
  const planId = usePlanStore((state) => state.planId);
  const isDemo = usePlanStore((state) => state.isDemo);
  const setSaveStatus = usePlanStore((state) => state.setSaveStatus);

  const timeoutRef = useRef(null);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Skip saving during initial render or for demo plans
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }

    if (isDemo || !currentPlan || !planId) return;

    setSaveStatus('saving');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      // 1. Always mirror to localStorage immediately
      saveToLocalStorage(planId, currentPlan);

      // 2. Persist to Firestore if configured
      if (isConfigured) {
        const success = await savePlanToFirestore(planId, currentPlan);
        setSaveStatus(success ? 'saved' : 'offline');
      } else {
        setSaveStatus('offline');
      }
    }, 800);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentPlan, planId, isDemo, setSaveStatus]);
}
