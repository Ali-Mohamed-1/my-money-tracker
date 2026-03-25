/* eslint-disable react-refresh/only-export-components */
/**
 * AppContext.jsx — Global React Context + Provider
 *
 * Exposes:
 *   - state: { sources, transactions, storageError }
 *   - dispatch: React dispatch function
 *   - Derived selectors (computed, never stored):
 *       selectTotalBalance(sources)
 *       selectSourceById(sources, id)
 *       selectTransactionsBySource(transactions, sourceId?)
 */

import { createContext, useContext, useReducer, useEffect } from 'react';
import { reducer, initialState } from './reducer';
import { LOAD_DATA, ADD_TRANSACTION, DELETE_TRANSACTION, SET_STORAGE_ERROR } from './actions';
import { getData, saveData } from '../utils/storage';

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted data once on mount
  useEffect(() => {
    const { sources, transactions, storageError } = getData();
    dispatch({ type: LOAD_DATA, payload: { sources, transactions, storageError } });
  }, []);

  // Persist to localStorage whenever sources or transactions change.
  // Skip on initial empty state (before LOAD_DATA fires).
  useEffect(() => {
    if (state.sources.length === 0) return;

    const saved = saveData({
      sources: state.sources,
      transactions: state.transactions,
    });

    if (!saved && !state.storageError) {
      dispatch({ type: SET_STORAGE_ERROR, payload: true });
    }
  }, [state.sources, state.transactions]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}

// ─── Action Creators ──────────────────────────────────────────────────────────

/**
 * Creates a fully-formed transaction object.
 * Call this before dispatching ADD_TRANSACTION.
 * Assumes data has already been validated by the form.
 */
export function createTransaction({ title, amount, type, sourceId, date }) {
  return {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim(),
    amount: Math.round((parseFloat(amount) + Number.EPSILON) * 100) / 100,
    type,
    sourceId,
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

export { ADD_TRANSACTION, DELETE_TRANSACTION, LOAD_DATA, SET_STORAGE_ERROR };

// ─── Selectors (Derived — never stored in state) ──────────────────────────────

/**
 * Total balance across all sources.
 * Always computed at call time — never a stored value.
 */
export function selectTotalBalance(sources) {
  const total = sources.reduce((sum, s) => sum + s.balance, 0);
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

/**
 * Find a single source by ID.
 */
export function selectSourceById(sources, id) {
  return sources.find((s) => s.id === id) ?? null;
}

/**
 * Returns transactions for a specific source, or all transactions.
 * Always sorted newest-first (already prepended in reducer, so this is stable).
 *
 * @param {Transaction[]} transactions
 * @param {string|null}   sourceId  — pass null/undefined to get all
 */
export function selectTransactionsBySource(transactions, sourceId) {
  if (!sourceId) return transactions;
  return transactions.filter((t) => t.sourceId === sourceId);
}
