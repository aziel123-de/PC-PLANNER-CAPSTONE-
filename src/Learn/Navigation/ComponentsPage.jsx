import React, { useState, useMemo, useRef, useEffect } from 'react';
import PROCESSOR from '../LearnComponents/PROCESSOR';
import GRAPHICS from '../LearnComponents/GRAPHICS';
import Mobo from '../LearnComponents/Mobo';
import Ram from '../LearnComponents/Ram';
import Storage from '../LearnComponents/Storage';
import PSU from '../LearnComponents/PSU';
import Case from '../LearnComponents/Case';
import Monitor from '../LearnComponents/Monitor';
import Keyboard from '../LearnComponents/Keyboard';
import Mouse from '../LearnComponents/Mouse';
import './ComponentsPage.css';
import Navbar from '../Navigation/Navbar.jsx';

const components = [
  { id: 'processor', name: 'Processor', Comp: PROCESSOR },
  { id: 'gpu', name: 'Graphics Card', Comp: GRAPHICS },
  { id: 'mobo', name: 'Motherboard', Comp: Mobo },
  { id: 'ram', name: 'RAM', Comp: Ram },
  { id: 'storage', name: 'Storage', Comp: Storage },
  { id: 'psu', name: 'Power Supply', Comp: PSU },
  { id: 'case', name: 'Case', Comp: Case },
  { id: 'monitor', name: 'Monitor', Comp: Monitor },
  { id: 'keyboard', name: 'Keyboard', Comp: Keyboard },
  { id: 'mouse', name: 'Mouse', Comp: Mouse },
];

function ComponentsPage() {
  const [openId, setOpenId] = useState(null);
  const results = components; // show the full list
  


  return (
    <div className="components-page">
      <h1>Understanding PC Components</h1>
      <p className="page-description">Every PC is made up of several key components that work together. Explore each item for a concise explanation and specs.</p>

      <Navbar />

      {/* controls removed: search and show-only toggle */}

      <div className="components-grid">
        {results.length === 0 && <div className="no-results">No components found.</div>}
        {results.map(item => (
          <Card
            key={item.id}
            id={item.id}
            title={item.name}
            Comp={item.Comp}
            open={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function Card({ id, title, Comp, open, onToggle, showOnlyKeySpecs }) {
  const detailsRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const el = detailsRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    if (open) {
      // measure and set maxHeight for smooth animation
      const h = inner.scrollHeight;
      el.style.maxHeight = h + 'px';
      el.style.opacity = '1';
    } else {
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
    }
  }, [open]);

  return (
    <article className={`component-card ${open ? 'is-open' : ''}`} tabIndex={0} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}>
      <header className="component-card-header" onClick={onToggle} role="button" aria-expanded={open}>
        <div className="component-left">
          <span className="component-icon" aria-hidden="true">{svgFor(title)}</span>
          <h3 className="component-name">{title}</h3>
        </div>
        <div className={`component-right expand-arrow ${open ? 'rotated' : ''}`}>{'▾'}</div>
      </header>
      <div className="component-details" ref={detailsRef} style={{ maxHeight: 0, opacity: 0 }}>
        <div className="component-inner" ref={innerRef}>
          <Comp />
        </div>
      </div>
    </article>
  );
}

function svgFor(title) {
  const t = title.toLowerCase();
  if (t.includes('processor')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#6366F1" strokeWidth="1.5" fill="#EEF2FF"/><path d="M8 8h8v8H8z" fill="#6366F1" opacity="0.12"/></svg>
  );
  if (t.includes('graphics')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#EF4444" strokeWidth="1.4" fill="#FFF1F2"/><circle cx="8.5" cy="12" r="1.6" fill="#EF4444"/><circle cx="15.5" cy="12" r="1.6" fill="#EF4444"/></svg>
  );
  if (t.includes('motherboard')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="3" stroke="#059669" strokeWidth="1.4" fill="#ECFDF5"/><path d="M7 7h10v10H7z" fill="#059669" opacity="0.08"/></svg>
  );
  if (t === 'ram') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="16" height="10" rx="2" stroke="#F59E0B" strokeWidth="1.4" fill="#FFFBEB"/><path d="M6 9v6M9 9v6M12 9v6M15 9v6M18 9v6" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round"/></svg>
  );
  if (t.includes('storage')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" rx="2" stroke="#0EA5A4" strokeWidth="1.4" fill="#ECFEFF"/><rect x="7" y="9" width="10" height="6" fill="#0EA5A4" opacity="0.08"/></svg>
  );
  if (t.includes('power')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v10" stroke="#F97316" strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="16" r="6" stroke="#F97316" strokeWidth="1.2" fill="#FFF7ED"/></svg>
  );
  if (t.includes('case')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="3" stroke="#7C3AED" strokeWidth="1.4" fill="#F5F3FF"/><rect x="7" y="8" width="10" height="8" fill="#7C3AED" opacity="0.06"/></svg>
  );
  if (t.includes('monitor')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="12" rx="2" stroke="#2563EB" strokeWidth="1.4" fill="#EFF6FF"/><path d="M8 18h8l-1 2H9l-1-2z" fill="#2563EB" opacity="0.08"/></svg>
  );
  if (t.includes('keyboard')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="10" rx="2" stroke="#111827" strokeWidth="1" fill="#F8FAFC"/><path d="M6 10h.01M9 10h.01M12 10h.01M15 10h.01M6 13h.01M9 13h.01M12 13h.01M15 13h.01" stroke="#111827" strokeWidth="0.8" strokeLinecap="round"/></svg>
  );
  if (t.includes('mouse')) return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c3 0 6 1.5 6 4.5S15 13 12 13 6 8.5 6 6.5 9 2 12 2z" stroke="#111827" strokeWidth="1" fill="#F8FAFC"/><path d="M12 7v2" stroke="#374151" strokeWidth="1" strokeLinecap="round"/></svg>
  );
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="3" stroke="#64748B" strokeWidth="1" fill="#F1F5F9"/></svg>
  );
}

export default ComponentsPage;