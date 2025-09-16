import React from 'react';

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
    <div style={styles.card}>
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
      <div style={styles.actions}>
  <button onClick={() => onView && onView(build)} style={styles.button}>View</button>
  <button onClick={() => onLoad && onLoad(build)} style={styles.button}>Edit</button>
  <button onClick={() => onShare && onShare(build)} style={{ ...styles.button, ...styles.shareBtn }}>Share</button>
        <button
          onClick={() => {
            if (window.confirm('Delete this saved build?')) onDelete && onDelete(id);
          }}
          style={{ ...styles.button, ...styles.deleteBtn }}
        >Delete</button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  infoCol: { flex: 1, marginRight: 12 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8 },
  title: { margin: 0, fontSize: 18 },
  meta: { color: '#555', fontSize: 13, marginTop: 4 },
  warnings: { color: '#a33', fontSize: 13, marginTop: 6 },
  badge: { padding: '2px 8px', borderRadius: 14, fontSize: 12, fontWeight: 600 },
  badgeIssues: { background: '#ffe6e6', color: '#b00000' },
  badgeOk: { background: '#e6fff2', color: '#006a3d' },
  actions: { display: 'flex', flexDirection: 'column', gap: 8 },
  button: { padding: '6px 10px', cursor: 'pointer', fontSize: 13 },
  deleteBtn: { background: '#fff', border: '1px solid #e0e0e0' }
  ,shareBtn: { background: '#1d5bff', color: '#fff', border: '1px solid #1d5bff' }
};
