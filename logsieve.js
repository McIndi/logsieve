/**
 * LogSieve - Log File Analysis Tool
 * JavaScript functionality for filtering, parsing, and visualizing log data
 */

// ---------- Utilities ----------
// (Moved to shared.js)

// ---------- Log Parsing Helpers ----------
// (Moved to shared.js)

/**
 * Parse various time string formats and return ISO (UTC) string or empty string.
 * For naive timestamps (no timezone) this treats them as local timestamps.
 * @param {string} s
 * @returns {string}
 */
// `parseTimestampToISO` is provided by `shared.js` and loaded before this file.

// Format an ISO or raw timestamp string to user's localized datetime with tz
// `formatLocalDatetime` is provided by `shared.js`.

/**
 * Remove timestamp prefix from log line
 * @param {string} line - Log line text
 * @returns {string} - Line without timestamp prefix
 */
// `stripPrefix` (remove timestamp prefix) is provided by `shared.js`.

/**
 * Check if a line starts a new exception event (even without timestamp)
 * These patterns indicate standalone exception entries
 * @param {string} line - Log line text
 * @returns {boolean} - True if line starts a new exception
 */
// `isExceptionStart` is provided by `shared.js`.

/**
 * Check if a line is a continuation line (part of a multi-line event)
 * Continuation lines are typically:
 * - Stack trace lines (starting with whitespace + "at", "File", etc.)
 * - Exception lines (starting with common exception types)
 * - Lines that don't have a timestamp and start with whitespace
 * @param {string} line - Log line text
 * @returns {boolean} - True if line is a continuation line
 */
// `isContinuationLine` is provided by `shared.js`.

/**
 * Tokenize string for search purposes
 * @param {string} s - String to tokenize
 * @returns {Array<string>} - Array of tokens
 */
// `tokenize` is provided by `shared.js`.

// ---------- Storage Manager ----------

// `generateUUID` is provided by `shared.js`.

/**
 * Storage manager for localStorage operations
 */
const Storage = {
  KEYS: {
    EXTRACTORS: 'logsieve-extractors',
    FILTERS: 'logsieve-filters',
    ACTIVE_EXTRACTORS: 'logsieve-active-extractors',
    TRANSFORMS: 'logsieve-transforms',
    ACTIVE_TRANSFORMS: 'logsieve-active-transforms',
    PREFS: 'logsieve-prefs',
    THEME: 'logsieve-theme'
  },

  /**
   * Get all saved extractors
   * @returns {Array<Object>} - Array of extractor objects
   */
  getExtractors() {
    try {
      const data = localStorage.getItem(this.KEYS.EXTRACTORS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load extractors:', e);
      return [];
    }
  },

  /**
   * Save an extractor (create or update)
   * @param {Object} extractor - Extractor object
   * @returns {Object} - Saved extractor with id
   */
  saveExtractor(extractor) {
    const extractors = this.getExtractors();

    if (!extractor.id) {
      extractor.id = generateUUID();
      extractor.created = new Date().toISOString();
    }
    extractor.updated = new Date().toISOString();

    const idx = extractors.findIndex(e => e.id === extractor.id);
    if (idx >= 0) {
      extractors[idx] = extractor;
    } else {
      extractors.push(extractor);
    }

    localStorage.setItem(this.KEYS.EXTRACTORS, JSON.stringify(extractors));
    return extractor;
  },

  /**
   * Delete an extractor by id
   * @param {string} id - Extractor id
   */
  deleteExtractor(id) {
    const extractors = this.getExtractors().filter(e => e.id !== id);
    localStorage.setItem(this.KEYS.EXTRACTORS, JSON.stringify(extractors));

    // Remove from active list if present
    const active = this.getActiveExtractors().filter(aid => aid !== id);
    this.setActiveExtractors(active);
  },

  /**
   * Get active extractor IDs
   * @returns {Array<string>} - Array of active extractor IDs
   */
  getActiveExtractors() {
    try {
      const data = localStorage.getItem(this.KEYS.ACTIVE_EXTRACTORS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load active extractors:', e);
      return [];
    }
  },

  /**
   * Set active extractor IDs
   * @param {Array<string>} ids - Array of extractor IDs
   */
  setActiveExtractors(ids) {
    // Deduplicate and clean up IDs
    const uniqueIds = [...new Set(ids)];
    const validExtractors = this.getExtractors();
    const validIds = uniqueIds.filter(id => validExtractors.some(e => e.id === id));
    localStorage.setItem(this.KEYS.ACTIVE_EXTRACTORS, JSON.stringify(validIds));
  },

  getTransforms() {
    try {
      const data = localStorage.getItem(this.KEYS.TRANSFORMS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load transforms:', e);
      return [];
    }
  },

  saveTransform(transform) {
    const transforms = this.getTransforms();

    if (!transform.id) {
      transform.id = generateUUID();
      transform.created = new Date().toISOString();
    }
    transform.updated = new Date().toISOString();

    const idx = transforms.findIndex(t => t.id === transform.id);
    if (idx >= 0) transforms[idx] = transform;
    else transforms.push(transform);

    localStorage.setItem(this.KEYS.TRANSFORMS, JSON.stringify(transforms));
    return transform;
  },

  deleteTransform(id) {
    const transforms = this.getTransforms().filter(t => t.id !== id);
    localStorage.setItem(this.KEYS.TRANSFORMS, JSON.stringify(transforms));
    const active = this.getActiveTransforms().filter(tid => tid !== id);
    this.setActiveTransforms(active);
  },

  getActiveTransforms() {
    try {
      const data = localStorage.getItem(this.KEYS.ACTIVE_TRANSFORMS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load active transforms:', e);
      return [];
    }
  },

  setActiveTransforms(ids) {
    const uniqueIds = [...new Set(ids)];
    const validTransforms = this.getTransforms();
    const validIds = uniqueIds.filter(id => validTransforms.some(t => t.id === id));
    localStorage.setItem(this.KEYS.ACTIVE_TRANSFORMS, JSON.stringify(validIds));
  },

  /**
   * Get all saved filters
   * @returns {Array<Object>} - Array of filter objects
   */
  getFilters() {
    try {
      const data = localStorage.getItem(this.KEYS.FILTERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load filters:', e);
      return [];
    }
  },

  /**
   * Save a filter (create or update)
   * @param {Object} filter - Filter object
   * @returns {Object} - Saved filter with id
   */
  saveFilter(filter) {
    const filters = this.getFilters();

    if (!filter.id) {
      filter.id = generateUUID();
      filter.created = new Date().toISOString();
    }
    filter.updated = new Date().toISOString();

    const idx = filters.findIndex(f => f.id === filter.id);
    if (idx >= 0) {
      filters[idx] = filter;
    } else {
      filters.push(filter);
    }

    localStorage.setItem(this.KEYS.FILTERS, JSON.stringify(filters));
    return filter;
  },

  /**
   * Delete a filter by id
   * @param {string} id - Filter id
   */
  deleteFilter(id) {
    const filters = this.getFilters().filter(f => f.id !== id);
    localStorage.setItem(this.KEYS.FILTERS, JSON.stringify(filters));
  },

  /**
   * Get user preferences
   * @returns {Object} - Preferences object
   */
  getPrefs() {
    try {
      const data = localStorage.getItem(this.KEYS.PREFS);
      return data ? JSON.parse(data) : {
        defaultPageSize: 50,
        extractorMergeStrategy: 'last-wins',
        unsafeJsTransforms: false
      };
    } catch (e) {
      console.error('Failed to load preferences:', e);
      return { defaultPageSize: 50, extractorMergeStrategy: 'last-wins', unsafeJsTransforms: false };
    }
  },

  /**
   * Save user preferences
   * @param {Object} prefs - Preferences object
   */
  savePrefs(prefs) {
    localStorage.setItem(this.KEYS.PREFS, JSON.stringify(prefs));
  },

  /**
   * Export all data
   * @returns {Object} - All stored data
   */
  exportAll() {
    return {
      extractors: this.getExtractors(),
      filters: this.getFilters(),
      transforms: this.getTransforms(),
      activeExtractors: this.getActiveExtractors(),
      activeTransforms: this.getActiveTransforms(),
      prefs: this.getPrefs(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
  },

  /**
   * Import data with merge option
   * @param {Object} data - Data to import
   * @param {boolean} merge - Whether to merge with existing data
   * @returns {Object} - Import results
   */
  importAll(data, merge = true) {
    const results = { extractors: 0, filters: 0, transforms: 0, errors: [] };

    try {
      if (data.extractors) {
        const existing = merge ? this.getExtractors() : [];
        const imported = data.extractors.map(e => {
          // Generate new ID if merging to avoid conflicts
          if (merge) e.id = generateUUID();
          return e;
        });
        localStorage.setItem(this.KEYS.EXTRACTORS, JSON.stringify([...existing, ...imported]));
        results.extractors = imported.length;
      }

      if (data.filters) {
        const existing = merge ? this.getFilters() : [];
        const imported = data.filters.map(f => {
          if (merge) f.id = generateUUID();
          return f;
        });
        localStorage.setItem(this.KEYS.FILTERS, JSON.stringify([...existing, ...imported]));
        results.filters = imported.length;
      }

      if (data.transforms) {
        const existing = merge ? this.getTransforms() : [];
        const imported = data.transforms.map(t => {
          if (merge) t.id = generateUUID();
          return t;
        });
        localStorage.setItem(this.KEYS.TRANSFORMS, JSON.stringify([...existing, ...imported]));
        results.transforms = imported.length;
      }

      if (data.activeTransforms && !merge) {
        localStorage.setItem(this.KEYS.ACTIVE_TRANSFORMS, JSON.stringify(data.activeTransforms));
      }

      if (data.prefs && !merge) {
        this.savePrefs(data.prefs);
      }
    } catch (e) {
      results.errors.push(e.message);
    }

    return results;
  }
};

// ---------- Data Model ----------

let rows = [];        // Full dataset
let view = [];        // Filtered/sorted view
let page = 1;         // Current page number
let per = 50;         // Items per page
let totalRows = 0;    // Total rows in filtered view
let fieldNames = new Set();  // Track all extracted field names
let visibleColumns = new Set(); // Columns the user wants to show; empty => show all
let columnOrder = []; // ordered list of columns (strings)
let currentFilterConfig = null;
let builderOpen = true; // make builder primary and visible by default
// applied* states capture what was last applied with the Apply button
let appliedFilterConfig = null;
let appliedAdvancedQuery = null;
// Detected user's timezone name (IANA). Set at startup for consistent rendering
const userTimeZone = (Intl && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Local';
let sortByIdOrder = 'asc';
let editingTransformId = null;
let pipelineOrder = [];
let transientQuickTestExtractor = null;

// ---------- Worker Communication ----------

let worker = null;
let pendingRequests = new Map(); // Track pending worker requests

/**
 * Initialize the WebWorker
 */
function initWorker() {
  if (worker) return; // Already initialized

  worker = new Worker('logsieve-worker.js?v=20260728b');
  worker.onmessage = handleWorkerMessage;
  worker.onerror = handleWorkerError;
}

/**
 * Handle messages from the worker
 */
function handleWorkerMessage(e) {
  const { type, data, id } = e.data;

  // Resolve pending request if this is a response to a specific request
  if (id && pendingRequests.has(id)) {
    if (type !== 'PROGRESS') {
      const resolve = pendingRequests.get(id);
      pendingRequests.delete(id);
      resolve({ type, data });
      return;
    }
  }

  // Handle unsolicited messages
  switch (type) {
    case 'PARSE_COMPLETE':
      // rows = data.rows || []; // Worker no longer sends full rows for performance
      transientQuickTestExtractor = null;
      fieldNames = new Set(data.fieldNames || []);
      if (data.fieldRegistry) {
        FieldRegistry.deserialize(data.fieldRegistry);
      }
      // Ensure visible columns and column order reflect new dataset
      initializeVisibleColumnsFromPrefs();
      initializeColumnOrderFromPrefs();
      renderColumnsPanel();
      $("#info").textContent = `Parsed ${fmt(data.rowCount)} entries`;
      $("#uploadProgress").style.display = 'none';
      // After parsing completes and results are displayed, collapse the Upload section and open Results
      const uploadSection = document.getElementById('section-upload');
      if (uploadSection) uploadSection.classList.remove('active');
      // Set Results nav active for clarity
      navigateToSection('results');
      renderPipelineList();
      renderTransformErrorAlert(null);
      applyFilters();
      break;

    case 'FILTER_COMPLETE':
      view = data.view || [];
      page = 1; // Reset to first page
      totalRows = data.viewLength || 0; // Store total rows for pagination
      $("#filterProgress").style.display = 'none';
      $("#savedFilterProgress").style.display = 'none';
      render();
      refreshSummaryIfOpen();
      break;

    case 'PIPELINE_COMPLETE':
      fieldNames = new Set(data.fieldNames || []);
      if (data.fieldRegistry) FieldRegistry.deserialize(data.fieldRegistry);
      initializeVisibleColumnsFromPrefs();
      initializeColumnOrderFromPrefs();
      mergeNewFieldsIntoOrder();
      renderColumnsPanel();
      page = 1;
      totalRows = data.viewLength || 0;
      $("#filterProgress").style.display = 'none';
      const pipelineProgress = $("#pipelineProgress");
      if (pipelineProgress) pipelineProgress.style.display = 'none';
      $("#savedFilterProgress").style.display = 'none';
      updateSortOptions();
      renderQueryFields();
      renderPipelineList();
      renderTransformErrorAlert(data.transformResults || null);
      render();
      refreshSummaryIfOpen();
      break;

    case 'EXTRACTORS_COMPLETE':
      fieldNames = new Set(data.newFieldNames || []);
      if (data.fieldRegistry) {
        FieldRegistry.deserialize(data.fieldRegistry);
      }
      // Update columns panel and merge new fields into saved order
      initializeVisibleColumnsFromPrefs();
      initializeColumnOrderFromPrefs();
      mergeNewFieldsIntoOrder();
      renderColumnsPanel();
      const extractHits = data.results?.total || 0;
      const transformChanged = data.transformResults?.changed || 0;
      $("#extractInfo").textContent = `Extractors: ${fmt(extractHits)} matches · Transforms: ${fmt(transformChanged)} changed`;
      $("#extractorProgress").style.display = 'none';
      updateSortOptions();
      renderQueryFields();
      renderPipelineList();
      renderTransformErrorAlert(data.transformResults || null);
      if (data.mode === 'quick-test') {
        totalRows = data.viewLength || totalRows;
        render();
        refreshSummaryIfOpen();
      } else {
        applyFilters();
      }
      break;

    case 'PAGE_DATA':
      // Handle paginated data for rendering
      renderPage(data);
      break;

    case 'STATS_DATA':
      renderStatsFromWorker(data);
      break;

    case 'FULL_VIEW_DATA':
      // This is handled by the pending request resolver
      break;

    case 'PARSE_QUERY_RESULT':
      // This is handled by the pending request resolver
      break;

    case 'SUMMARY_STATS_COMPLETE':
      $("#summary-progress").style.display = 'none';
      renderSummaryStats(data);
      break;

    case 'PROGRESS':
      const { percent, message, operation } = data;
      if (operation === 'parsing') {
        const container = $("#uploadProgress");
        const fill = $("#uploadProgressFill");
        const text = $("#uploadProgressText");
        container.style.display = 'block';
        fill.style.width = percent + '%';
        text.textContent = message;
      } else if (operation === 'extracting') {
        const container = $("#extractorProgress");
        const fill = $("#extractorProgressFill");
        const text = $("#extractorProgressText");
        container.style.display = 'block';
        fill.style.width = percent + '%';
        text.textContent = message;
      } else if (operation === 'filtering') {
        const container = $("#filterProgress");
        const fill = $("#filterProgressFill");
        const text = $("#filterProgressText");
        container.style.display = 'block';
        fill.style.width = percent + '%';
        text.textContent = message;
      } else if (operation === 'pipeline') {
        const container = $("#pipelineProgress");
        const fill = $("#pipelineProgressFill");
        const text = $("#pipelineProgressText");
        if (container && fill && text) {
          container.style.display = 'block';
          fill.style.width = percent + '%';
          text.textContent = message;
        }
      } else if (operation === 'saved-filtering') {
        const container = $("#savedFilterProgress");
        const fill = $("#savedFilterProgressFill");
        const text = $("#savedFilterProgressText");
        container.style.display = 'block';
        fill.style.width = percent + '%';
        text.textContent = message;
      } else if (operation === 'summary') {
        const container = $("#summary-progress");
        const fill = $("#summary-progress-fill");
        const text = $("#summary-progress-text");
        container.style.display = 'block';
        fill.style.width = percent + '%';
        text.textContent = message;
      }
      break;

    case 'ERROR':
      console.error('Worker error:', data.message);
      alert('Processing error: ' + data.message);
      break;

    default:
      console.warn('Unknown worker message type:', type);
  }
}

function renderTransformErrorAlert(transformResults) {
  const el = $("#transformErrorAlert");
  if (!el) return;

  const failed = transformResults?.failed || 0;
  if (!failed) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }

  const samples = Array.isArray(transformResults.errorSamples) ? transformResults.errorSamples.slice(0, 5) : [];
  const sampleHtml = samples.length
    ? `<ul>${samples.map(s => `<li>${escapeHtml(s.transformName || s.transformId || 'Transform')}${s.rowId ? ` (row ${escapeHtml(String(s.rowId))})` : ''}: ${escapeHtml(s.error || 'Unknown error')}</li>`).join('')}</ul>`
    : '';

  el.innerHTML = `<div class="title">Transform errors detected</div>
    <div>${fmt(failed)} transformation failure(s) occurred during the last run.</div>
    ${sampleHtml}`;
  el.style.display = 'block';
}

function refreshSummaryIfOpen() {
  const summary = $("#summary-details");
  if (summary?.open) computeSummaryStats();
}

/**
 * Handle worker errors
 */
function handleWorkerError(error) {
  console.error('Worker error:', error);
  alert('Worker error: ' + error.message);
}

/**
 * Send a message to the worker and optionally wait for response
 */
function sendToWorker(type, data, waitForResponse = false) {
  if (!worker) {
    throw new Error('Worker not initialized');
  }

  // Ensure data is serializable by deep cloning
  const serializableData = (() => {
    try {
      const str = JSON.stringify(data);
      return str === undefined ? null : JSON.parse(str);
    } catch (e) {
      console.error('Data not serializable, using null', data, e);
      return null;
    }
  })();
  const message = { type, data: serializableData };
  if (waitForResponse) {
    const id = generateUUID();
    message.id = id;
    return new Promise((resolve) => {
      pendingRequests.set(id, resolve);
      worker.postMessage(message);
    });
  } else {
    worker.postMessage(message);
  }
}

// ---------- Field Registry & Operators ----------
// (Moved to shared.js)

/**
 * Migrate v1 filter to v2 format
 */
function migrateFilter(oldFilter) {
  if (!oldFilter) return oldFilter;
  if (oldFilter.version === 2) return oldFilter;
  const rules = [];
  if (oldFilter.level) {
    rules.push({ id: generateUUID(), field: 'level', operator: 'equals', value: oldFilter.level, logic: 'AND', enabled: true });
  }
  if (oldFilter.from) rules.push({ id: generateUUID(), field: 'ts', operator: 'after', value: oldFilter.from, logic: 'AND', enabled: true });
  if (oldFilter.to) rules.push({ id: generateUUID(), field: 'ts', operator: 'before', value: oldFilter.to, logic: 'AND', enabled: true });
  if (rules.length > 0) rules[rules.length - 1].logic = null;
  return { ...oldFilter, version: 2, quickSearch: oldFilter.query || '', rules, sort: { field: oldFilter.sort || 'id', order: oldFilter.order || 'desc' }, _legacy: { query: oldFilter.query, regex: oldFilter.regex } };
}

function migrateAllFilters() {
  const filters = Storage.getFilters();
  let migrated = 0;
  filters.forEach(filter => { if (!filter.version || filter.version !== 2) { const v2 = migrateFilter(filter); Storage.saveFilter(v2); migrated++; } });
  if (migrated > 0) console.log(`Migrated ${migrated} filters to v2 format`);
}

function getPipelineOrderFromPrefs() {
  const prefs = Storage.getPrefs() || {};
  pipelineOrder = Array.isArray(prefs.pipelineOrder) ? prefs.pipelineOrder.slice() : [];
  return pipelineOrder;
}

function savePipelineOrderToPrefs() {
  const prefs = Storage.getPrefs() || {};
  prefs.pipelineOrder = pipelineOrder.slice();
  Storage.savePrefs(prefs);
}

function buildPipelineSteps(options = {}) {
  const { includeTransientQuickTest = false } = options;
  const steps = [];
  const prefs = Storage.getPrefs() || {};

  const rules = currentFilterConfig?.rules || [];
  for (const rule of rules) {
    const label = `Filter: ${rule.field} ${rule.operator}${rule.value ? ' ' + rule.value : ''}`;
    steps.push({
      key: `filter-rule:${rule.id}`,
      type: 'filter-rule',
      label,
      enabled: rule.enabled !== false,
      rule
    });
  }

  const advancedQuery = $("#textQuery")?.value.trim();
  if (advancedQuery) {
    steps.push({
      key: 'filter-advanced',
      type: 'advanced-query',
      label: `Filter: Advanced Query`,
      enabled: true,
      queryText: advancedQuery
    });
  }

  const activeExtractorIds = Storage.getActiveExtractors();
  const extractorMap = new Map(Storage.getExtractors().map(e => [e.id, e]));
  for (const id of activeExtractorIds) {
    const ext = extractorMap.get(id);
    if (!ext) continue;
    steps.push({
      key: `extractor:${id}`,
      type: 'extractor',
      label: `Extractor: ${ext.name}`,
      enabled: ext.enabled !== false,
      mergeStrategy: prefs.extractorMergeStrategy || 'last-wins',
      extractor: ext
    });
  }

  if (includeTransientQuickTest && transientQuickTestExtractor?.extractor) {
    steps.push({
      key: 'extractor:quick-test',
      type: 'extractor',
      label: 'Extractor: Quick Test',
      enabled: true,
      mergeStrategy: transientQuickTestExtractor.mergeStrategy || prefs.extractorMergeStrategy || 'last-wins',
      extractor: transientQuickTestExtractor.extractor
    });
  }

  const activeTransformIds = Storage.getActiveTransforms();
  const transformMap = new Map(Storage.getTransforms().map(t => [t.id, t]));
  for (const id of activeTransformIds) {
    const t = transformMap.get(id);
    if (!t) continue;
    steps.push({
      key: `transform:${id}`,
      type: 'transform',
      label: `Transform: ${t.name || t.operation}`,
      enabled: t.enabled !== false,
      transform: t
    });
  }

  const order = getPipelineOrderFromPrefs();
  const byKey = new Map(steps.map(s => [s.key, s]));
  const ordered = [];

  for (const key of order) {
    const step = byKey.get(key);
    if (step) {
      ordered.push(step);
      byKey.delete(key);
    }
  }
  for (const step of byKey.values()) ordered.push(step);

  pipelineOrder = ordered.map(s => s.key);
  savePipelineOrderToPrefs();
  return ordered;
}

function renderPipelineList() {
  const list = $("#pipelineList");
  if (!list) return;

  const steps = buildPipelineSteps();
  if (steps.length === 0) {
    list.innerHTML = '<div class="empty-state">No pipeline steps yet. Add filter rules, extractors, or transformations.</div>';
    updateAnalysisSummary(steps);
    return;
  }

  list.innerHTML = steps.map(step => {
    const kind = step.type === 'filter-rule' || step.type === 'advanced-query' ? 'Filter' : (step.type === 'extractor' ? 'Extractor' : 'Transform');
    return `
      <div class="library-item" data-step-key="${step.key}" draggable="true">
        <input type="checkbox" class="pipeline-toggle" data-step-key="${step.key}" ${step.enabled ? 'checked' : ''} />
        <div class="library-item-content">
          <div class="library-item-title">${escapeHtml(kind)}</div>
          <div class="library-item-pattern">${escapeHtml(step.label)}</div>
        </div>
        <div class="library-item-actions"><span class="drag-handle" style="cursor:grab; color:var(--muted)">≡</span></div>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.pipeline-toggle').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const key = e.target.dataset.stepKey;
      const checked = e.target.checked;
      if (key.startsWith('filter-rule:')) {
        const id = key.split(':')[1];
        const rule = (currentFilterConfig?.rules || []).find(r => r.id === id);
        if (rule) rule.enabled = checked;
      } else if (key.startsWith('extractor:')) {
        const id = key.split(':')[1];
        const active = Storage.getActiveExtractors();
        if (checked && !active.includes(id)) active.push(id);
        if (!checked) Storage.setActiveExtractors(active.filter(x => x !== id));
        else Storage.setActiveExtractors(active);
        renderExtractorList();
      } else if (key.startsWith('transform:')) {
        const id = key.split(':')[1];
        const active = Storage.getActiveTransforms();
        if (checked && !active.includes(id)) active.push(id);
        if (!checked) Storage.setActiveTransforms(active.filter(x => x !== id));
        else Storage.setActiveTransforms(active);
        renderTransformationList();
      }
      updateExtractorInfo();
      renderPipelineList();
    });
  });

  let dragSrcEl = null;
  list.addEventListener('dragstart', (e) => {
    const el = e.target.closest('.library-item');
    if (!el) return;
    dragSrcEl = el;
    el.classList.add('dragging');
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterEl = getDragAfterElement(list, e.clientY);
    if (!dragSrcEl) return;
    if (!afterEl) list.appendChild(dragSrcEl);
    else list.insertBefore(dragSrcEl, afterEl);
  });

  list.addEventListener('dragend', () => {
    if (dragSrcEl) dragSrcEl.classList.remove('dragging');
    pipelineOrder = [...list.querySelectorAll('.library-item')].map(n => n.dataset.stepKey);
    savePipelineOrderToPrefs();
    dragSrcEl = null;
  });

  function getDragAfterElement(container, y) {
    const els = [...container.querySelectorAll('.library-item:not(.dragging)')];
    let closest = { offset: Number.NEGATIVE_INFINITY, element: null };
    for (const child of els) {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) closest = { offset, element: child };
    }
    return closest.element;
  }

  updateAnalysisSummary(steps);
}

function updateAnalysisSummary(steps = buildPipelineSteps()) {
  const el = $("#analysisSummary");
  if (!el) return;

  const counts = {
    filters: steps.filter(step => step.type === 'filter-rule' || step.type === 'advanced-query').length,
    extractors: steps.filter(step => step.type === 'extractor').length,
    transforms: steps.filter(step => step.type === 'transform').length
  };

  const parts = [];
  if (counts.filters) parts.push(`${counts.filters} filter${counts.filters === 1 ? '' : 's'}`);
  if (counts.extractors) parts.push(`${counts.extractors} extractor${counts.extractors === 1 ? '' : 's'}`);
  if (counts.transforms) parts.push(`${counts.transforms} transform${counts.transforms === 1 ? '' : 's'}`);

  el.textContent = parts.length
    ? `Ready to run: ${parts.join(', ')}.`
    : 'Add filters, extractors, or transforms to build your analysis.';
}

function runPipeline(operation = 'pipeline') {
  const sortConfig = {
    field: $("#sort").value,
    order: $("#order").value
  };

  const prefs = Storage.getPrefs();
  const steps = buildPipelineSteps({
    includeTransientQuickTest: operation !== 'pipeline' && !!transientQuickTestExtractor
  });

  const progress = $("#pipelineProgress");
  const progressFill = $("#pipelineProgressFill");
  const progressText = $("#pipelineProgressText");
  if (progress && progressFill && progressText) {
    progress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Running pipeline...';
  }

  sendToWorker('RUN_PIPELINE', {
    operation,
    steps,
    sort: sortConfig,
    transformRuntime: {
      unsafeMode: !!prefs.unsafeJsTransforms,
      maxTotalMs: 2500,
      maxOutputLength: 100000
    }
  });
}


/**
 * Apply all active filters to the dataset
 */
function applyFilters(operation = 'filtering') {
  runPipeline(operation);
}

/**
 * Get current page of results based on pagination settings
 * @param {Array} list - List to paginate
 * @returns {Array} - Current page items
 */
function paginate(list) {
  per = +$("#per").value;
  const start = (page - 1) * per;
  return list.slice(start, start + per);
}

/**
 * Render the current view to the UI
 */
function render() {
  // Request current page data from worker
  sendToWorker('GET_PAGE', { page, per });
}

function getSortValueForColumn(col) {
  if (['id', 'ts', 'level', 'message'].includes(col)) return col;
  return `field:${col}`;
}

function getSortArrow(sortValue, currentSort, currentOrder) {
  if (sortValue !== currentSort) return '';
  return currentOrder === 'asc' ? ' ▲' : ' ▼';
}

function handleSortHeaderClick(sortValue) {
  const sortSelect = $("#sort");
  const orderSelect = $("#order");
  if (!sortSelect || !orderSelect) return;

  const currentSort = sortSelect.value;
  const currentOrder = orderSelect.value;
  const nextOrder = currentSort === sortValue && currentOrder === 'asc' ? 'desc' : 'asc';

  sortSelect.value = sortValue;
  orderSelect.value = nextOrder;
  if (sortValue === 'id') sortByIdOrder = nextOrder;
  applyFilters();
}

/**
 * Render a specific page of data
 */
function renderPage(pageData) {
  const t0 = performance.now();
  const body = $("#tbody");
  const theadRow = $("#thead-row");
  body.innerHTML = "";

  // Update table headers with dynamic field columns using user-defined columnOrder
  const order = getCurrentColumnOrder();
  const displayedCols = order.filter(c => isColumnVisible(c));
  const currentSort = $("#sort")?.value || 'id';
  const currentOrder = $("#order")?.value || 'desc';
  if (currentSort === 'id') sortByIdOrder = currentOrder;

  // Build header cells matching displayed columns
  const headerHtml = displayedCols.map(col => {
    if (col === 'id') {
    const arrow = sortByIdOrder === 'asc' ? '▲' : '▼';
    return `<th style="width:72px; cursor:pointer" class="id-header">ID ${arrow}</th>`;
      }
    if (col === 'ts') return `<th style="width:210px">Timestamp <br/>(<span id="tzLabel">${escapeHtml(userTimeZone)}</span>)</th>`;
    if (col === 'level') return `<th style="width:120px">Level</th>`;
    if (col === 'message') return `<th style="max-width:80ch">Message</th>`;
    return `<th style="width:150px">${escapeHtml(col)}</th>`;
  }).join('');

  theadRow.innerHTML = headerHtml;

  // Attach click handler to ID header
const idHeader = theadRow.querySelector('.id-header');
    if (idHeader) {
      idHeader.addEventListener('click', () => {
        sortByIdOrder = sortByIdOrder === 'asc' ? 'desc' : 'asc';
        $("#sort").value = 'id';
        $("#order").value = sortByIdOrder;
        applyFilters();
      });
    }

  const pageRows = pageData.pageRows;
  const frag = document.createDocumentFragment();

  for (const r of pageRows) {
    const tr = document.createElement('tr');

    // Build cells in same order as headers
    const cellsHtml = displayedCols.map(col => {
      if (col === 'id') return `<td>${escapeText(r.id)}</td>`;
      else if (col === 'ts') return `<td>${escapeText(formatLocalDatetime(r.ts))}</td>`;
      else if (col === 'level') return `<td><span class="lvl-${escapeText(r.level)}">${escapeText(r.level)}</span></td>`;
      else if (col === 'message') return `<td><pre>${escapeHtml(r.message)}</pre><details><summary>raw</summary><pre>${escapeHtml(r.raw)}</pre></details></td>`;

      const val = r.fields?.[col];
      if (val === undefined || val === null) return '<td></td>';
      if (Array.isArray(val)) {
        if (val.length === 1) return `<td>${escapeHtml(val[0])}</td>`;
        return `<td><code>${escapeHtml(JSON.stringify(val))}</code></td>`;
      }
      return `<td>${escapeHtml(String(val))}</td>`;
    }).join('');

    tr.innerHTML = cellsHtml;
    frag.appendChild(tr);
  }

  body.appendChild(frag);

  // Update UI elements
  $("#pageLabel").textContent = `${pageData.currentPage} / ${pageData.totalPages}`;
  $("#renderInfo").textContent = `${fmt(pageData.totalRows)} rows · showing ${fmt(pageRows.length)} · ${Math.round(performance.now() - t0)}ms`;
  $("#countTag").textContent = `${fmt(pageData.totalRows)} lines`;

  // Store total rows for pagination calculations
  totalRows = pageData.totalRows;
  // Request stats separately
  sendToWorker('GET_STATS');
}

/**
 * Update the filter status tag
 */
function updateFilterTag() {
  const bits = [];
  if (currentFilterConfig && currentFilterConfig.rules && currentFilterConfig.rules.length) bits.push('builder');
  const hasAdvanced = !!(
    appliedAdvancedQuery &&
    (
      (appliedAdvancedQuery.version === 3 && appliedAdvancedQuery.ast) ||
      (Array.isArray(appliedAdvancedQuery.rules) && appliedAdvancedQuery.rules.length)
    )
  );
  if (hasAdvanced) bits.push('advanced');
  $("#filterTag").textContent = bits.length ? `filters: ${bits.join(',')}` : 'no filters';
}

/**
 * Render statistics and sparkline chart
 */
function renderStats() {
  // Stats are now requested separately and handled in renderStatsFromWorker
}

/**
 * Render statistics from worker data
 */
function renderStatsFromWorker(stats) {
  $("#sRows").textContent = fmt(stats.totalRows);
  $("#sInfo").textContent = fmt(stats.infoCount);
  $("#sWarn").textContent = fmt(stats.warnCount);
  $("#sErr").textContent = fmt(stats.errorCount);

  // Create time-bucket sparkline (per minute)
  drawSpark($("#spark"), stats.timeBuckets);
}

/**
 * Draw sparkline chart on canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {Array<number>} arr - Data points to plot
 */
function drawSpark(canvas, arr) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width = canvas.clientWidth * devicePixelRatio;
  const h = canvas.height = canvas.clientHeight * devicePixelRatio;

  ctx.clearRect(0, 0, w, h);
  if (!arr.length) return;

  const max = Math.max(...arr);
  const min = 0;
  const step = w / Math.max(1, arr.length - 1);

  ctx.lineWidth = 2 * devicePixelRatio;
  ctx.globalAlpha = .9;
  ctx.beginPath();

  arr.forEach((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min || 1)) * (h - 6 * devicePixelRatio) - 3 * devicePixelRatio;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent');
  ctx.stroke();
}

/**
 * Escape HTML special characters
 * @param {string} s - String to escape
 * @returns {string} - HTML-escaped string
 */
// `escapeHtml` is provided by `shared.js`.

// ---------- Pattern Extractor ----------

// `runSingleExtractor` and `runMultipleExtractors` are provided by `shared.js`.

/**
 * Update sort dropdown with extracted field names
 */
function updateSortOptions() {
  const sortSelect = $("#sort");
  const currentValue = sortSelect.value;
  const sortedFields = [...fieldNames].sort();

  // Rebuild options
  sortSelect.innerHTML = `
    <option value="id">ID</option>
    <option value="ts">Timestamp</option>
    <option value="level">Level</option>
    ${sortedFields.map(f => `<option value="field:${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('')}
  `;

  // Restore previous selection if still valid
  const options = [...sortSelect.options];
  if (options.some(opt => opt.value === currentValue)) {
    sortSelect.value = currentValue;
  }
  // Refresh columns panel since available fields changed
  mergeNewFieldsIntoOrder();
  renderColumnsPanel();
}

// ---------- Columns Visibility Management ----------

function initializeVisibleColumnsFromPrefs() {
  const prefs = Storage.getPrefs() || {};
  if (prefs.visibleColumns && Array.isArray(prefs.visibleColumns)) {
    visibleColumns = new Set(prefs.visibleColumns || []);
  } else {
    // keep empty Set to mean "all visible" (default)
    visibleColumns = new Set();
  }
}

// ---------- Column Order / Reordering (native drag & drop) ----------

function initializeColumnOrderFromPrefs() {
  const prefs = Storage.getPrefs() || {};
  if (prefs.columnOrder && Array.isArray(prefs.columnOrder)) {
    columnOrder = prefs.columnOrder.slice();
  } else {
    columnOrder = [];
  }
  // Ensure we merge any fields known now
  mergeNewFieldsIntoOrder();
}

function saveColumnOrderToPrefs() {
  const prefs = Storage.getPrefs();
  prefs.columnOrder = columnOrder.slice();
  Storage.savePrefs(prefs);
}

function mergeNewFieldsIntoOrder() {
  // Ensure columnOrder contains the standard columns and any extracted fields, append new ones
  const sortedFields = [...fieldNames].sort();
  const allCols = ['id', 'ts', 'level', 'message', ...sortedFields];

  if (!columnOrder || columnOrder.length === 0) {
    columnOrder = allCols.slice();
    return;
  }

  // Filter out any columns no longer present, then append missing ones in allCols order
  const filtered = columnOrder.filter(c => allCols.includes(c));
  const missing = allCols.filter(c => !filtered.includes(c));
  columnOrder = filtered.concat(missing);
}

function getCurrentColumnOrder() {
  mergeNewFieldsIntoOrder();
  return columnOrder.slice();
}

function isColumnVisible(colKey) {
  // If user has not specifically configured columns, treat all as visible
  if (!visibleColumns || visibleColumns.size === 0) return true;
  return visibleColumns.has(colKey);
}

function saveVisibleColumnsToPrefs() {
  const prefs = Storage.getPrefs();
  prefs.visibleColumns = visibleColumns.size ? Array.from(visibleColumns) : [];
  Storage.savePrefs(prefs);
}

function setColumnVisibility(colKey, visible) {
  // If no explicit config exists yet (empty = all visible), initialize to current all columns
  if ((!visibleColumns || visibleColumns.size === 0) && !visible) {
    // populate with all currently-known columns so we can toggle one off
    const all = ['id', 'ts', 'level', 'message', ...[...fieldNames].sort()];
    visibleColumns = new Set(all);
  }

  if (visible) visibleColumns.add(colKey);
  else visibleColumns.delete(colKey);

  saveVisibleColumnsToPrefs();
  // Re-render results and columns panel
  render();
  renderColumnsPanel();
}

function renderColumnsPanel() {
  const container = $("#columnsList");
  if (!container) return;
  const order = getCurrentColumnOrder();

  if (!order.length) {
    container.innerHTML = '<div class="empty-state">No columns available yet. Load a file or run extractors to populate columns.</div>';
    return;
  }

  const html = order.map(col => {
    const label = col === 'id' ? 'ID' : (col === 'ts' ? 'Timestamp' : (col === 'level' ? 'Level' : (col === 'message' ? 'Message' : col)));
    const checked = isColumnVisible(col) ? 'checked' : '';
    return `
      <div class="library-item" draggable="true" data-col="${escapeHtml(col)}" style="display:flex; align-items:center; gap:8px; padding:6px">
        <div class="drag-handle" title="Drag to reorder" style="cursor:grab; padding-right:8px; user-select:none;">≡</div>
        <label style="display:flex; align-items:center; gap:8px; flex:1">
          <input type="checkbox" class="col-toggle" data-col="${escapeHtml(col)}" ${checked} />
          <span style="flex:1">${escapeHtml(label)}</span>
        </label>
      </div>
    `;
  }).join('');

  // Add reset button and container for reorderable list
  container.innerHTML = `
    <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center">
      <button class="btn" id="columnsReset">Reset to default</button>
      <div style="color:var(--muted); font-size:13px">Unchecked columns will be hidden in Results. Drag to reorder columns.</div>
    </div>
    <div id="columnsListContainer">${html}</div>
  `;

  const list = container.querySelector('#columnsListContainer');

  // Attach checkbox listeners
  list.querySelectorAll('.col-toggle').forEach(cb => cb.addEventListener('change', (e) => {
    const col = e.currentTarget.dataset.col;
    setColumnVisibility(col, e.currentTarget.checked);
  }));

  const reset = container.querySelector('#columnsReset');
  if (reset) reset.addEventListener('click', () => {
    // Clear prefs to default (all visible) and reset order
    visibleColumns = new Set();
    columnOrder = [];
    saveVisibleColumnsToPrefs();
    saveColumnOrderToPrefs();
    render();
    renderColumnsPanel();
  });

  // Native HTML5 drag & drop implementation for reordering columns.
  // Uses `draggable="true"` on `.library-item` elements and a helper
  // to determine insertion point while dragging.
  let dragSrcEl = null;

  list.addEventListener('dragstart', (e) => {
    const el = e.target.closest('.library-item');
    if (!el) return;
    dragSrcEl = el;
    el.classList.add('dragging');
    try { e.dataTransfer.setData('text/plain', el.dataset.col); } catch (err) { /* some browsers may throw */ }
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterEl = getDragAfterElement(list, e.clientY);
    if (!dragSrcEl) return;
    if (!afterEl) list.appendChild(dragSrcEl);
    else list.insertBefore(dragSrcEl, afterEl);
  });

  list.addEventListener('dragend', (e) => {
    if (dragSrcEl) dragSrcEl.classList.remove('dragging');
    // Update columnOrder from current DOM order
    const newOrder = [...list.querySelectorAll('.library-item')].map(n => n.dataset.col);
    columnOrder = newOrder.slice();
    saveColumnOrderToPrefs();
    render();
    dragSrcEl = null;
  });

  // Helper: find the element after the given vertical coordinate `y`.
  // Excludes the currently dragging element (which has class `dragging`).
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.library-item:not(.dragging)')];

    let closest = { offset: Number.NEGATIVE_INFINITY, element: null };

    for (const child of draggableElements) {
      const box = child.getBoundingClientRect();
      // Calculate offset from the vertical center of the element
      const offset = y - box.top - box.height / 2;
      // We want the element with the smallest negative offset (closest above)
      if (offset < 0 && offset > closest.offset) {
        closest = { offset, element: child };
      }
    }

    return closest.element;
  }
}

/**
 * Run active extractors from storage
 */
function runActiveExtractors() {
  runPipeline('pipeline');
}

function renderQueryFields() {
  const el = $("#queryFields");
  if (!el) return;
  const fields = [...fieldNames].sort().slice(0, 20);
  if (fields.length === 0) {
    el.innerHTML = '';
    return;
  }
  el.innerHTML = fields.map(f => `<button class="btn ghost" data-field="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join(' ');
  el.querySelectorAll('button[data-field]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const f = e.currentTarget.dataset.field;
      const tq = $("#textQuery");
      if (!tq) return;
      const insert = `${f}:`;
      const pos = tq.selectionStart || tq.value.length;
      tq.value = tq.value.slice(0, pos) + insert + tq.value.slice(pos);
      tq.focus();
    });
  });
}

/**
 * Legacy: Run extractor from manual input (for backwards compatibility)
 */
function runExtractor() {
  const quickPattern = $("#extractPattern").value.trim();
  if (!quickPattern) {
    alert('Provide a named-group regex.');
    return;
  }

  if (!worker) {
    alert('Processing is not ready yet.');
    return;
  }

  if (!$("#fileTag") || $("#fileTag").textContent === 'no file') {
    alert('Load a file before testing a pattern.');
    return;
  }

  const prefs = Storage.getPrefs();
  const mergeStrategy = prefs.extractorMergeStrategy || 'last-wins';
  const scope = $("#extractScope").value;
  transientQuickTestExtractor = {
    extractor: {
      id: 'quick-test',
      name: 'Quick Test',
      pattern: quickPattern,
      enabled: true
    },
    mergeStrategy,
    scope
  };
  const extractorProgress = $("#extractorProgress");
  const extractorProgressFill = $("#extractorProgressFill");
  const extractorProgressText = $("#extractorProgressText");
  if (extractorProgress && extractorProgressFill && extractorProgressText) {
    extractorProgress.style.display = 'block';
    extractorProgressFill.style.width = '0%';
    extractorProgressText.textContent = 'Testing pattern...';
  }

  sendToWorker('RUN_EXTRACTORS', {
    mode: 'quick-test',
    extractors: [transientQuickTestExtractor.extractor],
    transforms: [],
    scope,
    mergeStrategy,
    transformRuntime: {
      unsafeMode: !!prefs.unsafeJsTransforms,
      maxTotalMs: 2500,
      maxOutputLength: 100000
    }
  });
  return;
  /*
  const pattern = $("#extractPattern").value.trim();
  if (!pattern) {
    alert('Provide a named‑group regex.');
    return;
  }

  const scope = $("#extractScope").value === 'filtered' ? view : rows;
  const prefs = Storage.getPrefs();
  const mergeStrategy = prefs.extractorMergeStrategy || 'last-wins';
  const hits = runSingleExtractor(pattern, scope, mergeStrategy);

  $("#extractInfo").textContent = `Applied to ${fmt(scope.length)} rows · ${fmt(hits)} with captures`;
  updateSortOptions();
  applyFilters();
  */
}

// ---------- File Handling ----------

/**
 * Read file as text using FileReader API
 * @param {File} file - File object
 * @returns {Promise<string>} - File content as text
 */
async function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(r.error);
    r.onload = () => resolve(r.result);
    r.readAsText(file);
  });
}

/**
 * Detect file format based on extension
 * @param {string} filename - Name of the file
 * @returns {string} - Format type: 'csv', 'json', or 'log'
 */
function detectFileFormat(filename) {
  const ext = filename.split('.').pop().toLowerCase();

  if (ext === 'csv') return 'csv';
  if (ext === 'json') return 'json';

  // Default to log format for .log, .txt, and unknown extensions
  return 'log';
}

/**
 * Handle uploaded file and parse it based on format
 * @param {File} file - File object to process
 */
async function handleFile(file) {
  $("#fileTag").textContent = file.name;
  $("#info").textContent = 'Parsing…';
  $("#uploadProgress").style.display = 'block';

  try {
    const text = await readFileAsText(file);
    const format = detectFileFormat(file.name);

    // Clear existing field names for new file
    fieldNames.clear();

    // Send to worker for processing
    sendToWorker('PARSE_DATA', { text, format });
  } catch (error) {
    console.error('File reading error:', error);
    $("#info").textContent = 'Error reading file';
    $("#uploadProgress").style.display = 'none';
    alert('Error reading file: ' + error.message);
  }
}

// ---------- Export Functions ----------

/**
 * Export current view as JSON file
 */
/**
 * Export current view as JSON file
 */
async function exportJSON() {
  try {
    const response = await sendToWorker('GET_FULL_VIEW', {}, true);
    const view = response.data;
    // Ensure column order is up to date and respect visibility
    mergeNewFieldsIntoOrder();
    const exportCols = getCurrentColumnOrder().filter(c => isColumnVisible(c));

    // Build array of row objects containing only selected columns in the specified order
    const out = view.map(r => {
      const obj = {};
      for (const col of exportCols) {
        if (col === 'id') obj.id = r.id;
        else if (col === 'ts') obj.ts = r.ts || '';
        else if (col === 'level') obj.level = r.level || '';
        else if (col === 'message') obj.message = r.message || '';
        else obj[col] = r.fields?.[col] === undefined ? null : r.fields[col];
      }
      return obj;
    });

    const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logsieve-data.json';
    a.click();
  } catch (error) {
    console.error('Export JSON failed:', error);
    alert('Failed to export JSON: ' + error.message);
  }
}

/**
 * Export current view as CSV file
 */
async function exportCSV() {
  try {
    const response = await sendToWorker('GET_FULL_VIEW', {}, true);
    const view = response.data;
    // Ensure column order is up to date and respect visibility
    mergeNewFieldsIntoOrder();
    const exportCols = getCurrentColumnOrder().filter(c => isColumnVisible(c));

    // Build header row using exportCols
    const header = exportCols.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
    const lines = [header];

    for (const r of view) {
      const rowVals = exportCols.map(col => {
        let val;
        if (col === 'id') val = r.id;
        else if (col === 'ts') val = r.ts || '';
        else if (col === 'level') val = r.level || '';
        else if (col === 'message') val = r.message || '';
        else {
          const v = r.fields?.[col];
          if (v === undefined || v === null) val = '';
          else if (Array.isArray(v)) {
            val = v.length === 1 ? v[0] : JSON.stringify(v);
          } else val = String(v);
        }
        // Quote and escape
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      lines.push(rowVals.join(','));
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'logsieve-data.csv';
    a.click();
  } catch (error) {
    console.error('Export CSV failed:', error);
    alert('Failed to export CSV: ' + error.message);
  }
}

/**
 * Export extractors and filters library
 */
function exportLibrary() {
  const data = Storage.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `logsieve-library-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

/**
 * Import extractors and filters library
 * @param {File} file - JSON file to import
 */
async function importLibrary(file) {
  try {
    const text = await readFileAsText(file);
    const data = JSON.parse(text);

    // Validate data structure
    if (!data.extractors && !data.filters && !data.transforms) {
      alert('Invalid library file: no extractors, filters, or transforms found.');
      return;
    }

    // Ask user about merge vs replace
    const merge = confirm(
      'Import mode:\n\n' +
      'OK = Merge with existing (keep current items)\n' +
      'Cancel = Replace existing (delete current items)\n\n' +
      `Importing: ${data.extractors?.length || 0} extractors, ${data.filters?.length || 0} filters, ${data.transforms?.length || 0} transforms`
    );

    const results = Storage.importAll(data, merge);

    if (results.errors.length > 0) {
      alert('Import completed with errors:\n' + results.errors.join('\n'));
    } else {
      alert(`Import successful!\n\nImported:\n- ${results.extractors} extractors\n- ${results.filters} filters\n- ${results.transforms || 0} transforms`);
    }

    // Refresh UI
    renderExtractorList();
    renderTransformationList();
    renderFilterList();
    updateExtractorInfo();
    updateFilterLibInfo();
  } catch (e) {
    alert('Failed to import library: ' + e.message);
  }
}

// ---------- UI Management ----------

/**
 * Render the extractor library list
 */
function renderExtractorList() {
  const extractors = Storage.getExtractors();
  const activeIds = Storage.getActiveExtractors();
  const container = $("#extractorList");

  if (extractors.length === 0) {
    container.innerHTML = '<div class="empty-state">No extractors saved. Click "+ New Extractor" to create one.</div>';
    return;
  }

  container.innerHTML = extractors.map(ext => `
    <div class="library-item" data-id="${ext.id}">
      <input type="checkbox" class="extractor-checkbox" data-id="${ext.id}" ${activeIds.includes(ext.id) ? 'checked' : ''} />
      <div class="library-item-content">
        <div class="library-item-title">${escapeHtml(ext.name)}</div>
        ${ext.description ? `<div class="library-item-desc">${escapeHtml(ext.description)}</div>` : ''}
        <div class="library-item-pattern">${escapeHtml(ext.pattern)}</div>
      </div>
      <div class="library-item-actions">
        <button class="btn ghost edit-extractor" data-id="${ext.id}">Edit</button>
        <button class="btn ghost delete-extractor" data-id="${ext.id}">Delete</button>
      </div>
    </div>
  `).join('');

  // Attach event listeners
  container.querySelectorAll('.extractor-checkbox').forEach(cb => {
    cb.addEventListener('change', handleExtractorToggle);
  });
  container.querySelectorAll('.edit-extractor').forEach(btn => {
    btn.addEventListener('click', handleEditExtractor);
  });
  container.querySelectorAll('.delete-extractor').forEach(btn => {
    btn.addEventListener('click', handleDeleteExtractor);
  });
  renderPipelineList();
}

function transformationPreview(t) {
  const target = t.targetField && t.targetField !== t.sourceField ? ` → ${t.targetField}` : '';
  if (t.operation === 'json-parse') {
    return `${t.sourceField} | json.parse${t.path ? ' path=' + t.path : ''}${target}`;
  }
  if (t.operation === 'xml-tag') {
    return `${t.sourceField} | xml tag=${t.tag || t.path || ''}${target}`;
  }
  if (t.operation === 'url-decode') {
    return `${t.sourceField} | url decode${target}`;
  }
  if (t.operation === 'url-encode') {
    return `${t.sourceField} | url encode${target}`;
  }
  if (t.operation === 'js') {
    return `${t.sourceField} | js:${(t.expression || '').slice(0, 80)}${target}`;
  }
  return `${t.sourceField} | ${t.operation}${target}`;
}

function renderTransformationList() {
  const transforms = Storage.getTransforms();
  const activeIds = Storage.getActiveTransforms();
  const container = $("#transformList");
  if (!container) return;

  if (transforms.length === 0) {
    container.innerHTML = '<div class="empty-state">No transformations saved. Add one below.</div>';
    return;
  }

  container.innerHTML = transforms.map(t => `
    <div class="library-item" data-id="${t.id}">
      <input type="checkbox" class="transform-checkbox" data-id="${t.id}" ${activeIds.includes(t.id) ? 'checked' : ''} />
      <div class="library-item-content">
        <div class="library-item-title">${escapeHtml(t.name || t.operation || 'Transform')}</div>
        <div class="library-item-pattern">${escapeHtml(transformationPreview(t))}</div>
      </div>
      <div class="library-item-actions">
        <button class="btn ghost edit-transform" data-id="${t.id}">Edit</button>
        <button class="btn ghost delete-transform" data-id="${t.id}">Delete</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.transform-checkbox').forEach(cb => {
    cb.addEventListener('change', handleTransformToggle);
  });
  container.querySelectorAll('.delete-transform').forEach(btn => {
    btn.addEventListener('click', handleDeleteTransform);
  });
  container.querySelectorAll('.edit-transform').forEach(btn => {
    btn.addEventListener('click', handleEditTransform);
  });
  renderPipelineList();
}

function addTransformationFromInputs() {
  const name = $("#transformName")?.value.trim();
  const sourceField = $("#transformSource")?.value.trim();
  const operation = $("#transformOp")?.value;
  const targetField = $("#transformTarget")?.value.trim() || sourceField;
  const option = $("#transformOption")?.value.trim();

  if (!sourceField) {
    alert('Please provide source field for transformation.');
    return;
  }

  const transform = {
    name: name || `${operation}(${sourceField})`,
    sourceField,
    targetField,
    operation,
    enabled: true,
    order: Storage.getTransforms().length
  };

  if (editingTransformId) {
    const existing = Storage.getTransforms().find(t => t.id === editingTransformId);
    if (existing) {
      transform.id = existing.id;
      transform.created = existing.created;
      transform.enabled = existing.enabled !== false;
      transform.order = existing.order ?? 0;
    }
  }

  if (operation === 'json-parse') {
    if (option) transform.path = option;
  } else if (operation === 'xml-tag') {
    if (!option) {
      alert('XML transform requires a tag name in Option.');
      return;
    }
    transform.tag = option;
  } else if (operation === 'js') {
    if (!option) {
      alert('JS transform requires an expression in Option.');
      return;
    }
    transform.expression = option;
  }

  const saved = Storage.saveTransform(transform);
  const activeIds = Storage.getActiveTransforms();
  if (!activeIds.includes(saved.id)) {
    activeIds.push(saved.id);
    Storage.setActiveTransforms(activeIds);
  }

  if ($("#transformName")) $("#transformName").value = '';
  if ($("#transformSource")) $("#transformSource").value = '';
  if ($("#transformTarget")) $("#transformTarget").value = '';
  if ($("#transformOption")) $("#transformOption").value = '';
  if ($("#transformOp")) $("#transformOp").value = 'json-parse';

  clearTransformEditState();

  renderTransformationList();
  updateExtractorInfo();
}

function clearTransformEditState() {
  editingTransformId = null;
  const addBtn = $("#addTransform");
  const cancelBtn = $("#cancelTransformEdit");
  if (addBtn) addBtn.textContent = '+ Add Transform';
  if (cancelBtn) cancelBtn.style.display = 'none';
}

function handleEditTransform(e) {
  const id = e.target.dataset.id;
  const transform = Storage.getTransforms().find(t => t.id === id);
  if (!transform) return;

  editingTransformId = id;
  if ($("#transformName")) $("#transformName").value = transform.name || '';
  if ($("#transformSource")) $("#transformSource").value = transform.sourceField || '';
  if ($("#transformTarget")) $("#transformTarget").value = transform.targetField || '';
  if ($("#transformOp")) $("#transformOp").value = transform.operation || 'json-parse';
  if ($("#transformOption")) {
    if (transform.operation === 'json-parse') $("#transformOption").value = transform.path || '';
    else if (transform.operation === 'xml-tag') $("#transformOption").value = transform.tag || transform.path || '';
    else if (transform.operation === 'js') $("#transformOption").value = transform.expression || '';
    else $("#transformOption").value = '';
  }

  const addBtn = $("#addTransform");
  const cancelBtn = $("#cancelTransformEdit");
  if (addBtn) addBtn.textContent = 'Save Transform';
  if (cancelBtn) cancelBtn.style.display = '';
}

/**
 * Render the filter library list
 */
function renderFilterList() {
  const filters = Storage.getFilters();
  const container = $("#filterList");

  if (filters.length === 0) {
    container.innerHTML = '<div class="empty-state">No filters saved. Apply filters and click "Save Current Filter".</div>';
    return;
  }

  container.innerHTML = filters.map(filter => {
    const settings = [];
    // Show builder rules count and advanced query if present
    if (filter.version === 2) {
      if (filter.rules && filter.rules.length) settings.push(`rules: ${filter.rules.length}`);
      if (filter.advancedQuery) settings.push(`advanced: ${escapeHtml(filter.advancedQuery)}`);
      if (filter.quickSearch) settings.push(`quick: ${filter.quickSearch}`);
    } else {
      if (filter.query) settings.push(`legacy: ${filter.query}`);
    }

    return `
      <div class="library-item" data-id="${filter.id}">
        <div class="library-item-content">
          <div class="library-item-title">${escapeHtml(filter.name)}</div>
          ${filter.description ? `<div class="library-item-desc">${escapeHtml(filter.description)}</div>` : ''}
          <div class="filter-item-settings">
            ${settings.map(s => `<span>${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="library-item-actions">
          <button class="btn apply-filter" data-id="${filter.id}">Apply</button>
          <button class="btn ghost delete-filter" data-id="${filter.id}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners
  container.querySelectorAll('.apply-filter').forEach(btn => {
    btn.addEventListener('click', handleApplyFilter);
  });
  container.querySelectorAll('.delete-filter').forEach(btn => {
    btn.addEventListener('click', handleDeleteFilter);
  });

  // Keep the saved filter dropdown updated with latest list
  populateSavedFilterDropdown();
}

/**
 * Populate the Saved Filters <select> dropdown in Filters & Sort
 */
function populateSavedFilterDropdown() {
  const select = $('#savedFilterSelect');
  if (!select) return;
  const filters = Storage.getFilters();
  const options = ['<option value="">-- Select saved filter --</option>'];
  filters.forEach(f => options.push(`<option value="${f.id}">${escapeHtml(f.name)}</option>`));
  select.innerHTML = options.join('');
}

/**
 * Load a saved filter into the Filters & Sort UI without applying it
 * @param {Object} filter
 */
function loadFilterIntoUI(filter) {
  if (!filter) return;

  // Populate Advanced Query and sort fields
  $("#textQuery").value = filter.advancedQuery || filter.quickSearch || filter.query || '';
  $("#sort").value = filter.sort || 'id';
  $("#order").value = filter.order || 'desc';

  // If v2 format, set builder rules and render
  if (filter.version === 2) {
    currentFilterConfig = { version: 2, rules: JSON.parse(JSON.stringify(filter.rules || [])), quickSearch: filter.quickSearch || '' };
    renderBuilderUI();
    // ensure builder is visible so rules appear to the user
    const b = $("#filterBuilder");
    if (b) { b.style.display = 'block'; builderOpen = true; }
  } else {
    currentFilterConfig = null;
    renderBuilderUI();
  }
  updateFilterTag();
}

/**
 * Open extractor modal for creating/editing
 * @param {string} extractorId - Optional ID for editing existing extractor
 */
function openExtractorModal(extractorId = null) {
  const modal = $("#extractorModal");
  const title = $("#extractorModalTitle");

  if (extractorId) {
    const extractor = Storage.getExtractors().find(e => e.id === extractorId);
    if (!extractor) return;

    title.textContent = "Edit Extractor";
    $("#extractorName").value = extractor.name;
    $("#extractorPattern").value = extractor.pattern;
    $("#extractorDesc").value = extractor.description || '';
    $("#extractorEnabled").checked = extractor.enabled !== false;
    modal.dataset.editId = extractorId;
  } else {
    title.textContent = "New Extractor";
    $("#extractorName").value = '';
    $("#extractorPattern").value = '';
    $("#extractorDesc").value = '';
    $("#extractorEnabled").checked = true;
    delete modal.dataset.editId;
  }

  modal.classList.add('active');
}

/**
 * Close extractor modal
 */
function closeExtractorModal() {
  $("#extractorModal").classList.remove('active');
}

/**
 * Save extractor from modal
 */
function saveExtractorFromModal() {
  const modal = $("#extractorModal");
  const name = $("#extractorName").value.trim();
  const pattern = $("#extractorPattern").value.trim();
  const description = $("#extractorDesc").value.trim();
  const enabled = $("#extractorEnabled").checked;

  if (!name) {
    alert('Please provide a name for the extractor.');
    return;
  }

  if (!pattern) {
    alert('Please provide a regex pattern.');
    return;
  }

  // Validate regex
  try {
    new RegExp(pattern);
  } catch (e) {
    alert('Invalid regex pattern: ' + e.message);
    return;
  }

  const extractor = {
    name,
    pattern,
    description,
    enabled
  };

  if (modal.dataset.editId) {
    extractor.id = modal.dataset.editId;
  }

  Storage.saveExtractor(extractor);
  renderExtractorList();
  closeExtractorModal();
}

/**
 * Open filter modal for saving current filter
 */
function openFilterModal() {
  const modal = $("#filterModal");

  $("#filterName").value = '';
  $("#filterDesc").value = '';

  // Show current filter settings (builder + advanced)
  const preview = $("#filterPreview");
  const settings = [];
  if (currentFilterConfig && currentFilterConfig.rules && currentFilterConfig.rules.length) settings.push(`rules: ${currentFilterConfig.rules.length}`);
  const adv = $("#textQuery").value.trim();
  if (adv) settings.push(`advanced: ${escapeHtml(adv)}`);
  settings.push(`Sort: ${$("#sort").value} (${$("#order").value})`);
  preview.innerHTML = settings.join('<br>');

  modal.classList.add('active');
}

/**
 * Close filter modal
 */
function closeFilterModal() {
  $("#filterModal").classList.remove('active');
}

/**
 * Save filter from modal
 */
function saveFilterFromModal() {
  const name = $("#filterName").value.trim();
  const description = $("#filterDesc").value.trim();

  if (!name) {
    alert('Please provide a name for the filter.');
    return;
  }

  const filter = {
    name,
    description,
    version: 2,
    rules: currentFilterConfig?.rules ? JSON.parse(JSON.stringify(currentFilterConfig.rules)) : [],
    advancedQuery: $("#textQuery").value.trim(),
    sort: $("#sort").value,
    order: $("#order").value
  };

  Storage.saveFilter(filter);
  renderFilterList();
  closeFilterModal();
  updateFilterLibInfo();
}

/**
 * Handle extractor toggle (checkbox)
 */
function handleExtractorToggle(e) {
  const id = e.target.dataset.id;
  const activeIds = Storage.getActiveExtractors();

  if (e.target.checked) {
    if (!activeIds.includes(id)) {
      activeIds.push(id);
    }
  } else {
    const idx = activeIds.indexOf(id);
    if (idx >= 0) {
      activeIds.splice(idx, 1);
    }
  }

  Storage.setActiveExtractors(activeIds);
  updateExtractorInfo();
  renderPipelineList();
}

function handleTransformToggle(e) {
  const id = e.target.dataset.id;
  const activeIds = Storage.getActiveTransforms();

  if (e.target.checked) {
    if (!activeIds.includes(id)) activeIds.push(id);
  } else {
    const idx = activeIds.indexOf(id);
    if (idx >= 0) activeIds.splice(idx, 1);
  }

  Storage.setActiveTransforms(activeIds);
  updateExtractorInfo();
  renderPipelineList();
}

function handleDeleteTransform(e) {
  const id = e.target.dataset.id;
  const transform = Storage.getTransforms().find(t => t.id === id);
  if (transform && confirm(`Delete transform "${transform.name}"?`)) {
    if (editingTransformId === id) clearTransformEditState();
    Storage.deleteTransform(id);
    renderTransformationList();
    updateExtractorInfo();
  }
}

/**
 * Handle edit extractor button
 */
function handleEditExtractor(e) {
  const id = e.target.dataset.id;
  openExtractorModal(id);
}

/**
 * Handle delete extractor button
 */
function handleDeleteExtractor(e) {
  const id = e.target.dataset.id;
  const extractor = Storage.getExtractors().find(e => e.id === id);

  if (extractor && confirm(`Delete extractor "${extractor.name}"?`)) {
    Storage.deleteExtractor(id);
    renderExtractorList();
    updateExtractorInfo();
  }
}

/**
 * Handle apply filter button
 */
async function handleApplyFilter(e) {
  const id = e.target.dataset.id;
  const filter = Storage.getFilters().find(f => f.id === id);

  if (!filter) return;

  // Show progress
  $("#savedFilterProgress").style.display = 'block';
  $("#savedFilterProgressFill").style.width = '0%';
  $("#savedFilterProgressText").textContent = 'Applying saved filter...';

  // Apply saved filter settings to UI
  $("#textQuery").value = filter.advancedQuery || filter.quickSearch || filter.query || '';
  $("#sort").value = filter.sort || 'id';
  $("#order").value = filter.order || 'desc';

  // If this is a v2 filter, set as current structured filter
  if (filter.version === 2) {
    // Set the structured builder rules
    currentFilterConfig = { version: 2, rules: JSON.parse(JSON.stringify(filter.rules || [])), quickSearch: filter.quickSearch || '' };
    appliedFilterConfig = JSON.parse(JSON.stringify(currentFilterConfig));
    // Open the builder UI when applying a saved v2 filter so builder rules are visible
    const b = $("#filterBuilder");
    if (b) {
      b.style.display = 'block';
      builderOpen = true;
    }
    renderBuilderUI();
  } else {
    currentFilterConfig = null;
  }

  // Parse and set applied advanced query using the worker path for consistency
  if ($('#textQuery').value.trim()) {
    try {
      const response = await sendToWorker('PARSE_ADVANCED_QUERY', { queryText: $('#textQuery').value.trim() }, true);
      if (response.data.success) {
        appliedAdvancedQuery = response.data.result;
        $('#queryError').textContent = '';
      } else {
        appliedAdvancedQuery = null;
        $('#queryError').textContent = 'Query parse error: ' + response.data.error;
        return;
      }
    } catch (err) {
      appliedAdvancedQuery = null;
      $('#queryError').textContent = 'Query parse error: ' + err.message;
      return;
    }
  } else {
    appliedAdvancedQuery = null;
    $('#queryError').textContent = '';
  }
  applyFilters('saved-filtering');
}

/**
 * --- Query Builder: functions ---
 */
function createEmptyRule() {
  return { id: generateUUID(), field: 'level', operator: 'equals', value: '', logic: 'AND', enabled: true };
}

function addRule(rule = null) {
  currentFilterConfig = currentFilterConfig || { version: 2, rules: [], quickSearch: '' };
  const r = rule || createEmptyRule();
  // If there are existing rules, default logic from previous one remains; ensure last rule logic is null
  if (currentFilterConfig.rules.length > 0) {
    currentFilterConfig.rules[currentFilterConfig.rules.length - 1].logic = 'AND';
  }
  currentFilterConfig.rules.push(r);
  currentFilterConfig.rules[currentFilterConfig.rules.length - 1].logic = null;
  // do not apply; wait for user to press Apply
  renderPipelineList();
}

function deleteRule(id) {
  currentFilterConfig = currentFilterConfig || { version: 2, rules: [], quickSearch: '' };
  currentFilterConfig.rules = currentFilterConfig.rules.filter(r => r.id !== id);
  // Ensure logic on last rule is null
  if (currentFilterConfig.rules.length > 0) currentFilterConfig.rules[currentFilterConfig.rules.length - 1].logic = null;
  renderBuilderUI();
  renderPipelineList();
  // do not auto-apply
}

function updateRuleField(id, fieldName) {
  const r = (currentFilterConfig?.rules || []).find(rr => rr.id === id);
  if (!r) return;
  r.field = fieldName;
  // pick default operator for the field
  const sample = FieldRegistry.get(fieldName)?.samples?.[0];
  const ops = getOperatorsForField(fieldName, sample);
  r.operator = ops?.[0]?.value || 'equals';
  r.value = '';
  renderBuilderUI();
  renderPipelineList();
  // do not auto-apply
}

function updateRuleOperator(id, operator) {
  const r = (currentFilterConfig?.rules || []).find(rr => rr.id === id);
  if (!r) return;
  r.operator = operator;
  renderBuilderUI();
  renderPipelineList();
  // do not auto-apply
}

function updateRuleValue(id, value) {
  const r = (currentFilterConfig?.rules || []).find(rr => rr.id === id);
  if (!r) return;
  r.value = value;
  renderPipelineList();
  // do not auto-apply; preview updated by renderBuilderUI
}

function updateRuleLogic(id, logic) {
  const idx = (currentFilterConfig?.rules || []).findIndex(rr => rr.id === id);
  if (idx < 0) return;
  currentFilterConfig.rules[idx].logic = logic;
  renderBuilderUI();
  renderPipelineList();
  // do not auto-apply
}

function rulesToQuery(rules) {
  if (!rules || rules.length === 0) return '';
  const parts = rules.map(rule => {
    let prefix = '';
    if (['greaterThan', 'greaterOrEqual', 'lessThan', 'lessOrEqual', 'notEquals'].includes(rule.operator)) {
      const opMap = { 'greaterThan': '>', 'greaterOrEqual': '>=', 'lessThan': '<', 'lessOrEqual': '<=', 'notEquals': '!=' };
      prefix = opMap[rule.operator];
    } else if (rule.operator === 'startsWith') {
      prefix = '^';
    } else if (rule.operator === 'endsWith') {
      // We'll append suffix on value
      // keep prefix empty
    }
    let val = String(rule.value || '');
    if (rule.operator === 'endsWith') val = val + '$';
    // Quote if contains spaces
    if (val.includes(' ')) val = '"' + val + '"';
    return `${rule.field}:${prefix}${val}${rule.logic ? ' ' + rule.logic + ' ' : ''}`;
  }).join('');
  // ---------- Query Parser ----------
  // (Moved to shared.js)
}

function renderBuilderUI() {
  const cont = $("#rulesContainer");
  if (!cont) return;

  if (!currentFilterConfig) currentFilterConfig = { version: 2, rules: [], quickSearch: '' };

  if (!Array.isArray(currentFilterConfig.rules) || currentFilterConfig.rules.length === 0) {
    cont.innerHTML = '<div class="empty-state">No filter rules. Click + Add Filter Rule to get started.</div>';
    $("#builderPreview").textContent = '';
    return;
  }

  // Build HTML for rules
  const allFields = [...fieldNames].sort();
  const html = currentFilterConfig.rules.map((rule, idx) => {
    const ops = getOperatorsForField(rule.field, FieldRegistry.get(rule.field)?.samples?.[0] || '');
    return `
      <div class="filter-rule" data-rule-id="${rule.id}">
        <select class="field-select" data-rule-id="${rule.id}">` +
      ` <optgroup label="Standard Fields">` +
      ` <option value="level" ${rule.field === 'level' ? 'selected' : ''}>Level</option>` +
      ` <option value="ts" ${rule.field === 'ts' ? 'selected' : ''}>Timestamp</option>` +
      ` <option value="message" ${rule.field === 'message' ? 'selected' : ''}>Message</option>` +
      ` <option value="raw" ${rule.field === 'raw' ? 'selected' : ''}>Raw</option>` +
      ` </optgroup>` +
      (allFields.length ? ` <optgroup label="Extracted Fields">` + allFields.map(f => ` <option value="${escapeHtml(f)}" ${rule.field === f ? 'selected' : ''}>${escapeHtml(f)}</option>`).join('') + ` </optgroup>` : '') +
      `</select>
        <select class="operator-select" data-rule-id="${rule.id}">` +
      ops.map(op => `<option value="${op.value}" ${rule.operator === op.value ? 'selected' : ''}>${escapeHtml(op.label)}</option>`).join('') +
      `</select>
        ${(() => {
        const meta = FieldRegistry.get(rule.field);
        const isDate = meta?.type === 'date' || rule.field === 'ts';
        if (rule.operator === 'between' && isDate) {
          const parts = (rule.value || '').split(',');
          const start = parts[0] ? new Date(parts[0]).toISOString().slice(0, 16) : '';
          const end = parts[1] ? new Date(parts[1]).toISOString().slice(0, 16) : '';
          return `
                <input type="datetime-local" class="value-input" data-rule-id="${rule.id}" data-sub="start" value="${escapeHtml(start)}" />
                <span style="padding:0 8px; color:var(--muted);">to</span>
                <input type="datetime-local" class="value-input" data-rule-id="${rule.id}" data-sub="end" value="${escapeHtml(end)}" />
              `;
        }
        if (isDate) {
          return `<input type="datetime-local" class="value-input" data-rule-id="${rule.id}" value="${escapeHtml(rule.value ? (new Date(rule.value).toISOString().slice(0, 16)) : '')}" placeholder="Enter date/time" />`;
        }
        return `<input class="value-input" data-rule-id="${rule.id}" value="${escapeHtml(rule.value || '')}" placeholder="Enter value..." list="values-${rule.id}" />`;
      })()
      }
        <datalist id="values-${rule.id}">
          ${FieldRegistry.getUniqueValues(rule.field, 50).map(val => `<option value="${escapeHtml(val)}">`).join('')}
        </datalist>
        <button class="delete-rule" data-rule-id="${rule.id}">×</button>
      </div>
      ${(idx !== currentFilterConfig.rules.length - 1) ? `
        <div class="logic-selector">
          <label><input type="radio" name="logic-${rule.id}" value="AND" ${rule.logic === 'AND' ? 'checked' : ''} data-rule-id="${rule.id}" class="logic-input"> AND</label>
          <label><input type="radio" name="logic-${rule.id}" value="OR" ${rule.logic === 'OR' ? 'checked' : ''} data-rule-id="${rule.id}" class="logic-input"> OR</label>
        </div>
      ` : ''}
    `;
  }).join('');

  cont.innerHTML = html;

  // Attach listeners
  cont.querySelectorAll('.field-select').forEach(sel => {
    sel.addEventListener('change', (e) => updateRuleField(e.target.dataset.ruleId, e.target.value));
  });
  cont.querySelectorAll('.operator-select').forEach(sel => {
    sel.addEventListener('change', (e) => updateRuleOperator(e.target.dataset.ruleId, e.target.value));
  });
  cont.querySelectorAll('.value-input').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const id = e.target.dataset.ruleId;
      const sub = e.target.dataset.sub; // for between start/end
      const val = e.target.value;

      if (sub) {
        // pair input - find both values and combine as CSV of ISO strings
        const startEl = cont.querySelector(`.value-input[data-rule-id="${id}"][data-sub="start"]`);
        const endEl = cont.querySelector(`.value-input[data-rule-id="${id}"][data-sub="end"]`);
        const startVal = startEl?.value ? new Date(startEl.value).toISOString() : '';
        const endVal = endEl?.value ? new Date(endEl.value).toISOString() : '';
        const combined = [startVal, endVal].filter(Boolean).join(',');
        updateRuleValue(id, combined);
        return;
      }

      if (e.target.type === 'datetime-local') {
        if (!val) updateRuleValue(id, '');
        else updateRuleValue(id, new Date(val).toISOString());
      } else {
        updateRuleValue(id, val);
      }
    });
  });
  cont.querySelectorAll('.delete-rule').forEach(btn => {
    btn.addEventListener('click', (e) => { deleteRule(e.target.dataset.ruleId); });
  });
  cont.querySelectorAll('.logic-input').forEach(inp => {
    inp.addEventListener('change', (e) => updateRuleLogic(e.target.dataset.ruleId, e.target.value));
  });

  // Update preview (show generated query only; remove 'Generated:' prefix per request)
  const preview = rulesToQuery(currentFilterConfig.rules);
  $("#builderPreview").textContent = preview ? preview : '';

  // Keep advanced query separate — do not update textQuery from builder
}

/**
 * Handle delete filter button
 */
function handleDeleteFilter(e) {
  const id = e.target.dataset.id;
  const filter = Storage.getFilters().find(f => f.id === id);

  if (filter && confirm(`Delete filter "${filter.name}"?`)) {
    Storage.deleteFilter(id);
    renderFilterList();
    updateFilterLibInfo();
  }
}

/**
 * Update extractor info display
 */
function updateExtractorInfo() {
  const activeIds = Storage.getActiveExtractors();
  const activeTransformIds = Storage.getActiveTransforms();
  const totalExtractors = Storage.getExtractors().length;
  const totalTransforms = Storage.getTransforms().length;
  $("#extractInfo").textContent = `${activeIds.length}/${totalExtractors} extractors · ${activeTransformIds.length}/${totalTransforms} transforms active`;
}

/**
 * Update filter library info
 */
function updateFilterLibInfo() {
  const totalFilters = Storage.getFilters().length;
  $("#filterLibInfo").textContent = `${totalFilters} saved`;
  populateSavedFilterDropdown();
}

/**
 * Initialize collapsible sections (legacy - kept for backwards compatibility)
 */
function initializeCollapsibles() {
  document.querySelectorAll('.collapsible-header').forEach(header => {
    header.addEventListener('click', () => {
      header.classList.toggle('collapsed');
      const content = header.nextElementSibling;
      if (content && content.classList.contains('collapsible-content')) {
        content.classList.toggle('collapsed');
      }
    });
  });
}

// ---------- Sidebar & Accordion Navigation ----------

/**
 * Navigate to a specific section
 * @param {string} sectionId - ID of section to navigate to
 */
function navigateToSection(sectionId, tab) {
  // Get all sections except always-visible ones
  const sections = document.querySelectorAll('.section-card:not(.always-visible)');
  const targetSection = document.getElementById(`section-${sectionId}`);

  if (!targetSection) return;

  // Collapse all sections except the target
  sections.forEach(section => {
    if (section.id === `section-${sectionId}`) {
      section.classList.add('active');
    } else {
      section.classList.remove('active');
    }
  });

  // No sidebar nav links to toggle — sections are navigable via headers and Search Tools

  // Scroll to top of page so the expanded section is fully visible
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Sidebar removed — no-op
}

/**
 * Toggle accordion section
 * @param {HTMLElement} header - Section header element
 */
function toggleSection(header) {
  const section = header.closest('.section-card');

  // Don't toggle always-visible sections
  if (section.classList.contains('always-visible')) {
    return;
  }

  const sectionId = section.dataset.section;

  if (section.classList.contains('active')) {
    // Collapse current section
    section.classList.remove('active');
  } else {
    // Navigate to this section (will collapse others)
    // If user is opening the Search Tools collapsible, default to Filters tab
    if (sectionId === 'search') {
      navigateToSection(sectionId, 'filters');
    } else {
      navigateToSection(sectionId);
    }
  }
}

/**
 * Initialize sidebar navigation
 */
// Sidebar removed — initializeSidebar is no longer needed; section headers now trigger toggles via initializeEventHandlers

/**
 * Show a specific tab inside the Search Tools collapsible
 * @param {string} tab - 'filters' | 'extractors' | 'transforms' | 'columns'
 */
function showSearchTab(tab) {
  const t = tab || 'filters';
  const allBtns = document.querySelectorAll('.tab-btn');
  allBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === t));

  const panels = document.querySelectorAll('.tab-panel');
  panels.forEach(p => p.style.display = (p.id === 'tab-' + t) ? '' : 'none');
}

/**
 * Toggle mobile sidebar visibility
 */
// Sidebar toggling/close functions removed — no mobile sidebar exists

// ---------- Event Handlers ----------

/**
 * Initialize all event listeners when DOM is ready
 */
function initializeEventHandlers() {
  // Filter controls
  ["sort", "order"].forEach(id =>
    $("#" + id).addEventListener('change', applyFilters)
  );

  // Page size dropdown - update per variable and apply filters
  $("#per").addEventListener('change', () => {
    per = +$("#per").value;
    page = 1; // Reset to first page when changing page size
    applyFilters();
  });

  // Also ensure changing filter inputs will cancel any active v2 structured filter (unless builder is open)
  ["sort", "order"].forEach(id => {
    const el = $("#" + id);
    if (!el) return;
    el.addEventListener('input', () => { if (!builderOpen) currentFilterConfig = null; });
  });

  // Pipeline run button
  const runPipelineBtn = $("#runPipelineBtn");
  if (runPipelineBtn) {
    runPipelineBtn.addEventListener('click', (e) => {
      e.preventDefault();
      runPipeline();
    });
  }

  // Builder always visible (no toggle)

  // Builder buttons
  $("#addFilterRule").addEventListener('click', () => {
    addRule();
    renderBuilderUI();
    // Do not auto-apply builder changes; require Apply
  });

  $("#clearFilterRules").addEventListener('click', () => {
    currentFilterConfig = currentFilterConfig || { version: 2, rules: [], quickSearch: '' };
    currentFilterConfig.rules = [];
    renderBuilderUI();
    // Clearing builder does not auto-apply unless user presses Apply
  });

  // Builder is always visible and primary
  const b = $("#filterBuilder");
  if (b) {
    b.style.display = 'block';
    builderOpen = true;
    renderBuilderUI();
  }

  // Text Query input parsing (two-way sync)
  const textQueryInput = $("#textQuery");
  if (textQueryInput) {
    let parseTimer = null;
    textQueryInput.addEventListener('input', (e) => {
      // Clear previous validation timeout
      clearTimeout(parseTimer);
      // For now, just clear any previous error - full validation happens on Apply
      parseTimer = setTimeout(() => {
        $('#queryError').textContent = '';
      }, 200);
      renderPipelineList();
    });

    // Clickable field name suggestions
    renderQueryFields();
  }

  // Section header toggle behavior (search, filters, upload, etc.) — now bound without a sidebar
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => toggleSection(header));
  });

  $("#clear").addEventListener('click', e => {
    e.preventDefault();
    // Clear advanced query and builder; remove applied filter state as well
    $("#textQuery").value = '';
    currentFilterConfig = null;
    appliedFilterConfig = null;
    appliedAdvancedQuery = null;
    applyFilters();
  });

  // Pagination
  $("#first").addEventListener('click', () => {
    if (page > 1) {
      page = 1;
      render();
    }
  });

  $("#prev").addEventListener('click', () => {
    if (page > 1) {
      page--;
      render();
    }
  });

  $("#next").addEventListener('click', () => {
    const max = Math.max(1, Math.ceil(totalRows / per));
    if (page < max) {
      page++;
      render();
    }
  });

  $("#last").addEventListener('click', () => {
    const max = Math.max(1, Math.ceil(totalRows / per));
    if (page < max) {
      page = max;
      render();
    }
  });

  // Extractor
  $("#runExtract").addEventListener('click', runExtractor);

  // Export/Import
  $("#exportJSON").addEventListener('click', exportJSON);
  $("#exportCSV").addEventListener('click', exportCSV);
  $("#exportLibrary").addEventListener('click', exportLibrary);
  $("#importLibrary").addEventListener('click', () => $("#importFile").click());
  $("#importFile").addEventListener('change', e => {
    const f = e.target.files?.[0];
    if (f) importLibrary(f);
    e.target.value = ''; // Reset input
  });

  // File handling
  const drop = $("#drop");
  const fileInput = $("#file");
  const pick = $("#pick");

  // Drag & drop events
  ['dragenter', 'dragover'].forEach(ev =>
    drop.addEventListener(ev, e => {
      e.preventDefault();
      drop.classList.add('drag');
    })
  );

  ['dragleave', 'drop'].forEach(ev =>
    drop.addEventListener(ev, e => {
      e.preventDefault();
      drop.classList.remove('drag');
    })
  );

  drop.addEventListener('drop', e => {
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  });

  pick.addEventListener('click', e => {
    e.preventDefault();
    fileInput.click();
  });

  fileInput.addEventListener('change', e => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = ''; // Reset input to allow re-selecting same file
  });

  /**
   * Handle file selection and read content in chunks
   * @param {File} file - Selected file
   */
  function handleFile(file) {
    // Reset state
    $("#fileTag").textContent = file.name;
    $("#uploadProgress").style.display = 'block';
    $("#uploadProgressFill").style.width = '0%';
    $("#uploadProgressText").textContent = 'Starting upload...';

    // Reset worker state
    sendToWorker('PARSE_START');

    const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
    const fileSize = file.size;
    let offset = 0;

    // Determine format
    let format = 'log';
    if (file.name.endsWith('.json')) format = 'json';
    else if (file.name.endsWith('.csv')) format = 'csv';
    else if (file.name.endsWith('.ndjson')) format = 'ndjson';

    function readNextChunk() {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      const reader = new FileReader();

      reader.onload = (e) => {
        const chunk = e.target.result;
        offset += chunk.length;

        // Update progress
        const percent = Math.round((offset / fileSize) * 100);
        $("#uploadProgressFill").style.width = percent + '%';
        $("#uploadProgressText").textContent = `Reading ${fmt(offset)} / ${fmt(fileSize)} bytes...`;

        // Send chunk to worker
        sendToWorker('PARSE_CHUNK', { chunk, format });

        if (offset < fileSize) {
          // Read next chunk
          // Use setTimeout to allow UI to update
          setTimeout(readNextChunk, 0);
        } else {
          // Done reading
          $("#uploadProgressText").textContent = 'Finalizing...';
          sendToWorker('PARSE_END', { format });
        }
      };

      reader.onerror = (e) => {
        console.error('File read error:', e);
        alert('Error reading file');
        $("#uploadProgress").style.display = 'none';
      };

      reader.readAsText(slice);
    }

    // Start reading
    readNextChunk();
  }

  // Extractor library
  $("#addExtractor").addEventListener('click', () => openExtractorModal());
  const runActiveExtractorsBtn = $("#runActiveExtractors");
  if (runActiveExtractorsBtn) runActiveExtractorsBtn.addEventListener('click', runActiveExtractors);
  $("#closeExtractorModal").addEventListener('click', closeExtractorModal);
  $("#cancelExtractor").addEventListener('click', closeExtractorModal);
  $("#saveExtractor").addEventListener('click', saveExtractorFromModal);

  // Filter library
  $("#saveCurrentFilter").addEventListener('click', openFilterModal);
  $("#closeFilterModal").addEventListener('click', closeFilterModal);
  $("#cancelFilter").addEventListener('click', closeFilterModal);
  $("#saveFilter").addEventListener('click', saveFilterFromModal);

  // Close modals on background click
  $("#extractorModal").addEventListener('click', e => {
    if (e.target.id === 'extractorModal') closeExtractorModal();
  });
  $("#filterModal").addEventListener('click', e => {
    if (e.target.id === 'filterModal') closeFilterModal();
  });

  // Keyboard shortcuts for modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($("#extractorModal").classList.contains('active')) {
        closeExtractorModal();
      }
      if ($("#filterModal").classList.contains('active')) {
        closeFilterModal();
      }
    }
  });

  // Settings - Merge Strategy
  $("#mergeStrategy").addEventListener('change', e => {
    const prefs = Storage.getPrefs();
    prefs.extractorMergeStrategy = e.target.value;
    Storage.savePrefs(prefs);
  });

  const addTransformBtn = $("#addTransform");
  if (addTransformBtn) {
    addTransformBtn.addEventListener('click', addTransformationFromInputs);
  }

  const cancelTransformEditBtn = $("#cancelTransformEdit");
  if (cancelTransformEditBtn) {
    cancelTransformEditBtn.addEventListener('click', () => {
      clearTransformEditState();
      if ($("#transformName")) $("#transformName").value = '';
      if ($("#transformSource")) $("#transformSource").value = '';
      if ($("#transformTarget")) $("#transformTarget").value = '';
      if ($("#transformOption")) $("#transformOption").value = '';
      if ($("#transformOp")) $("#transformOp").value = 'json-parse';
    });
  }

  const unsafeToggle = $("#unsafeJsTransforms");
  if (unsafeToggle) {
    unsafeToggle.addEventListener('change', e => {
      const prefs = Storage.getPrefs();
      prefs.unsafeJsTransforms = !!e.target.checked;
      Storage.savePrefs(prefs);
    });
  }

  // Saved Filters dropdown actions
  const sfSelect = $('#savedFilterSelect');
  if (sfSelect) {
    sfSelect.addEventListener('change', (e) => {
      // Selecting does not auto-apply — it only populates the Filters & Sort fields
      const id = e.target.value;
      const filter = Storage.getFilters().find(f => f.id === id);
      if (filter) loadFilterIntoUI(filter);
    });
  }

  const loadSavedFilterBtn = $('#loadSavedFilter');
  if (loadSavedFilterBtn) loadSavedFilterBtn.addEventListener('click', () => {
    const id = $('#savedFilterSelect').value;
    const filter = Storage.getFilters().find(f => f.id === id);
    if (filter) loadFilterIntoUI(filter);
  });

  const applySavedFilterBtn = $('#applySavedFilter');
  if (applySavedFilterBtn) applySavedFilterBtn.addEventListener('click', async () => {
    const id = $('#savedFilterSelect').value;
    const filter = Storage.getFilters().find(f => f.id === id);
    if (filter) {
      loadFilterIntoUI(filter);
      // parse advanced query and apply
      if ($('#textQuery').value.trim()) {
        try {
          const response = await sendToWorker('PARSE_ADVANCED_QUERY', { queryText: $('#textQuery').value.trim() }, true);
          if (response.data.success) {
            appliedAdvancedQuery = response.data.result;
            $('#queryError').textContent = '';
          } else {
            appliedAdvancedQuery = null;
            $('#queryError').textContent = 'Query parse error: ' + response.data.error;
            return;
          }
        } catch (err) {
          appliedAdvancedQuery = null;
          $('#queryError').textContent = 'Query parse error: ' + err.message;
          return;
        }
      } else {
        appliedAdvancedQuery = null;
      }
      // mark filter as applied
      appliedFilterConfig = currentFilterConfig ? JSON.parse(JSON.stringify(currentFilterConfig)) : null;
      applyFilters('saved-filtering');
    }
  });

  // Initialize UI
  // Clean up active extractors on load (remove deleted/invalid IDs)
  const activeIds = Storage.getActiveExtractors();
  Storage.setActiveExtractors(activeIds); // This will dedupe and validate
  const activeTransformIds = Storage.getActiveTransforms();
  Storage.setActiveTransforms(activeTransformIds);
  // Migrate any old v1 filters to v2 format on startup
  migrateAllFilters();
  renderExtractorList();
  renderTransformationList();
  renderFilterList();
  updateExtractorInfo();
  updateFilterLibInfo();
  // Set timezone label and info
  const info = $('#tzInfo');
  if (info) info.textContent = `Timestamps are displayed in your local timezone (${userTimeZone}). Naive timestamps are treated as local; UTC/Zulu timestamps are converted to your timezone.`;
  initializeCollapsibles();
  initializeSettings();
  // Initialize columns visibility from prefs and render the Columns panel
  initializeVisibleColumnsFromPrefs();
  initializeColumnOrderFromPrefs();
  renderColumnsPanel();
  // Sidebar removed — use section header clicks and Search Tools tabs for navigation
  // Move previously top-level Help/Filters/Extractors into the Search Tools tabbed panel
  moveSearchContentIntoTabs();
}

// ---------- Summary Stats Event Listener ----------

$("#summary-details").addEventListener('toggle', () => {
  if ($("#summary-details").open) {
    computeSummaryStats();
  }
});

/**
 * Move the content of existing top-level sections into tab panels and remove originals
 */
function moveSearchContentIntoTabs() {
  const names = ['filters', 'extractors', 'transforms'];
  names.forEach(name => {
    const old = document.getElementById(`section-${name}`);
    const panel = document.getElementById(`tab-${name}`);
    if (old && panel) {
      const content = old.querySelector('.section-content');
      if (content) {
        const contentBody = content.firstElementChild || content;
        // Move the existing DOM node so event listeners are preserved.
        panel.appendChild(contentBody);
      }
      // Remove the old section node so it's not duplicated (content already moved)
      if (old.parentNode) old.parentNode.removeChild(old);
    }
  });

  // Init tab button behaviors
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = e.currentTarget.dataset.tab;
      showSearchTab(t);
    });
  });

  // Default to Filters tab
  showSearchTab('filters');
}

// ---------- Settings ----------

/**
 * Initialize settings UI from saved preferences
 */
function initializeSettings() {
  const prefs = Storage.getPrefs();
  const mergeStrategySelect = $("#mergeStrategy");
  if (mergeStrategySelect) {
    mergeStrategySelect.value = prefs.extractorMergeStrategy || 'last-wins';
  }

  const unsafeToggle = $("#unsafeJsTransforms");
  if (unsafeToggle) {
    unsafeToggle.checked = !!prefs.unsafeJsTransforms;
  }

  // Initialize page size from preferences
  per = prefs.defaultPageSize || 50;
  const perSelect = $("#per");
  if (perSelect) {
    perSelect.value = per;
  }
}

// ---------- Theme Toggle ----------

/**
 * Initialize theme based on saved preference or system preference
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('logsieve-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Use saved theme, or fall back to system preference (default to light)
  const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;

  setTheme(isDark ? 'dark' : 'light');
}

/**
 * Set the theme and update UI
 * @param {string} theme - 'light' or 'dark'
 */
function setTheme(theme) {
  const root = document.documentElement;
  const themeIcon = $('#themeToggle .theme-icon');

  if (theme === 'light') {
    root.classList.remove('dark-theme');
    themeIcon.textContent = '☀️';
  } else {
    root.classList.add('dark-theme');
    themeIcon.textContent = '🌙';
  }

  // Save preference
  localStorage.setItem('logsieve-theme', theme);
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
  const isDark = document.documentElement.classList.contains('dark-theme');
  setTheme(isDark ? 'light' : 'dark');
}

/**
 * Initialize theme toggle functionality
 */
function initializeThemeToggle() {
  const themeToggle = $('#themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Initialize theme on page load
  initializeTheme();
}

// ---------- Dropdowns ----------

/**
 * Toggle dropdown menu visibility
 */
function toggleDropdown(menuId) {
  const menu = $(menuId);
  if (menu) {
    const isVisible = menu.classList.contains('show');
    // Close all dropdowns first
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('show'));
    // Toggle this one
    if (!isVisible) {
      menu.classList.add('show');
    }
  }
}

/**
 * Close all dropdowns when clicking outside
 */
function closeDropdowns(e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('show'));
  }
}

// ---------- Results Table: Right-click "Search for / Exclude" ----------

/**
 * Show a brief toast confirming a filter was added from the results table.
 */
function showResultsToast(message) {
  let toast = document.getElementById('resultsToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'resultsToast';
    toast.className = 'results-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showResultsToast._t);
  showResultsToast._t = setTimeout(() => toast.classList.remove('show'), 2500);
}

/**
 * Decide which field/operator pair to filter on for a given column + selected value.
 * Falls back to a raw-line text search when the column's detected type has no
 * contains/notContains operator (e.g. ts -> date, extracted numeric fields).
 */
function resolveContextFilterRule(col, value, exclude) {
  // Level's builder UI only exposes equals/notEquals (it's an enum-like field),
  // so match that instead of contains to keep the Filters tab dropdown accurate.
  if (col === 'level') {
    return { field: 'level', operator: exclude ? 'notEquals' : 'equals', value };
  }
  const meta = FieldRegistry.get(col);
  const fieldType = meta?.type || 'text';
  const supportsContains = (OPERATORS[fieldType] || OPERATORS.text).some(op => op.value === (exclude ? 'notContains' : 'contains'));
  if (supportsContains) {
    return { field: col, operator: exclude ? 'notContains' : 'contains', value };
  }
  // Fall back to searching the raw log line, which will contain the displayed text.
  return { field: 'raw', operator: exclude ? 'notContains' : 'contains', value };
}

/**
 * Wire up a right-click context menu on the Results table so users can
 * highlight a value and quickly "Search for" or "Exclude" it, without
 * needing to know the Filters/Builder UI.
 */
function initializeResultsContextMenu() {
  const tbody = $('#tbody');
  if (!tbody) return;

  let menu = document.getElementById('resultsContextMenu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'resultsContextMenu';
    menu.className = 'context-menu';
    document.body.appendChild(menu);
  }

  function hideMenu() { menu.classList.remove('show'); }

  tbody.addEventListener('contextmenu', (e) => {
    const cell = e.target.closest('td[data-col]');
    if (!cell) return;
    const col = cell.dataset.col;
    if (!col) return;

    const selection = window.getSelection();
    let text = '';
    if (selection && !selection.isCollapsed && cell.contains(selection.anchorNode)) {
      text = selection.toString().trim();
    }
    if (!text) text = (cell.textContent || '').trim();
    if (!text) return;

    e.preventDefault();

    const displayText = text.length > 60 ? text.slice(0, 57) + '…' : text;
    const fieldLabel = col === 'message' ? 'Message' : col === 'raw' ? 'Raw' : col === 'ts' ? 'Timestamp' : col;

    menu.innerHTML = `
      <button type="button" data-action="search">Search for &ldquo;${escapeHtml(displayText)}&rdquo;</button>
      <button type="button" data-action="exclude">Exclude &ldquo;${escapeHtml(displayText)}&rdquo;</button>
    `;

    const menuWidth = 240;
    const left = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${e.clientY}px`;
    menu.classList.add('show');

    menu.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const exclude = btn.dataset.action === 'exclude';
        const { field, operator, value } = resolveContextFilterRule(col, text, exclude);
        addRule({
          id: generateUUID(),
          field,
          operator,
          value,
          logic: null,
          enabled: true
        });
        renderBuilderUI();
        applyFilters();
        const opLabel = { contains: 'contains', notContains: 'does not contain', equals: 'is', notEquals: 'is not' }[operator] || operator;
        showResultsToast(`Filter added: ${field} ${opLabel} "${displayText}"`);
        hideMenu();
      }, { once: true });
    });
  });

  document.addEventListener('click', hideMenu);
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('td[data-col]')) hideMenu();
  });
  document.addEventListener('scroll', hideMenu, true);
  window.addEventListener('resize', hideMenu);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideMenu(); });
}

/**
 * Initialize dropdown functionality
 */
function initializeDropdowns() {
  // Links dropdown
  const linksDropdown = $('#linksDropdown');
  if (linksDropdown) {
    linksDropdown.addEventListener('click', () => toggleDropdown('#linksMenu'));
  }

  // Tools dropdown
  const toolsDropdown = $('#toolsDropdown');
  if (toolsDropdown) {
    toolsDropdown.addEventListener('click', () => toggleDropdown('#toolsMenu'));
  }

  // Submenu toggles
  document.querySelectorAll('.dropdown-submenu-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent closing parent menu
      const submenu = toggle.nextElementSibling;
      if (submenu) {
        submenu.classList.toggle('show');
      }
    });
    // Also open on hover
    toggle.addEventListener('mouseenter', () => {
      const submenu = toggle.nextElementSibling;
      if (submenu) {
        submenu.classList.add('show');
      }
    });
  });

  // Close submenus when leaving the submenu area
  document.querySelectorAll('.dropdown-submenu').forEach(submenu => {
    submenu.addEventListener('mouseleave', () => {
      const menu = submenu.querySelector('.dropdown-menu');
      if (menu) {
        menu.classList.remove('show');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', closeDropdowns);
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initWorker();
    initializeEventHandlers();
    initializeThemeToggle();
    initializeDropdowns();
    initializeResultsContextMenu();
  });
} else {
  initWorker();
  initializeEventHandlers();
  initializeThemeToggle();
  initializeDropdowns();
  initializeResultsContextMenu();
}

// ---------- Summary Stats ----------

function computeSummaryStats() {
  $("#summary-progress").style.display = 'block';
  $("#summary-results").innerHTML = '';
  sendToWorker('COMPUTE_SUMMARY_STATS', {}, true).then(response => {
    renderSummaryStats(response.data);
  });
}

function renderSummaryStats(stats) {
  const container = $("#summary-results");
  let html = '';
  for (const [fieldName, fieldStats] of Object.entries(stats)) {
    html += `<div class="field-summary" style="margin-bottom:15px; padding:10px; border:1px solid var(--border); border-radius:4px;">`;
    html += `<h4 style="margin:0 0 8px 0">${escapeHtml(fieldName)} (${fieldStats.type})</h4>`;
    html += `<p style="margin:4px 0">With value: ${fmt(fieldStats.withValue)}, Without: ${fmt(fieldStats.withoutValue)}, Unique: ${fmt(fieldStats.unique)}</p>`;
    if (fieldStats.type === 'numeric' && fieldStats.min !== undefined) {
      html += `<p style="margin:4px 0">Min: ${fieldStats.min.toFixed(2)}, Max: ${fieldStats.max.toFixed(2)}, Mean: ${fieldStats.mean.toFixed(2)}, Median: ${fieldStats.median.toFixed(2)}, Mode: ${fieldStats.mode !== null ? fieldStats.mode.toFixed(2) : 'N/A'}</p>`;
    } else if (fieldStats.type === 'date' && fieldStats.earliest) {
      html += `<p style="margin:4px 0">Earliest: ${formatLocalDatetime(fieldStats.earliest)}, Latest: ${formatLocalDatetime(fieldStats.latest)}</p>`;
    } else if (fieldStats.type === 'text' && fieldStats.minLen !== undefined) {
      html += `<p style="margin:4px 0">Min len: ${fieldStats.minLen}, Max len: ${fieldStats.maxLen}, Avg len: ${fieldStats.avgLen.toFixed(1)}</p>`;
      if (fieldStats.mostCommon && fieldStats.mostCommon.length) {
        html += `<p style="margin:4px 0">Most common: ${fieldStats.mostCommon.map(mc => `${escapeHtml(mc.val)} (${mc.count})`).join(', ')}</p>`;
      }
    } else if (fieldStats.type === 'array') {
      html += `<p style="margin:4px 0">Type: array</p>`;
    }
    html += `</div>`;
  }
  container.innerHTML = html;
  $("#summary-progress").style.display = 'none';
}

// Clean overrides for column sorting. These supersede the legacy implementations above.
function getSortArrow(sortValue, currentSort, currentOrder) {
  if (sortValue !== currentSort) return '';
  return currentOrder === 'asc' ? ' ^' : ' v';
}

function handleSortHeaderClick(sortValue) {
  const sortSelect = $("#sort");
  const orderSelect = $("#order");
  if (!sortSelect || !orderSelect) return;

  if (![...sortSelect.options].some(opt => opt.value === sortValue)) {
    updateSortOptions();
  }
  if (![...sortSelect.options].some(opt => opt.value === sortValue)) {
    const label = sortValue.startsWith('field:') ? sortValue.slice(6) : sortValue;
    sortSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(sortValue)}">${escapeHtml(label)}</option>`);
  }

  const currentSort = sortSelect.value;
  const currentOrder = orderSelect.value;
  const nextOrder = currentSort === sortValue && currentOrder === 'asc' ? 'desc' : 'asc';

  sortSelect.value = sortValue;
  orderSelect.value = nextOrder;
  if (sortValue === 'id') sortByIdOrder = nextOrder;
  applyFilters();
}

function updateSortOptions() {
  const sortSelect = $("#sort");
  const currentValue = sortSelect.value;
  const sortedFields = [...fieldNames].sort();

  sortSelect.innerHTML = `
    <option value="id">ID</option>
    <option value="ts">Timestamp</option>
    <option value="level">Level</option>
    <option value="message">Message</option>
    ${sortedFields.map(f => `<option value="field:${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('')}
  `;

  if ([...sortSelect.options].some(opt => opt.value === currentValue)) {
    sortSelect.value = currentValue;
  }

  mergeNewFieldsIntoOrder();
  renderColumnsPanel();
}

function renderPage(pageData) {
  const t0 = performance.now();
  const body = $("#tbody");
  const theadRow = $("#thead-row");
  body.innerHTML = "";

  const order = getCurrentColumnOrder();
  const displayedCols = order.filter(c => isColumnVisible(c));
  const currentSort = $("#sort")?.value || 'id';
  const currentOrder = $("#order")?.value || 'desc';
  if (currentSort === 'id') sortByIdOrder = currentOrder;

  const headerHtml = displayedCols.map(col => {
    const sortValue = getSortValueForColumn(col);
    const arrow = getSortArrow(sortValue, currentSort, currentOrder);
    const sortAttr = escapeHtml(sortValue);

    if (col === 'id') {
      return `<th style="width:72px; cursor:pointer" class="sortable-header" data-sort-value="id" data-col="id">ID${arrow}</th>`;
    }
    if (col === 'ts') {
      return `<th style="width:210px; cursor:pointer" class="sortable-header" data-sort-value="${sortAttr}" data-col="ts">Timestamp${arrow} <br/>(<span id="tzLabel">${escapeHtml(userTimeZone)}</span>)</th>`;
    }
    if (col === 'level') {
      return `<th style="width:120px; cursor:pointer" class="sortable-header" data-sort-value="${sortAttr}" data-col="level">Level${arrow}</th>`;
    }
    if (col === 'message') {
      return `<th style="max-width:80ch; cursor:pointer" class="sortable-header" data-sort-value="${sortAttr}" data-col="message">Message${arrow}</th>`;
    }
    return `<th style="width:150px; cursor:pointer" class="sortable-header" data-sort-value="${sortAttr}" data-col="${escapeHtml(col)}">${escapeHtml(col)}${arrow}</th>`;
  }).join('');

  theadRow.innerHTML = headerHtml;
  theadRow.querySelectorAll('.sortable-header').forEach(header => {
    header.addEventListener('click', () => {
      const sortValue = header.dataset.sortValue;
      if (!sortValue) return;
      handleSortHeaderClick(sortValue);
    });
  });

  const pageRows = pageData.pageRows;
  const frag = document.createDocumentFragment();

  for (const r of pageRows) {
    const tr = document.createElement('tr');
    const cellsHtml = displayedCols.map(col => {
      const colAttr = `data-col="${escapeHtml(col)}"`;
      if (col === 'id') return `<td ${colAttr}>${escapeText(r.id)}</td>`;
      if (col === 'ts') return `<td ${colAttr}>${escapeText(formatLocalDatetime(r.ts))}</td>`;
      if (col === 'level') return `<td ${colAttr}><span class="lvl-${escapeText(r.level)}">${escapeText(r.level)}</span></td>`;
      if (col === 'message') return `<td ${colAttr}><pre>${escapeHtml(r.message)}</pre><details><summary>raw</summary><pre>${escapeHtml(r.raw)}</pre></details></td>`;

      const val = r.fields?.[col];
      if (val === undefined || val === null) return `<td ${colAttr}></td>`;
      if (Array.isArray(val)) {
        if (val.length === 1) return `<td ${colAttr}>${escapeHtml(val[0])}</td>`;
        return `<td ${colAttr}><code>${escapeHtml(JSON.stringify(val))}</code></td>`;
      }
      return `<td ${colAttr}>${escapeHtml(String(val))}</td>`;
    }).join('');

    tr.innerHTML = cellsHtml;
    frag.appendChild(tr);
  }

  body.appendChild(frag);
  $("#pageLabel").textContent = `${pageData.currentPage} / ${pageData.totalPages}`;
  $("#renderInfo").textContent = `${fmt(pageData.totalRows)} rows - showing ${fmt(pageRows.length)} - ${Math.round(performance.now() - t0)}ms`;
  $("#countTag").textContent = `${fmt(pageData.totalRows)} lines`;

  totalRows = pageData.totalRows;
  sendToWorker('GET_STATS');
}
