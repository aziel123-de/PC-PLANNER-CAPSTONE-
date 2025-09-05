import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css'; // Reuse the same CSS

const performanceData = {
  "Entry Workstation": { category: "Productivity", productivity: 75, multitasking: 60, mediaEditing: 55 },
  "Professional Workstation": { category: "Productivity", productivity: 85, multitasking: 80, mediaEditing: 75 },
  "High-End Productivity PC": { category: "Productivity", productivity: 95, multitasking: 90, mediaEditing: 88 },
};

const Productivity = () => {

  // Mock builds data for productivity
  const builds = [
    {
      id: 1,
      name: "Entry Workstation",
      description: "Affordable workstation for office and light editing.",
      price: 35000,
      specs: ["Intel Core i5", "16GB RAM", "Integrated Graphics", "512GB SSD"],
      peripherals: ["Standard Keyboard", "Standard Mouse"]
    },
    {
      id: 2,
      name: "Professional Workstation",
      description: "Powerful workstation for multitasking and editing.",
      price: 80000,
      specs: ["Intel Core i7", "32GB RAM", "RTX 3060", "1TB SSD"],
      peripherals: ["Ergonomic Keyboard", "Precision Mouse"]
    },
    {
      id: 3,
      name: "High-End Productivity PC",
      description: "Ultimate productivity for demanding tasks.",
      price: 150000,
      specs: ["Intel Core i9", "64GB RAM", "RTX 4090", "2TB NVMe SSD"],
      peripherals: ["Premium Keyboard", "Premium Mouse"]
    }
  ];
  const [animatedValues, setAnimatedValues] = useState({
    "Entry Workstation": performanceData["Entry Workstation"],
    "Professional Workstation": performanceData["Professional Workstation"],
    "High-End Productivity PC": performanceData["High-End Productivity PC"]
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
    if (perf.category === "Productivity") {
      return (
        <>
          {renderStat("Productivity", perf.productivity, perf.category)}
          {renderStat("Multitasking", perf.multitasking, perf.category)}
          {renderStat("Media Editing", perf.mediaEditing, perf.category)}
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

export default Productivity;