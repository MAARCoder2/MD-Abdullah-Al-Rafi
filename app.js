/**
 * Tender Document Package Builder
 * Full Implementation of Problem Statement Main Tasks
 * (Frontend-only, Dynamic, Bilingual, PDF-Lib Assembly)
 */

// --- Global Application State ---
const state = {
  currentLang: 'en',      // 'en' | 'bn'
  loadedData: null,       // { tender: {}, requirements: [] }
  uploadedFiles: [],      // Array of { id, name, size, pageCount, arrayBuffer, hash, isDuplicate, duplicateTwinName }
  matches: {},            // Map of reqId -> fileId
  expiryDates: {},        // Map of reqId -> 'YYYY-MM-DD'
  isGenerating: false
};

// --- Bilingual Translations ---
const translations = {
  en: {
    appTitle: "Tender Document Package Builder",
    appSubtitle: "Preparation & Verification Suite (Frontend Only)",
    languageLabel: "Language:",
    step1Title: "Step 1: Load Requirements",
    step1Desc: "Upload requirements.json to configure tender parameters and required documents.",
    loadSampleBtn: "Load Default Sample",
    dropTextPrompt: "Click to choose",
    dropTextOr: "or drag & drop",
    dropHint: "Valid JSON with tender details and requirements list",
    tenderDetailsTitle: "Tender Overview",
    labelTenderTitle: "Tender Title",
    labelProcuringEntity: "Procuring Entity",
    labelBidder: "Bidder Name",
    labelDeadline: "Submission Deadline",
    step2Title: "Step 2: Upload Document PDFs",
    step2Desc: "Upload PDF files for the tender. Non-PDF files will be rejected. Duplicates will be detected automatically.",
    dropPdfPrompt: "Click to choose PDFs",
    dropPdfHint: "You can select multiple PDF files at once (e.g. from the documents folder)",
    uploadedCountBadge: "{count} PDFs Uploaded",
    uploadedFilesTitle: "Uploaded PDF Files",
    clearAllBtn: "Clear All Files",
    step3Title: "Step 3: Document Matching & Status",
    step3Desc: "Match uploaded PDFs to required documents and enter expiry dates where required.",
    thOrder: "Order",
    thId: "ID",
    thTitle: "Document Title",
    thRequirement: "Requirement",
    thMatchedFile: "Matched PDF File",
    thExpiryDate: "Expiry Date",
    thStatus: "Status",
    step4Title: "Step 4: Package Compilation & Download",
    generateBtnLabel: "Generate Package PDF",
    generatingLabel: "Generating Package PDF...",
    selectPdfPlaceholder: "-- Select uploaded PDF --",
    assignedToOther: "(Assigned to {id})",
    duplicateAssigned: "(Duplicate of assigned file)",
    badgeMandatory: "Mandatory",
    badgeOptional: "Optional",
    statusOk: "OK",
    statusMissing: "Missing",
    statusExpiryNeeded: "Expiry date needed",
    statusExpired: "Expired",
    statusNotProvided: "Not provided",
    duplicateTag: "Duplicate",
    notApplicable: "Not applicable",
    pagesCount: "{count} pages",
    pageCountSingle: "1 page",
    totalDocsPill: "{count} Documents",
    statusSummaryValid: "All documents valid",
    statusSummaryBlocking: "{count} blocking issues",
    readyToGenerateDesc: "All requirement checks passed. Ready to generate combined PDF package.",
    blockingDesc: "Cannot generate package. Please resolve the following blocking issues:",
    footerText: "Tender Document Package Builder · AI DevFest 2026 Solo Contest",
    alertLoadedSuccess: "Successfully loaded requirements for Tender: {id}",
    alertInvalidJson: "Failed to parse file. Please upload a valid JSON document.",
    alertInvalidSchema: "Invalid schema: JSON must contain 'tender' object and 'requirements' array.",
    alertNonPdfRejected: "Rejected: '{name}' is not a PDF file. Only PDF files are allowed.",
    alertDuplicateDetected: "Duplicate file detected: '{file1}' has identical content to '{file2}'.",
    issueMissing: "{id} ({title}): Missing required document — no file matched.",
    issueExpiryNeeded: "{id} ({title}): Expiry date required for matched file.",
    issueExpired: "{id} ({title}): File expired on {expiry} (Deadline: {deadline}).",
    issueDuplicateMatched: "Duplicate files '{file1}' and '{file2}' are matched to different documents."
  },
  bn: {
    appTitle: "টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার",
    appSubtitle: "প্রস্তুতি ও যাচাইকরণ স্যুট (শুধুমাত্র ফ্রন্টএন্ড)",
    languageLabel: "ভাষা:",
    step1Title: "ধাপ ১: রিকোয়ারমেন্ট লোড করুন",
    step1Desc: "দরপত্রের শর্তাবলী এবং নথির বিবরণ কনফিগার করতে requirements.json ফাইল আপলোড করুন।",
    loadSampleBtn: "ডিফল্ট স্যাম্পল লোড করুন",
    dropTextPrompt: "ফাইল বাছতে ক্লিক করুন",
    dropTextOr: "অথবা ড্র্যাগ করে আনুন",
    dropHint: "দরপত্রের মেটাডেটা এবং রিকোয়ারমেন্টস অ্যারে যুক্ত বৈধ JSON ফাইল",
    tenderDetailsTitle: "দরপত্রের বিবরণ",
    labelTenderTitle: "দরপত্রের শিরোনাম",
    labelProcuringEntity: "সংগ্রহকারী প্রতিষ্ঠান",
    labelBidder: "দরপত্রদাতা প্রতিষ্ঠান",
    labelDeadline: "জমা দেওয়ার শেষ তারিখ",
    step2Title: "ধাপ ২: PDF ফাইলসমূহ আপলোড করুন",
    step2Desc: "দরপত্রের জন্য PDF ফাইল আপলোড করুন। নন-PDF ফাইল বাতিল হবে এবং ডুপ্লিকেট শনাক্ত করা হবে।",
    dropPdfPrompt: "PDF ফাইলসমূহ নির্বাচন করুন",
    dropPdfHint: "একসাথে একাধিক PDF ফাইল বেছে নিতে পারেন (যেমন documents ফোল্ডার থেকে)",
    uploadedCountBadge: "{count}টি PDF আপলোড হয়েছে",
    uploadedFilesTitle: "আপলোডকৃত PDF ফাইলসমূহ",
    clearAllBtn: "সব ফাইল মুছুন",
    step3Title: "ধাপ ৩: ডকুমেন্ট ম্যাচিং ও স্ট্যাটাস যাচাই",
    step3Desc: "রিকোয়ারমেন্টের সাথে সংশ্লিষ্ট PDF ফাইল মিলিয়ে দিন এবং মেয়াদ দিন।",
    thOrder: "ক্রম",
    thId: "আইডি",
    thTitle: "নথির শিরোনাম",
    thRequirement: "প্রয়োজনীয়তা",
    thMatchedFile: "সংযুক্ত PDF ফাইল",
    thExpiryDate: "মেয়াদ উত্তীর্ণের তারিখ",
    thStatus: "বর্তমান স্ট্যাটাস",
    step4Title: "ধাপ ৪: প্যাকেজ তৈরি ও ডাউনলোড",
    generateBtnLabel: "প্যাকেজ PDF তৈরি ও ডাউনলোড",
    generatingLabel: "প্যাকেজ PDF তৈরি হচ্ছে...",
    selectPdfPlaceholder: "-- আপলোডকৃত PDF নির্বাচন করুন --",
    assignedToOther: "({id}-এ ব্যবহৃত)",
    duplicateAssigned: "(ব্যবহৃত ফাইলের ডুপ্লিকেট)",
    badgeMandatory: "বাধ্যতামূলক",
    badgeOptional: "ঐচ্ছিক",
    statusOk: "সঠিক (OK)",
    statusMissing: "অনুপস্থিত (Missing)",
    statusExpiryNeeded: "মেয়াদ আবশ্যক",
    statusExpired: "মেয়াদোত্তীর্ণ (Expired)",
    statusNotProvided: "দেওয়া হয়নি (Not provided)",
    duplicateTag: "ডুপ্লিকেট",
    notApplicable: "প্রযোজ্য নয়",
    pagesCount: "{count} পৃষ্ঠা",
    pageCountSingle: "১ পৃষ্ঠা",
    totalDocsPill: "{count}টি নথি",
    statusSummaryValid: "সব ডকুমেন্ট সঠিক আছে",
    statusSummaryBlocking: "{count}টি সমস্যা রয়েছে",
    readyToGenerateDesc: "সব শর্তাবলি পূরণ হয়েছে। চূড়ান্ত প্যাকেজ তৈরি করার জন্য প্রস্তুত।",
    blockingDesc: "প্যাকেজ তৈরি করা সম্ভব নয়। নিচের সমস্যাগুলো সমাধান করুন:",
    footerText: "দরপত্র নথি প্যাকেজ বিল্ডার · AI DevFest 2026",
    alertLoadedSuccess: "সফলভাবে রিকোয়ারমেন্ট লোড হয়েছে: {id}",
    alertInvalidJson: "ফাইলটি পড়া যায়নি। অনুগ্রহ করে একটি সঠিক JSON ফাইল নির্বাচন করুন।",
    alertInvalidSchema: "ভুল ফরম্যাট: JSON ফাইলে অবশ্যই 'tender' এবং 'requirements' থাকতে হবে।",
    alertNonPdfRejected: "বাতিল: '{name}' কোনো PDF ফাইল নয়। শুধুমাত্র PDF ফাইল অনুমোদিত।",
    alertDuplicateDetected: "ডুপ্লিকেট ফাইল পাওয়া গেছে: '{file1}' এবং '{file2}' এর বিষয়বস্তু হুবহু এক।",
    issueMissing: "{id} ({title}): বাধ্যতামূলক নথি পাওয়া যায়নি — কোনো ফাইল যুক্ত করা হয়নি।",
    issueExpiryNeeded: "{id} ({title}): যুক্ত করা ফাইলের মেয়াদ দেওয়ার প্রয়োজন।",
    issueExpired: "{id} ({title}): ফাইলের মেয়াদ শেষ হয়েছে {expiry} তারিখে (ডেডলাইন: {deadline})।",
    issueDuplicateMatched: "ডুপ্লিকেট ফাইল '{file1}' ও '{file2}' ভিন্ন ভিন্ন নথিতে যুক্ত করা যাবে না।"
  }
};

// --- DOM References ---
const langEnBtn = document.getElementById('langEnBtn');
const langBnBtn = document.getElementById('langBnBtn');

// JSON Load
const jsonDropZone = document.getElementById('jsonDropZone');
const jsonFileInput = document.getElementById('jsonFileInput');
const loadBundledBtn = document.getElementById('loadBundledBtn');
const jsonAlert = document.getElementById('jsonAlert');
const jsonAlertIcon = document.getElementById('jsonAlertIcon');
const jsonAlertMessage = document.getElementById('jsonAlertMessage');

// Tender Overview
const tenderDetailsSection = document.getElementById('tenderDetailsSection');
const tenderIdBadge = document.getElementById('tenderIdBadge');
const totalReqCountBadge = document.getElementById('totalReqCountBadge');
const tenderTitleVal = document.getElementById('tenderTitleVal');
const procuringEntityVal = document.getElementById('procuringEntityVal');
const bidderVal = document.getElementById('bidderVal');
const deadlineVal = document.getElementById('deadlineVal');

// PDF Upload
const pdfUploadSection = document.getElementById('pdfUploadSection');
const pdfDropZone = document.getElementById('pdfDropZone');
const pdfFileInput = document.getElementById('pdfFileInput');
const pdfUploadAlert = document.getElementById('pdfUploadAlert');
const pdfAlertIcon = document.getElementById('pdfAlertIcon');
const pdfAlertMessage = document.getElementById('pdfAlertMessage');
const uploadedCountBadge = document.getElementById('uploadedCountBadge');
const uploadedFilesContainer = document.getElementById('uploadedFilesContainer');
const uploadedFilesList = document.getElementById('uploadedFilesList');
const clearAllPdfsBtn = document.getElementById('clearAllPdfsBtn');

// Matching & Requirements
const requirementsListSection = document.getElementById('requirementsListSection');
const statusSummaryPill = document.getElementById('statusSummaryPill');
const requirementsTableBody = document.getElementById('requirementsTableBody');

// Generation
const generationSection = document.getElementById('generationSection');
const blockingStatusText = document.getElementById('blockingStatusText');
const blockingIssuesList = document.getElementById('blockingIssuesList');
const generateBtn = document.getElementById('generateBtn');
const generateBtnText = document.getElementById('generateBtnText');
const generationProgress = document.getElementById('generationProgress');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// --- Helper Utilities ---
function t(key, params = {}) {
  const dict = translations[state.currentLang] || translations.en;
  let text = dict[key] || translations.en[key] || key;
  for (const [paramKey, paramVal] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
  }
  return text;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

async function computeSHA256(arrayBuffer) {
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Bilingual Switcher ---
function updateUILanguage() {
  const isBn = state.currentLang === 'bn';
  document.body.classList.toggle('lang-bn', isBn);

  if (isBn) {
    langBnBtn.classList.add('active');
    langEnBtn.classList.remove('active');
  } else {
    langEnBtn.classList.add('active');
    langBnBtn.classList.remove('active');
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  if (state.loadedData) {
    renderTenderOverview();
    renderUploadedFilesList();
    renderRequirementsTable();
    updateValidationAndGenerateState();
  }
}

// --- JSON Loading & Processing ---
function showJsonAlert(message, type = 'success') {
  jsonAlert.className = `alert-banner ${type}`;
  jsonAlertIcon.textContent = type === 'success' ? '✓' : '⚠';
  jsonAlertMessage.textContent = message;
  jsonAlert.classList.remove('hidden');
}

function validateAndProcessJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error(t('alertInvalidJson'));
    }
    if (!parsed.tender || typeof parsed.tender !== 'object') {
      throw new Error(t('alertInvalidSchema'));
    }
    if (!Array.isArray(parsed.requirements)) {
      throw new Error(t('alertInvalidSchema'));
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

    // Reset matches and dates for new tender
    state.matches = {};
    state.expiryDates = {};

    // Render all dependent sections
    renderTenderOverview();
    pdfUploadSection.classList.remove('hidden');
    requirementsListSection.classList.remove('hidden');
    generationSection.classList.remove('hidden');

    renderUploadedFilesList();
    renderRequirementsTable();
    updateValidationAndGenerateState();

    const tenderId = parsed.tender.tender_id || 'N/A';
    showJsonAlert(t('alertLoadedSuccess', { id: tenderId }), 'success');
  } catch (err) {
    showJsonAlert(err.message || t('alertInvalidJson'), 'error');
  }
}

function renderTenderOverview() {
  if (!state.loadedData) return;
  const { tender, requirements } = state.loadedData;

  tenderIdBadge.textContent = tender.tender_id || 'N/A';
  totalReqCountBadge.textContent = t('totalDocsPill', { count: requirements.length });
  tenderTitleVal.textContent = tender.title || '-';
  procuringEntityVal.textContent = tender.procuring_entity || '-';
  bidderVal.textContent = tender.bidder || '-';
  deadlineVal.textContent = tender.submission_deadline || '-';

  tenderDetailsSection.classList.remove('hidden');
}

// --- PDF Upload, Duplicate Detection, and Page Counting ---
function showPdfAlert(message, type = 'warning') {
  pdfUploadAlert.className = `alert-banner ${type}`;
  pdfAlertIcon.textContent = type === 'success' ? '✓' : '⚠';
  pdfAlertMessage.textContent = message;
  pdfUploadAlert.classList.remove('hidden');
}

function hidePdfAlert() {
  pdfUploadAlert.classList.add('hidden');
}

async function handlePdfFiles(fileList) {
  hidePdfAlert();
  if (!fileList || fileList.length === 0) return;

  const filesArray = Array.from(fileList);
  const rejectedFiles = [];
  const validFiles = [];

  for (const file of filesArray) {
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      rejectedFiles.push(file.name);
    } else {
      validFiles.push(file);
    }
  }

  // Show clear error message for rejected non-PDF files
  if (rejectedFiles.length > 0) {
    showPdfAlert(t('alertNonPdfRejected', { name: rejectedFiles.join(', ') }), 'error');
  }

  if (validFiles.length === 0) return;

  // Process valid PDF files
  for (const file of validFiles) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hash = await computeSHA256(arrayBuffer);

      let pageCount = 1;
      try {
        if (typeof PDFLib !== 'undefined') {
          const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          pageCount = pdfDoc.getPageCount();
        }
      } catch (err) {
        console.warn('Could not inspect page count for', file.name, err);
      }

      const fileObj = {
        id: `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: file.name,
        size: file.size,
        arrayBuffer: arrayBuffer,
        pageCount: pageCount,
        hash: hash,
        isDuplicate: false,
        duplicateTwinName: ''
      };

      state.uploadedFiles.push(fileObj);
    } catch (err) {
      console.error('Error processing PDF file:', file.name, err);
    }
  }

  recalculateDuplicates();
  renderUploadedFilesList();
  renderRequirementsTable();
  updateValidationAndGenerateState();
}

function recalculateDuplicates() {
  // Map of hash -> array of file objects
  const hashMap = {};
  for (const f of state.uploadedFiles) {
    if (!hashMap[f.hash]) {
      hashMap[f.hash] = [];
    }
    hashMap[f.hash].push(f);
  }

  let duplicateFound = false;
  let dupeFile1 = '';
  let dupeFile2 = '';

  for (const f of state.uploadedFiles) {
    const twins = hashMap[f.hash];
    if (twins.length > 1) {
      f.isDuplicate = true;
      const other = twins.find(t => t.id !== f.id);
      f.duplicateTwinName = other ? other.name : 'Another uploaded file';
      duplicateFound = true;
      dupeFile1 = f.name;
      dupeFile2 = other ? other.name : '';
    } else {
      f.isDuplicate = false;
      f.duplicateTwinName = '';
    }
  }

  if (duplicateFound && dupeFile2) {
    showPdfAlert(t('alertDuplicateDetected', { file1: dupeFile1, file2: dupeFile2 }), 'warning');
  }
}

function removeUploadedFile(fileId) {
  // Clear any requirement match referencing this file
  for (const [reqId, matchedId] of Object.entries(state.matches)) {
    if (matchedId === fileId) {
      delete state.matches[reqId];
    }
  }

  state.uploadedFiles = state.uploadedFiles.filter(f => f.id !== fileId);
  recalculateDuplicates();
  renderUploadedFilesList();
  renderRequirementsTable();
  updateValidationAndGenerateState();
}

function clearAllUploadedFiles() {
  state.uploadedFiles = [];
  state.matches = {};
  state.expiryDates = {};
  hidePdfAlert();
  renderUploadedFilesList();
  renderRequirementsTable();
  updateValidationAndGenerateState();
}

function renderUploadedFilesList() {
  uploadedCountBadge.textContent = t('uploadedCountBadge', { count: state.uploadedFiles.length });

  if (state.uploadedFiles.length === 0) {
    uploadedFilesContainer.classList.add('hidden');
    uploadedFilesList.innerHTML = '';
    return;
  }

  uploadedFilesContainer.classList.remove('hidden');
  uploadedFilesList.innerHTML = '';

  state.uploadedFiles.forEach(file => {
    const card = document.createElement('div');
    card.className = `file-card ${file.isDuplicate ? 'is-duplicate' : ''}`;

    const pageCountText = file.pageCount === 1
      ? t('pageCountSingle')
      : t('pagesCount', { count: file.pageCount });

    card.innerHTML = `
      <div class="file-card-info">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <div class="file-card-details">
          <span class="file-card-name" title="${escapeHtml(file.name)}">${escapeHtml(file.name)}</span>
          <div class="file-card-meta">
            <span>${pageCountText}</span>
            <span>·</span>
            <span>${formatBytes(file.size)}</span>
            ${file.isDuplicate ? `<span class="duplicate-tag" title="Exact content as ${escapeHtml(file.duplicateTwinName)}">${t('duplicateTag')}</span>` : ''}
          </div>
        </div>
      </div>
      <button class="btn-icon-clear" type="button" title="Remove file" data-remove-id="${file.id}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    card.querySelector('[data-remove-id]').addEventListener('click', () => {
      removeUploadedFile(file.id);
    });

    uploadedFilesList.appendChild(card);
  });
}

// --- Requirements Table, Matching, and Live Status Evaluation ---
function calculateRequirementStatus(req) {
  const isMandatory = req.mandatory === true;
  const hasExpiry = req.has_expiry === true;
  const matchedFileId = state.matches[req.id];
  const matchedFile = state.uploadedFiles.find(f => f.id === matchedFileId);
  const expiryDate = state.expiryDates[req.id] || '';
  const deadline = state.loadedData?.tender?.submission_deadline || '';

  // 1. Missing: Required document, no file matched (Blocks: Yes)
  if (!matchedFile && isMandatory) {
    return {
      status: 'Missing',
      statusText: t('statusMissing'),
      statusClass: 'status-missing',
      blocks: true,
      reason: t('issueMissing', { id: req.id, title: getReqTitle(req) })
    };
  }

  // 2. Not provided: Optional document, no file matched (Blocks: No)
  if (!matchedFile && !isMandatory) {
    return {
      status: 'Not provided',
      statusText: t('statusNotProvided'),
      statusClass: 'status-notprovided',
      blocks: false,
      reason: ''
    };
  }

  // File is matched
  if (hasExpiry) {
    // 3. Expiry date needed: has_expiry = true and file matched, but no expiry date entered (Blocks: Yes)
    if (!expiryDate || expiryDate.trim() === '') {
      return {
        status: 'Expiry date needed',
        statusText: t('statusExpiryNeeded'),
        statusClass: 'status-needed',
        blocks: true,
        reason: t('issueExpiryNeeded', { id: req.id, title: getReqTitle(req) })
      };
    }

    // 4. Expired: Expiry date is before submission deadline (Blocks: Yes)
    // "If a document expires on the same day as the submission deadline, it is still OK."
    if (deadline && expiryDate < deadline) {
      return {
        status: 'Expired',
        statusText: t('statusExpired'),
        statusClass: 'status-expired',
        blocks: true,
        reason: t('issueExpired', { id: req.id, title: getReqTitle(req), expiry: expiryDate, deadline: deadline })
      };
    }

    // 5. OK: Expiry is on or after deadline (Blocks: No)
    return {
      status: 'OK',
      statusText: t('statusOk'),
      statusClass: 'status-ok',
      blocks: false,
      reason: ''
    };
  }

  // 6. OK: File matched and no expiry required (Blocks: No)
  return {
    status: 'OK',
    statusText: t('statusOk'),
    statusClass: 'status-ok',
    blocks: false,
    reason: ''
  };
}

function getReqTitle(req) {
  const isBn = state.currentLang === 'bn';
  if (isBn) {
    return req.title_bn || req.title_en || req.id;
  }
  return req.title_en || req.title_bn || req.id;
}

function renderRequirementsTable() {
  if (!state.loadedData) return;
  const { requirements } = state.loadedData;
  const isBn = state.currentLang === 'bn';

  requirementsTableBody.innerHTML = '';

  requirements.forEach(req => {
    const tr = document.createElement('tr');
    const matchedFileId = state.matches[req.id] || '';
    const expiryVal = state.expiryDates[req.id] || '';
    const statusObj = calculateRequirementStatus(req);

    // Title display
    const primaryTitle = getReqTitle(req);
    const secondaryTitle = isBn
      ? (req.title_en && req.title_en !== primaryTitle ? req.title_en : '')
      : (req.title_bn && req.title_bn !== primaryTitle ? req.title_bn : '');

    // Mandatory/Optional pill
    const reqBadgeHtml = req.mandatory
      ? `<span class="pill-mandatory">${t('badgeMandatory')}</span>`
      : `<span class="pill-optional">${t('badgeOptional')}</span>`;

    // Dropdown for matching files
    // Rule: One document gets at most one file. One file goes to at most one document.
    // Duplicate files rule: If file A is assigned to Doc 1, duplicate file B cannot be assigned to Doc 2!
    let optionsHtml = `<option value="">${t('selectPdfPlaceholder')}</option>`;

    state.uploadedFiles.forEach(file => {
      const isSelected = file.id === matchedFileId;

      // Check if file is assigned to another requirement
      let assignedToOtherReqId = null;
      for (const [rId, fId] of Object.entries(state.matches)) {
        if (fId === file.id && rId !== req.id) {
          assignedToOtherReqId = rId;
          break;
        }
      }

      // Check if this file is a duplicate of a file that is assigned to another requirement
      let duplicateAssignedToOther = false;
      if (file.isDuplicate && !assignedToOtherReqId) {
        for (const [rId, fId] of Object.entries(state.matches)) {
          if (rId !== req.id) {
            const assignedFile = state.uploadedFiles.find(af => af.id === fId);
            if (assignedFile && assignedFile.hash === file.hash) {
              duplicateAssignedToOther = true;
              break;
            }
          }
        }
      }

      let disabledAttr = '';
      let labelSuffix = '';

      if (assignedToOtherReqId) {
        disabledAttr = 'disabled';
        labelSuffix = ` ${t('assignedToOther', { id: assignedToOtherReqId })}`;
      } else if (duplicateAssignedToOther) {
        disabledAttr = 'disabled';
        labelSuffix = ` ${t('duplicateAssigned')}`;
      }

      optionsHtml += `
        <option value="${file.id}" ${isSelected ? 'selected' : ''} ${disabledAttr}>
          ${escapeHtml(file.name)} (${file.pageCount}p)${labelSuffix}
        </option>
      `;
    });

    const matchSelectHtml = `
      <div class="match-selector-wrap">
        <select class="match-select" data-req-id="${req.id}">
          ${optionsHtml}
        </select>
        ${matchedFileId ? `
          <button class="btn-icon-clear" type="button" title="Unmatch file" data-clear-match-id="${req.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ` : ''}
      </div>
    `;

    // Expiry date input
    let expiryInputHtml = `<span class="text-not-applicable">${t('notApplicable')}</span>`;
    if (req.has_expiry) {
      if (matchedFileId) {
        expiryInputHtml = `
          <div class="expiry-input-wrap">
            <input type="date" class="expiry-date-input" data-req-id="${req.id}" value="${escapeHtml(expiryVal)}">
          </div>
        `;
      } else {
        expiryInputHtml = `<span class="text-not-applicable">—</span>`;
      }
    }

    tr.innerHTML = `
      <td><span class="order-badge">${req.order ?? '-'}</span></td>
      <td><span class="doc-id-code">${escapeHtml(req.id || '-')}</span></td>
      <td>
        <div class="doc-title-cell">${escapeHtml(primaryTitle)}</div>
        ${secondaryTitle ? `<div class="doc-title-sub">${escapeHtml(secondaryTitle)}</div>` : ''}
      </td>
      <td>${reqBadgeHtml}</td>
      <td>${matchSelectHtml}</td>
      <td>${expiryInputHtml}</td>
      <td>
        <span class="status-pill ${statusObj.statusClass}">
          ${statusObj.statusText}
        </span>
      </td>
    `;

    // Bind Match Select Event
    const selectEl = tr.querySelector('.match-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          state.matches[req.id] = val;
        } else {
          delete state.matches[req.id];
        }
        renderRequirementsTable();
        updateValidationAndGenerateState();
      });
    }

    // Bind Clear Match Button
    const clearBtn = tr.querySelector('[data-clear-match-id]');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        delete state.matches[req.id];
        renderRequirementsTable();
        updateValidationAndGenerateState();
      });
    }

    // Bind Expiry Date Input
    const dateInput = tr.querySelector('.expiry-date-input');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        state.expiryDates[req.id] = e.target.value;
        renderRequirementsTable();
        updateValidationAndGenerateState();
      });
    }

    requirementsTableBody.appendChild(tr);
  });
}

// --- Validation and Package Generation State ---
function checkAllBlockingIssues() {
  if (!state.loadedData) return ['No requirements loaded.'];

  const { requirements } = state.loadedData;
  const blockingIssues = [];

  // 1. Check every document requirement status
  requirements.forEach(req => {
    const statusObj = calculateRequirementStatus(req);
    if (statusObj.blocks && statusObj.reason) {
      blockingIssues.push(statusObj.reason);
    }
  });

  // 2. Check duplicate files constraint: Do not allow duplicates to be matched to different documents
  const matchedFileIds = Object.values(state.matches);
  const matchedHashes = {};

  for (const fId of matchedFileIds) {
    const f = state.uploadedFiles.find(uf => uf.id === fId);
    if (f) {
      if (matchedHashes[f.hash]) {
        blockingIssues.push(
          t('issueDuplicateMatched', { file1: f.name, file2: matchedHashes[f.hash].name })
        );
      } else {
        matchedHashes[f.hash] = f;
      }
    }
  }

  return blockingIssues;
}

function updateValidationAndGenerateState() {
  if (!state.loadedData) return;

  const blockingIssues = checkAllBlockingIssues();
  const hasBlockingIssues = blockingIssues.length > 0;

  if (hasBlockingIssues) {
    statusSummaryPill.className = 'pill pill-summary pill-mandatory';
    statusSummaryPill.textContent = t('statusSummaryBlocking', { count: blockingIssues.length });

    blockingStatusText.textContent = t('blockingDesc');
    blockingIssuesList.innerHTML = '';
    blockingIssues.forEach(issue => {
      const item = document.createElement('div');
      item.className = 'blocking-issue-item';
      item.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${escapeHtml(issue)}</span>
      `;
      blockingIssuesList.appendChild(item);
    });
    blockingIssuesList.classList.remove('hidden');

    generateBtn.disabled = true;
  } else {
    statusSummaryPill.className = 'pill pill-summary pill-ok status-ok';
    statusSummaryPill.textContent = t('statusSummaryValid');

    blockingStatusText.textContent = t('readyToGenerateDesc');
    blockingIssuesList.classList.add('hidden');
    blockingIssuesList.innerHTML = '';

    generateBtn.disabled = false;
  }
}

// --- Combined PDF Generation & Download (Section 6) ---
async function generateTenderPackage() {
  if (state.isGenerating) return;
  const blockingIssues = checkAllBlockingIssues();
  if (blockingIssues.length > 0) return;

  try {
    state.isGenerating = true;
    generateBtn.disabled = true;
    generateBtnText.textContent = t('generatingLabel');
    generationProgress.classList.remove('hidden');
    setProgressBar(10, 'Initializing PDF Package Builder...');

    if (typeof PDFLib === 'undefined') {
      throw new Error('PDF-Lib library is not loaded. Please ensure connection or refresh.');
    }

    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    // Standard fonts for cover page and footers
    const helvetica = await mergedPdf.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);

    const { tender, requirements } = state.loadedData;
    const tenderId = tender.tender_id || 'Tender';
    const packageDate = new Date().toISOString().split('T')[0];

    // Filter included documents in strict order
    const includedReqs = requirements.filter(req => {
      const matchedId = state.matches[req.id];
      return Boolean(matchedId);
    });

    setProgressBar(25, 'Creating Official English Cover Page...');

    // -----------------------------------------------------------------
    // Section 6.1: Page 1 is a Cover Page, in English
    // Shows: tender ID, tender title, procuring entity, bidder name,
    // submission deadline, package creation date, and list of included documents in order.
    // -----------------------------------------------------------------
    const coverPage = mergedPdf.addPage([595.28, 841.89]); // A4 Size in points
    const { width: cWidth, height: cHeight } = coverPage.getSize();

    // Draw Cover Header
    coverPage.drawText('TENDER DOCUMENT PACKAGE', {
      x: 50,
      y: cHeight - 60,
      size: 20,
      font: helveticaBold,
      color: rgb(0.06, 0.09, 0.16) // #0f172a
    });

    coverPage.drawText('Official Bid Submission Compilation', {
      x: 50,
      y: cHeight - 80,
      size: 11,
      font: helvetica,
      color: rgb(0.39, 0.45, 0.55) // #64748b
    });

    // Separator line
    coverPage.drawLine({
      start: { x: 50, y: cHeight - 92 },
      end: { x: cWidth - 50, y: cHeight - 92 },
      thickness: 1.5,
      color: rgb(0.88, 0.91, 0.94) // #e2e8f0
    });

    // Metadata Table / Key-Values
    const metaEntries = [
      ['Tender ID', tenderId],
      ['Tender Title', tender.title || 'N/A'],
      ['Procuring Entity', tender.procuring_entity || 'N/A'],
      ['Bidder Name', tender.bidder || 'N/A'],
      ['Submission Deadline', tender.submission_deadline || 'N/A'],
      ['Package Created On', packageDate]
    ];

    let metaY = cHeight - 118;
    metaEntries.forEach(([label, val]) => {
      coverPage.drawText(label + ':', {
        x: 50,
        y: metaY,
        size: 9.5,
        font: helveticaBold,
        color: rgb(0.2, 0.25, 0.35)
      });
      coverPage.drawText(String(val), {
        x: 180,
        y: metaY,
        size: 9.5,
        font: helvetica,
        color: rgb(0.06, 0.09, 0.16)
      });
      metaY -= 20;
    });

    // Documents Table Header on Cover Page
    let tableY = metaY - 20;
    coverPage.drawText('INCLUDED DOCUMENTS CHECKLIST (IN SUBMISSION ORDER)', {
      x: 50,
      y: tableY,
      size: 11,
      font: helveticaBold,
      color: rgb(0.06, 0.09, 0.16)
    });

    tableY -= 15;
    coverPage.drawLine({
      start: { x: 50, y: tableY },
      end: { x: cWidth - 50, y: tableY },
      thickness: 1,
      color: rgb(0.88, 0.91, 0.94)
    });

    tableY -= 18;
    // Table column headers
    coverPage.drawText('Order', { x: 50, y: tableY, size: 8.5, font: helveticaBold, color: rgb(0.39, 0.45, 0.55) });
    coverPage.drawText('ID', { x: 95, y: tableY, size: 8.5, font: helveticaBold, color: rgb(0.39, 0.45, 0.55) });
    coverPage.drawText('Document Title', { x: 135, y: tableY, size: 8.5, font: helveticaBold, color: rgb(0.39, 0.45, 0.55) });
    coverPage.drawText('File Attached', { x: 340, y: tableY, size: 8.5, font: helveticaBold, color: rgb(0.39, 0.45, 0.55) });
    coverPage.drawText('Pages', { x: 495, y: tableY, size: 8.5, font: helveticaBold, color: rgb(0.39, 0.45, 0.55) });

    tableY -= 10;
    coverPage.drawLine({
      start: { x: 50, y: tableY },
      end: { x: cWidth - 50, y: tableY },
      thickness: 0.5,
      color: rgb(0.88, 0.91, 0.94)
    });

    tableY -= 16;
    includedReqs.forEach(req => {
      const fileId = state.matches[req.id];
      const file = state.uploadedFiles.find(f => f.id === fileId);
      const titleEn = req.title_en || req.id;
      const fileName = file ? file.name : 'N/A';
      const pCount = file ? String(file.pageCount) : '1';

      coverPage.drawText(String(req.order ?? '-'), { x: 50, y: tableY, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
      coverPage.drawText(String(req.id), { x: 95, y: tableY, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });
      coverPage.drawText(titleEn.substring(0, 32), { x: 135, y: tableY, size: 8.5, font: helveticaBold, color: rgb(0.1, 0.1, 0.1) });
      coverPage.drawText(fileName.substring(0, 26), { x: 340, y: tableY, size: 8.5, font: helvetica, color: rgb(0.3, 0.35, 0.4) });
      coverPage.drawText(pCount, { x: 505, y: tableY, size: 8.5, font: helvetica, color: rgb(0.1, 0.1, 0.1) });

      tableY -= 18;
    });

    // -----------------------------------------------------------------
    // Section 6.2: Documents come after the cover, sorted by order.
    // Include all pages of each file, in their original order.
    // Skip optional documents with no file.
    // -----------------------------------------------------------------
    let processedDocsCount = 0;
    for (const req of includedReqs) {
      processedDocsCount++;
      const fileId = state.matches[req.id];
      const file = state.uploadedFiles.find(f => f.id === fileId);
      if (!file) continue;

      const progressPercent = 30 + Math.floor((processedDocsCount / includedReqs.length) * 50);
      setProgressBar(progressPercent, `Merging document ${processedDocsCount} of ${includedReqs.length}: ${file.name}...`);

      const srcPdf = await PDFDocument.load(file.arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
      copiedPages.forEach(p => mergedPdf.addPage(p));
    }

    setProgressBar(85, 'Stamping required page footers on every page...');

    // -----------------------------------------------------------------
    // Section 6.3: Every page, including the cover, has a footer at the bottom:
    // <tender_id> | Page X of Y. Y is the total number of pages in the package.
    // Section 6.4: The footer must be easy to read and must not cover document content.
    // -----------------------------------------------------------------
    const totalPages = mergedPdf.getPageCount();

    for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
      const page = mergedPdf.getPage(pageIdx);
      const { width: pWidth } = page.getSize();
      const pageNumberText = `${tenderId} | Page ${pageIdx + 1} of ${totalPages}`;
      const footerFontSize = 9;
      const textWidth = helvetica.widthOfTextAtSize(pageNumberText, footerFontSize);
      const footerX = (pWidth - textWidth) / 2;
      const footerY = 20; // 20 points from bottom

      page.drawText(pageNumberText, {
        x: footerX,
        y: footerY,
        size: footerFontSize,
        font: helvetica,
        color: rgb(0.25, 0.3, 0.35)
      });
    }

    setProgressBar(95, 'Saving compiled PDF binary...');
    const mergedPdfBytes = await mergedPdf.save();

    // Trigger download as <tender_id>_Package.pdf
    const fileName = `${tenderId}_Package.pdf`;
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const downloadUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);

    setProgressBar(100, `Downloaded ${fileName} successfully!`);
    setTimeout(() => {
      generationProgress.classList.add('hidden');
      generateBtn.disabled = false;
      generateBtnText.textContent = t('generateBtnLabel');
    }, 2000);

  } catch (err) {
    console.error('Error generating PDF package:', err);
    alert('Failed to generate package: ' + (err.message || 'Unknown error'));
    generationProgress.classList.add('hidden');
    generateBtn.disabled = false;
    generateBtnText.textContent = t('generateBtnLabel');
  } finally {
    state.isGenerating = false;
  }
}

function setProgressBar(percent, text) {
  progressBar.style.width = `${percent}%`;
  progressText.textContent = text;
}

// --- Event Listeners Initialization ---

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

// JSON File Input & Drag/Drop
jsonFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => validateAndProcessJSON(event.target.result);
  reader.onerror = () => showJsonAlert(t('alertInvalidJson'), 'error');
  reader.readAsText(file);
});

jsonDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  jsonDropZone.classList.add('drag-over');
});
jsonDropZone.addEventListener('dragleave', () => {
  jsonDropZone.classList.remove('drag-over');
});
jsonDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  jsonDropZone.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => validateAndProcessJSON(event.target.result);
    reader.onerror = () => showJsonAlert(t('alertInvalidJson'), 'error');
    reader.readAsText(file);
  }
});

// Load Default Sample Button
loadBundledBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('./requirements.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    validateAndProcessJSON(text);
  } catch (err) {
    // If local fetch is blocked by browser CORS (file://), open file picker
    jsonFileInput.click();
  }
});

// PDF File Input & Drag/Drop
pdfFileInput.addEventListener('change', (e) => {
  handlePdfFiles(e.target.files);
  e.target.value = ''; // Reset input to allow re-uploading same file if desired
});

pdfDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  pdfDropZone.classList.add('drag-over');
});
pdfDropZone.addEventListener('dragleave', () => {
  pdfDropZone.classList.remove('drag-over');
});
pdfDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  pdfDropZone.classList.remove('drag-over');
  handlePdfFiles(e.dataTransfer.files);
});

// Clear All Files Button
clearAllPdfsBtn.addEventListener('click', () => {
  clearAllUploadedFiles();
});

// Generate Button
generateBtn.addEventListener('click', () => {
  generateTenderPackage();
});

// Auto-initialize UI
updateUILanguage();
