import { useMemo } from 'react';
import { useAppContext, DELETE_TRANSACTION } from '../state/AppContext';
import './HistoryScreen.css';

export default function HistoryScreen() {
  const { state, dispatch } = useAppContext();

  // Sort by creation time descending (newest added = first shown)
  const sortedTransactions = useMemo(() => {
    return [...state.transactions].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }, [state.transactions]);

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المعاملة؟')) {
      dispatch({ type: DELETE_TRANSACTION, payload: id });
    }
  };

  const getSourceName = (id) => {
    const s = state.sources.find(s => s.id === id);
    return s ? s.nameAr : 'غير معروف';
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

  return (
    <div className="screen history-screen">
      <header className="screen-header">
        <h1 className="screen-title">المعاملات</h1>
      </header>

      <div className="history-content">
        {sortedTransactions.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-title">لا توجد معاملات</h2>
            <p className="empty-text">قم بإضافة معاملات جديدة لتظهر هنا</p>
          </div>
        ) : (
          <div className="transaction-list">
            {sortedTransactions.map(tx => (
              <div key={tx.id} className="transaction-card">
                <div className="tx-main">
                  <div className="tx-details">
                    <h3 className="tx-title">{tx.title}</h3>
                    <span className="tx-source">{getSourceName(tx.sourceId)}</span>
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
