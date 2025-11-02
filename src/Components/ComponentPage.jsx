import React, { useState, useMemo, useEffect, useRef } from "react";
// import Header from "../HomepageForm/Header.jsx"; // removed duplicated header
import ComponentCard from "./ComponentCard";
import './ComponentPage.css';
import { FiFilter } from 'react-icons/fi';
import { FaSortAlphaDown, FaDollarSign, FaArrowUp } from 'react-icons/fa';

import { useComponents } from '../contexts/ComponentsContext.jsx';

const CATEGORY_META = [
  { key: "motherboard", title: "Motherboards", type: 'mobo' },
  { key: "cpu", title: "CPUs", type: 'cpu' },
  { key: "cpu-cooler", title: "CPU Coolers", type: 'cpuCooler' },
  { key: "gpu", title: "GPUs", type: 'gpu' },
  { key: "psu", title: "PSUs", type: 'psu' },
  { key: "ram", title: "RAM", type: 'ram' },
  { key: "storage", title: "Storage", type: 'storage' },
  { key: "m2", title: "M.2 / NVMe", type: 'm2' },
  { key: "case", title: "Cases", type: 'case' },
  { key: "case-fans", title: "Case Fans", type: 'case-fans' },
  { key: "monitor", title: "Monitors", type: 'monitor' },
  { key: "keyboard", title: "Keyboards", type: 'keyboard' },
  { key: "mouse", title: "Mice", type: 'mouse' },
  { key: "headset", title: "Headsets", type: 'headset' },
];

function ComponentPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState(null); // 'alpha' | 'price' | null
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'

  const { dataLookup, loading } = useComponents();

  const filters = [
    { key: "all", title: "All" },
    ...CATEGORY_META.map((c) => ({ key: c.key, title: c.title }))
  ];

  const normalizedQuery = query.trim().toLowerCase();

  // Memoize filtered lists for performance
  const visibleCategories = useMemo(() => {
    const matchesQuery = (component) => {
      if (!normalizedQuery) return true;
      // check name + stringified values
      const text = (component.name || "") + " " + Object.values(component || {}).join(" ");
      return text.toLowerCase().includes(normalizedQuery);
    };

    const sortArray = (arr) => {
      if (!sortBy) return arr;
      const copy = [...arr];
      if (sortBy === "alpha") {
        copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      } else if (sortBy === "price") {
        copy.sort((a, b) => (Number(a.price || 0) - Number(b.price || 0)));
      }
      if (sortOrder === "desc") copy.reverse();
      return copy;
    };

    return CATEGORY_META.map(({ key, title, type }) => {
      const arr = dataLookup?.[type] || [];
      const filtered = arr.filter((c) => {
        if (filter !== "all" && filter !== key) return false;
        return matchesQuery(c);
      });
      return { key, title, arr: sortArray(filtered) };
    }).filter(cat => Array.isArray(cat.arr) && cat.arr.length > 0);
  }, [normalizedQuery, filter, sortBy, sortOrder, dataLookup]);



  const scrollToTop = () => {
    console.log('Scroll to top clicked!');
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  };

  return (
    <>
      {/* Header*/}
      <div className="component-page" style={{ paddingTop: 20, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="componentdb-header">
          
            <h2 className="componentdb-title">Component Database</h2>
            <p className="componentdb-desc">Browse our comprehensive database of PC components with detailed specifications and compatibility information</p>
          
        </div>

         {/* Buttons*/}
        <div className="component-filter-wrap">
          <div className="filter-left">
            <div className="filter-nav">
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`filter-btn ${filter === f.key ? "active" : ""}`}
                  onClick={() => setFilter(f.key)}
                  type="button"
                >
                  {f.title}
                </button>
              ))}

              {/* sort/filter button inside nav */}
              <div className="sort-container">
                <button
                  type="button"
                  className={`filter-btn sort-btn ${sortBy ? "active" : ""}`}
                  onClick={() => setShowSortMenu((s) => !s)}
                  aria-haspopup="true"
                  aria-expanded={showSortMenu}
                >
                  <FiFilter style={{ marginRight: 8 }} /> Sort
                </button>
                {showSortMenu && (
                  <div className="sort-menu" role="menu">
                    <button
                      type="button"
                      className={`sort-option ${sortBy === "alpha" ? "selected" : ""}`}
                      onClick={() => {
                        if (sortBy === "alpha") setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        else {
                          setSortBy("alpha");
                          setSortOrder("asc");
                        }
                        setShowSortMenu(false);
                      }}
                    >
                      <FaSortAlphaDown style={{ marginRight: 8 }} /> Alphabetical
                      {sortBy === "alpha" && <span className="sort-order"> ({sortOrder})</span>}
                    </button>

                    <button
                      type="button"
                      className={`sort-option ${sortBy === "price" ? "selected" : ""}`}
                      onClick={() => {
                        if (sortBy === "price") setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
                        else {
                          setSortBy("price");
                          setSortOrder("asc");
                        }
                        setShowSortMenu(false);
                      }}
                    >
                      <FaDollarSign style={{ marginRight: 8 }} /> Price
                      {sortBy === "price" && <span className="sort-order"> ({sortOrder})</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* moved search below the nav */}
            <div className="search-row">
              <input
                className="search-input"
                type="search"
                placeholder="Search components by name or spec..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search components"
              />
              {query && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* removed filter-right - search is now under filter-left */}
        </div>

        {/* Floating filter button shown after scrolling past header */}
        <FloatingFilterButton
          filters={filters}
          activeFilter={filter}
          onFilterChange={setFilter}
          query={query}
          onQueryChange={setQuery}
        />

        {loading && (
          <div className="no-results">Loading components...</div>
        )}
        <div style={{ flex: 1 }}>
          {!loading && visibleCategories.length === 0 && (
            <div className="no-results">No components found.</div>
          )}

          {visibleCategories.map(({ key, title, arr }) => (
            <section
              key={key}
              className={`component-section component-section--${key}`}
            >
              <h2>{title}</h2>
              <div className="component-grid">
                {arr.map((component, idx) => (
                  <ComponentCard
                    key={component.id ?? `${key}-${idx}`}
                    component={component}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Scroll to top button */}
        <button 
          className="scroll-to-top-btn" 
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaArrowUp />
        </button>
      </div>
    </>
  );
}

export default ComponentPage;

function FloatingFilterButton({ filters, activeFilter, onFilterChange, query, onQueryChange }) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [renderPopover, setRenderPopover] = useState(false);
  const ANIM_MS = 180; // match CSS transition timing

  useEffect(() => {
    const el = document.querySelector('.comp-list');
    // compute absolute threshold where comp-list bottom has scrolled past the viewport top
    let threshold = 220; // fallback
    if (el) {
      const rect = el.getBoundingClientRect();
      threshold = rect.bottom + window.scrollY;
    }

    let lastY = window.scrollY;
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        const scrollingUp = delta < 0;

        // Show when we've passed the threshold OR when the user scrolls up a bit
        const shouldShow = y >= threshold || (scrollingUp && y > 60);
        setVisible(shouldShow);
        lastY = y;
        ticking = false;
      });
    }

    // recompute threshold on resize
    function onResize() {
      const el2 = document.querySelector('.comp-list');
      if (el2) {
        const r2 = el2.getBoundingClientRect();
        threshold = r2.bottom + window.scrollY;
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // manage render/unmount so we can animate close
  useEffect(() => {
    if (open) {
      setRenderPopover(true);
    } else if (renderPopover) {
      // start closing animation then unmount
      const t = setTimeout(() => setRenderPopover(false), ANIM_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // keyboard: ESC to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!visible && !open) return null;

  function toggle() {
    if (!open) {
      setRenderPopover(true);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }

  return (
    <div className="floating-filter">
      <button
        className="floating-filter-btn"
        onClick={toggle}
        aria-expanded={open}
        aria-label="Open filters"
      >
        Filters
      </button>

      {renderPopover && (
        <div
          className={`floating-filter-popover ${open ? 'open' : 'closing'}`}
          role="dialog"
          aria-modal="false"
        >
          <div className="filter-nav">
            {filters.map(f => (
              <button
                key={f.key}
                className={`filter-btn ${activeFilter === f.key ? 'active' : ''}`}
                onClick={() => { onFilterChange(f.key); }}
                type="button"
              >
                {f.title}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 8 }}>
            <input
              className="search-input"
              type="search"
              placeholder="Search components..."
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
