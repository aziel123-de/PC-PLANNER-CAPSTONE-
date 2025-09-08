import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gaming.css';

const performanceData = {
  // Gaming
  "Budget Gaming": { category: "Gaming", gaming: 60, productivity: 50, streaming: 40 },
  "Mid-Range Gaming": { category: "Gaming", gaming: 80, productivity: 65, streaming: 70 },
  "High-End Gaming": { category: "Gaming", gaming: 95, productivity: 80, streaming: 90 },

  // Productivity
  "Entry-level Workstation": { category: "Productivity", productivity: 75, multitasking: 60, mediaEditing: 55 },
  "Professional Workstation": { category: "Productivity", productivity: 85, multitasking: 80, mediaEditing: 75 },
  "High-End Productivity PC": { category: "Productivity", productivity: 95, multitasking: 90, mediaEditing: 88 },
  

  // General Use
  "Basic Home PC": { category: "General", web: 85, office: 70, entertainment: 60 },
  "Home Office PC": { category: "General", web: 95, office: 85, entertainment: 80 },
  "Premium GeneralUse": { category: "General", web: 100, office: 95, entertainment: 90 },
};

const All = () => {

  // Mock builds data for all categories
  const builds = [
    // Gaming
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
      description: "Max settings 1440p/4K gaming experience.",
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
    },
    // Productivity
    {
      id: 4,
      name: "Entry-level Workstation",
      description: "Affordable Workstation for office & editing.",
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
      id: 5,
      name: "Professional Workstation",
      description: "Workstation for editing & multitasking.",
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
      id: 6,
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

    },
    

    // General Use
    {
      id: 7,
      name: "Basic Home PC",
      description: "Simple PC for web, office, and entertainment.",
      price: 18000,
      specs: [
            "Intel Pentium Gold G6400",
            "4GB DDR4 2666MHz",
            "Intel UHD Graphics 610",
            "256GB SATA SSD",
            "Intel H410 Chipset",
            "300W PSU"
        ],
      peripherals: [
            "Logitech K120 Keyboard ",
            "Logitech M90 Mouse"
        ]
    },
    {
      id: 8,
      name: "Home Office PC",
      description: "Reliable PC for home office tasks.",
      price: 30000,
      specs: [
              "Intel Core i3-12100",
              "8GB DDR4 3200MHz",
              "Intel UHD Graphics 730",
              "512GB NVMe SSD",
              "Intel B660 Chipset",
              "450W 80+ Bronze"
  ],
      peripherals:[
              "Logitech MK270 Wireless Keyboard & Mouse Combo",
              "Logitech C270 HD Webcam"
      ]
    },
    {
      id: 9,
      name: "Premium GeneralUse",
      description: "Premium desktop computer for versatile performance.",
      price: 60000,
      specs: [
                "Intel Core i5-12400",
                "16GB DDR4 3200MHz",
                "Intel UHD Graphics 730",
                "1TB NVMe SSD",
                "Intel B660 Chipset",
                "500W 80+ Bronze"
  ],
      peripherals: [
            "Logitech G413 Mechanical Keyboard",
            "Logitech MX Master 3 Mouse"
        ]
    }
  ];
  const [animatedValues, setAnimatedValues] = useState({
    "Budget Gaming": performanceData["Budget Gaming"],
    "Mid-Range Gaming": performanceData["Mid-Range Gaming"],
    "High-End Gaming": performanceData["High-End Gaming"],
    "Entry-level Workstation": performanceData["Entry-level Workstation"],
    "Professional Workstation": performanceData["Professional Workstation"],
    "High-End Productivity PC": performanceData["High-End Productivity PC"],  
    "Basic Home PC": performanceData["Basic Home PC"],
    "Home Office PC": performanceData["Home Office PC"],
    "Premium GeneralUse": performanceData["Premium GeneralUse"]
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
                Add to Build
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default All;