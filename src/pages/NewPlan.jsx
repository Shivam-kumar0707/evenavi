import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Sparkles, Mic, MicOff, ArrowRight, ArrowLeft, Check, Calendar, Users, IndianRupee, MapPin, Heart, AlertCircle, Loader2 } from 'lucide-react';
import { parseMoney, formatINR } from '../lib/money.js';
import { allocate, getTemplate } from '../lib/budgetEngine.js';
import { generateTimeline, mergeExtraTasks } from '../lib/timelineEngine.js';
import { getVendorTemplates } from '../data/vendorTemplates.js';
import { evaluateRisks } from '../lib/riskEngine.js';
import { callAiTask, getDeterministicFallback } from '../lib/aiClient.js';
import { useSpeech } from '../hooks/useSpeech.js';
import { usePlanStore, saveToLocalStorage } from '../lib/planStore.js';
import { EXAMPLE_INTAKE_PROMPTS, CITY_TIERS, DIET_OPTIONS, VENUE_TYPES } from '../data/templates.js';

const WEDDING_FUNCTIONS = [
  { id: 'engagement', name: 'Engagement / Roka' },
  { id: 'haldi', name: 'Haldi Ceremony' },
  { id: 'mehendi', name: 'Mehendi & Chooda' },
  { id: 'sangeet', name: 'Sangeet & Cocktails' },
  { id: 'wedding', name: 'Wedding Vows (Pheras)' },
  { id: 'reception', name: 'Grand Reception' },
];

export function NewPlan() {
  const navigate = useNavigate();
  const setPlan = usePlanStore((state) => state.setPlan);

  // Intake State
  const [freeText, setFreeText] = useState('');
  const [parsingAi, setParsingAi] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Wizard Form Fields
  const [formData, setFormData] = useState({
    type: 'wedding',
    title: '',
    date: '',
    city: '',
    cityTier: 2,
    guestCount: 200,
    rawBudget: '12 lakh',
    totalBudget: 1200000,
    diet: 'veg',
    culture: 'North Indian',
    vibe: 'Festive & Elegant',
    venueType: 'both',
    mustHaves: '',
    avoid: '',
    selectedFunctions: ['sangeet', 'wedding', 'reception'],
  });

  // Speech Hook
  const { isSupported: speechSupported, isListening, toggleListening } = useSpeech({
    onTranscript: (transcript) => {
      setFreeText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    },
  });

  // Parse natural language intake prompt
  const handleParseIntake = async (promptToParse) => {
    const text = promptToParse || freeText;
    if (!text.trim()) return;

    setParsingAi(true);
    setErrors({});

    try {
      const res = await callAiTask('parse_intake', { text });
      const parsedEvent = res.data?.event || {};

      setFormData((prev) => {
        const nextBudget = parsedEvent.totalBudget != null ? parsedEvent.totalBudget : prev.totalBudget;
        return {
          ...prev,
          type: parsedEvent.type || prev.type,
          title: parsedEvent.title || prev.title || (parsedEvent.type ? `${parsedEvent.type.toUpperCase()} Celebration` : ''),
          date: parsedEvent.date || prev.date,
          city: parsedEvent.city || prev.city,
          guestCount: parsedEvent.guestCount || prev.guestCount,
          totalBudget: nextBudget,
          rawBudget: nextBudget ? formatINR(nextBudget) : prev.rawBudget,
          diet: parsedEvent.diet || prev.diet,
          culture: parsedEvent.culture || prev.culture,
          vibe: parsedEvent.vibe || prev.vibe,
          venueType: parsedEvent.venueType || prev.venueType,
        };
      });
    } catch (err) {
      console.warn('AI intake parse error, using manual form data.', err);
    } finally {
      setParsingAi(false);
    }
  };

  const handleBudgetChange = (val) => {
    const num = parseMoney(val);
    setFormData((prev) => ({
      ...prev,
      rawBudget: val,
      totalBudget: num,
    }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (!formData.title.trim()) errs.title = 'Event title is required';
      if (!formData.date) errs.date = 'Event date is required';
      if (!formData.city.trim()) errs.city = 'City is required';
    } else if (step === 2) {
      if (!formData.guestCount || formData.guestCount <= 0) errs.guestCount = 'Guest count must be greater than 0';
      if (!formData.totalBudget || formData.totalBudget <= 0) errs.totalBudget = 'Please enter a valid budget (e.g. 8 lakh, 1.2 cr)';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit and create plan
  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    const planId = nanoid(10);
    const eventType = formData.type;
    const totalBudget = formData.totalBudget;

    // 1. Instant deterministic plan creation
    const baseline = getTemplate(eventType);
    const allocations = allocate(totalBudget, baseline);
    const { timeline, timelineMeta } = generateTimeline({
      eventType,
      eventDate: formData.date,
    });
    const vendors = getVendorTemplates(eventType);

    const mustHavesList = formData.mustHaves
      ? formData.mustHaves.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const avoidList = formData.avoid
      ? formData.avoid.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const functionObjects = eventType === 'wedding'
      ? formData.selectedFunctions.map((id) => {
          const meta = WEDDING_FUNCTIONS.find((f) => f.id === id) || { name: id };
          return { id, name: meta.name, date: formData.date, guests: formData.guestCount };
        })
      : [];

    const planEvent = {
      type: eventType,
      title: formData.title,
      date: formData.date,
      city: formData.city,
      cityTier: Number(formData.cityTier) || 2,
      guestCount: Number(formData.guestCount) || 100,
      totalBudget: Number(totalBudget),
      currency: 'INR',
      culture: formData.culture,
      diet: formData.diet,
      vibe: formData.vibe,
      ageGroup: eventType === 'birthday' ? 'Kids & Families' : 'All ages',
      mustHaves: mustHavesList,
      avoid: avoidList,
      venueType: formData.venueType,
      functions: functionObjects,
    };

    const initialPlan = {
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      event: planEvent,
      budget: {
        summary: `Deterministic budget allocated across ${allocations.length} categories adhering to baseline proportions.`,
        source: 'template',
        allocations,
      },
      timeline,
      timelineMeta,
      vendors,
      ideas: {
        ...getDeterministicFallback('ideas', { event: planEvent }),
        source: 'template',
      },
      risks: [],
      quotes: [],
    };

    initialPlan.risks = evaluateRisks(initialPlan);

    // Save locally and set store state
    saveToLocalStorage(planId, initialPlan);
    setPlan(initialPlan, planId, false);

    // Redirect user to workspace immediately
    navigate(`/plan/${planId}`);

    // 2. Fire parallel background AI calls (plan_core, vendor_pack, ideas)
    Promise.allSettled([
      callAiTask('plan_core', { event: planEvent, allocations }),
      callAiTask('vendor_pack', { event: planEvent, categories: allocations.map((a) => a.category) }),
      callAiTask('ideas', { event: planEvent }),
    ]).then(([coreRes, vendorRes, ideasRes]) => {
      const currentStorePlan = usePlanStore.getState().currentPlan;
      if (!currentStorePlan) return;

      let enrichedPlan = { ...currentStorePlan };

      if (coreRes.status === 'fulfilled' && coreRes.value.ok) {
        const core = coreRes.value.data;
        enrichedPlan.budget = {
          ...enrichedPlan.budget,
          summary: core.summary || enrichedPlan.budget.summary,
          source: 'ai',
        };
        if (core.extraTasks && core.extraTasks.length > 0) {
          enrichedPlan.timeline = mergeExtraTasks(enrichedPlan.timeline, core.extraTasks, planEvent.date);
        }
      }

      if (vendorRes.status === 'fulfilled' && vendorRes.value.ok) {
        const vPack = vendorRes.value.data?.vendors || [];
        if (vPack.length > 0) {
          enrichedPlan.vendors = enrichedPlan.vendors.map((v) => {
            const aiV = vPack.find((item) => item.category?.toLowerCase() === v.category?.toLowerCase());
            if (aiV) {
              return {
                ...v,
                questions: aiV.questions?.length ? aiV.questions : v.questions,
                redFlags: aiV.redFlags?.length ? aiV.redFlags : v.redFlags,
                source: 'ai',
              };
            }
            return v;
          });
        }
      }

      if (ideasRes.status === 'fulfilled' && ideasRes.value.ok) {
        enrichedPlan.ideas = {
          ...ideasRes.value.data,
          source: 'ai',
        };
      }

      enrichedPlan.risks = evaluateRisks(enrichedPlan);
      enrichedPlan.updatedAt = new Date().toISOString();

      saveToLocalStorage(planId, enrichedPlan);
      usePlanStore.getState().setPlan(enrichedPlan, planId, false);
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">Step-by-Step Intake</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white mt-1">
            Build Your Event Plan
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Describe your event in words, or fill the 4-step wizard below.
          </p>
        </div>

        {/* Natural Language Prompt & Speech Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm mb-6">
          <label htmlFor="intake-text-input" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            One-Sentence Magic Intake (Optional)
          </label>
          <div className="relative">
            <textarea
              id="intake-text-input"
              data-testid="intake-free-text"
              rows={3}
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="e.g. Planning my sister's 3-day wedding in Lucknow for 250 guests in December. Budget 12L, pure vegetarian food, need a grand sangeet..."
              className="w-full p-3.5 pr-20 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/50 focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-stone-900 outline-none transition-all placeholder:text-stone-400"
            />
            <div className="absolute right-2.5 bottom-3.5 flex items-center gap-1.5">
              {speechSupported && (
                <button
                  type="button"
                  data-testid="intake-mic-btn"
                  onClick={toggleListening}
                  className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                  title={isListening ? 'Stop listening' : 'Speak event description'}
                  aria-label="Voice input toggle"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleParseIntake()}
                disabled={parsingAi || !freeText.trim()}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-40 transition-all flex items-center gap-1"
              >
                {parsingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Auto-Fill</span>
              </button>
            </div>
          </div>

          {/* Example Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-stone-400 font-medium">Try examples:</span>
            {EXAMPLE_INTAKE_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                data-testid={`intake-example-chip-${idx}`}
                onClick={() => {
                  setFreeText(item.text);
                  handleParseIntake(item.text);
                }}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 border border-stone-200 dark:border-stone-700 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wizard Progress Stepper */}
        <div className="flex items-center justify-between mb-6 px-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === step
                    ? 'bg-brand-600 text-white ring-4 ring-brand-500/20'
                    : currentStep > step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                }`}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-stone-600 dark:text-stone-300">
                {step === 1 && 'Basics'}
                {step === 2 && 'Scale & Budget'}
                {step === 3 && 'Style & Events'}
                {step === 4 && 'Review'}
              </span>
              {step < 4 && <div className="w-6 sm:w-12 h-0.5 bg-stone-200 dark:bg-stone-800 mx-1" />}
            </div>
          ))}
        </div>

        {/* Wizard Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div data-testid="intake-wizard-step-1" className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Step 1: Event Fundamentals
              </h3>

              {/* Event Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2">
                  Event Type
                </label>
                <div className="grid grid-cols-3 gap-3" data-testid="input-event-type">
                  {['wedding', 'birthday', 'community'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.type === t
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="text-sm capitalize">{t}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Plan Title
                </label>
                <input
                  type="text"
                  data-testid="input-event-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Priya & Kabir's Royal Wedding"
                  className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
              </div>

              {/* Date & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                    Target Event Date
                  </label>
                  <input
                    type="date"
                    data-testid="input-event-date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                    City / Destination
                  </label>
                  <input
                    type="text"
                    data-testid="input-event-city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Lucknow, Pune, Bengaluru"
                    className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {errors.city && <p className="text-xs text-rose-500 mt-1">{errors.city}</p>}
                </div>
              </div>

              {/* City Tier */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  City Tier (Calibrates per-guest price bands)
                </label>
                <select
                  data-testid="input-city-tier"
                  value={formData.cityTier}
                  onChange={(e) => setFormData({ ...formData, cityTier: Number(e.target.value) })}
                  className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {CITY_TIERS.map((c) => (
                    <option key={c.tier} value={c.tier}>
                      {c.label} ({c.example})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: SCALE & BUDGET */}
          {currentStep === 2 && (
            <div data-testid="intake-wizard-step-2" className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Step 2: Scale, Budget & Diet
              </h3>

              {/* Guest Count */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Estimated Guest Count
                </label>
                <div className="relative">
                  <input
                    type="number"
                    data-testid="input-guest-count"
                    min={1}
                    max={20000}
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full p-3 pl-10 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <Users className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
                {errors.guestCount && <p className="text-xs text-rose-500 mt-1">{errors.guestCount}</p>}
              </div>

              {/* Total Budget */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Total Budget (Accepts 8L, 8 lakh, 1.2 cr)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    data-testid="input-total-budget"
                    value={formData.rawBudget}
                    onChange={(e) => handleBudgetChange(e.target.value)}
                    placeholder="e.g. 12 lakh, 1.2 cr, 40000"
                    className="w-full p-3 pl-10 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                  />
                  <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-xs text-stone-500">
                  <span>Parsed amount: <strong className="text-brand-600">{formatINR(formData.totalBudget)}</strong></span>
                  <span>Per guest: ~{formatINR(Math.round(formData.totalBudget / Math.max(1, formData.guestCount)))}</span>
                </div>
                {errors.totalBudget && <p className="text-xs text-rose-500 mt-1">{errors.totalBudget}</p>}
              </div>

              {/* Diet */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2">
                  Catering Diet Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5" data-testid="input-diet">
                  {DIET_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, diet: d.id })}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        formData.diet === d.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="text-xs font-semibold">{d.label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{d.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Culture */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Cultural / Regional Tradition
                </label>
                <input
                  type="text"
                  data-testid="input-culture"
                  value={formData.culture}
                  onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                  placeholder="e.g. North Indian Awadhi, Punjabi, South Indian Tamil, Maharashtrian"
                  className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: STYLE & FUNCTIONS */}
          {currentStep === 3 && (
            <div data-testid="intake-wizard-step-3" className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Step 3: Vibe & Multi-Function Setup
              </h3>

              {/* Vibe */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Desired Vibe / Theme Direction
                </label>
                <input
                  type="text"
                  data-testid="input-vibe"
                  value={formData.vibe}
                  onChange={(e) => setFormData({ ...formData, vibe: e.target.value })}
                  placeholder="e.g. Royal Heritage, Minimalist Pastel, Energetic Bollywood"
                  className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Venue Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2">
                  Venue Preference
                </label>
                <div className="grid grid-cols-3 gap-3" data-testid="input-venue-type">
                  {VENUE_TYPES.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, venueType: v.id })}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        formData.venueType === v.id
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-bold'
                          : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      <div className="text-xs">{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Function Wedding Setup (Only for Weddings) */}
              {formData.type === 'wedding' && (
                <div data-testid="wedding-functions-select" className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      Multi-Function Wedding Coordination
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mb-3">
                    Select the key functions you are hosting. Evenavi calculates dedicated budgets and timeline milestones for each ceremony.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {WEDDING_FUNCTIONS.map((fn) => {
                      const isSelected = formData.selectedFunctions.includes(fn.id);
                      return (
                        <button
                          key={fn.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              selectedFunctions: isSelected
                                ? prev.selectedFunctions.filter((x) => x !== fn.id)
                                : [...prev.selectedFunctions, fn.id],
                            }));
                          }}
                          className={`p-2.5 rounded-lg border text-xs font-semibold transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-amber-500 bg-white dark:bg-stone-900 text-amber-800 dark:text-amber-300 shadow-sm'
                              : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 opacity-70'
                          }`}
                        >
                          <span>{fn.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & MUST-HAVES */}
          {currentStep === 4 && (
            <div data-testid="intake-wizard-step-4" className="space-y-5 animate-fade-in">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Step 4: Final Preferences & Review
              </h3>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                  <span className="text-stone-500">Event:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200 capitalize">{formData.type} — {formData.title}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                  <span className="text-stone-500">Date & Location:</span>
                  <span className="font-semibold text-stone-800 dark:text-stone-200">{formData.date} • {formData.city} (Tier {formData.cityTier})</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 dark:border-stone-700 pb-2">
                  <span className="text-stone-500">Budget & Scale:</span>
                  <span className="font-bold text-brand-600">{formatINR(formData.totalBudget)} • {formData.guestCount} guests</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Diet & Vibe:</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200 capitalize">{formData.diet} diet • {formData.vibe}</span>
                </div>
              </div>

              {/* Must-Haves */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Must-Have Priorities (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.mustHaves}
                  onChange={(e) => setFormData({ ...formData, mustHaves: e.target.value })}
                  placeholder="e.g. Live chaat counter, Drone cinematography, Royal mandap"
                  className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Avoid */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1.5">
                  Things to Avoid (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.avoid}
                  onChange={(e) => setFormData({ ...formData, avoid: e.target.value })}
                  placeholder="e.g. Single-use plastic, Overly loud western music, Heavy cream gravies"
                  className="w-full p-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {/* Stepper Controls */}
          <div className="mt-8 pt-5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                data-testid="wizard-prev-btn"
                onClick={prevStep}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                data-testid="wizard-next-btn"
                onClick={nextStep}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                data-testid="wizard-submit-btn"
                onClick={handleSubmit}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Plan Instantly</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
