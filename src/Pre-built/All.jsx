import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css';

const performanceData = {
  // Gaming
  "Budget Gaming PC": { category: "Gaming", gaming: 60, productivity: 50, streaming: 40 },
  "Mid-Range Gaming PC": { category: "Gaming", gaming: 80, productivity: 65, streaming: 70 },
  "High-End Gaming PC": { category: "Gaming", gaming: 95, productivity: 80, streaming: 90 },

  // Productivity
  "Entry Workstation": { category: "Productivity", productivity: 75, multitasking: 60, mediaEditing: 55 },
  "Professional Workstation": { category: "Productivity", productivity: 85, multitasking: 80, mediaEditing: 75 },
  

  // General Use
  "Basic Home PC": { category: "General", web: 85, office: 70, entertainment: 60 },
  "Home Office PC": { category: "General", web: 95, office: 85, entertainment: 80 },
  "Premium General Use PC": { category: "General", web: 100, office: 95, entertainment: 90 },
};

const All = () => {

  // Mock builds data for all categories
  const builds = [
    // Gaming
    {
      id: 1,
      name: "Budget Gaming PC",
      description: "Entry-level gaming build for 1080p gaming.",
      price: 25000,
      specs: ["Intel Core i3", "8GB RAM", "GTX 1650", "256GB SSD"],
      peripherals: ["Basic Keyboard", "Basic Mouse"]
    },
    {
      id: 2,
      name: "Mid-Range Gaming PC",
      description: "Smooth 1080p/1440p gaming experience.",
      price: 50000,
      specs: ["Intel Core i5", "16GB RAM", "RTX 3060", "512GB SSD"],
      peripherals: ["Gaming Keyboard", "Gaming Mouse"]
    },
    {
      id: 3,
      name: "High-End Gaming PC",
      description: "Max settings 1440p/4K gaming.",
      price: 120000,
      specs: ["Intel Core i7", "32GB RAM", "RTX 4080", "1TB NVMe SSD"],
      peripherals: ["Mechanical Keyboard", "High DPI Mouse"]
    },
    // Productivity
    {
      id: 4,
      name: "Entry Workstation",
      description: "Affordable workstation for office and light editing.",
      price: 35000,
      specs: ["Intel Core i5", "16GB RAM", "Integrated Graphics", "512GB SSD"],
      peripherals: ["Standard Keyboard", "Standard Mouse"]
    },
    {
      id: 5,
      name: "Professional Workstation",
      description: "Powerful workstation for multitasking and editing.",
      price: 80000,
      specs: ["Intel Core i7", "32GB RAM", "RTX 3060", "1TB SSD"],
      peripherals: ["Ergonomic Keyboard", "Precision Mouse"]
    },
    

    // General Use
    {
      id: 6,
      name: "Basic Home PC",
      description: "Simple PC for web, office, and entertainment.",
      price: 18000,
      specs: ["Intel Pentium", "4GB RAM", "Integrated Graphics", "256GB SSD"],
      peripherals: ["Basic Keyboard", "Basic Mouse"]
    },
    {
      id: 7,
      name: "Home Office PC",
      description: "Reliable PC for home office tasks.",
      price: 30000,
      specs: ["Intel Core i3", "8GB RAM", "Integrated Graphics", "512GB SSD"],
      peripherals: ["Wireless Keyboard", "Wireless Mouse"]
    },
    {
      id: 8,
      name: "Premium General Use PC",
      description: "High-end PC for all-around use.",
      price: 60000,
      specs: ["Intel Core i5", "16GB RAM", "Integrated Graphics", "1TB SSD"],
      peripherals: ["Premium Keyboard", "Premium Mouse"]
    }
  ];
  const [animatedValues, setAnimatedValues] = useState({
    "Budget Gaming PC": performanceData["Budget Gaming PC"],
    "Mid-Range Gaming PC": performanceData["Mid-Range Gaming PC"],
    "High-End Gaming PC": performanceData["High-End Gaming PC"],
    "Entry Workstation": performanceData["Entry Workstation"],
    "Professional Workstation": performanceData["Professional Workstation"],
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

  const renderPerformanceBars = (perf) => {
    if (perf.category === "Gaming") {
      return (
        <>
          {renderStat("Gaming", perf.gaming, perf.category)}
          {renderStat("Productivity", perf.productivity, perf.category)}
          {renderStat("Streaming", perf.streaming, perf.category)}
        </>
      );
    } else if (perf.category === "Productivity") {
      return (
        <>
          {renderStat("Productivity", perf.productivity, perf.category)}
          {renderStat("Multitasking", perf.multitasking, perf.category)}
          {renderStat("Media Editing", perf.mediaEditing, perf.category)}
        </>
      );
    } else if (perf.category === "General") {
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

export default All;