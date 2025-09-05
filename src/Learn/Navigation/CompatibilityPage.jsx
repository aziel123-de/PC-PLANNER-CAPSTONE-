import React from 'react';
import Navbar from '../Navigation/Navbar.jsx';
import './CompatibilityPage.css';

function CompatibilityPage() {
  return (
    <div className="compatibility-page">
      <h1 className="section-title">Component Compatibility</h1>
      <p className="page-description">Ensure all your PC parts work together seamlessly</p>
      <Navbar />
      <div className="vertical-container">

        {/* CPU & Motherboard */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">CPU and Motherboard Compatibility</h3>
          <p className="vertical-card-text">The most critical compatibility check.</p>

          <h4>Socket Type</h4>
          <ul>
            <li><strong>AMD:</strong> AM4 (Ryzen 3000/5000), AM5 (Ryzen 7000)</li>
            <li><strong>Intel:</strong> LGA1700 (12th/13th Gen), LGA1200 (10th/11th Gen)</li>
          </ul>

          <h4>Chipset Compatibility</h4>
          <ul>
            <li><strong>AMD AM4:</strong> X570, B550, A520 (for Ryzen 5000)</li>
            <li><strong>Intel LGA1700:</strong> Z690, B660, H610 (for 12th/13th Gen)</li>
          </ul>
          <p><strong>Note:</strong> Some older chipsets may require a BIOS update to support newer CPUs.</p>
        </div>

        {/* RAM */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">RAM Compatibility</h3>
          <p className="vertical-card-text">Memory must match motherboard specifications.</p>

          <h4>Memory Type</h4>
          <ul>
            <li><strong>DDR4:</strong> Common for builds from 2015–2021</li>
            <li><strong>DDR5:</strong> Newer standard for latest Intel and AMD platforms</li>
          </ul>

          <h4>Memory Speed</h4>
          <ul>
            <li><strong>AMD Ryzen:</strong> Benefits from faster RAM (3600MHz ideal)</li>
            <li><strong>Intel:</strong> Less sensitive, but still benefits</li>
            <li>RAM speed depends on both RAM and motherboard limits</li>
          </ul>
        </div>

        {/* PSU */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">PSU Requirements</h3>
          <p className="vertical-card-text">Your PSU must provide enough power for all components.</p>

          <h4>Wattage Requirements</h4>
          <ul>
            <li>Sum up CPU + GPU TDP</li>
            <li>Add ~100–150W for motherboard, RAM, storage, fans</li>
            <li>Add 30% headroom for future upgrades</li>
            <li>
              <strong>Example:</strong> 105W CPU + 220W GPU + 100W = 425W × 1.3 = <strong>552.5W → choose 650W PSU</strong>
            </li>
          </ul>

          <h4>Connector Requirements</h4>
          <ul>
            <li>CPU: 4+4 or 8-pin EPS</li>
            <li>GPU: 6-pin / 8-pin / 12-pin PCIe</li>
            <li>SATA: For drives</li>
            <li>Motherboard: 24-pin ATX</li>
          </ul>
        </div>

        {/* Storage */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">Storage Compatibility</h3>
          <p className="vertical-card-text">Match your drives to available connections.</p>

          <h4>Interface Types</h4>
          <ul>
            <li><strong>NVMe M.2:</strong> Fastest, requires M.2 PCIe slot</li>
            <li><strong>SATA M.2:</strong> M.2 slot, SATA speed</li>
            <li><strong>SATA SSD/HDD:</strong> Uses SATA ports on motherboard</li>
          </ul>

          <h4>Form Factor</h4>
          <ul>
            <li><strong>2280:</strong> Most common (22mm × 80mm)</li>
            <li><strong>Other sizes:</strong> 2242, 2260, 22110</li>
            <li>Check motherboard support for length</li>
          </ul>
        </div>

        {/* Checklist Card */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">Compatibility Checklist</h3>
          <ul className="vertical-checklist">
            <li>Always check CPU socket compatibility before buying</li>
            <li>Verify RAM is on motherboard's QVL (Qualified Vendor List)</li>
            <li>Confirm GPU length and case clearance</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default CompatibilityPage;
