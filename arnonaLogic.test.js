const assert = require('node:assert/strict');
const {
  resolveArnonaZone,
  resolveResidentialType,
  calculateArnona,
  parseAddress,
} = require('./arnonaLogic.js');

function approx(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 0.005, `${message}: expected ${expected}, got ${actual}`);
}

assert.deepEqual(parseAddress('רחוב הרצל 55, קריית אונו'), {
  streetName: 'הרצל',
  houseNumber: '55',
});

assert.equal(resolveArnonaZone('הרצל 55').zone, 'ב');
assert.equal(resolveArnonaZone('לוס אנגלס 34').zone, 'ג');
assert.equal(resolveArnonaZone('הנשיא 10').zone, 'א');
assert.equal(resolveArnonaZone('הרצל').requiresManualSelection, true);
assert.deepEqual(
  {
    zone: resolveArnonaZone('שאול המלך 16').zone,
    requiresManualSelection: resolveArnonaZone('שאול המלך 16').requiresManualSelection,
    reason: resolveArnonaZone('שאול המלך 16').reason,
  },
  {
    zone: null,
    requiresManualSelection: true,
    reason: 'building_year_required',
  },
);

assert.equal(resolveResidentialType(126), '2');
assert.equal(resolveResidentialType(96), '4א');
assert.equal(resolveResidentialType(76), '4ב');
assert.equal(resolveResidentialType(56), '4ג');
assert.equal(resolveResidentialType(55), '6');

const result = calculateArnona({
  zone: 'ב',
  apartmentAreaM2: 90,
  balconyIncluded: false,
  balconyAreaM2: 10,
  storageExists: true,
  storageAreaM2: 5,
});

assert.equal(result.residentialType, '4א');
assert.equal(result.taxableAreaM2, 105);
assert.equal(result.ratePerM2, 53.23);
approx(result.annualArnona, 5589.15, 'annual arnona');
approx(result.biMonthlyArnona, 931.525, 'bi-monthly arnona');

console.log('arnona logic tests passed');
