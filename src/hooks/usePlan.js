/**
 * usePlan.js
 * Loads a plan by planId or demoType into the plan store.
 * Zero-network load for /demo/* routes.
 * Firestore first with localStorage fallback for /plan/:id routes.
 */

import { useEffect, useState } from 'react';
import { usePlanStore, loadFromLocalStorage } from '../lib/planStore.js';
import { fetchPlanFromFirestore } from '../lib/firebase.js';
import { DEMO_PLANS } from '../data/demoPlans.js';
import { PlanSchema } from '../lib/schemas.js';

export function usePlan({ planId, demoType }) {
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  const currentPlan = usePlanStore((state) => state.currentPlan);
  const isDemo = usePlanStore((state) => state.isDemo);
  const setPlan = usePlanStore((state) => state.setPlan);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      // 1. DEMO MODE: Zero network calls, load fixture directly
      if (demoType) {
        const fixture = DEMO_PLANS[demoType];
        if (fixture) {
          if (active) {
            setPlan(fixture, `demo_${demoType}`, true);
            setLoading(false);
          }
          return;
        } else {
          if (active) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
      }

      // 2. REAL PLAN: Try Firestore, then localStorage mirror
      if (planId) {
        let planData = null;

        // Try Firestore first
        try {
          planData = await fetchPlanFromFirestore(planId);
        } catch {
          planData = null;
        }

        // Fallback to local storage mirror
        if (!planData) {
          planData = loadFromLocalStorage(planId);
        }

        if (!planData) {
          if (active) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        // Validate loaded document against PlanSchema
        const validation = PlanSchema.safeParse(planData);
        if (!validation.success) {
          console.warn('Plan validation warning:', validation.error.format());
          // Still load the data if possible, or show friendly error
          if (active) {
            setPlan(planData, planId, false);
            setLoading(false);
          }
        } else {
          if (active) {
            setPlan(validation.data, planId, false);
            setLoading(false);
          }
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [planId, demoType, setPlan]);

  return {
    plan: currentPlan,
    isDemo,
    loading,
    notFound,
    error,
  };
}
