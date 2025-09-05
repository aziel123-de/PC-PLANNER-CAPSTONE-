import React from 'react';
import Navbar from '../Navigation/Navbar.jsx';
import './BottlenecksPage.css';

function BottlenecksPage() {
  return (
    <div className="bottlenecks-page">
      <h1 className="section-title">Understanding Bottlenecks</h1>
      <p className="page-description">
        A bottleneck occurs when one component limits your system's performance. Learn how to identify and avoid the most common ones.
      </p>
      <Navbar />

      <div className="vertical-container">

        {/* CPU Bottleneck */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">CPU Bottlenecks</h3>
          <p>When your processor limits system performance.</p>

          <h4>Signs</h4>
          <ul>
            <li>GPU usage below 90-95% while CPU cores are at 100%</li>
            <li>Frame rates don't improve when lowering graphics settings</li>
            <li>Stuttering or inconsistent performance in CPU-heavy games</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>Entry-level CPU (e.g., Ryzen 3 or Core i3) with a high-end GPU</li>
            <li>Older CPUs paired with modern GPUs</li>
            <li>Simulation games or streaming while gaming</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Pair CPU and GPU of similar tier</li>
            <li>Choose CPUs with more cores for multitasking</li>
            <li>Prioritize single-core performance for gaming</li>
          </ul>
        </div>

        {/* GPU Bottleneck */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">GPU Bottlenecks</h3>
          <p>When your graphics card limits system performance.</p>

          <h4>Signs</h4>
          <ul>
            <li>GPU usage at 99-100% while CPU usage is lower</li>
            <li>Frame rates improve when lowering resolution or graphics settings</li>
            <li>Poor performance in graphically intense games</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>High-end CPU with entry-level GPU</li>
            <li>Playing at ultra settings or high resolutions (e.g., 4K) on mid-tier GPU</li>
            <li>Using ray tracing or other demanding features</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Match GPU to your monitor resolution and refresh rate</li>
            <li>Spend more on GPU for gaming builds</li>
            <li>Check VRAM needs for your games</li>
          </ul>
        </div>

        {/* RAM Bottleneck */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">RAM Bottlenecks</h3>
          <p>When memory limits system performance.</p>

          <h4>Signs</h4>
          <ul>
            <li>High memory usage (90%+)</li>
            <li>Frequent use of page file (virtual memory)</li>
            <li>Stuttering during multitasking</li>
            <li>Slow system despite strong CPU/GPU</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>Only 8GB RAM for modern gaming or editing</li>
            <li>Slow RAM with Ryzen CPUs</li>
            <li>Running heavy apps side by side</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Use 16GB RAM for gaming, 32GB+ for content creation</li>
            <li>Enable dual-channel (2 or 4 sticks)</li>
            <li>Use 3200–3600MHz for AMD, 3200MHz+ for Intel</li>
          </ul>
        </div>

        {/* Storage Bottleneck */}
        <div className="vertical-card interactive-card">
          <h3 className="vertical-card-title">Storage Bottlenecks</h3>
          <p>When storage speed slows down the system.</p>

          <h4>Signs</h4>
          <ul>
            <li>Slow app/game load times</li>
            <li>Lag or stutter when loading new areas</li>
            <li>High disk usage in Task Manager</li>
            <li>Overall sluggishness despite good CPU/GPU</li>
          </ul>

          <h4>Common Scenarios</h4>
          <ul>
            <li>Running system from an HDD</li>
            <li>SSD almost full (SSDs slow down when near full)</li>
            <li>Using SATA SSDs where NVMe is beneficial</li>
          </ul>

          <h4>How to Avoid</h4>
          <ul>
            <li>Use NVMe SSD for OS and key apps</li>
            <li>Leave 10–20% SSD space free</li>
            <li>Use tiered storage: NVMe (OS), SATA SSD (games), HDD (files)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BottlenecksPage;
