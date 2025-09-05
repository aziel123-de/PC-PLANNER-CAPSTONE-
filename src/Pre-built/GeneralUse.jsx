import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css'; // same CSS for consistency

const performanceData = {
  "Basic Home PC": { category: "General", web: 85, office: 70, entertainment: 60 },
  "Home Office PC": { category: "General", web: 95, office: 85, entertainment: 80 },
  "Premium General Use PC": { category: "General", web: 100, office: 95, entertainment: 90 },
};

const GeneralUse = () => {

  // Mock builds data for general use
  const builds = [
    {
      id: 1,
      name: "Basic Home PC",
      description: "Simple PC for web, office, and entertainment.",
      price: 18000,
      specs: ["Intel Pentium", "4GB RAM", "Integrated Graphics", "256GB SSD"],
      peripherals: ["Basic Keyboard", "Basic Mouse"]
    },
    {
      id: 2,
      name: "Home Office PC",
      description: "Reliable PC for home office tasks.",
      price: 30000,
      specs: ["Intel Core i3", "8GB RAM", "Integrated Graphics", "512GB SSD"],
      peripherals: ["Wireless Keyboard", "Wireless Mouse"]
    },
    {
      id: 3,
      name: "Premium General Use PC",
      description: "High-end PC for all-around use.",
      price: 60000,
      specs: ["Intel Core i5", "16GB RAM", "Integrated Graphics", "1TB SSD"],
      peripherals: ["Premium Keyboard", "Premium Mouse"]
    }
  ];
  const [animatedValues, setAnimatedValues] = useState({
    "Basic Home PC": performanceData["Basic Home PC"],
    "Home Office PC": performanceData["Home Office PC"],
    "Premium General Use PC": performanceData["Premium General Use PC"]
  });
  const navigate = useNavigate();

  const renderList = (list) => {
    if (!Array.isArray(list)) return <li>Invalid data</li>;
    return list.map((item, idx) => <li key={idx}>{item}</li>);
  };

  const handleClick = () => {
    navigate('/customize');
  };

  const renderStat = (label, value, category) => (
    <>
      <div className="stat-row">
        <span>{label}</span>
        <span>{value || 0}%</span>
      </div>
      <div className="progress-container">
        <div className={`progress-bar ${category?.toLowerCase()}`} style={{ width: `${value || 0}%` }}></div>
      </div>
    </>
  );

  const renderPerformanceBars = (perf) => {
    if (perf.category === "General") {
      return (
        <>
          {renderStat("Web Browsing", perf.web, perf.category)}
          {renderStat("Office Work", perf.office, perf.category)}
          {renderStat("Entertainment", perf.entertainment, perf.category)}
        </>
      );
    }
    return <p>No performance data available</p>;
  };

  return (
    <div className="container">
      <div className="grid">
        {builds.map((build) => {
          const perf = animatedValues[build.name] || { category: "" };
          return (
            <div className="build-card" key={build.id}>
              <h2>{build.name}</h2>
              <p><strong>{build.description}</strong></p>
              <p><span className="price">₱{build.price.toLocaleString()}</span></p>

              <h4>Performance</h4>
              {renderPerformanceBars(perf)}

              <h4>Specifications</h4>
              <ul>{renderList(build.specs)}</ul>

              <h4>Recommended Peripherals</h4>
              <ul>{renderList(build.peripherals)}</ul>

              <button className="Customization" onClick={handleClick}>
                Customize
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeneralUse;