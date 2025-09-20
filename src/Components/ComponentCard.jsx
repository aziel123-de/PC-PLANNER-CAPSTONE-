import React from "react";
import './ComponentCard.css';

/**
 * ComponentCard
 * Props:
 *  - component: object (optional)
 *  - category: string (optional)
 *  - id: number (optional)
 *
 * If component provided, it's used directly. Otherwise category+id is used to find the item.
 */
function ComponentCard({ component }) {
  const item = component || null;

  if (!item) {
    return (
      <div className="component-card component-card--empty">
        <h3>Component not found</h3>
        <p>No data provided.</p>
      </div>
    );
  }

  // Render component card
  return (
    <div className="component-card">
      <h2>{item.name}</h2>

      {item.image && (
        <div className="component-image">
          <img src={item.image} alt={item.name} />
        </div>
      )}

      <ul>
        {Object.entries(item).map(([key, value]) => {
          // skip meta fields and any raw data fields
          if (key === "id" || key === "name" || key === "image") return null;
          if (String(key).toLowerCase().includes('raw')) return null;

          // format the label: replace underscores and title-case
          const label = String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

          return (
            <li key={key} className="components-list-info">
             <label className="label-text">{label}:</label>
              <span className="value">{String(value)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ComponentCard;