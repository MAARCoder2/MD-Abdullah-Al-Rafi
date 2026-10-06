/**
 * Tender Document Package Builder
 * Step 1: Dynamic Requirements Loader & Viewer with Bilingual Support
 */

// --- Global State ---
const state = {
  currentLang: 'en', // 'en' | 'bn'
  loadedData: null   // parsed requirements.json object
};

// --- Bilingual Translation Dictionary ---
const translations = {
  en: {
    appTitle: "Tender Document Package Builder",
    appSubtitle: "Preparation & Verification Suite (Frontend Only)",
    languageLabel: "Language:",
    step1Title: "Step 1: Load Requirements",
    step1Desc: "Upload a valid requirements.json file to configure the tender parameters and document specifications.",
    loadSampleBtn: "Load Default Sample",
    dropTextPrompt: "Click to choose",
    dropTextOr: "or drag & drop",
    dropHint: "Valid JSON containing tender metadata and requirements array",
    tenderDetailsTitle: "Tender Overview",
    labelTenderTitle: "Tender Title",
    labelProcuringEntity: "Procuring Entity",
    labelBidder: "Bidder Name",
    labelDeadline: "Submission Deadline",
    reqListTitle: "Required Documents Checklist",
    reqListDesc: "Documents required for final package assembly, strictly sorted by sequence order.",
    thOrder: "Order",
    thId: "ID",
    thTitle: "Document Title",
    thRequirement: "Requirement",
    thExpiryReq: "Expiry Check",
    badgeMandatory: "Mandatory",
    badgeOptional: "Optional",
    badgeExpiryRequired: "Expiry Required",
    badgeNoExpiry: "Not Required",
    totalDocsPill: "{count} Documents",
    mandatoryPill: "{count} Mandatory",
    optionalPill: "{count} Optional",
    expiryPill: "{count} Expiry Checks",
    footerText: "Tender Document Package Builder · AI DevFest 2026 Solo Contest",
    alertLoadedSuccess: "Successfully loaded requirements for Tender: {id}",
    alertInvalidJson: "Failed to parse file. Please upload a valid JSON document.",
    alertInvalidSchema: "Invalid schema: JSON must contain 'tender' object and 'requirements' array.",
    alertFetchSampleError: "Could not auto-fetch sample. Please drag and drop requirements.json directly."
  },
  bn: {
    appTitle: "টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার",
    appSubtitle: "প্রস্তুতি ও যাচাইকরণ স্যুট (শুধুমাত্র ফ্রন্টএন্ড)",
    languageLabel: "ভাষা:",
    step1Title: "ধাপ ১: রিকোয়ারমেন্ট লোড করুন",
    step1Desc: "দরপত্রের শর্তাবলী এবং নথির বিবরণ কনফিগার করতে একটি বৈধ requirements.json ফাইল আপলোড করুন।",
    loadSampleBtn: "ডিফল্ট স্যাম্পল লোড করুন",
    dropTextPrompt: "ফাইল বাছতে ক্লিক করুন",
    dropTextOr: "অথবা ড্র্যাগ করে আনুন",
    dropHint: "দরপত্রের মেটাডেটা এবং রিকোয়ারমেন্টস অ্যারে যুক্ত বৈধ JSON ফাইল",
    tenderDetailsTitle: "দরপত্রের বিবরণ",
    labelTenderTitle: "দরপত্রের শিরোনাম",
    labelProcuringEntity: "সংগ্রহকারী প্রতিষ্ঠান",
    labelBidder: "দরপত্রদাতা প্রতিষ্ঠান",
    labelDeadline: "জমা দেওয়ার শেষ তারিখ",
    reqListTitle: "প্রয়োজনীয় নথিপত্রের তালিকা",
    reqListDesc: "চূড়ান্ত প্যাকেজের জন্য প্রয়োজনীয় নথিপত্র, ক্রমানুসারে সাজানো।",
    thOrder: "ক্রম",
    thId: "আইডি",
    thTitle: "নথির শিরোনাম",
    thRequirement: "প্রয়োজনীয়তা",
    thExpiryReq: "মেয়াদ যাচাই",
    badgeMandatory: "বাধ্যতামূলক",
    badgeOptional: "ঐচ্ছিক",
    badgeExpiryRequired: "মেয়াদ আবশ্যক",
    badgeNoExpiry: "প্রযোজ্য নয়",
    totalDocsPill: "{count}টি নথি",
    mandatoryPill: "{count}টি বাধ্যতামূলক",
    optionalPill: "{count}টি ঐচ্ছিক",
    expiryPill: "{count}টির মেয়াদ যাচাই",
    footerText: "দরপত্র নথি প্যাকেজ বিল্ডার · AI DevFest 2026",
    alertLoadedSuccess: "সফলভাবে রিকোয়ারমেন্ট লোড হয়েছে: {id}",
    alertInvalidJson: "ফাইলটি পড়া যায়নি। অনুগ্রহ করে একটি সঠিক JSON ফাইল নির্বাচন করুন।",
    alertInvalidSchema: "ভুল ফরম্যাট: JSON ফাইলে অবশ্যই 'tender' অবজেক্ট এবং 'requirements' অ্যারে থাকতে হবে।",
    alertFetchSampleError: "স্যাম্পল ফাইলটি সরাসরি লোড করা যায়নি। অনুগ্রহ করে requirements.json ড্রপ করুন।"
  }
};

// --- DOM References ---
const langEnBtn = document.getElementById('langEnBtn');
const langBnBtn = document.getElementById('langBnBtn');
const dropZone = document.getElementById('dropZone');
const jsonFileInput = document.getElementById('jsonFileInput');
const loadBundledBtn = document.getElementById('loadBundledBtn');
const loadAlert = document.getElementById('loadAlert');
const alertIcon = document.getElementById('alertIcon');
const alertMessage = document.getElementById('alertMessage');

const tenderDetailsSection = document.getElementById('tenderDetailsSection');
const tenderIdBadge = document.getElementById('tenderIdBadge');
const totalReqCountBadge = document.getElementById('totalReqCountBadge');
const tenderTitleVal = document.getElementById('tenderTitleVal');
const procuringEntityVal = document.getElementById('procuringEntityVal');
const bidderVal = document.getElementById('bidderVal');
const deadlineVal = document.getElementById('deadlineVal');

const requirementsListSection = document.getElementById('requirementsListSection');
const mandatoryCountPill = document.getElementById('mandatoryCountPill');
const optionalCountPill = document.getElementById('optionalCountPill');
const expiryCountPill = document.getElementById('expiryCountPill');
const requirementsTableBody = document.getElementById('requirementsTableBody');

// --- Helper Functions ---
function getTranslation(key, params = {}) {
  const dict = translations[state.currentLang] || translations.en;
  let text = dict[key] || translations.en[key] || key;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    text = text.replace(`{${paramKey}}`, paramVal);
  }
  return text;
}

function updateUILanguage() {
  const isBn = state.currentLang === 'bn';
  document.body.classList.toggle('lang-bn', isBn);

  // Update active state on language buttons
  if (isBn) {
    langBnBtn.classList.add('active');
    langEnBtn.classList.remove('active');
  } else {
    langEnBtn.classList.add('active');
    langBnBtn.classList.remove('active');
  }

  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = getTranslation(key);
  });

  // Re-render data if already loaded
  if (state.loadedData) {
    renderTenderData(state.loadedData);
  }
}

function showAlert(message, type = 'success') {
  loadAlert.className = `alert-banner ${type}`;
  alertIcon.textContent = type === 'success' ? '✓' : '⚠';
  alertMessage.textContent = message;
  loadAlert.classList.remove('hidden');
}

function hideAlert() {
  loadAlert.classList.add('hidden');
}

// --- JSON Validation & Processing ---
function validateAndProcessJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    // Validate Schema
    if (!parsed || typeof parsed !== 'object') {
      throw new Error(getTranslation('alertInvalidJson'));
    }

    if (!parsed.tender || typeof parsed.tender !== 'object') {
      throw new Error(getTranslation('alertInvalidSchema'));
    }

    if (!Array.isArray(parsed.requirements)) {
      throw new Error(getTranslation('alertInvalidSchema'));
    }

    // Sort requirements dynamically by order
    const sortedRequirements = [...parsed.requirements].sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 999;
      const orderB = typeof b.order === 'number' ? b.order : 999;
      return orderA - orderB;
    });

    state.loadedData = {
      tender: parsed.tender,
      requirements: sortedRequirements
    };

    renderTenderData(state.loadedData);

    const tenderId = parsed.tender.tender_id || 'N/A';
    showAlert(getTranslation('alertLoadedSuccess', { id: tenderId }), 'success');
  } catch (err) {
    showAlert(err.message || getTranslation('alertInvalidJson'), 'error');
  }
}

// --- Render Loaded Data Dynamically ---
function renderTenderData(data) {
  const { tender, requirements } = data;
  const isBn = state.currentLang === 'bn';

  // 1. Populate Tender Details
  tenderIdBadge.textContent = tender.tender_id || 'N/A';
  totalReqCountBadge.textContent = getTranslation('totalDocsPill', { count: requirements.length });
  tenderTitleVal.textContent = tender.title || '-';
  procuringEntityVal.textContent = tender.procuring_entity || '-';
  bidderVal.textContent = tender.bidder || '-';
  deadlineVal.textContent = tender.submission_deadline || '-';

  tenderDetailsSection.classList.remove('hidden');

  // 2. Count Summaries
  const mandatoryCount = requirements.filter(r => r.mandatory === true).length;
  const optionalCount = requirements.filter(r => r.mandatory === false).length;
  const expiryCount = requirements.filter(r => r.has_expiry === true).length;

  mandatoryCountPill.textContent = getTranslation('mandatoryPill', { count: mandatoryCount });
  optionalCountPill.textContent = getTranslation('optionalPill', { count: optionalCount });
  expiryCountPill.textContent = getTranslation('expiryPill', { count: expiryCount });

  // 3. Render Requirements Table Rows
  requirementsTableBody.innerHTML = '';

  requirements.forEach(item => {
    const tr = document.createElement('tr');

    // Title based on chosen language
    let primaryTitle = '';
    let secondaryTitle = '';

    if (isBn) {
      primaryTitle = item.title_bn || item.title_en || item.id;
      secondaryTitle = item.title_en && item.title_en !== primaryTitle ? item.title_en : '';
    } else {
      primaryTitle = item.title_en || item.title_bn || item.id;
      secondaryTitle = item.title_bn && item.title_bn !== primaryTitle ? item.title_bn : '';
    }

    // Badges
    const isMandatory = item.mandatory === true;
    const hasExpiry = item.has_expiry === true;

    const mandatoryBadgeHtml = isMandatory
      ? `<span class="status-pill status-mandatory">${getTranslation('badgeMandatory')}</span>`
      : `<span class="status-pill status-optional">${getTranslation('badgeOptional')}</span>`;

    const expiryBadgeHtml = hasExpiry
      ? `<span class="status-pill status-expiry-yes">${getTranslation('badgeExpiryRequired')}</span>`
      : `<span class="status-pill status-expiry-no">${getTranslation('badgeNoExpiry')}</span>`;

    tr.innerHTML = `
      <td>
        <span class="order-badge">${item.order ?? '-'}</span>
      </td>
      <td>
        <span class="doc-id-code">${escapeHtml(item.id || '-')}</span>
      </td>
      <td>
        <div class="doc-title-cell">${escapeHtml(primaryTitle)}</div>
        ${secondaryTitle ? `<div class="doc-title-sub">${escapeHtml(secondaryTitle)}</div>` : ''}
      </td>
      <td>${mandatoryBadgeHtml}</td>
      <td>${expiryBadgeHtml}</td>
    `;

    requirementsTableBody.appendChild(tr);
  });

  requirementsListSection.classList.remove('hidden');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Event Listeners ---

// Language Switches
langEnBtn.addEventListener('click', () => {
  if (state.currentLang !== 'en') {
    state.currentLang = 'en';
    updateUILanguage();
  }
});

langBnBtn.addEventListener('click', () => {
  if (state.currentLang !== 'bn') {
    state.currentLang = 'bn';
    updateUILanguage();
  }
});

// File Input Change
jsonFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    validateAndProcessJSON(event.target.result);
  };
  reader.onerror = () => {
    showAlert(getTranslation('alertInvalidJson'), 'error');
  };
  reader.readAsText(file);
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      validateAndProcessJSON(event.target.result);
    };
    reader.onerror = () => {
      showAlert(getTranslation('alertInvalidJson'), 'error');
    };
    reader.readAsText(file);
  }
});

// Load Default Sample Button
loadBundledBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('./requirements.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const text = await response.text();
    validateAndProcessJSON(text);
  } catch (err) {
    // If running via file:// protocol where fetch is blocked by browser CORS policy,
    // trigger file picker directly with a hint.
    jsonFileInput.click();
  }
});

// Initialize UI
updateUILanguage();
