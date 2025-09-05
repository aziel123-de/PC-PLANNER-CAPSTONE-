import './BuildSummary.css';
import ComponentSpecs from './ComponentSpecs';
import React from 'react';

function BuildSummary({ selectedParts }) {
  // Convert selectedParts object to a flat array of all selected parts (filter out null/undefined)
  const allParts = Object.values(selectedParts).flat().filter(Boolean).map(p => p._raw ? p : p);
  const TOTAL_PART_COUNT = 10; // You can tweak this depending on required parts
  const selectedCount = allParts.length;
  const progress = Math.min(Math.round((selectedCount / TOTAL_PART_COUNT) * 100), 100);

  const estimatedPrice = allParts.reduce((total, part) => {
    return part?.price ? total + part.price : total;
  }, 0);

  // --- Heuristic CPU/GPU bottleneck estimate ---
  const getFirst = (obj, ...keys) => {
    for (const k of keys) {
      if (!obj) continue;
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] != null) return obj[k];
      const low = k.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(obj, low) && obj[low] != null) return obj[low];
      const up = k.charAt(0).toUpperCase() + k.slice(1);
      if (Object.prototype.hasOwnProperty.call(obj, up) && obj[up] != null) return obj[up];
    }
    return undefined;
  };

  const toNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    const s = String(v);
    const m = s.match(/[0-9]+(\.[0-9]+)?/);
    if (!m) return 0;
    const n = parseFloat(m[0]);
    return Number.isFinite(n) ? n : 0;
  };

  const parseGHz = (v) => {
    if (v == null) return 0;
    const s = String(v).toLowerCase();
    if (s.includes('ghz')) return toNumber(s);
    // values like 4.8 or 5.4 already in GHz
    return toNumber(s);
  };

  const parseMHz = (v) => {
    if (v == null) return 0;
    const s = String(v).toLowerCase();
    // given GPU boost is likely MHz already; if in GHz, convert
    const n = toNumber(s);
    if (s.includes('ghz')) return n * 1000;
    return n;
  };

  const vramInfo = (vramStr) => {
    const s = String(vramStr || '').toUpperCase();
    const gb = toNumber(s);
    let type = 'GDDR6';
    if (s.includes('GDDR7')) type = 'GDDR7';
    else if (s.includes('GDDR6X')) type = 'GDDR6X';
    else if (s.includes('GDDR6')) type = 'GDDR6';
    return { gb, type };
  };

  const cpu = selectedParts?.cpu || null;
  const gpu = (selectedParts?.gpus && selectedParts.gpus[0]) || null;

  const cpuRaw = cpu?._raw || cpu || null;
  const gpuRaw = gpu?._raw || gpu || null;

  // Build comparable CPU/GPU indices (GHz-based scaling to avoid huge numbers)
  const cpuIndex = (() => {
    if (!cpuRaw) return 0;
    const cores = toNumber(getFirst(cpuRaw, 'Cores')) || 0;
    const threads = toNumber(getFirst(cpuRaw, 'Threads')) || 0;
    const boostGHz = parseGHz(getFirst(cpuRaw, 'BoostClock')) || parseGHz(getFirst(cpuRaw, 'BaseClock')) || 0;
    const cacheL3 = toNumber(getFirst(cpuRaw, 'L3Cache', 'Cache', 'cache')) || 0;
    const effThreads = Math.max(0, threads - cores); // SMT value
    const base = (cores * 2 + effThreads) * Math.max(1, boostGHz);
    const cacheFactor = 1 + Math.min(0.4, cacheL3 / 128); // up to +40%
    return base * cacheFactor; // typical range ~10-150
  })();

  const gpuIndex = (() => {
    if (!gpuRaw) return 0;
    const cuda = toNumber(getFirst(gpuRaw, 'CudaCores')) || 0;
    const cu = toNumber(getFirst(gpuRaw, 'ComputeUnits')) || 0;
    const xe = toNumber(getFirst(gpuRaw, 'XeCores')) || 0;
    const boostMHz = parseMHz(getFirst(gpuRaw, 'BoostFrequency')) || 0;
    const boostGHz = boostMHz ? boostMHz / 1000 : 0;
    const { gb: vramGB, type: vType } = vramInfo(getFirst(gpuRaw, 'Vram'));
    const shaderLike = cuda || (cu * 64) || (xe * 128) || 0;
    const vTypeFactor = vType === 'GDDR7' ? 1.12 : vType === 'GDDR6X' ? 1.06 : 1.0;
    const vramFactor = 1 + Math.min(0.25, (Math.max(0, vramGB) / 32)); // up to +25%
    // scale down with 1000 to bring into ~ similar range to cpuIndex
    return (shaderLike * Math.max(1, boostGHz) * vTypeFactor * vramFactor) / 1000; // typical range ~50-300
  })();

  // Bottleneck assessment with calibrated ratio and conservative percentages
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  let bottleneckNote = 'Select a CPU and GPU to estimate bottleneck.';
  let compatSeverity = 'good'; // 'good' | 'warning' | 'bad'
  if (cpuIndex > 0 && gpuIndex > 0) {
    // Calibrate GPU vs CPU scale so mid-range pairs don’t read GPU-limited too easily
    const BALANCE_K = 18; // slightly higher to reduce false GPU bottleneck flags
    const ratioAdj = (gpuIndex * BALANCE_K) / cpuIndex; // >1: GPU stronger; <1: CPU stronger

    // CPU bottleneck threshold: make it stricter so it triggers less often
    if (ratioAdj > 2.0) {
      // milder percent mapping and higher bar for 'bad'
      const pctCpu = clamp(Math.round((ratioAdj - 1) * 60), 3, 40);
      bottleneckNote = `Warning: CPU may bottleneck this GPU (~${pctCpu}% potential GPU underutilization).`;
      compatSeverity = ratioAdj > 2.8 ? 'bad' : 'warn';
    } else if (ratioAdj < 0.6) {
      // GPU bottleneck threshold (more relaxed) with gentle percent curve
      const severity = clamp((0.6 - ratioAdj) / 0.6, 0, 1); // 0 at 0.6, 1 at 0
      const pctGpu = clamp(Math.round(severity * 45), 5, 45);
      bottleneckNote = `Note: GPU may limit performance; consider a stronger GPU (~${pctGpu}% GPU-side cap).`;
      // if severity is high, mark as 'bad'
      compatSeverity = severity > 0.66 ? 'bad' : 'warn';
    } else {
      bottleneckNote = 'Good balance: CPU and GPU look well-matched.';
      compatSeverity = 'good';
    }
  }

  return (
  <div className='BuildSummary'>
      <h1>Build Summary</h1>

      <p>Build Completion: {progress}%</p>
      <div className="ProgressBar">
        <div className="ProgressFill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className='SelectedComponentsBox'>
        {allParts.map((part, index) =>
          part ? (
            <div className="ComponentCard" key={index}>
              <ComponentSpecs
                part={part}
                type={part.type || part.componentType || "Component"}
              />
            </div>
          ) : null
        )}
      </div>

      <h1 className='Price'>Estimated Price: ₱{estimatedPrice.toLocaleString()}</h1>
  <div className="compat-row">
    <h2 style={{ margin: 0 }}>Compatibility:</h2>
    <div className={`compat-badge ${compatSeverity === 'good' ? 'compat-good' : compatSeverity === 'warn' ? 'compat-warn' : 'compat-bad'}`}>
      {compatSeverity === 'good' ? 'OK' : compatSeverity === 'warn' ? 'WARNING' : 'BAD'}
    </div>
  </div>
  <p className="compat-note">{bottleneckNote}</p>
    </div>
  );
}

export default BuildSummary;
