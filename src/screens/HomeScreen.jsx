import { useState } from 'react';
import { useAppContext, selectTotalBalance, ADD_SOURCE } from '../state/AppContext';
import SourceCard from '../components/SourceCard';
import { Warning, Plus, Check } from '../components/icons';
import './HomeScreen.css';

export default function HomeScreen({ onSourceClick }) {
  const { state, dispatch } = useAppContext();
  const totalBalance = selectTotalBalance(state.sources);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const handleAddSource = (e) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;
    
    dispatch({ 
      type: ADD_SOURCE, 
      payload: { nameAr: newSourceName.trim(), icon: 'cash' } 
    });
    
    setNewSourceName('');
    setIsAdding(false);
  };

  return (
    <div className="screen home-screen">
      {state.storageError && (
        <div className="storage-banner">
          <Warning size={18} style={{ verticalAlign: 'middle', marginLeft: '6px' }} /> تعذر حفظ البيانات. سيتم مسحها عند إغلاق التطبيق.
        </div>
      )}

      <header className="home-header">
        <h2 className="label">الرصيد الكلي</h2>
        <div className="total-balance amount-lg">
          {totalBalance.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="currency">ج.م</span>
        </div>
      </header>

      <section className="sources-list">
        {state.sources.map((source) => (
          <SourceCard key={source.id} source={source} onCardClick={() => onSourceClick(source.id)} />
        ))}

        {isAdding ? (
          <form className="source-card add-source-form" onSubmit={handleAddSource}>
            <input 
              type="text" 
              className="add-source-input"
              placeholder="اسم المصدر الجديد..."
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              autoFocus
            />
            <div className="add-source-actions">
              <button type="submit" className="icon-btn success-btn"><Check /></button>
              <button type="button" className="icon-btn" onClick={() => setIsAdding(false)}>×</button>
            </div>
          </form>
        ) : (
          <button className="source-card add-source-card" onClick={() => setIsAdding(true)}>
            <div className="add-icon-wrapper"><Plus size={32} /></div>
            <div className="add-text">إضافة مصدر جديد</div>
          </button>
        )}
      </section>
    </div>
  );
}
