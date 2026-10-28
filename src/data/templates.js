/**
 * templates.js
 * Default metadata, base notes, and curated fallbacks per event type.
 */

export const EVENT_TYPES = [
  { id: 'wedding', label: 'Wedding', description: 'Complete celebration with multi-function coordination' },
  { id: 'birthday', label: 'Birthday', description: 'Milestone party, kids themes, or intimate dinner' },
  { id: 'community', label: 'Community Event', description: 'Society festival, cultural celebration, or sports meet' },
];

export const CITY_TIERS = [
  { tier: 1, label: 'Tier 1 (Metro)', example: 'Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata' },
  { tier: 2, label: 'Tier 2 (Emerging)', example: 'Pune, Jaipur, Lucknow, Ahmedabad, Chandigarh, Kochi' },
  { tier: 3, label: 'Tier 3 (Town/Semi-Urban)', example: 'Varanasi, Nashik, Dehradun, Madurai, Jodhpur' },
];

export const DIET_OPTIONS = [
  { id: 'veg', label: 'Pure Vegetarian', description: 'No meat, seafood or eggs' },
  { id: 'jain', label: 'Jain Vegetarian', description: 'No root vegetables (onion, garlic, potato)' },
  { id: 'nonveg', label: 'Non-Vegetarian', description: 'Includes poultry, meat and seafood' },
  { id: 'mixed', label: 'Mixed / Dual Kitchen', description: 'Dedicated separate veg and non-veg counters' },
];

export const VENUE_TYPES = [
  { id: 'indoor', label: 'Indoor Hall / Banquet' },
  { id: 'outdoor', label: 'Outdoor Lawn / Open Air' },
  { id: 'both', label: 'Both / Combined Spaces' },
];

export const DEFAULT_SUMMARIES = {
  wedding: 'A structured, culturally aligned celebration plan designed to maintain budget discipline across key vendor milestones without missing auspicious dates.',
  birthday: 'A cheerful, organized birthday plan focused on engaging entertainment, delicious catering, and memorable photo moments.',
  community: 'An orderly community festival blueprint ensuring vendor safety compliance, volunteer alignment, and vibrant cultural entertainment for all residents.',
};

export const EXAMPLE_INTAKE_PROMPTS = [
  {
    label: "Sister's Wedding (Lucknow)",
    text: "Planning my sister's 3-day wedding in Lucknow for 250 guests in December. Budget is 12 lakh, vegetarian food, need a grand sangeet and outdoor lawn mandap.",
  },
  {
    label: "7th Birthday Party (Pune)",
    text: "Organising my daughter's 7th birthday party in Pune for 40 kids and parents. Budget 40k next month, jungle safari theme, cake, magic show and return gifts.",
  },
  {
    label: "Society Diwali Mela (Bengaluru)",
    text: "Apartment RWA Diwali cultural event in Bengaluru for 400 residents in November. Budget 1.5 lakh, stage lights, food stalls, volunteer management and rangoli contest.",
  },
];
