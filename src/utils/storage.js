/**
 * storage.js — Money Tracker localStorage Persistence Layer
 *
 * Keys: mmt__sources | mmt__transactions
 * All functions return plain data — no side effects beyond localStorage.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

export const KEYS = {
  SOURCES: 'mmt__sources',
  TRANSACTIONS: 'mmt__transactions',
};

const VALID_SOURCE_IDS = ['src_ewallet', 'src_visa', 'src_cash'];

// ─── Default Data ─────────────────────────────────────────────────────────────

function buildDefaultSources() {
  const now = new Date().toISOString();
  return [
    { id: 'src_ewallet', nameAr: 'محفظة إلكترونية', icon: 'ewallet', balance: 0, createdAt: now },
    { id: 'src_visa',    nameAr: 'فيزا',             icon: 'visa',    balance: 0, createdAt: now },
    { id: 'src_cash',    nameAr: 'نقدي',             icon: 'cash',    balance: 0, createdAt: now },
  ];
}

// ─── Storage Availability Check ───────────────────────────────────────────────

function isStorageAvailable() {
  try {
    const probe = '__mmt_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

// ─── Source Sanitizer ─────────────────────────────────────────────────────────

/**
 * Ensures parsed sources are valid.
 * - Resets NaN balances to 0
 * - Keeps only known source IDs (guards against schema drift)
 */
function sanitizeSources(parsed) {
  const defaults = buildDefaultSources();

  return defaults.map((def) => {
    const found = Array.isArray(parsed)
      ? parsed.find((s) => s.id === def.id)
      : null;

    if (!found) return def;

    return {
      ...def,
      balance: typeof found.balance === 'number' && !isNaN(found.balance)
        ? found.balance
        : 0,
    };
  });
}

// ─── Transaction Sanitizer ────────────────────────────────────────────────────

/**
 * Filters out transactions with:
 * - missing/invalid sourceId
 * - non-positive amount
 * - missing required fields
 */
function sanitizeTransactions(parsed, validSourceIds) {
  if (!Array.isArray(parsed)) return [];

  return parsed.filter((t) => {
    return (
      t &&
      typeof t.id === 'string' &&
      typeof t.title === 'string' && t.title.trim().length > 0 &&
      typeof t.amount === 'number' && t.amount > 0 &&
      (t.type === 'income' || t.type === 'expense') &&
      typeof t.sourceId === 'string' && validSourceIds.includes(t.sourceId) &&
      typeof t.date === 'string' &&
      typeof t.createdAt === 'string'
    );
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * getData()
 *
 * Loads sources + transactions from localStorage.
 * Returns defaults if keys are missing.
 * Returns in-memory defaults and sets storageError=true if localStorage fails.
 *
 * @returns {{ sources: Source[], transactions: Transaction[], storageError: boolean }}
 */
export function getData() {
  const available = isStorageAvailable();

  if (!available) {
    return {
      sources: buildDefaultSources(),
      transactions: [],
      storageError: true,
    };
  }

  let sources = null;
  let transactions = null;
  let storageError = false;

  // Load sources
  try {
    const raw = localStorage.getItem(KEYS.SOURCES);
    if (raw !== null) {
      sources = sanitizeSources(JSON.parse(raw));
    }
  } catch {
    storageError = true;
  }

  // Load transactions
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    if (raw !== null) {
      const validIds = (sources || buildDefaultSources()).map((s) => s.id);
      transactions = sanitizeTransactions(JSON.parse(raw), validIds);
    }
  } catch {
    storageError = true;
  }

  return {
    sources: sources ?? buildDefaultSources(),
    transactions: transactions ?? [],
    storageError,
  };
}

/**
 * saveData({ sources, transactions })
 *
 * Persists current state to localStorage.
 * Both keys are always written together to keep them in sync.
 *
 * @returns {boolean} true if saved, false if failed (quota exceeded, etc.)
 */
export function saveData({ sources, transactions }) {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.setItem(KEYS.SOURCES, JSON.stringify(sources));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (err) {
    // Most likely: QuotaExceededError
    console.error('[MMT] localStorage save failed:', err);
    return false;
  }
}

/**
 * clearData()
 *
 * Wipes all app data from localStorage (dev/reset utility).
 */
export function clearData() {
  try {
    localStorage.removeItem(KEYS.SOURCES);
    localStorage.removeItem(KEYS.TRANSACTIONS);
  } catch {
    // silent fail — nothing to clear
  }
}

/**
 * getDefaultSources()
 *
 * Returns a fresh copy of the 3 default sources with zero balances.
 */
export function getDefaultSources() {
  return buildDefaultSources();
}
