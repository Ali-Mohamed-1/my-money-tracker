import { useState, useRef, useEffect } from 'react';
import { useAppContext, ADD_TRANSACTION, createTransaction } from '../state/AppContext';
import { Edit, Check } from './icons';
import './SourceCard.css';

export default function SourceCard({ source }) {
  const { dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newVal, setNewVal] = useState(source.balance.toString());
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const num = Number(newVal);
    if (!isNaN(num) && num !== source.balance) {
      const diff = num - source.balance;
      
      const newTx = createTransaction({
        title: 'تعديل يدوي',
        amount: Math.abs(diff),
        type: diff > 0 ? 'income' : 'expense',
        sourceId: source.id,
        date: new Date().toISOString(),
      });

      dispatch({ type: ADD_TRANSACTION, payload: newTx });
    }
    
    setNewVal(num.toString()); // Re-sync val
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setNewVal(source.balance.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="card source-card">
      <div className="source-icon">{source.icon}</div>
      <div className="source-info">
        <h3 className="source-name">{source.nameAr}</h3>
        <span className="label">الرصيد</span>
      </div>
      
      <div className="source-balance-container">
        {isEditing ? (
          <div className="edit-mode">
            <input
              ref={inputRef}
              type="number"
              step="0.01"
              inputMode="decimal"
              className="balance-edit-input"
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
            />
            <button className="icon-btn check-btn" onClick={handleSave}>
              <Check />
            </button>
          </div>
        ) : (
          <div className="view-mode">
            <span className="source-balance amount-md">
              {source.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <button className="icon-btn edit-btn" onClick={() => setIsEditing(true)}>
              <Edit />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
