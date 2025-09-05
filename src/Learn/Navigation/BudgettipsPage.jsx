import React, { useState } from 'react';
import './BudgettipsPage.css';
import Navbar from '../Navigation/Navbar.jsx';

function BudgettipsPage() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedBuild, setSelectedBuild] = useState('Budget');

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };
  

  const dropdowns = [
    {
      title: 'Prioritize Performance-Critical Components',
      content: (
        <>
          Spend more on components that directly impact performance for your specific use case:
          <ul>
            <li>Gaming: GPU &gt; CPU &gt; RAM &gt; Storage</li>
            <li>Content Creation: CPU &gt; RAM &gt; Storage &gt; GPU</li>
            <li>General Use: CPU &gt; SSD &gt; RAM &gt; GPU</li>
          </ul>
        </>
      )
    },
    {
      title: 'Consider Previous Generation Components',
      content: (
        <>
          Last-gen components often offer excellent value:
          <ul>
            <li>20–30% cheaper, 10–15% less performance</li>
            <li>Ryzen 5000 series and Intel 12th Gen still great in 2023</li>
            <li>RTX 3000 series still good vs RTX 4000</li>
          </ul>
        </>
      )
    },
    {
      title: "Don't Overspend on the Motherboard",
      content: (
        <>
          Mid-range boards offer best value:
          <ul>
            <li>B550, B660 offer great features</li>
            <li>Only pay for features you need (Wi-Fi, extra M.2, VRMs)</li>
            <li>Check for needed ports and expansion slots</li>
          </ul>
        </>
      )
    },
    {
      title: 'Start with a Good Foundation',
      content: (
        <>
          Invest in long-lasting parts:
          <ul>
            <li>Good PSU lasts 10+ years</li>
            <li>Case with airflow supports future upgrades</li>
            <li>Motherboard with extra slots for expandability</li>
          </ul>
        </>
      )
    },
    {
      title: 'Plan for Upgrades',
      content: (
        <>
          Build with expansion in mind:
          <ul>
            <li>Strong CPU & motherboard first, GPU later</li>
            <li>Start with 2x8GB RAM, leave room to expand</li>
            <li>Begin with NVMe SSD, add storage later</li>
            <li>PSU with headroom for GPU upgrade</li>
          </ul>
        </>
      )
    }
  ];

  const builds = {
    Budget: {
      title: 'Budget Gaming Build (₱35,000)',
      parts: [
        'CPU: Intel Core i3-12100F (₱6,500) or AMD Ryzen 5 5500 (₱7,000)',
        'Motherboard: MSI PRO B660M-A (₱6,000) or MSI B550M PRO-VDH (₱5,500)',
        'GPU: NVIDIA GTX 1660 Super (₱12,000) or AMD RX 6600 (₱13,000)',
        'RAM: 16GB (2x8GB) DDR4-3200 (₱3,500)',
        'Storage: 500GB NVMe SSD (₱3,000)',
        'PSU: 550W 80+ Bronze (₱3,000)',
        'Case: Budget ATX case with mesh front (₱2,000)',
        'Performance: 1080p gaming at medium-high settings'
      ]
    },
    Mid: {
      title: 'Mid-range Gaming Build (₱65,000)',
      parts: [
        'CPU: Intel Core i5-13400F (₱11,000) or Ryzen 5 7600 (₱13,000)',
        'Motherboard: B660M or B650M (₱6,000–₱7,000)',
        'GPU: RTX 3060 Ti (₱20,000) or RX 6700 XT (₱21,000)',
        'RAM: 16GB (2x8GB) DDR4/DDR5 (₱4,000)',
        'Storage: 1TB NVMe SSD (₱4,500)',
        'PSU: 650W 80+ Bronze or Gold (₱4,000)',
        'Case: Mid-tower with good airflow (₱2,500)',
        'Performance: Excellent 1080p / good 1440p'
      ]
    },
    High: {
      title: 'High-end Gaming Build (₱100,000)',
      parts: [
        'CPU: Ryzen 7 7800X3D (₱21,000) or Intel Core i7-14700KF (₱22,000)',
        'Motherboard: B650/X670 or Z790 (₱9,000–₱12,000)',
        'GPU: RTX 4070 Super (₱36,000) or RX 7900 XT (₱38,000)',
        'RAM: 32GB DDR5 (2x16GB) 6000MHz (₱7,000)',
        'Storage: 1TB Gen4 NVMe SSD (₱5,000)',
        'PSU: 750W–850W Gold (₱5,500)',
        'Case: High-airflow premium ATX (₱3,000–₱5,000)',
        'Performance: Ultra 1440p / entry 4K'
      ]
    }
  };

  return (
    <div className="budget-tips-page">
      <h1>Budget Optimization Tips</h1>
      <p className="page-description">Build a powerful PC without breaking the bank</p>
      <Navbar />
      
  {/* First Card */}
  <section className="wiki-section">
        <h2>Budget Allocation Strategy</h2>
        <h3>Gaming PC Budget Breakdown</h3>
        <ul>
          <li>GPU: 30–40% of budget</li>
          <li>CPU: 15–20%</li>
          <li>Motherboard, RAM, Storage: 10–15% each</li>
          <li>PSU, Case: 5–10% each</li>
        </ul>
        <p><strong>Example:</strong> ₱50,000 build → ₱15,000–₱20,000 on GPU, ₱7,500–₱10,000 on CPU</p>

        <h3>Productivity PC Budget Breakdown</h3>
        <ul>
          <li>CPU: 25–30% of budget</li>
          <li>RAM, Storage: 15–20%</li>
          <li>GPU: 10–15%</li>
          <li>Motherboard, PSU, Case: 5–15%</li>
        </ul>
  </section>

  {/* Second Card */}
  <section className="wiki-section">
        <h2>Smart Saving Strategies</h2>
        {dropdowns.map((item, index) => (
          <div key={index} className="dropdown">
            <button onClick={() => toggleDropdown(index)} className="dropdown-button">
              {item.title}
            </button>
            {openDropdown === index && (
              <div className="dropdown-content">
                {item.content}
              </div>
            )}
          </div>
        ))}
  </section>

  {/* Third Card */}
  <section className="wiki-section">
        <h2>Budget Build Templates</h2>
        <div className="build-nav">
          {['Budget', 'Mid', 'High'].map((tab) => (
            <button
              key={tab}
              className={selectedBuild === tab ? 'active' : ''}
              onClick={() => setSelectedBuild(tab)}
            >
              {tab === 'Budget' ? '₱35,000' : tab === 'Mid' ? '₱65,000' : '₱100,000'}
            </button>
          ))}
        </div>
        <div className="build-details">
          <h3>{builds[selectedBuild].title}</h3>
          <ul>
            {builds[selectedBuild].parts.map((part, idx) => (
              <li key={idx}>{part}</li>
            ))}
          </ul>
        </div>
  </section>
    </div>
  );
}

export default BudgettipsPage;
