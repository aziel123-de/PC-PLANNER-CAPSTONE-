import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css'; // Reuse the same CSS

const performanceData = {
  "Entry-level Workstation": { category: "Productivity", productivity: 75, multitasking: 60, mediaEditing: 55 },
  "Professional Workstation": { category: "Productivity", productivity: 85, multitasking: 80, mediaEditing: 75 },
  "High-End Productivity PC": { category: "Productivity", productivity: 95, multitasking: 90, mediaEditing: 88 },
};

const Productivity = () => {

  // Mock builds data for productivity
  const builds = [
    {
      id: 1,
      name: "Entry-level Workstation",
      description: "Affordable workstation for office and light editing.",
      price: 35000,
      specs: [
      "Intel Core i5-12400",
      "16GB DDR4 3200MHz",
      "Intel UHD Graphics 730",
      "512GB NVMe SSD",
      "Intel B660 Chipset",
      "450W 80+ Bronze"
    ],
    peripherals: [
      "Logitech K270 Wireless Keyboard",
      "Logitech M185 Wireless Mouse"
    ]
    },
    {
      id: 2,
      name: "Professional Workstation",
      description: "Powerful workstation for multitasking and editing.",
      price: 80000,
      specs: [
      "Intel Core i7-12700",
      "32GB DDR4 3200MHz",
      "NVIDIA GeForce RTX 3060",
      "1TB NVMe SSD",
      "Intel Z690 Chipset",
      "650W 80+ Gold"
    ],
    peripherals: [
      "Logitech MX Keys Advanced Wireless Keyboard",
      "Logitech MX Master 3S Wireless Mouse"
    ]
    },
    {
      id: 3,
      name: "High-End Productivity PC",
      description: "Ultimate productivity for demanding tasks.",
      price: 150000,
      specs:  [
      "Intel Core i9-13900K",
      "64GB DDR5 5600MHz",
      "NVIDIA GeForce RTX 4090",
      "2TB NVMe Gen4 SSD",
      "Intel Z790 Chipset",
      "1000W 80+ Platinum"
    ],
    peripherals: [
      "Corsair K95 RGB Mechanical Keyboard",
      "Logitech MX Master 3S Wireless Mouse"
    ]
    }
  ];
  const [animatedValues, setAnimatedValues] = useState({
    "Entry-level Workstation": performanceData["Entry-level Workstation"],
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
                Add to Build
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Productivity;