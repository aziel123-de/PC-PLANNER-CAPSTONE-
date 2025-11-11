import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from 'react-dom';
import './ComponentCard.css';
import { BiGitCompare } from 'react-icons/bi';
import { useComponents } from '../contexts/ComponentsContext.jsx';

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
  const [img, setImg] = useState(() => (item?.image || null));
  const [imgSrcLink, setImgSrcLink] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [imgError, setImgError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareTarget, setCompareTarget] = useState(null);
  const [search, setSearch] = useState("");

  const { dataLookup } = useComponents() || {};

  // Infer dataset key (cpu, gpu, mobo, etc.) with stricter same-type rules to avoid cross-category matches on shared IDs.
  const datasetKey = useMemo(() => {
    if (!item || !dataLookup) return null;

    function normalizeType(raw) {
      if (!raw) return null;
      const t = String(raw).toLowerCase();
      if (t.includes('motherboard') || t === 'mobo') return 'mobo';
      if (t === 'cpu' || t.includes('processor')) return 'cpu';
      if (t === 'gpu' || t.includes('graphics')) return 'gpu';
      if (t === 'psu' || t.includes('power')) return 'psu';
      if (t === 'ram' || t.includes('memory')) return 'ram';
      if (t === 'storage' || t === 'hdd' || t === 'ssd') return 'storage';
      if (t === 'm2' || t.includes('nvme')) return 'm2';
      if (t === 'case') return 'case';
      if (t.includes('fan')) return 'case-fans';
      if (t.includes('cooler')) return 'cpuCooler';
      if (t.includes('monitor')) return 'monitor';
      if (t.includes('keyboard')) return 'keyboard';
      if (t.includes('mouse')) return 'mouse';
      if (t.includes('headset') || t.includes('headphone')) return 'headset';
      return null;
    }

    // 1. Direct type/componentType mapping
    const direct = normalizeType(item.type) || normalizeType(item.componentType);
    if (direct && dataLookup[direct]) return direct;

    // 2. Name-based hints
    const name = (item.name || '').toLowerCase();
    const hinted = normalizeType(name);
    if (hinted && dataLookup[hinted]) return hinted;

    // 3. Feature-based heuristics (look for distinctive spec keys)
    const keys = Object.keys(item).map(k => k.toLowerCase());
    const hasAny = (arr) => arr.some(k => keys.includes(k));
    if (hasAny(['socket','chipset','form_factor','ram_slots'])) return 'mobo';
    if (hasAny(['cores','threads','base_clock','boost_clock'])) return 'cpu';
    if (hasAny(['vram','vram_type','boost_clock'])) return 'gpu';
    if (hasAny(['wattage','efficiency_rating'])) return 'psu';
    if (hasAny(['capacity','speed','module_type'])) return 'ram';
    if (hasAny(['read_speed','write_speed'])) return 'storage';

    // 4. Exact id match but verify by comparing representative field overlap
    for (const [key, arr] of Object.entries(dataLookup)) {
      if (!Array.isArray(arr)) continue;
      if (arr.some(x => x?.id === item.id)) {
        // Require at least one shared spec key (excluding id/name/image) to confirm category
        const sample = arr.find(x => x?.id === item.id) || arr[0];
        if (sample) {
          const sampleKeys = Object.keys(sample).filter(k => !['id','name','image'].includes(k));
          const overlap = sampleKeys.filter(k => k in item);
          if (overlap.length > 0) return key; // confirmed by shared structure
        }
      }
    }

    // 5. Name equality fallback (rare)
    for (const [key, arr] of Object.entries(dataLookup)) {
      if (Array.isArray(arr) && arr.some((x) => (x?.name || '').toLowerCase() === name)) return key;
    }

    return null;
  }, [item, dataLookup]);

  const compareCandidates = useMemo(() => {
    if (!datasetKey || !dataLookup) return [];
    const arr = dataLookup[datasetKey] || [];
    return arr.filter((c) => c?.id !== item?.id);
  }, [datasetKey, dataLookup, item?.id]);

  if (!item) {
    return (
      <div className="component-card component-card--empty">
        <h3>Component not found</h3>
        <p>No data provided.</p>
      </div>
    );
  }

  // Attempt to auto-fetch an image if none is provided, based on item.name
  useEffect(() => {
    let active = true;
    async function load() {
      if (!item || !item.name) return;
      if (item.image) return; // already have image
      // simple per-session cache via window.__imgCache
      const key = `img:${item.name}`;
      try {
        setLoadingImg(true);
        setImgError(null);
        const cache = (typeof window !== 'undefined') ? (window.__imgCache = window.__imgCache || new Map()) : null;
        if (cache && cache.has(key)) {
          const c = cache.get(key);
          if (active) { setImg(c.image_url || c.link || null); setImgSrcLink(c.source_url || c.contextLink || c.link || null); }
          return;
        }
        // Use backend DB-backed ensure endpoint
        const base = import.meta?.env?.VITE_BACKEND_URL || '';
        const url = `${base}/api/items/${encodeURIComponent(item.id || 0)}/image?name=${encodeURIComponent(item.name)}`;
        const r = await fetch(url);
        if (!r.ok) throw new Error(`image search failed: ${r.status}`);
        const data = await r.json();
        if (active) {
          // data is a row from item_images or normalized payload
          const imgUrl = data.image_url || data.link || null;
          const srcUrl = data.source_url || data.contextLink || data.link || null;
          setImg(imgUrl);
          setImgSrcLink(srcUrl);
          if (cache) cache.set(key, data);
        }
      } catch (e) {
        if (active) setImgError(e.message || String(e));
      } finally {
        if (active) setLoadingImg(false);
      }
    }
    load();
    return () => { active = false; };
  // re-run if the name changes
  }, [item?.name]);

  // Render component card
  return (
    <div className="component-card">
      <h2 className="component-title-list">{item.name}</h2>

      <div className="component-image" onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
        {img ? (
          <img src={img} alt={item.name} />
        ) : (
          <div className="component-image--placeholder">
            {loadingImg ? 'Loading image…' : (imgError ? 'No image found' : 'No image')}
          </div>
        )}
      </div>

      <div className="component-actions">
        <button className="component-details-btn" onClick={() => setShowModal(true)}>
          See More Details
        </button>
        {datasetKey && (
          <button
            className="component-compare-btn"
            title="Compare"
            onClick={() => setShowCompare(true)}
            type="button"
          >
            <BiGitCompare size={16} style={{ marginRight: 6 }} /> Compare
          </button>
        )}
      </div>

      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">{item.name}</h2>
            <div className="component-image">
              {img ? (
                <a href={img} target="_blank" rel="noopener noreferrer">
                  <img src={img} alt={item.name} />
                </a>
              ) : (
                <div className="component-image--placeholder">
                  {loadingImg ? 'Loading image…' : (imgError ? 'No image found' : 'No image')}
                </div>
              )}
            </div>
            <div className="modal-details">
              {Object.entries(item).map(([key, value]) => {
                if (key === "id" || key === "name" || key === "image") return null;
                if (String(key).toLowerCase().includes('raw')) return null;
                const label = String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                return (
                  <div key={key} className="modal-detail-item">
                    <strong>{label}:</strong> {String(value)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}

      {showCompare && createPortal(
        <div className="modal-overlay" onClick={() => setShowCompare(false)}>
          <div className="compare-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCompare(false)}>×</button>
            <h2 className="modal-title">Compare Components</h2>
            <div className="compare-grid">
              <div className="compare-panel">
                <div className="compare-panel-header">Selected</div>
                <div className="compare-panel-body">
                  <div className="compare-item">
                    <div className="compare-item-image">
                      {img ? <img src={img} alt={item.name} /> : <div className="component-image--placeholder">No image</div>}
                    </div>
                    <div className="compare-item-name">{item.name}</div>
                  </div>
                </div>
              </div>
              <div className="compare-panel">
                <div className="compare-panel-header">Select to compare</div>
                <div className="compare-panel-body">
                  <input
                    className="compare-search"
                    type="search"
                    placeholder={`Search ${datasetKey || ''}...`}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className="compare-list">
                    {compareCandidates
                      .filter(c => !search || (c.name || '').toLowerCase().includes(search.toLowerCase()))
                      .slice(0, 100)
                      .map(c => (
                        <button key={c.id || c.name} className={`compare-list-item ${compareTarget?.id === c.id ? 'active' : ''}`} onClick={() => setCompareTarget(c)}>
                          <span className="compare-list-name">{c.name}</span>
                          <span className="compare-list-price">{c.price ? `₱${Number(c.price).toLocaleString()}` : ''}</span>
                        </button>
                      ))}
                    {compareCandidates.length === 0 && (
                      <div className="compare-empty">No candidates found for this type.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {compareTarget && (
              <div className="compare-table">
                {renderComparisonRows(item, compareTarget)}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ComponentCard;

// Helpers
function isNumericValue(val) {
  if (val === null || val === undefined) return false;
  if (typeof val === 'number') return Number.isFinite(val);
  if (typeof val !== 'string') return false;
  // Extract first numeric token from the string (handles units like "4.2 GHz", "650 W", etc.)
  const match = val.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  if (!match) return false;
  const num = parseFloat(match[0]);
  return Number.isFinite(num);
}

function toNumber(val) {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const m = val.replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
    return m ? parseFloat(m[0]) : NaN;
  }
  return NaN;
}

function prettyValue(val) {
  if (val === null || val === undefined) return '';
  return String(val);
}

function niceLabel(key) {
  return String(key).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function renderComparisonRows(a, b) {
  function lowerIsBetterForKey(key) {
    const k = String(key).toLowerCase();
    // TDP-specific rule: lower is better
    if (k === 'tdp' || k.endsWith('_tdp') || k.includes('tdp')) return true;
    // Price-specific rule: lower is better
    if (k === 'price' || k.endsWith('_price') || k.includes('price')) return true;
    return false;
  }

  // Combine keys and keep only numeric-comparable fields
  const keys = Array.from(new Set([...Object.keys(a || {}), ...Object.keys(b || {})]))
    .filter(k => !['id','name','image'].includes(k))
    .filter(k => !String(k).toLowerCase().includes('raw'))
    .filter(k => isNumericValue(a?.[k]) || isNumericValue(b?.[k]));

  if (keys.length === 0) {
    return <div className="compare-empty">No numeric fields to compare.</div>;
  }

  return (
    <div className="compare-rows">
      <div className="compare-rows-header">
        <div className="col label">Spec</div>
        <div className="col val">Selected</div>
        <div className="col val">Compared</div>
      </div>
      {keys.map((k) => {
        const va = a?.[k];
        const vb = b?.[k];
        const na = toNumber(va);
        const nb = toNumber(vb);
        let aClass = 'cmp-equal';
        let bClass = 'cmp-equal';
        if (Number.isFinite(na) && Number.isFinite(nb)) {
          const invert = lowerIsBetterForKey(k);
          const deltaA = invert ? (nb - na) : (na - nb); // positive => A better
          if (deltaA > 0) { aClass = 'cmp-better'; bClass = 'cmp-worse'; }
          else if (deltaA < 0) { aClass = 'cmp-worse'; bClass = 'cmp-better'; }
          else { aClass = 'cmp-equal'; bClass = 'cmp-equal'; }
        }
        return (
          <div key={k} className="compare-row">
            <div className="col label">{niceLabel(k)}</div>
            <div className={`col val ${aClass}`}>{prettyValue(va)}</div>
            <div className={`col val ${bClass}`}>{prettyValue(vb)}</div>
          </div>
        );
      })}
    </div>
  );
}