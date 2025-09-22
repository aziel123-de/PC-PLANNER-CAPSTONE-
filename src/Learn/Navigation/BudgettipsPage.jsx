import React, { useState, useRef, useEffect } from 'react';
import './BudgettipsPage.css';
import Navbar from '../Navigation/Navbar.jsx';

function BudgettipsPage() {
  // allow multiple tips open
  const [openIds, setOpenIds] = useState([]);
  const sectionsRef = useRef({});

  // Collapsible card component
  function TipCard({ id, title, summary, children }) {
    const isOpen = openIds.includes(id);
    const containerRef = useRef(null);
    const innerRef = useRef(null);

    useEffect(() => {
      const el = containerRef.current;
      const inner = innerRef.current;
      if (!el || !inner) return;
      if (isOpen) {
        el.style.maxHeight = inner.scrollHeight + 'px';
        el.style.opacity = '1';
      } else {
        el.style.maxHeight = '0px';
        el.style.opacity = '0';
      }
    }, [isOpen]);

    const toggle = () => {
      setOpenIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
      <article className={`tips-card ${isOpen ? 'is-open' : ''}`} id={id} ref={(el) => (sectionsRef.current[id] = el)}>
        <header
          className="tips-header"
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={toggle}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle()}
        >
          <div>
            <h3 className="card-heading">{title}</h3>
            {summary ? <p className="card-summary">{summary}</p> : null}
          </div>
          <div className={`expand-arrow ${isOpen ? 'rotated' : ''}`}>{'▾'}</div>
        </header>
        <div className="tips-details" ref={containerRef} style={{ maxHeight: 0, opacity: 0 }}>
          <div ref={innerRef} className="tips-inner">
            {children}
          </div>
        </div>
      </article>
    );
  }
  

  const dropdowns = [
    {
      title: 'Prioritize Performance-Critical Components',
      badge: 'Quick win',
      summary: 'Spend more on components that directly impact your primary workload (gaming, content, etc.)',
      content: (
        <>
          <p className="tldr">TL;DR: Spend where it matters for your workload — GPU for gaming, CPU for content.</p>
          <ul className="action-list">
            <li><strong>Do:</strong> Allocate ~30–40% to GPU for gaming builds.</li>
            <li><strong>Do:</strong> Prioritize CPU and RAM for productivity/content creation.</li>
            <li><strong>Quick check:</strong> Compare current-gen vs previous-gen price/perf.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Consider Previous Generation Components',
      badge: 'Trade-off',
      summary: 'Last-gen parts often give great value — check price/perf before buying latest.',
      content: (
        <>
          <p className="tldr">TL;DR: Buying last-gen hardware can save money with small performance loss.</p>
          <ul className="action-list">
            <li><strong>Do:</strong> Check prices for previous-gen CPUs/GPUs — often 20–30% cheaper.</li>
            <li><strong>Check:</strong> Feature gaps (PCIe lanes, memory support) before buying.</li>
            <li><strong>Tip:</strong> Look for sales on trusted retailers or gently-used parts.</li>
          </ul>
        </>
      )
    },
    {
      title: "Don't Overspend on the Motherboard",
      badge: 'Long-term',
      summary: 'Choose a mid-range board and avoid paying for features you don\'t need.',
      content: (
        <>
          <p className="tldr">TL;DR: Get a reliable mid-range board — skip expensive extras you won't use.</p>
          <ul className="action-list">
            <li><strong>Do:</strong> Pick a board with the sockets and slots you actually need.</li>
            <li><strong>Avoid:</strong> Paying for premium features (RGB, ultra-high-end audio) if unnecessary.</li>
            <li><strong>Check:</strong> VRM quality for future CPU upgrades.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Start with a Good Foundation',
      badge: 'Essential',
      summary: 'Invest in quality PSU, case, and motherboard for longevity and upgrades.',
      content: (
        <>
          <p className="tldr">TL;DR: Spend a bit more on PSU and case — they protect and enable future upgrades.</p>
          <ul className="action-list">
            <li><strong>Do:</strong> Buy a reputable PSU with headroom (80+ Bronze or better).</li>
            <li><strong>Do:</strong> Choose a case with good airflow and cable management.</li>
            <li><strong>Tip:</strong> A quality PSU often outlives one or two CPU/GPU upgrades.</li>
          </ul>
        </>
      )
    },
    {
      title: 'Plan for Upgrades',
      badge: 'Strategy',
      summary: 'Build with future expansion in mind: leave slots and headroom.',
      content: (
        <>
          <p className="tldr">TL;DR: Design the build for easy upgrades to extend lifespan and save money long-term.</p>
          <ul className="action-list">
            <li><strong>Do:</strong> Start with a strong CPU/motherboard, upgrade GPU later as needed.</li>
            <li><strong>Do:</strong> Buy 2x8GB RAM now and leave room to add more later.</li>
            <li><strong>Check:</strong> PSU wattage headroom and extra M.2 slots.</li>
          </ul>
        </>
      )
    }
  ];

  // builds/templates removed (templates section is intentionally deleted)

  return (
    <div className="budget-tips-page">
      <h1>Budget Optimization Tips</h1>
      <p className="page-description">Build a powerful PC without breaking the bank</p>
      <Navbar />

      {/* First Card */}
      <section className="wiki-section">
        <h2>Budget Allocation Strategy</h2>
        <p className="tldr">TL;DR: Allocate most of your budget to the component that affects your main workload (GPU for gaming, CPU for productivity).</p>

        <div className="alloc-grid">
          <div className="alloc-col">
            <h4>Gaming PC (example)</h4>
            <div className="alloc-row"><span>GPU</span><div className="alloc-bar"><div style={{width:'35%'}}/></div><span className="alloc-pct">35%</span></div>
            <div className="alloc-row"><span>CPU</span><div className="alloc-bar"><div style={{width:'18%'}}/></div><span className="alloc-pct">18%</span></div>
            <div className="alloc-row"><span>Motherboard</span><div className="alloc-bar"><div style={{width:'10%'}}/></div><span className="alloc-pct">10%</span></div>
            <div className="alloc-row"><span>RAM</span><div className="alloc-bar"><div style={{width:'10%'}}/></div><span className="alloc-pct">10%</span></div>
            <div className="alloc-row"><span>Storage</span><div className="alloc-bar"><div style={{width:'10%'}}/></div><span className="alloc-pct">10%</span></div>
            <div className="alloc-row"><span>PSU/Case</span><div className="alloc-bar"><div style={{width:'17%'}}/></div><span className="alloc-pct">17%</span></div>
          </div>
          <div className="alloc-col">
            <h4>Productivity PC (example)</h4>
            <div className="alloc-row"><span>CPU</span><div className="alloc-bar"><div style={{width:'30%'}}/></div><span className="alloc-pct">30%</span></div>
            <div className="alloc-row"><span>RAM</span><div className="alloc-bar"><div style={{width:'18%'}}/></div><span className="alloc-pct">18%</span></div>
            <div className="alloc-row"><span>Storage</span><div className="alloc-bar"><div style={{width:'18%'}}/></div><span className="alloc-pct">18%</span></div>
            <div className="alloc-row"><span>GPU</span><div className="alloc-bar"><div style={{width:'12%'}}/></div><span className="alloc-pct">12%</span></div>
            <div className="alloc-row"><span>Motherboard</span><div className="alloc-bar"><div style={{width:'12%'}}/></div><span className="alloc-pct">12%</span></div>
            <div className="alloc-row"><span>PSU/Case</span><div className="alloc-bar"><div style={{width:'10%'}}/></div><span className="alloc-pct">10%</span></div>
          </div>
        </div>
      </section>

      {/* Second Card */}
      <section className="wiki-section">
        <h2>Smart Saving Strategies</h2>

        <div className="tips-controls">
          <div className="tips-toc">
            {dropdowns.map((d, i) => (
              <button key={d.title} className="toc-tip" onClick={() => {
                const id = `tip-${i}`;
                setOpenIds(prev => prev.includes(id) ? prev : [...prev, id]);
                const el = sectionsRef.current[id];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}>
                <span className="toc-title">{d.title}</span>
                {d.badge ? <span className="badge">{d.badge}</span> : null}
              </button>
            ))}
          </div>
        </div>

        {dropdowns.map((item, index) => (
          <TipCard key={index} id={`tip-${index}`} title={item.title} summary={item.summary}>
            {item.content}
          </TipCard>
        ))}
      </section>

      {/* Budget Build Templates removed per request */}
    </div>
  );
}

export default BudgettipsPage;
