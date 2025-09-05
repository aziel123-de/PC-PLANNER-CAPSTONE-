import React from "react";
import './ComponentCard.css';
import {
  moboOptions,
  cpuOptions,
  gpuOptions,
  psuOptions,
  ramOptions,
  storageOptions,
  m2Options,
  caseOptions
} from "../PCBuilder/PCBuilding/PCcomponentsDatabase.js";

function getCategoryArray(cat) {
  switch ((cat || "").toLowerCase()) {
    case "mobo":
    case "motherboard":
      return moboOptions;
    case "cpu":
    case "processor":
      return cpuOptions;
    case "gpu":
    case "graphics":
      return gpuOptions;
    case "psu":
    case "power":
      return psuOptions;
    case "ram":
    case "memory":
      return ramOptions;
    case "storage":
      return storageOptions;
    case "m2":
    case "nvme":
      return m2Options;
    case "case":
    case "pcase":
      return caseOptions;
    default:
      return null;
  }
}

/**
 * ComponentCard
 * Props:
 *  - component: object (optional)
 *  - category: string (optional)
 *  - id: number (optional)
 *
 * If component provided, it's used directly. Otherwise category+id is used to find the item.
 */
function ComponentCard({ component, category, id }) {
  let item = component || null;

  if (!item && category && id != null) {
    const arr = getCategoryArray(category);
    if (Array.isArray(arr)) {
      item = arr.find((it) => Number(it.id) === Number(id)) || null;
    }
  }

  if (!item) {
    return (
      <div className="component-card component-card--empty">
        <h3>Component not found</h3>
        <p>Provide a valid component object or category + id.</p>
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
          if (key === "id" || key === "name" || key === "image") return null;
          return (
            <li key={key}>
              <strong>{key}:</strong> <span>{String(value)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ComponentCard;