import { useMemo } from 'react';
import { useAppContext, selectSourceById, selectTransactionsBySource, DELETE_TRANSACTION } from '../state/AppContext';
import { ArrowRight, SourceIcon } from '../components/icons';
import './HistoryScreen.css'; // Reusing transaction list styles
import './SourceDetailsScreen.css';

export default function SourceDetailsScreen({ sourceId, onBack }) {
  const { state, dispatch } = useAppContext();
  
  const source = selectSourceById(state.sources, sourceId);
  const sourceTransactions = selectTransactionsBySource(state.transactions, sourceId);

  // Sort by creation time descending (newest added = first shown)
  const sortedTransactions = useMemo(() => {
    return [...sourceTransactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [sourceTransactions]);

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      dispatch({ type: DELETE_TRANSACTION, payload: id });
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!source) {
    return (
      <div className="screen source-details-screen">
        <header className="screen-header row-header">
          <button className="icon-btn back-btn" onClick={onBack}>
            <ArrowRight />
          </button>
          <h1 className="screen-title">المصدر غير موجود</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="screen source-details-screen">
      <header className="source-details-header">
        <button className="icon-btn back-btn" onClick={onBack}>
          <ArrowRight />
        </button>
        <div className="source-info-header">
          <div className="icon-wrapper"><SourceIcon iconKey={source.icon} size={28} /></div>
          <div className="text-wrapper">
            <h1 className="source-name-title">{source.nameAr}</h1>
            <div className="source-balance-badge amount-md">
              {source.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م
            </div>
          </div>
        </div>
      </header>

      <div className="history-content">
        {sortedTransactions.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-title">لا توجد معاملات</h2>
            <p className="empty-text">لم تقم بأي معاملات من خلال هذا الحساب</p>
          </div>
        ) : (
          <div className="transaction-list">
            {sortedTransactions.map(tx => (
              <div key={tx.id} className="transaction-card">
                <div className="tx-main">
                  <div className="tx-details">
                    <h3 className="tx-title">{tx.title}</h3>
                    <span className="tx-date">{formatDate(tx.date)}</span>
                  </div>
                  <div className={`tx-amount ${tx.type === 'income' ? 'income-text' : 'expense-text'}`}>
                    {tx.type === 'income' ? '+' : '-'} {tx.amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="tx-actions">
                  <button className="del-btn" onClick={() => handleDelete(tx.id)}>حذف</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
