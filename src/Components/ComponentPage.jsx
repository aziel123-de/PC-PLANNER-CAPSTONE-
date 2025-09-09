import React, { useState, useMemo } from "react";
// import Header from "../HomepageForm/Header.jsx"; // removed duplicated header
import ComponentCard from "./ComponentCard";
import './ComponentPage.css';
import { FiFilter } from 'react-icons/fi';
import { FaSortAlphaDown, FaDollarSign } from 'react-icons/fa';

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

const CATEGORY_LIST = [
  { key: "motherboard", arr: moboOptions, title: "Motherboards" },
  { key: "cpu", arr: cpuOptions, title: "CPUs" },
  { key: "gpu", arr: gpuOptions, title: "GPUs" },
  { key: "psu", arr: psuOptions, title: "PSUs" },
  { key: "ram", arr: ramOptions, title: "RAM" },
  { key: "storage", arr: storageOptions, title: "Storage" },
  { key: "m2", arr: m2Options, title: "M.2 / NVMe" },
  { key: "case", arr: caseOptions, title: "Cases" },
];

function ComponentPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState(null); // 'alpha' | 'price' | null
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' | 'desc'

  const filters = [
    { key: "all", title: "All" },
    ...CATEGORY_LIST.map((c) => ({ key: c.key, title: c.title })),
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

    return CATEGORY_LIST.map(({ key, arr, title }) => {
      const filtered = (Array.isArray(arr) ? arr : []).filter((c) => {
        if (filter !== "all" && filter !== key) return false;
        return matchesQuery(c);
      });
      return { key, title, arr: sortArray(filtered) };
    }).filter(cat => Array.isArray(cat.arr) && cat.arr.length > 0);
  }, [normalizedQuery, filter, sortBy, sortOrder]);

  return (
    <>
      {/* Header removed here — App.jsx should render the global Header */}
      <div className="component-page" style={{ paddingTop: 80 }}>
        <div className="componentdb-header">
          <h2 className="componentdb-title">Component Database</h2>
          <p className="componentdb-desc">Browse our comprehensive database of PC components with detailed specifications and compatibility information</p>
        </div>
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

        {visibleCategories.length === 0 && (
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
    </>
  );
}

export default ComponentPage;
