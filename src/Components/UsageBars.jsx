import React from 'react';

function normalizePct(value) {
  if (value == null) return 0;
  if (typeof value === 'string') {
    const num = parseFloat(value.replace('%', ''));
    if (!isFinite(num)) return 0;
    return Math.max(0, Math.min(100, num));
  }
  const num = Number(value);
  if (!isFinite(num)) return 0;
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return Math.max(0, Math.min(100, Math.round(num)));
}

function barColor(p) {
  const v = Number(p || 0);
  return v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444';
}

export default function UsageBars({ scores, note }) {
  const gaming = normalizePct(scores?.gaming);
  const office = normalizePct(scores?.office);
  const productivity = normalizePct(scores?.productivity);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ minWidth: 80, fontSize: '0.85rem', fontWeight: 500 }}>Gaming:</span>
          <div style={{ flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${gaming}%`, height: '100%', backgroundColor: barColor(gaming), transition: 'width 0.3s ease' }}></div>
          </div>
          <span style={{ minWidth: 35, fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{gaming}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ minWidth: 80, fontSize: '0.85rem', fontWeight: 500 }}>Office Use:</span>
          <div style={{ flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${office}%`, height: '100%', backgroundColor: barColor(office), transition: 'width 0.3s ease' }}></div>
          </div>
          <span style={{ minWidth: 35, fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{office}%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ minWidth: 80, fontSize: '0.85rem', fontWeight: 500 }}>Productivity:</span>
          <div style={{ flex: 1, height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: `${productivity}%`, height: '100%', backgroundColor: barColor(productivity), transition: 'width 0.3s ease' }}></div>
          </div>
          <span style={{ minWidth: 35, fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>{productivity}%</span>
        </div>
      </div>
      {note && (
        <div style={{ marginTop: 12, padding: '8px 12px', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#495057', fontWeight: 500 }}>{note}</p>
        </div>
      )}
    </div>
  );
}
