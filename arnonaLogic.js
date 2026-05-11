const RATES_2026 = {
  'א': { '2': 82.11, '4א': 68.75, '4ב': 65.60, '4ג': 62.63, '6': 45.84 },
  'ב': { '2': 68.75, '4א': 53.23, '4ב': 52.03, '4ג': 49.61, '6': 41.67 },
  'ג': { '2': 51.27, '4א': 41.08, '4ב': 41.08, '4ג': 41.08, '6': 41.08 },
};

const STREET_ALIASES = {
  'לוס אנגלס': "לוס אנג'לס",
  'לוס אנג׳לס': "לוס אנג'לס",
  'זבוטינסקי': "ז'בוטינסקי",
  'ז׳בוטינסקי': "ז'בוטינסקי",
  'קקל': 'שדרות קק"ל',
  'שד קקל': 'שדרות קק"ל',
  'שדרות קקל': 'שדרות קק"ל',
  'רשי': 'רש"י',
  'שי עגנון': 'ש"י עגנון',
  'ש י עגנון': 'ש"י עגנון',
  'המהריץ': 'המהרי"ץ',
};

const SPECIAL_ZONE_B_NEWER_BUILDING_STREETS = [
  'שאול המלך',
  'ישעיהו',
  'יהודה הלוי',
  'הרוגי מלכות בבל',
];

const ZONE_C_RULES = [
  { street: 'ביאליק', numbers: ['16א', '17א', '25', '27', '33', '35', '14', '16'] },
  { street: 'גולומב', numbers: ['33', '35', '39'] },
  { street: "לוס אנג'לס", range: { from: 32, to: 42 } },
  { street: 'טרומן', numbers: ['2', '4', '6', '8', '10', '12', '14'] },
  { street: 'מרזוק עזר', range: { from: 3, to: 27 } },
];

const ZONE_B_RULES = [
  { street: 'אבן עזרא', all: true },
  { street: 'אבן גבירול', all: true },
  { street: 'ביאליק', all: true, exceptNumbers: ['15', '17'], exceptParity: 'odd' },
  { street: 'ברכה', all: true },
  { street: 'ברנר', all: true },
  { street: 'גולומב', ranges: [{ from: 18, to: 24, parity: 'even' }, { from: 25, to: 39, parity: 'odd' }] },
  { street: 'גורדון', parity: 'odd' },
  { street: 'דבורה הנביאה', all: true },
  { street: 'הברוש', all: true },
  { street: 'הגפן', all: true },
  { street: 'ההדר', parity: 'even' },
  { street: 'הושע', all: true },
  { street: 'הכלנית', all: true },
  { street: 'המעפילים', all: true },
  { street: 'הרוגי מלכות בבל', all: true },
  { street: 'השקד', all: true },
  { street: 'התאנה', range: { from: 1, to: 11 }, parity: 'odd' },
  { street: 'הרצל', ranges: [{ from: 53, to: 57 }, { from: 61, to: Infinity, parity: 'odd' }, { from: 68, to: Infinity }] },
  { street: "ז'בוטינסקי", ranges: [{ from: 1, to: 9 }, { from: 31, to: 45 }] },
  { street: 'חזקיהו', all: true },
  { street: 'טרומן', all: true },
  { street: 'יהואש', all: true },
  { street: 'יהודה הלוי', all: true },
  { street: 'ירמיהו', all: true },
  { street: 'ירושלים', all: true },
  { street: 'ישעיהו', all: true },
  { street: "לוס אנג'לס", ranges: [{ from: 5, to: 11, parity: 'odd' }, { from: 28, to: 42, parity: 'even' }] },
  { street: 'המהרי"ץ', all: true },
  { street: 'מרזוק עזר', all: true },
  { street: 'עמוס', all: true },
  { street: 'צדקיהו', all: true },
  { street: 'אחאב', all: true },
  { street: 'קפלן', ranges: [{ from: 45, to: 47 }, { from: 57, to: Infinity, parity: 'odd' }, { from: 56, to: Infinity, parity: 'even' }] },
  { street: 'רש"י', all: true },
  { street: 'שלמה המלך', all: true },
  { street: 'ש"י עגנון', numbers: ['1', '13'] },
  { street: 'שמואל הנביא', all: true },
  { street: 'שדרות קק"ל', range: { from: 15, to: Infinity }, parity: 'odd' },
];

function resolveResidentialType(taxableAreaM2) {
  if (taxableAreaM2 > 125) return '2';
  if (taxableAreaM2 >= 96) return '4א';
  if (taxableAreaM2 >= 76) return '4ב';
  if (taxableAreaM2 >= 56) return '4ג';
  return '6';
}

function normalizeHebrewAddress(input) {
  let normalized = String(input || '')
    .trim()
    .replace(/^רחוב\s+/, '')
    .replace(/קריית אונו|קרית אונו/g, '')
    .replace(/[,.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [alias, realName] of Object.entries(STREET_ALIASES)) {
    if (normalized.startsWith(alias)) {
      normalized = normalized.replace(alias, realName);
      break;
    }
  }

  return normalized;
}

function parseAddress(input) {
  const normalized = normalizeHebrewAddress(input);
  if (!normalized) return { streetName: null, houseNumber: null };

  const match = normalized.match(/^(.*?)\s+(\d+[א-תA-Za-z]?)$/i);
  if (match) {
    return { streetName: match[1].trim(), houseNumber: match[2] };
  }

  return { streetName: normalized, houseNumber: null };
}

function extractNumber(houseNumber) {
  if (!houseNumber) return null;
  const match = String(houseNumber).match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : null;
}

function checkParity(num, parity) {
  if (!parity) return true;
  const isEven = num % 2 === 0;
  return parity === 'even' ? isEven : !isEven;
}

function checkRuleMatch(rule, parsedHouseNumberStr) {
  const numStr = parsedHouseNumberStr;
  const num = extractNumber(numStr);
  const needsNumber = rule.numbers || rule.range || rule.ranges || rule.parity || rule.exceptNumbers || rule.exceptParity;

  if (needsNumber && !numStr) return 'partial';

  if (rule.all) {
    if (rule.exceptNumbers && numStr && rule.exceptNumbers.includes(numStr)) return false;
    if (rule.exceptParity && num !== null && checkParity(num, rule.exceptParity)) return false;
    return true;
  }

  if (rule.numbers && numStr && rule.numbers.includes(numStr)) return true;

  if (num !== null) {
    if (rule.range && num >= rule.range.from && num <= rule.range.to && checkParity(num, rule.parity)) return true;
    if (rule.ranges) {
      return rule.ranges.some((range) => num >= range.from && num <= range.to && checkParity(num, range.parity));
    }
    if (rule.parity && checkParity(num, rule.parity)) return true;
  }

  return false;
}

function resolveArnonaZone(address) {
  const parsed = parseAddress(address);
  if (!parsed.streetName) {
    return { zone: null, confidence: 'low', requiresManualSelection: true, reason: 'street_not_found', parsed };
  }

  let requiresManual = false;

  for (const rule of ZONE_C_RULES) {
    if (rule.street === parsed.streetName) {
      const match = checkRuleMatch(rule, parsed.houseNumber);
      if (match === 'partial') requiresManual = true;
      else if (match) return { zone: 'ג', confidence: 'high', requiresManualSelection: false, parsed };
    }
  }

  for (const rule of ZONE_B_RULES) {
    if (rule.street === parsed.streetName) {
      const match = checkRuleMatch(rule, parsed.houseNumber);
      if (match === 'partial') requiresManual = true;
      else if (match) return { zone: 'ב', confidence: 'high', requiresManualSelection: false, parsed };
    }
  }

  if (requiresManual) {
    return { zone: null, confidence: 'low', requiresManualSelection: true, reason: 'house_number_required', parsed };
  }

  return { zone: 'א', confidence: 'medium', requiresManualSelection: false, reason: 'default_zone_a_after_successful_parse', parsed };
}

function calculateArnona(input) {
  const taxableAreaM2 =
    input.apartmentAreaM2 +
    (input.balconyIncluded === false ? input.balconyAreaM2 : 0) +
    (input.storageExists ? input.storageAreaM2 : 0);
  const residentialType = resolveResidentialType(taxableAreaM2);
  const ratePerM2 = RATES_2026[input.zone][residentialType];
  const annualArnona = taxableAreaM2 * ratePerM2;
  const warnings = [];

  if (input.balconyIncluded === 'unknown') {
    warnings.push('רמת דיוק בינונית: אם שטח המרפסת אינו כלול בשטח שהוזן, החיוב בפועל עשוי להיות גבוה יותר.');
  }
  if (input.storageExists && input.storageAreaM2 > 0) {
    warnings.push('אם שטח המחסן הוזן כהערכה, החיוב בפועל עשוי להשתנות לפי שטח הארנונה הרשמי.');
  }
  if (input.apartmentAreaM2 > 0 && (input.apartmentAreaM2 < 20 || input.apartmentAreaM2 > 300)) {
    warnings.push('השטח שהוזן נראה חריג. כדאי לוודא שהמספר נכון.');
  }
  if (input.balconyIncluded === false && input.balconyAreaM2 > 80) {
    warnings.push('שטח המרפסת נראה חריג. נא לוודא שההזנה תקינה.');
  }

  return {
    zone: input.zone,
    residentialType,
    taxableAreaM2,
    ratePerM2,
    annualArnona,
    biMonthlyArnona: annualArnona / 6,
    monthlyAverageArnona: annualArnona / 12,
    warnings,
  };
}

const api = {
  RATES_2026,
  SPECIAL_ZONE_B_NEWER_BUILDING_STREETS,
  resolveResidentialType,
  normalizeHebrewAddress,
  parseAddress,
  resolveArnonaZone,
  calculateArnona,
};

if (typeof module !== 'undefined') {
  module.exports = api;
}

if (typeof window !== 'undefined') {
  window.ArnonaLogic = api;
}
