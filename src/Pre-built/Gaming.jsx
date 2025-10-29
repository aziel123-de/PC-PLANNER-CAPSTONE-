import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css';


const performanceData = {
  "Budget Gaming": { category: "Gaming", gaming: 60, productivity: 50, streaming: 40 },
  "Mid-Range Gaming": { category: "Gaming", gaming: 80, productivity: 65, streaming: 70 },
  "High-End Gaming": { category: "Gaming", gaming: 95, productivity: 80, streaming: 90 },
};

const Gaming = () => {

  // Mock builds data
  const builds = [
    {
      id: 1,
      name: "Budget Gaming",
      description: "Entry-level gaming build for 1080p gaming.",
      price: 25000,
      specs: [
      "Intel Core i3-12100F",
      "8GB DDR4 3200MHz",
      "NVIDIA GeForce GTX 1650",
      "256GB NVMe SSD",
      "Intel B660 Chipset",
      "450W 80+ Bronze"
    ],
    peripherals: [
      "Logitech G213 Prodigy Gaming Keyboard",
      "Logitech G102 Lightsync Gaming Mouse"
    ]
    },
    {
      id: 2,
      name: "Mid-Range Gaming",
      description: "Smooth 1080p/1440p gaming experience.",
      price: 50000,
      specs: [
      "Intel Core i5-12400F",
      "16GB DDR4 3200MHz",
      "NVIDIA GeForce RTX 3060",
      "512GB NVMe SSD",
      "Intel B660 Chipset",
      "650W 80+ Bronze"
    ],
    peripherals: [
      "Corsair K55 RGB Gaming Keyboard",
      "Logitech G502 Hero Gaming Mouse"
    ]
    },
    {
      id: 3,
      name: "High-End Gaming",
      description: "Max settings 1440p/4K gaming.",
      price: 120000,
      specs: [
      "Intel Core i7-13700K",
      "32GB DDR5 5600MHz",
      "NVIDIA GeForce RTX 4080",
      "1TB NVMe Gen4 SSD",
      "Intel Z790 Chipset",
      "850W 80+ Gold"
    ],
    peripherals: [
      "Razer BlackWidow V3 Mechanical Gaming Keyboard",
      "Logitech G Pro X Superlight Mouse"
    ]
    }
  ];
  const [animatedValues, setAnimatedValues] = useState({
    "Budget Gaming": performanceData["Budget Gaming"],
    "Mid-Range Gaming": performanceData["Mid-Range Gaming"],
    "High-End Gaming": performanceData["High-End Gaming"]
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
    if (perf.category === "Gaming") {
      return (
        <>
          {renderStat("Gaming", perf.gaming, perf.category)}
          {renderStat("Productivity", perf.productivity, perf.category)}
          {renderStat("Streaming", perf.streaming, perf.category)}
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

export default Gaming;