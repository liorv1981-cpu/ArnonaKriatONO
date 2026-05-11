(() => {
  const {
    SPECIAL_ZONE_B_NEWER_BUILDING_STREETS: newerBuildingStreets,
    calculateArnona,
    parseAddress,
    resolveArnonaZone,
  } = window.ArnonaLogic;

  const form = document.querySelector('#calculator');
  const addressInput = document.querySelector('#address');
  const zoneFeedback = document.querySelector('#zoneFeedback');
  const manualZone = document.querySelector('#manualZone');
  const balconyAreaWrap = document.querySelector('#balconyAreaWrap');
  const storageAreaWrap = document.querySelector('#storageAreaWrap');
  const biMonthlyResult = document.querySelector('#biMonthlyResult');
  const monthlyResult = document.querySelector('#monthlyResult');
  const breakdown = document.querySelector('#breakdown');
  const warnings = document.querySelector('#warnings');

  const money = new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 2,
  });

  const area = new Intl.NumberFormat('he-IL', {
    maximumFractionDigits: 1,
  });

  function numberValue(name) {
    const raw = form.elements[name].value;
    return raw === '' ? 0 : Number.parseFloat(raw);
  }

  function selectedValue(name) {
    return new FormData(form).get(name);
  }

  function balconyIncludedValue() {
    const value = selectedValue('balconyIncluded');
    if (value === 'true') return true;
    if (value === 'false') return false;
    return 'unknown';
  }

  function selectedManualZone() {
    return selectedValue('manualZone') || null;
  }

  function setResultPlaceholder(message) {
    biMonthlyResult.textContent = message;
    monthlyResult.textContent = '';
    breakdown.innerHTML = '';
    warnings.innerHTML = '';
  }

  function renderZone(address) {
    const zoneResult = resolveArnonaZone(address);
    const manual = selectedManualZone();
    const effectiveZone = manual || (zoneResult.requiresManualSelection ? null : zoneResult.zone);

    if (address.trim().length < 2) {
      zoneFeedback.hidden = true;
      manualZone.hidden = true;
      return { effectiveZone, zoneResult };
    }

    zoneFeedback.hidden = false;

    if (zoneResult.requiresManualSelection) {
      zoneFeedback.className = 'zone-feedback warning';
      zoneFeedback.textContent =
        zoneResult.reason === 'house_number_required'
          ? 'ברחוב הזה נדרש מספר בית כדי לזהות את אזור הארנונה. אפשר להשלים מספר בית או לבחור אזור ידנית.'
          : 'לא הצלחנו לזהות אזור לפי הכתובת. אפשר לבחור אזור ידנית.';
      manualZone.hidden = false;
      return { effectiveZone, zoneResult };
    }

    manualZone.hidden = false;
    zoneFeedback.className = 'zone-feedback';
    zoneFeedback.textContent = manual
      ? `אזור הארנונה נבחר ידנית: אזור ${manual}׳.`
      : `אזור הארנונה זוהה אוטומטית: אזור ${zoneResult.zone}׳.`;

    const parsed = parseAddress(address);
    if (parsed.streetName && newerBuildingStreets.includes(parsed.streetName)) {
      zoneFeedback.textContent += ' בכתובת זו ייתכן שסיווג האזור תלוי בשנת סיום הבנייה או ההרחבה.';
    }

    return { effectiveZone, zoneResult };
  }

  function renderBreakdown(result) {
    const items = [
      ['אזור ארנונה', `אזור ${result.zone}׳`],
      ['סוג דירה', result.residentialType],
      ['שטח לחיוב', `${area.format(result.taxableAreaM2)} מ"ר`],
      ['תעריף שנתי למ"ר', money.format(result.ratePerM2)],
      ['ארנונה שנתית', money.format(result.annualArnona)],
    ];

    breakdown.innerHTML = items
      .map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`)
      .join('');
  }

  function renderWarnings(result) {
    warnings.innerHTML = result.warnings.map((warning) => `<p>${warning}</p>`).join('');
  }

  function update() {
    const address = addressInput.value;
    const { effectiveZone } = renderZone(address);
    const apartmentAreaM2 = numberValue('apartmentArea');
    const balconyIncluded = balconyIncludedValue();
    const balconyAreaM2 = numberValue('balconyArea');
    const storageExists = selectedValue('storageExists') === 'true';
    const storageAreaM2 = numberValue('storageArea');

    balconyAreaWrap.hidden = balconyIncluded !== false;
    storageAreaWrap.hidden = !storageExists;

    if (!effectiveZone) {
      setResultPlaceholder('יש לבחור אזור');
      return;
    }

    if (apartmentAreaM2 <= 0) {
      setResultPlaceholder('יש להזין שטח דירה');
      return;
    }

    if (balconyIncluded === false && balconyAreaM2 <= 0) {
      setResultPlaceholder('יש להזין שטח מרפסת');
      return;
    }

    if (storageExists && storageAreaM2 <= 0) {
      setResultPlaceholder('יש להזין שטח מחסן');
      return;
    }

    const result = calculateArnona({
      zone: effectiveZone,
      apartmentAreaM2,
      balconyIncluded,
      balconyAreaM2,
      storageExists,
      storageAreaM2,
    });

    biMonthlyResult.textContent = money.format(result.biMonthlyArnona);
    monthlyResult.textContent = `ממוצע חודשי: ${money.format(result.monthlyAverageArnona)}`;
    renderBreakdown(result);
    renderWarnings(result);
  }

  form.addEventListener('input', update);
  form.addEventListener('change', update);
  update();
})();
