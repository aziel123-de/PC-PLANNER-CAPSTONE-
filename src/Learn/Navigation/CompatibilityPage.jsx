import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navigation/Navbar.jsx';
import './CompatibilityPage.css';

function Collapsible({ id, title, icon, openId, setOpenId, children }) {
  const isOpen = openId === id;
  const detailsRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const el = detailsRef.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    if (isOpen) {
      const h = inner.scrollHeight;
      el.style.maxHeight = h + 'px';
      el.style.opacity = '1';
    } else {
      el.style.maxHeight = '0px';
      el.style.opacity = '0';
    }
  }, [isOpen]);

  const toggle = () => setOpenId(isOpen ? null : id);

  return (
    <div className={`vertical-card interactive-card compat-card ${isOpen ? 'is-open' : ''}`}>
      <header
        className="compat-card-header"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle()}
      >
        <div className="compat-left">
          <span className="compat-icon" aria-hidden="true">{icon}</span>
          <h3 className="vertical-card-title">{title}</h3>
        </div>
        <div className={`expand-arrow ${isOpen ? 'rotated' : ''}`} aria-hidden>{'▾'}</div>
      </header>

      <div className="compat-details" ref={detailsRef} style={{ maxHeight: 0, opacity: 0 }}>
        <div ref={innerRef} className="compat-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

function iconForSection(key) {
  switch (key) {
    case 'cpu':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#6366F1" strokeWidth="1.4" fill="#EEF2FF"/></svg>
      );
    case 'ram':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="16" height="10" rx="2" stroke="#F59E0B" strokeWidth="1.2" fill="#FFFBEB"/></svg>
      );
    case 'psu':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" stroke="#F97316" strokeWidth="1.2" fill="#FFF7ED"/></svg>
      );
    case 'storage':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" rx="2" stroke="#0EA5A4" strokeWidth="1.2" fill="#ECFEFF"/></svg>
      );
    case 'checklist':
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12l4 4L19 6" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
      );
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="3" stroke="#64748B" strokeWidth="1" fill="#F1F5F9"/></svg>
      );
  }
}

function CompatibilityPage() {
  const [openId, setOpenId] = useState(null);

  return (
    <div className="compatibility-page">
      <h1 className="section-title-compatibility">Component Compatibility</h1>
      <p className="page-description-compatibility">Ensure all your PC parts work together seamlessly</p>
      <Navbar />
      <div className="vertical-container">
        <Collapsible id="cpu" title="CPU and Motherboard Compatibility" icon={iconForSection('cpu')} openId={openId} setOpenId={setOpenId}>
          <p className="vertical-card-text">The most critical compatibility check.</p>
          <h4>Socket Type</h4>
          <ul>
            <li><strong>AMD:</strong> AM4 (Ryzen 3000/5000), AM5 (Ryzen 7000)</li>
            <li><strong>Intel:</strong> LGA1700 (12th/13th Gen), LGA1200 (10th/11th Gen)</li>
          </ul>

          <h4>Chipset Compatibility</h4>
          <ul>
            <li><strong>AMD AM4:</strong> X570, B550, A520 (for Ryzen 5000)</li>
            <li><strong>Intel LGA1700:</strong> Z690, B660, H610 (for 12th/13th Gen)</li>
          </ul>
          <p><strong>Note:</strong> Some older chipsets may require a BIOS update to support newer CPUs.</p>
        </Collapsible>

        <Collapsible id="ram" title="RAM Compatibility" icon={iconForSection('ram')} openId={openId} setOpenId={setOpenId}>
          <p className="vertical-card-text">Memory must match motherboard specifications.</p>
          <h4>Memory Type</h4>
          <ul>
            <li><strong>DDR4:</strong> Common for builds from 2015–2021</li>
            <li><strong>DDR5:</strong> Newer standard for latest Intel and AMD platforms</li>
          </ul>
          <h4>Memory Speed</h4>
          <ul>
            <li><strong>AMD Ryzen:</strong> Benefits from faster RAM (3600MHz ideal)</li>
            <li><strong>Intel:</strong> Less sensitive, but still benefits</li>
            <li>RAM speed depends on both RAM and motherboard limits</li>
          </ul>
        </Collapsible>

        <Collapsible id="psu" title="PSU Requirements" icon={iconForSection('psu')} openId={openId} setOpenId={setOpenId}>
          <p className="vertical-card-text">Your PSU must provide enough power for all components.</p>
          <h4>Wattage Requirements</h4>
          <ul>
            <li>Sum up CPU + GPU TDP</li>
            <li>Add ~100–150W for motherboard, RAM, storage, fans</li>
            <li>Add 30% headroom for future upgrades</li>
            <li>
              <strong>Example:</strong> 105W CPU + 220W GPU + 100W = 425W × 1.3 = <strong>552.5W → choose 650W PSU</strong>
            </li>
          </ul>
          <h4>Connector Requirements</h4>
          <ul>
            <li>CPU: 4+4 or 8-pin EPS</li>
            <li>GPU: 6-pin / 8-pin / 12-pin PCIe</li>
            <li>SATA: For drives</li>
            <li>Motherboard: 24-pin ATX</li>
          </ul>
        </Collapsible>

        <Collapsible id="storage" title="Storage Compatibility" icon={iconForSection('storage')} openId={openId} setOpenId={setOpenId}>
          <p className="vertical-card-text">Match your drives to available connections.</p>
          <h4>Interface Types</h4>
          <ul>
            <li><strong>NVMe M.2:</strong> Fastest, requires M.2 PCIe slot</li>
            <li><strong>SATA M.2:</strong> M.2 slot, SATA speed</li>
            <li><strong>SATA SSD/HDD:</strong> Uses SATA ports on motherboard</li>
          </ul>
          <h4>Form Factor</h4>
          <ul>
            <li><strong>2280:</strong> Most common (22mm × 80mm)</li>
            <li><strong>Other sizes:</strong> 2242, 2260, 22110</li>
            <li>Check motherboard support for length</li>
          </ul>
        </Collapsible>

        <Collapsible id="checklist" title="Compatibility Checklist" icon={iconForSection('checklist')} openId={openId} setOpenId={setOpenId}>
          <ul className="vertical-checklist">
            <li>Always check CPU socket compatibility before buying</li>
            <li>Verify RAM is on motherboard's QVL (Qualified Vendor List)</li>
            <li>Confirm GPU length and case clearance</li>
          </ul>
        </Collapsible>

      </div>
    </div>
  );
}

export default CompatibilityPage;