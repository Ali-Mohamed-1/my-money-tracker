import { useAppContext, selectTotalBalance } from '../state/AppContext';
import SourceCard from '../components/SourceCard';
import { Warning } from '../components/icons';
import './HomeScreen.css';

export default function HomeScreen({ onSourceClick }) {
  const { state } = useAppContext();
  const totalBalance = selectTotalBalance(state.sources);

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
      </section>
    </div>
  );
}
