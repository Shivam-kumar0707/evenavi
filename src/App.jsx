import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/ui/Navbar.jsx';
import { MyPlansDrawer } from './components/ui/MyPlansDrawer.jsx';
import { Landing } from './pages/Landing.jsx';

const NewPlan = lazy(() => import('./pages/NewPlan.jsx').then(m => ({ default: m.NewPlan })));
const PlanWorkspace = lazy(() => import('./pages/PlanWorkspace.jsx').then(m => ({ default: m.PlanWorkspace })));
const NotFound = lazy(() => import('./pages/NotFound.jsx').then(m => ({ default: m.NotFound })));

function RouteLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-stone-400">
      <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [myPlansOpen, setMyPlansOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#FCFBF9] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-100 transition-colors">
        <Navbar onOpenMyPlans={() => setMyPlansOpen(true)} />
        <MyPlansDrawer isOpen={myPlansOpen} onClose={() => setMyPlansOpen(false)} />

        <div className="flex-1">
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing onOpenMyPlans={() => setMyPlansOpen(true)} />} />
              <Route path="/new" element={<NewPlan />} />
              <Route path="/plan/:id" element={<PlanWorkspace isDemoRoute={false} />} />
              <Route path="/demo/:type" element={<PlanWorkspace isDemoRoute={true} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}
