import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Landing } from '../src/pages/Landing.jsx';
import { NewPlan } from '../src/pages/NewPlan.jsx';
import { PlanWorkspace } from '../src/pages/PlanWorkspace.jsx';
import { DEMO_PLANS } from '../src/data/demoPlans.js';
import { usePlanStore } from '../src/lib/planStore.js';

describe('UI Component & Data-TestId Verification', () => {
  it('renders Landing page with all critical review hooks', () => {
    render(
      <MemoryRouter>
        <Landing onOpenMyPlans={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('hero-title')).toBeInTheDocument();
    expect(screen.getByTestId('start-planning-btn')).toBeInTheDocument();
    expect(screen.getByTestId('try-demo-btn')).toBeInTheDocument();
    expect(screen.getByTestId('demo-wedding-btn')).toBeInTheDocument();
    expect(screen.getByTestId('demo-birthday-btn')).toBeInTheDocument();
    expect(screen.getByTestId('demo-community-btn')).toBeInTheDocument();
  });

  it('renders NewPlan intake wizard with input hooks and example chips', () => {
    render(
      <MemoryRouter>
        <NewPlan />
      </MemoryRouter>
    );

    expect(screen.getByTestId('intake-free-text')).toBeInTheDocument();
    expect(screen.getByTestId('intake-example-chip-0')).toBeInTheDocument();
    expect(screen.getByTestId('intake-example-chip-1')).toBeInTheDocument();
    expect(screen.getByTestId('intake-example-chip-2')).toBeInTheDocument();
    expect(screen.getByTestId('intake-wizard-step-1')).toBeInTheDocument();
    expect(screen.getByTestId('input-event-type')).toBeInTheDocument();
    expect(screen.getByTestId('input-event-title')).toBeInTheDocument();
    expect(screen.getByTestId('input-event-date')).toBeInTheDocument();
    expect(screen.getByTestId('input-event-city')).toBeInTheDocument();
    expect(screen.getByTestId('input-city-tier')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-next-btn')).toBeInTheDocument();
  });

  it('renders PlanWorkspace with demo banner and all workspace tabs', () => {
    // Pre-seed store with wedding fixture
    usePlanStore.getState().setPlan(DEMO_PLANS.wedding, 'demo_wedding', true);

    render(
      <MemoryRouter initialEntries={['/demo/wedding']}>
        <Routes>
          <Route path="/demo/:type" element={<PlanWorkspace isDemoRoute={true} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('demo-banner')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-header')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-title')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-budget')).toBeInTheDocument();
    expect(screen.getByTestId('tab-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('tab-vendors')).toBeInTheDocument();
    expect(screen.getByTestId('tab-ideas')).toBeInTheDocument();
    expect(screen.getByTestId('tab-quotes')).toBeInTheDocument();
    expect(screen.getByTestId('tab-risks')).toBeInTheDocument();
    expect(screen.getByTestId('tab-share')).toBeInTheDocument();
    expect(screen.getByTestId('overview-summary')).toBeInTheDocument();
    expect(screen.getByTestId('overview-stats')).toBeInTheDocument();
  });
});
