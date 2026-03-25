import './SourceCard.css';

export default function SourceCard({ source }) {
  return (
    <div className="card source-card">
      <div className="source-icon">{source.icon}</div>
      <div className="source-info">
        <h3 className="source-name">{source.nameAr}</h3>
        <span className="label">الرصيد</span>
      </div>
      <div className="source-balance amount-md">
        {source.balance.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </div>
  );
}
