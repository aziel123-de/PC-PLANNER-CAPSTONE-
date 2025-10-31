import React, { useEffect, useState } from "react";
import { createPortal } from 'react-dom';
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
  const [img, setImg] = useState(() => (item?.image || null));
  const [imgSrcLink, setImgSrcLink] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [imgError, setImgError] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

      <div className="component-image">
        {img ? (
          imgSrcLink ? (
            <a href={imgSrcLink} target="_blank" rel="noopener noreferrer">
              <img src={img} alt={item.name} />
            </a>
          ) : (
            <img src={img} alt={item.name} />
          )
        ) : (
          <div className="component-image--placeholder">
            {loadingImg ? 'Loading image…' : (imgError ? 'No image found' : 'No image')}
          </div>
        )}
      </div>

      <button className="component-details-btn" onClick={() => setShowModal(true)}>
        See More Details
      </button>

      {showModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <h2 className="modal-title">{item.name}</h2>
            <div className="component-image">
              {img ? (
                imgSrcLink ? (
                  <a href={imgSrcLink} target="_blank" rel="noopener noreferrer">
                    <img src={img} alt={item.name} />
                  </a>
                ) : (
                  <img src={img} alt={item.name} />
                )
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
    </div>
  );
}

export default ComponentCard;