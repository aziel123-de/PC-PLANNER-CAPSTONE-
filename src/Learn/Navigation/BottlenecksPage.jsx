import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../Navigation/Navbar.jsx';
import './BottlenecksPage.css';

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
      <header className="compat-card-header" role="button" tabIndex={0} aria-expanded={isOpen} onClick={toggle} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle()}>
        <div className="compat-left">
          <span className="compat-icon" aria-hidden>{icon}</span>
          <h3 className="vertical-card-title">{title}</h3>
        </div>
        <div className={`expand-arrow ${isOpen ? 'rotated' : ''}`}>{'▾'}</div>
      </header>
      <div className="compat-details" ref={detailsRef} style={{ maxHeight: 0, opacity: 0 }}>
        <div className="compat-inner" ref={innerRef}>
          {children}
        </div>
      </div>
    </div>
  );
}

function BottlenecksPage() {
  const [openId, setOpenId] = useState(null);

  const icon = (type) => {
    switch (type) {
      case 'cpu': return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="4" width="16" height="16" rx="3" stroke="#6366F1" strokeWidth="1.4" fill="#EEF2FF"/></svg>);
      case 'gpu': return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#EF4444" strokeWidth="1.2" fill="#FFF1F2"/></svg>);
      case 'ram': return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="7" width="16" height="10" rx="2" stroke="#F59E0B" strokeWidth="1.2" fill="#FFFBEB"/></svg>);
      case 'storage': return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="6" width="16" height="12" rx="2" stroke="#0EA5A4" strokeWidth="1.2" fill="#ECFEFF"/></svg>);
      default: return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="16" rx="3" stroke="#64748B" strokeWidth="1" fill="#F1F5F9"/></svg>);
    }
  };

  return (
    <div className="bottlenecks-page">
      <h1 className="section-title">Understanding Bottlenecks</h1>
      <p className="page-description">
        A bottleneck occurs when one component limits your system's performance. Learn how to identify and avoid the most common ones.
      </p>
      <Navbar />

      <div className="vertical-container">

        <Collapsible id="cpu" title="CPU Bottlenecks" icon={icon('cpu')} openId={openId} setOpenId={setOpenId}>
          <p>When your processor limits system performance.</p>

          <h4>Signs</h4>
          <ul>
            <li>GPU usage below 90-95% while CPU cores are at 100%</li>
            <li>Frame rates don't improve when lowering graphics settings</li>
            <li>Stuttering or inconsistent performance in CPU-heavy games</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>Entry-level CPU (e.g., Ryzen 3 or Core i3) with a high-end GPU</li>
            <li>Older CPUs paired with modern GPUs</li>
            <li>Simulation games or streaming while gaming</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Pair CPU and GPU of similar tier</li>
            <li>Choose CPUs with more cores for multitasking</li>
            <li>Prioritize single-core performance for gaming</li>
          </ul>
        </Collapsible>

        <Collapsible id="gpu" title="GPU Bottlenecks" icon={icon('gpu')} openId={openId} setOpenId={setOpenId}>
          <p>When your graphics card limits system performance.</p>

          <h4>Signs</h4>
          <ul>
            <li>GPU usage at 99-100% while CPU usage is lower</li>
            <li>Frame rates improve when lowering resolution or graphics settings</li>
            <li>Poor performance in graphically intense games</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>High-end CPU with entry-level GPU</li>
            <li>Playing at ultra settings or high resolutions (e.g., 4K) on mid-tier GPU</li>
            <li>Using ray tracing or other demanding features</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Match GPU to your monitor resolution and refresh rate</li>
            <li>Spend more on GPU for gaming builds</li>
            <li>Check VRAM needs for your games</li>
          </ul>
        </Collapsible>

        <Collapsible id="ram" title="RAM Bottlenecks" icon={icon('ram')} openId={openId} setOpenId={setOpenId}>
          <p>When memory limits system performance.</p>

          <h4>Signs</h4>
          <ul>
            <li>High memory usage (90%+)</li>
            <li>Frequent use of page file (virtual memory)</li>
            <li>Stuttering during multitasking</li>
            <li>Slow system despite strong CPU/GPU</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>Only 8GB RAM for modern gaming or editing</li>
            <li>Slow RAM with Ryzen CPUs</li>
            <li>Running heavy apps side by side</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Use 16GB RAM for gaming, 32GB+ for content creation</li>
            <li>Enable dual-channel (2 or 4 sticks)</li>
            <li>Use 3200–3600MHz for AMD, 3200MHz+ for Intel</li>
          </ul>
        </Collapsible>

        <Collapsible id="storage" title="Storage Bottlenecks" icon={icon('storage')} openId={openId} setOpenId={setOpenId}>
          <p>When storage speed slows down the system.</p>

          <h4>Signs</h4>
          <ul>
            <li>Slow app/game load times</li>
            <li>Lag or stutter when loading new areas</li>
            <li>High disk usage in Task Manager</li>
            <li>Overall sluggishness despite good CPU/GPU</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>Running system from an HDD</li>
            <li>SSD almost full (SSDs slow down when near full)</li>
            <li>Using SATA SSDs where NVMe is beneficial</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Use NVMe SSD for OS and key apps</li>
            <li>Leave 10–20% SSD space free</li>
            <li>Use tiered storage: NVMe (OS), SATA SSD (games), HDD (files)</li>
          </ul>
        </Collapsible>
      </div>
    </div>
  );
}

export default BottlenecksPage;