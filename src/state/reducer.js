/**
 * reducer.js — Pure reducer for money tracker state
 *
 * State shape:
 * {
 *   sources:      Source[]       — 3 fixed sources, each with a `balance` field
 *   transactions: Transaction[]  — append-only list
 *   storageError: boolean        — true if localStorage failed
 * }
 *
 * Rule: `totalBalance` is NEVER stored in state.
 *       It is always derived via the `selectTotalBalance` selector.
 *
 * Rule: source.balance is ALWAYS updated atomically with ADD_TRANSACTION.
 *       No separate balance calculation pass is needed.
 */

import { LOAD_DATA, ADD_TRANSACTION, SET_STORAGE_ERROR } from './actions';

// ─── Initial State ────────────────────────────────────────────────────────────

export const initialState = {
  sources: [],
  transactions: [],
  storageError: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function reducer(state, action) {
  switch (action.type) {

    /**
     * LOAD_DATA
     * Fired once on app mount. Replaces state with data from localStorage
     * (or in-memory defaults if storage failed).
     *
     * payload: { sources, transactions, storageError }
     */
    case LOAD_DATA: {
      const { sources, transactions, storageError } = action.payload;
      return {
        sources,
        transactions,
        storageError: storageError ?? false,
      };
    }

    /**
     * ADD_TRANSACTION
     * Appends the transaction AND updates the affected source's balance.
     * This keeps both in perfect sync — single atomic operation.
     *
     * payload: Transaction (fully formed, validated before dispatch)
     */
    case ADD_TRANSACTION: {
      const tx = action.payload;

      const updatedSources = state.sources.map((source) => {
        if (source.id !== tx.sourceId) return source;

        const delta = tx.type === 'income' ? tx.amount : -tx.amount;

        return {
          ...source,
          balance: round2(source.balance + delta),
        };
      });

      // Prepend so history is newest-first without re-sorting
      const updatedTransactions = [tx, ...state.transactions];

      return {
        ...state,
        sources: updatedSources,
        transactions: updatedTransactions,
      };
    }

    /**
     * SET_STORAGE_ERROR
     * Updates the storageError flag at runtime (e.g. after a failed save).
     *
     * payload: boolean
     */
    case SET_STORAGE_ERROR: {
      return {
        ...state,
        storageError: action.payload,
      };
    }

    default:
      return state;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Rounds to 2 decimal places to avoid floating-point drift */
function round2(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}
