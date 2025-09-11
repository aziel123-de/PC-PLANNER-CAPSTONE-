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

  // Helper: convert many possible numeric-like keys to a number by pattern
  const findNumericByKeyPattern = (obj, patterns = ['boost', 'clock', 'ghz', 'mhz', 'core', 'thread', 'cache', 'cuda', 'vram', 'power']) => {
    if (!obj || typeof obj !== 'object') return 0;
    const keys = Object.keys(obj || {});
    for (const p of patterns) {
      for (const k of keys) {
        if (k.toLowerCase().includes(p)) {
          const n = toNumber(obj[k]);
          if (n > 0) return n;
        }
      }
    }
    return 0;
  };

  // Extract first part helper: supports single object or arrays under multiple possible keys
  const extractFirstPart = (container, names = []) => {
    if (!container || typeof container !== 'object') return null;
    for (const n of names) {
      if (Object.prototype.hasOwnProperty.call(container, n)) {
        const val = container[n];
        if (Array.isArray(val)) return val[0] || null;
        return val || null;
      }
    }
    return null;
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

  const cpu = extractFirstPart(selectedParts, ['cpu', 'cpus', 'CPU', 'processor']) || selectedParts?.cpu || null;
  const gpu = extractFirstPart(selectedParts, ['gpus', 'gpu', 'GPU', 'graphics']) || (selectedParts?.gpus && selectedParts.gpus[0]) || null;

  const cpuRaw = cpu?._raw || cpu || null;
  const gpuRaw = gpu?._raw || gpu || null;

  // Build comparable CPU/GPU indices (GHz-based scaling to avoid huge numbers)
  const cpuIndex = (() => {
    if (!cpuRaw) return 0;
    const cores = toNumber(getFirst(cpuRaw, 'Cores', 'cores', 'CoreCount', 'coreCount')) || findNumericByKeyPattern(cpuRaw, ['core', 'cores', 'corecount']) || 0;
    const threads = toNumber(getFirst(cpuRaw, 'Threads', 'threads', 'ThreadCount')) || findNumericByKeyPattern(cpuRaw, ['thread', 'threads', 'threadcount']) || 0;
    // boost/base clock may be stored under different keys or in MHz — try multiple strategies
    let boostCandidate = getFirst(cpuRaw, 'BoostClock', 'Boost', 'BoostClockGHz', 'BoostClockMHz', 'BaseClock', 'Base') || findNumericByKeyPattern(cpuRaw, ['boost', 'clock', 'ghz', 'mhz']);
    let boostGHz = parseGHz(boostCandidate);
    if (!boostGHz) {
      // maybe value returned as MHz number
      const maybeMHz = findNumericByKeyPattern(cpuRaw, ['mhz']);
      if (maybeMHz) boostGHz = maybeMHz / 1000;
    }
    const cacheL3 = toNumber(getFirst(cpuRaw, 'L3Cache', 'Cache', 'cache', 'L3')) || findNumericByKeyPattern(cpuRaw, ['cache']) || 0;
    const effThreads = Math.max(0, threads - cores); // SMT value
    const base = (cores * 2 + effThreads) * Math.max(1, boostGHz);
    const cacheFactor = 1 + Math.min(0.4, cacheL3 / 128); // up to +40%
    return base * cacheFactor; // typical range ~10-150
  })();

  const gpuIndex = (() => {
    if (!gpuRaw) return 0;
    const cuda = toNumber(getFirst(gpuRaw, 'CudaCores', 'cuda_cores', 'Cuda')) || findNumericByKeyPattern(gpuRaw, ['cuda']) || 0;
    const cu = toNumber(getFirst(gpuRaw, 'ComputeUnits', 'compute_units')) || findNumericByKeyPattern(gpuRaw, ['computeunit', 'compute_units']) || 0;
    const xe = toNumber(getFirst(gpuRaw, 'XeCores', 'xe_cores')) || 0;
    let boostCandidateGpu = getFirst(gpuRaw, 'BoostFrequency', 'BoostClock', 'Boost', 'BoostMHz') || findNumericByKeyPattern(gpuRaw, ['boost', 'clock', 'ghz', 'mhz']);
    let boostMHz = parseMHz(boostCandidateGpu);
    if (!boostMHz && typeof boostCandidateGpu === 'number' && boostCandidateGpu < 1000) {
      // could be GHz as small number
      boostMHz = boostCandidateGpu * 1000;
    }
    const boostGHz = boostMHz ? boostMHz / 1000 : 0;
    const { gb: vramGB, type: vType } = vramInfo(getFirst(gpuRaw, 'Vram', 'VRAM', 'Memory'));
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
    const BALANCE_K = 22; // slightly higher to reduce false GPU bottleneck flags
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

  // Recommendation based on the same ratio: suggest upgrading CPU or GPU when a bottleneck exists
  let upgradeRecommendation = '';
  if (cpuIndex > 0 && gpuIndex > 0) {
  const BALANCE_K = 22;
    const ratioAdj = (gpuIndex * BALANCE_K) / cpuIndex;
    // Use the same thresholds as the bottleneck assessment to avoid contradictory messages
    if (ratioAdj > 2.0) {
      upgradeRecommendation = 'Consider upgrading the CPU to better match this GPU.';
    } else if (ratioAdj < 0.6) {
      upgradeRecommendation = 'Consider upgrading the GPU to better match this CPU.';
    } else {
      upgradeRecommendation = '';
    }
  }

  // --- PSU compatibility check (CPU TDP + GPU power draw vs PSU wattage) ---
  const getNumericFrom = (obj, ...keys) => {
    if (!obj) return 0;
    return toNumber(getFirst(obj, ...keys));
  };

  // Fallback scanner: look for any property name that contains tdp/power/thermal and return its numeric value
  const getNumericByPattern = (obj, patterns = ['tdp', 'power', 'thermal']) => {
    if (!obj || typeof obj !== 'object') return 0;
    const lowerPatterns = patterns.map(p => p.toLowerCase());
    for (const k of Object.keys(obj)) {
      const kl = k.toLowerCase();
      if (lowerPatterns.some(p => kl.includes(p))) {
        const v = obj[k];
        const n = toNumber(v);
        if (n > 0) return n;
      }
    }
    return 0;
  };

  // Use multiple common keys for CPU TDP and GPU power, then fallback to pattern scan
  // prefer the standard 'TDP' value (typical thermal design power); fall back to MaxTDP or pattern matches
  const cpuTDP = cpuRaw ? (getNumericFrom(cpuRaw, 'TDP', 'Tdp', 'MaxTDP', 'ThermalDesignPower', 'PackageTDP', 'PackageTDPWatts') || getNumericByPattern(cpuRaw, ['tdp', 'thermal'])) : 0;
  const gpuPower = gpuRaw ? (getNumericFrom(gpuRaw, 'PowerDraw', 'TDP', 'BoardPower', 'TypicalBoardPower', 'Power') || getNumericByPattern(gpuRaw, ['power', 'tdp'])) : 0;

  // Prefer explicit PSU slot from selectedParts (BuilderPage uses `psu`), otherwise try to find one heuristically
  const psuPart = (selectedParts && selectedParts.psu) ? (selectedParts.psu._raw || selectedParts.psu || selectedParts.psu) : allParts.find(p => {
    const type = (p.type || p.componentType || p.name || p.Name || '').toString().toLowerCase();
    return type.includes('psu') || type.includes('power supply') || type.includes('power-supply');
  });
  const psuRaw = psuPart?._raw || psuPart || null;
  const psuSelected = !!psuPart;
  const psuWatt = psuRaw ? getNumericFrom(psuRaw, 'Watt', 'Wattage', 'wattage', 'Power', 'Capacity', 'RatedPower', 'Output') : 0;

  const totalRequiredPower = Math.round((cpuTDP || 0) + (gpuPower || 0));
  const headroomMultiplier = 1.2; // 20% safety headroom
  const requiredWithHeadroom = Math.round(totalRequiredPower * headroomMultiplier);
  const showPowerWarning = psuWatt > 0 && requiredWithHeadroom > psuWatt;
  const powerWarningText = showPowerWarning
    ? `Power Warning: PSU ${psuWatt}W is less than estimated required ${requiredWithHeadroom}W (includes 20% headroom). CPU ${cpuTDP || 0}W + GPU ${gpuPower || 0}W = ${totalRequiredPower}W.`
    : '';

  // Determine which component contributes more to the required power for a small hint badge
  const powerCause = (() => {
    const c = cpuTDP || 0;
    const g = gpuPower || 0;
    if (c === 0 && g === 0) return 'unknown';
    const total = c + g;
    if (total === 0) return 'unknown';
    const cShare = c / total;
    const gShare = g / total;
    if (cShare >= 0.65) return 'cpu';
    if (gShare >= 0.65) return 'gpu';
    return 'both';
  })();

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
      
      {/* Enhanced Compatibility Section */}
      <div className="compatibility-section">
        <div className="compatibility-header">
          <h2 className="compatibility-title">System Compatibility</h2>
        </div>
        
        {/* Performance Balance Check */}
        <div className="compat-card">
          <div className="compat-card-header">
            <div className="compat-card-title">
              <span>Performance Balance</span>
            </div>
            <div
              className={`compat-badge ${selectedCount === 0 ? 'compat-unknown' : (compatSeverity === 'good' ? 'compat-good' : compatSeverity === 'warn' ? 'compat-warn' : 'compat-bad')}`}
            >
              {selectedCount === 0 ? 'NO DATA' : (compatSeverity === 'good' ? 'BALANCED' : compatSeverity === 'warn' ? 'WARNING' : 'BOTTLENECK')}
            </div>
          </div>
          <div className="compat-card-content">
            <p className="compat-description">{bottleneckNote}</p>
            {upgradeRecommendation && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="compat-badge compat-warn compat-secondary">RECOMMENDATION</div>
                <div style={{ color: '#334155', fontWeight: 600 }}>{upgradeRecommendation}</div>
              </div>
            )}
            
          </div>
        </div>

        {/* Power Supply Check */}
        {(showPowerWarning || (process.env.NODE_ENV !== 'production')) && (
          <div className="compat-card">
            <div className="compat-card-header">
              <div className="compat-card-title">
                <span>Power Supply</span>
              </div>
              <div className="compat-badges">
                <div
                  className={`compat-badge ${!psuSelected ? 'compat-unknown' : (showPowerWarning ? 'compat-bad' : 'compat-good')}`}
                >
                    {!psuSelected ? 'NO DATA' : (showPowerWarning ? 'INSUFFICIENT' : 'SUFFICIENT')}
                  </div>
                {showPowerWarning && (
                  <div className={`compat-badge compat-warn compat-secondary`}>
                    {powerCause === 'cpu' ? 'CPU' : powerCause === 'gpu' ? 'GPU' : powerCause === 'both' ? 'CPU+GPU' : 'N/A'}
                  </div>
                )}
                {process.env.NODE_ENV !== 'production' && psuSelected && !showPowerWarning && (
                  <div className={`compat-badge compat-info compat-secondary`}>
                    INFO
                  </div>
                )}
              </div>
            </div>
            <div className="compat-card-content">
              <p className="compat-description">
                {!psuSelected
                  ? 'PSU not selected.'
                  : showPowerWarning
                    ? powerWarningText
                    : process.env.NODE_ENV !== 'production'
                      ? `Power Check: PSU ${psuWatt || 'N/A'}W vs required ${requiredWithHeadroom}W (CPU ${cpuTDP || 0}W + GPU ${gpuPower || 0}W = ${totalRequiredPower}W). ${psuWatt ? (requiredWithHeadroom > psuWatt ? 'Not enough.' : 'Sufficient.') : 'PSU not selected.'}`
                      : ''
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BuildSummary;
