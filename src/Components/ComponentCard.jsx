import React from "react";
import './ComponentCard.css';
import {
  moboOptions as moboLocal,
  cpuOptions as cpuLocal,
  gpuOptions as gpuLocal,
  psuOptions as psuLocal,
  ramOptions as ramLocal,
  storageOptions as storageLocal,
  m2Options as m2Local,
  caseOptions as caseLocal
} from "../PCBuilder/PCBuilding/PCcomponentsDatabase.js";

function getCategoryArray(cat, lookup) {
  switch ((cat || "").toLowerCase()) {
    case "mobo":
    case "motherboard":
  return (lookup && lookup.mobo) || moboLocal;
    case "cpu":
    case "processor":
  return (lookup && lookup.cpu) || cpuLocal;
    case "gpu":
    case "graphics":
  return (lookup && lookup.gpu) || gpuLocal;
    case "psu":
    case "power":
  return (lookup && lookup.psu) || psuLocal;
    case "ram":
    case "memory":
  return (lookup && lookup.ram) || ramLocal;
    case "storage":
  return (lookup && lookup.storage) || storageLocal;
    case "m2":
    case "nvme":
  return (lookup && lookup.m2) || m2Local;
    case "case":
    case "pcase":
  return (lookup && lookup.case) || caseLocal;
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
function ComponentCard({ component, category, id, lookup }) {
  let item = component || null;

  if (!item && category && id != null) {
  const arr = getCategoryArray(category, lookup);
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