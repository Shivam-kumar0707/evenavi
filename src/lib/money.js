/**
 * Money utilities with strict INR and Indian numbering format (en-IN).
 */

/**
 * Format a number as Indian Currency (e.g. ₹8,50,000)
 * @param {number} amount
 * @param {boolean} showDecimals
 * @returns {string}
 */
export function formatINR(amount, showDecimals = false) {
  if (amount == null || isNaN(amount)) return '₹0';
  const rounded = Math.round(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(rounded);
}

/**
 * Format in compact Indian style (e.g. ₹8.5L, ₹1.2 Cr, ₹45k)
 * @param {number} amount
 * @returns {string}
 */
export function formatCompactINR(amount) {
  if (amount == null || isNaN(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return `${sign}₹${cr % 1 === 0 ? cr : cr.toFixed(2).replace(/\.?0+$/, '')} Cr`;
  }
  if (abs >= 100000) {
    const lakh = abs / 100000;
    return `${sign}₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}₹${k % 1 === 0 ? k : k.toFixed(1).replace(/\.?0+$/, '')}k`;
  }
  return `${sign}₹${abs}`;
}

/**
 * Parse Indian money strings into exact numeric amounts in INR.
 * Supports: 8L, 8 lakh, 1.2 cr, 1.2 crore, 45k, ₹8,50,000, 850000.
 * @param {string|number} input
 * @returns {number}
 */
export function parseMoney(input) {
  if (typeof input === 'number') return isNaN(input) ? 0 : Math.round(input);
  if (!input || typeof input !== 'string') return 0;

  let cleaned = input.trim().toLowerCase().replace(/,/g, '').replace(/₹/g, '').replace(/\s+/g, ' ');

  // Match crore: 1.2 cr, 1.2 crore, 1cr
  const crMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:cr|crore|crores)$/);
  if (crMatch) {
    return Math.round(parseFloat(crMatch[1]) * 10000000);
  }

  // Match lakh: 8l, 8 lakh, 8.5 lakhs
  const lakhMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:l|lakh|lakhs|lac|lacs)$/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }

  // Match thousand: 45k, 45 thousand
  const kMatch = cleaned.match(/^([0-9]+(?:\.[0-9]+)?)\s*(?:k|thousand|thousands)$/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }

  // Pure numeric string
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}
