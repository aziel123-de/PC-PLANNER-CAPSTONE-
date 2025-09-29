import React from 'react';
import { Trash } from 'lucide-react';

/**
 * SavedBuildCard
 * Props:
 *  - build: { id,name,total_price,createdAt,warnings,has_issues,parts }
 *  - onDelete(id)
 *  - onLoad(build)
 *  - onView(build)
 */
export default function SavedBuildCard({ build, onDelete, onLoad, onView, onShare }) {
  if (!build) return null;
  const { id, name, total_price, createdAt, has_issues, warnings = [] } = build;
  const dateStr = createdAt ? new Date(createdAt).toLocaleString() : '';

  return (
    <div style={styles.card} className="saved-build-card">
      <div style={styles.infoCol}>
        <div style={styles.titleRow}>
          <h3 style={styles.title}>{name || 'Untitled Build'}</h3>
          {has_issues ? (
            <span style={{ ...styles.badge, ...styles.badgeIssues }}>Issues</span>
          ) : (
            <span style={{ ...styles.badge, ...styles.badgeOk }}>OK</span>
          )}
        </div>
        <div style={styles.meta}>Saved: {dateStr}</div>
        <div style={styles.meta}>Total: ₱{Number(total_price || 0).toLocaleString()}</div>
        {warnings.length > 0 && (
          <div style={styles.warnings}>
            <strong>Warnings:</strong> {warnings.slice(0, 3).join('; ')}{warnings.length > 3 ? '…' : ''}
          </div>
        )}
      </div>
      <div className="saved-build-actions">
        <button 
          onClick={() => onView && onView(build)} 
          className="saved-build-card-btn view-btn"
        >
          View
        </button>
        <button 
          onClick={() => onLoad && onLoad(build)} 
          className="saved-build-card-btn edit-btn"
        >
          Edit
        </button>
        <button 
          onClick={() => onShare && onShare(build)} 
          className="saved-build-card-btn share-btn"
        >
          Share
        </button>
        <button
          onClick={() => onDelete && onDelete(build)}
          className="saved-build-card-btn delete-btn"
        >
          <Trash size={14} /> Delete
        </button>
      </div>
      

    </div>
  );
}

const styles = {
  card: {
    border: 'none',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden'
  },
  infoCol: { flex: 1, marginRight: 16 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { margin: 0, fontSize: 20, fontWeight: 600, color: '#1f2937' },
  meta: { color: '#6b7280', fontSize: 14, marginTop: 6, fontWeight: 500 },
  warnings: { color: '#dc2626', fontSize: 13, marginTop: 8, fontWeight: 500 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  badgeIssues: { background: '#fee2e2', color: '#dc2626' },
  badgeOk: { background: '#d1fae5', color: '#059669' }
};
