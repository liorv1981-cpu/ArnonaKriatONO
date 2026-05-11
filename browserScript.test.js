const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = __dirname;

const elements = new Map();
function element(id, extra = {}) {
  const value = '';
  const el = {
    hidden: false,
    textContent: '',
    innerHTML: '',
    value,
    addEventListener() {},
    ...extra,
  };
  elements.set(`#${id}`, el);
  return el;
}

const form = element('calculator', {
  elements: {
    address: { value: '' },
    apartmentArea: { value: '' },
    balconyArea: { value: '' },
    storageArea: { value: '' },
  },
});

for (const id of [
  'address',
  'zoneFeedback',
  'manualZone',
  'balconyAreaWrap',
  'storageAreaWrap',
  'biMonthlyResult',
  'monthlyResult',
  'breakdown',
  'warnings',
]) {
  element(id);
}

elements.set('#address', form.elements.address);

const context = vm.createContext({
  window: {},
  document: {
    querySelector(selector) {
      return elements.get(selector) || element(selector.replace('#', ''));
    },
  },
  FormData: class {
    get(name) {
      if (name === 'balconyIncluded') return 'unknown';
      if (name === 'storageExists') return 'false';
      return null;
    }
  },
  Intl,
  console,
});
context.window = context;

assert.doesNotThrow(() => {
  vm.runInContext(fs.readFileSync(path.join(root, 'arnonaLogic.js'), 'utf8'), context);
  vm.runInContext(fs.readFileSync(path.join(root, 'app.js'), 'utf8'), context);
});

console.log('browser script test passed');
