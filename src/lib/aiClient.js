/**
 * aiClient.js
 * Client-side interface to POST /api/ai.
 * Provides resilient parallel fetching, retry on 429, and guaranteed deterministic fallbacks.
 */

import { parseMoney } from './money.js';
import { DEFAULT_SUMMARIES } from '../data/templates.js';
import { getVendorTemplates } from '../data/vendorTemplates.js';
import { DEMO_PLANS } from '../data/demoPlans.js';

const API_ENDPOINT = '/api/ai';

/**
 * Call the AI proxy endpoint with retry and fallback
 * @param {string} task
 * @param {object} input
 * @returns {Promise<{ ok: boolean, data: object, source: 'ai'|'template', error?: string }>}
 */
export async function callAiTask(task, input) {
  try {
    let response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, input }),
    });

    // Handle 429 with single retry after min(retryAfter, 2s)
    if (response.status === 429) {
      const retryAfter = Math.min(2, parseInt(response.headers.get('retry-after') || '2', 10));
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, input }),
      });
    }

    if (response.ok) {
      const json = await response.json();
      if (json.ok && json.data) {
        return { ok: true, data: json.data, source: 'ai' };
      }
    }
  } catch (err) {
    console.warn(`AI task ${task} network call failed, falling back to deterministic template.`, err.message);
  }

  // Fallback to deterministic client content
  const fallbackData = getDeterministicFallback(task, input);
  return { ok: false, data: fallbackData, source: 'template', error: 'AI_FALLBACK_USED' };
}

/**
 * Deterministic client fallbacks for every task (AI Spec Part 3.5)
 * @param {string} task
 * @param {object} input
 * @returns {object}
 */
export function getDeterministicFallback(task, input = {}) {
  switch (task) {
    case 'parse_intake': {
      const text = input.text || '';

      // Extract money substring from free text e.g. "8 lakh", "1.2 cr", "40k", "₹8,50,000"
      let money = 0;
      const moneyRegex = /(?:₹\s*)?([0-9]+(?:\.[0-9]+)?)\s*(cr|crore|crores|l|lakh|lakhs|lac|lacs|k|thousand|thousands)\b|(?:₹\s*)([0-9,]+)/i;
      const mMatch = text.match(moneyRegex);
      if (mMatch) {
        money = parseMoney(mMatch[0]);
      } else {
        money = parseMoney(text);
      }

      // Guess guest count e.g. "200 guests", "40 pax", "for 150 people"
      const guestMatch = text.match(/(\d+)\s*(?:guests?|people|pax|residents?|kids?)/i);
      const guestCount = guestMatch ? parseInt(guestMatch[1], 10) : undefined;

      // Guess event type
      let type = undefined;
      const lower = text.toLowerCase();
      if (lower.includes('wedding') || lower.includes('shaadi') || lower.includes('sangeet')) {
        type = 'wedding';
      } else if (lower.includes('birthday') || lower.includes('bday')) {
        type = 'birthday';
      } else if (lower.includes('community') || lower.includes('diwali') || lower.includes('society') || lower.includes('mela')) {
        type = 'community';
      }

      // Guess diet
      let diet = undefined;
      if (lower.includes('jain')) diet = 'jain';
      else if (lower.includes('pure veg') || lower.includes('vegetarian')) diet = 'veg';
      else if (lower.includes('non-veg') || lower.includes('nonveg')) diet = 'nonveg';

      // Guess city from common Indian cities
      const CITIES = ['Lucknow', 'Pune', 'Bengaluru', 'Delhi', 'Mumbai', 'Jaipur', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Chandigarh', 'Goa'];
      let city = undefined;
      for (const c of CITIES) {
        if (new RegExp(`\\b${c}\\b`, 'i').test(text)) {
          city = c;
          break;
        }
      }

      const missing = [];
      if (!type) missing.push('type');
      if (!guestCount) missing.push('guestCount');
      if (!money) missing.push('totalBudget');
      if (!city) missing.push('city');

      return {
        event: {
          type,
          guestCount,
          totalBudget: money || undefined,
          city,
          diet,
          title: text.slice(0, 50).trim(),
        },
        missing,
      };
    }

    case 'plan_core': {
      const eventType = input.event?.type || 'wedding';
      const summary = DEFAULT_SUMMARIES[eventType] || DEFAULT_SUMMARIES.wedding;
      const budgetNotes = (input.allocations || []).map((a) => ({
        category: a.category,
        note: `Target approximately ${a.percent}% of budget for quality service and clear deliverables.`,
      }));
      const perGuestVal = Math.round((input.event?.totalBudget || 0) / Math.max(1, input.event?.guestCount || 1));
      return {
        summary,
        perGuestInsight: `At approximately ₹${perGuestVal.toLocaleString('en-IN')} per guest, this budget provides a dependable baseline for your ${eventType}.`,
        budgetNotes,
        extraTasks: [],
      };
    }

    case 'vendor_pack': {
      const eventType = input.event?.type || 'wedding';
      const templateVendors = getVendorTemplates(eventType);
      return {
        vendors: templateVendors.map((v) => ({
          category: v.category,
          tasks: v.tasks.map((t) => t.text),
          questions: v.questions,
          redFlags: v.redFlags,
        })),
      };
    }

    case 'ideas': {
      const eventType = input.event?.type || 'wedding';
      const fixture = DEMO_PLANS[eventType]?.ideas;
      if (fixture) {
        return {
          themes: fixture.themes,
          menu: fixture.menu,
          activities: fixture.activities,
          returnGifts: fixture.returnGifts,
          invitation: fixture.invitation,
        };
      }
      return {
        themes: [
          {
            name: 'Festive Heritage',
            tagline: 'Timeless traditional elegance with warm marigold accents.',
            palette: ['#F59E0B', '#DC2626', '#10B981', '#FEF3C7'],
            decor: ['Marigold garlands', 'Brass lamps', 'Fairy light curtains'],
            menuHighlights: ['Paneer Tikka', 'Dal Makhani', 'Gulab Jamun'],
            activity: 'Traditional blessing ceremony and family photo session.',
          },
          {
            name: 'Modern Contemporary',
            tagline: 'Sleek pastel minimalism with ambient lighting.',
            palette: ['#3B82F6', '#8B5CF6', '#EC4899', '#F8FAFC'],
            decor: ['Pastel drapery', 'Geometric centerpieces', 'Neon sign photo booth'],
            menuHighlights: ['Crispy Corn', 'Veg Biryani', 'Rasmalai Cake'],
            activity: 'Interactive musical game and curated playlist.',
          },
          {
            name: 'Eco-Friendly Celebration',
            tagline: 'Sustainable, green and heartwarming celebration.',
            palette: ['#16A34A', '#EAB308', '#0D9488', '#F0FDF4'],
            decor: ['Potted plants', 'Jute table runners', 'Earthen clay lamps'],
            menuHighlights: ['Regional starters', 'Organic thali', 'Jaggery sweet'],
            activity: 'Tree sapling plantation blessing.',
          },
        ],
        menu: {
          starters: ['Paneer Tikka', 'Crispy Corn', 'Spring Rolls'],
          mains: ['Paneer Lababdar', 'Dal Makhani', 'Veg Dum Biryani', 'Assorted Breads'],
          desserts: ['Gulab Jamun with Rabri', 'Ice Cream cups'],
          drinks: ['Masala Chai', 'Fresh Fruit Mocktails'],
        },
        activities: ['Welcome photo booth', 'Family trivia quiz', 'Musical performance'],
        returnGifts: ['Handcrafted scented candle', 'Assorted dry fruit box', 'Plantable seed pencil set'],
        invitation: {
          en: 'You are cordially invited to celebrate this joyous occasion with us. Your presence and blessings will make our celebration complete.',
          hi: 'इस पावन और शुभ अवसर पर आप सभी का सपरिवार सादर स्वागत है। कृपया पधारकर अपने स्नेह और आशीर्वाद से हमें अनुगृहीत करें।',
          hinglish: 'You are warmly invited to join us for this special celebration. Aapka aana hamare liye behad khushi ki baat hogi!',
        },
      };
    }

    case 'explain_budget_change': {
      const beforeMap = Object.fromEntries((input.before || []).map((b) => [b.id, b.planned]));
      const bullets = [];
      const warnings = [];

      (input.after || []).forEach((a) => {
        const prev = beforeMap[a.id] || 0;
        const diff = a.planned - prev;
        if (Math.abs(diff) >= 500) {
          const sign = diff > 0 ? 'increased' : 'decreased';
          bullets.push(`${a.category} planned budget ${sign} by ₹${Math.abs(diff).toLocaleString('en-IN')}.`);
        }
      });

      if (bullets.length === 0) {
        bullets.push('Budget allocations remain balanced with no significant category shifts.');
      }

      // Check contingency
      const cont = (input.after || []).find((a) => a.id === 'contingency');
      if (cont && cont.planned < (input.event?.totalBudget || 0) * 0.03) {
        warnings.push('Contingency buffer is below recommended 3% threshold. Consider preserving buffer for unexpected expenses.');
      }

      return { bullets, warnings };
    }

    case 'compare_quotes': {
      const normalized = (input.quotes || []).map((q, idx) => ({
        vendor: `Vendor ${idx + 1}`,
        total: 'Review quote text for breakdown',
        inclusions: ['Standard service package'],
        exclusions: ['Check for travel/overtime charges'],
        hiddenCostFlags: ['Ensure GST and extra hours are clarified'],
      }));

      return {
        normalized,
        bestValue: 'Vendor 1',
        recommendation: 'Evaluate both vendors on food quality tasting and verified past customer reviews before paying advance.',
        negotiationTips: [
          'Ask for complimentary water bottles and beverage dispensers.',
          'Request a 5% waiver on advance deposit.',
          'Clarify overtime cutoff policy for music and service.',
        ],
        confidence: 'medium',
      };
    }

    case 'plan_b': {
      return {
        mitigations: (input.risks || []).map((r) => ({
          riskId: r.id,
          steps: [
            'Convene an immediate review with primary stakeholders and planners.',
            'Establish an emergency WhatsApp group with vendor point-of-contacts.',
            'Confirm payment milestones are linked to milestone delivery check-offs.',
          ],
        })),
      };
    }

    case 'vendor_message': {
      const { category, vendorName, intent, language, event } = input;
      const vName = vendorName || `${category} team`;
      const dateStr = event?.date || 'upcoming dates';
      const cityStr = event?.city ? `in ${event.city}` : '';
      const guestStr = event?.guestCount ? `for ${event.guestCount} guests` : '';

      if (language === 'hi') {
        if (intent === 'enquiry') {
          return { message: `नमस्ते ${vName}, हम ${dateStr} को ${cityStr} ${guestStr} अपने कार्यक्रम के लिए आपकी सेवाओं के बारे में जानकारी चाहते हैं। कृपया अपना कोटेशन और उपलब्धता साझा करें। धन्यवाद!` };
        }
        return { message: `नमस्ते ${vName}, हमारे कार्यक्रम के संबंध में कृपया अंतिम कोटेशन और सेवा विवरण साझा करें। धन्यवाद!` };
      }

      if (language === 'hinglish') {
        if (intent === 'enquiry') {
          return { message: `Hi ${vName}, we are planning a ${event?.type || 'event'} on ${dateStr} ${cityStr} ${guestStr}. Would love to check your availability and package pricing. Please share details. Thanks!` };
        }
        if (intent === 'negotiate') {
          return { message: `Hi ${vName}, thank you for sharing the quote! We really loved your work. Since our overall budget is tight, can we work together around a special package rate? Let's discuss!` };
        }
        return { message: `Hi ${vName}, just following up on our event discussion for ${dateStr}. Looking forward to confirming the dates with you soon. Thanks!` };
      }

      // English
      if (intent === 'enquiry') {
        return { message: `Hello ${vName}, we are planning a ${event?.type || 'event'} on ${dateStr} ${cityStr} ${guestStr}. We would like to inquire about your availability and package details. Please share your quote at your earliest convenience. Thank you!` };
      }
      if (intent === 'negotiate') {
        return { message: `Hello ${vName}, thank you for your quotation. We appreciate your portfolio and would love to work with you. Our allocated budget for this service is slightly tighter; could you consider a package adjustment? Let us know if we can discuss.` };
      }
      if (intent === 'confirm') {
        return { message: `Hello ${vName}, we are delighted to confirm our booking for the event on ${dateStr}. Please send across the agreement and advance payment bank details to finalize. Thank you!` };
      }
      return { message: `Hello ${vName}, following up regarding our event on ${dateStr}. Please let us know if you require any additional details from our end to proceed. Thank you!` };
    }

    default:
      return {};
  }
}
