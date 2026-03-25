import { useState } from 'react';
import { useAppContext, ADD_TRANSACTION, createTransaction } from '../state/AppContext';
import './AddScreen.css';

export default function AddScreen({ onSuccess }) {
  const { state, dispatch } = useAppContext();
  
  // Default to today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  // Auto-select the first source (usually the default wallet/cash)
  const [sourceId, setSourceId] = useState(state.sources[0]?.id || '');
  const [date, setDate] = useState(today);

  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError('يرجى إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!title.trim()) {
      setError('يرجى كتابة وصف للمعاملة');
      return;
    }
    if (!sourceId) {
      setError('يرجى اختيار المحفظة/الحساب');
      return;
    }

    // Balance check — only for expenses
    if (type === 'expense') {
      const source = state.sources.find(s => s.id === sourceId);
      if (source && Number(amount) > source.balance) {
        setError(
          `الرصيد غير كافٍ في "${source.nameAr}" — الرصيد الحالي: ${source.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2 })} ج.م`
        );
        return;
      }
    }

    // Build and dispatch transaction
    const newTx = createTransaction({
      title,
      amount: Number(amount),
      type,
      sourceId,
      date: new Date(date).toISOString(),
    });

    dispatch({ type: ADD_TRANSACTION, payload: newTx });
    
    // Return to home screen
    onSuccess();
  };

  return (
    <div className="screen add-screen">
      <h2 className="screen-title">إضافة معاملة</h2>
      
      <form onSubmit={handleSubmit} className="add-form">
        
        {/* Type Toggle */}
        <div className="type-toggle">
          <button 
            type="button" 
            className={`toggle-btn ${type === 'expense' ? 'active expense' : ''}`}
            onClick={() => setType('expense')}
          >
            مصروف
          </button>
          <button 
            type="button" 
            className={`toggle-btn ${type === 'income' ? 'active income' : ''}`}
            onClick={() => setType('income')}
          >
            دخل
          </button>
        </div>

        {/* Amount Input */}
        <div className="form-group amount-group">
          <label htmlFor="amount" className="label">المبلغ</label>
          <div className="input-with-currency">
            <input
              id="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <span className="currency">ج.م</span>
          </div>
        </div>

        {/* Title Input */}
        <div className="form-group">
          <label htmlFor="title" className="label">الوصف</label>
          <input
            id="title"
            type="text"
            placeholder="مثال: بقالة، راتب..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Source Selector (Buttons) */}
        <div className="form-group">
          <label className="label">الحساب</label>
          <div className="source-toggle">
            {state.sources.map(s => (
              <button
                key={s.id}
                type="button"
                className={`source-btn ${sourceId === s.id ? 'active' : ''}`}
                onClick={() => setSourceId(s.id)}
              >
                <span className="source-btn-icon">{s.icon}</span>
                <span className="source-btn-name">{s.nameAr}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date Input */}
        <div className="form-group">
          <label htmlFor="date" className="label">التاريخ</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Error Banner */}
        {error && <div className="error-banner">{error}</div>}

        {/* Submit */}
        <button type="submit" className="btn-submit">
          حفظ المعاملة
        </button>
      </form>
    </div>
  );
}
