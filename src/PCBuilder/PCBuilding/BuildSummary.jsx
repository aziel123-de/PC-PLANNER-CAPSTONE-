import './BuildSummary.css';
import ComponentSpecs from './ComponentSpecs';
import React from 'react';
/*
 Multi-GPU Enhancement Notes:
 - combinedGpuIndex: sums per-GPU synthetic indices with diminishing weights (1.0, 0.70, 0.55, 0.45, then 0.40 for any extras)
   to approximate sub-linear real scaling (driver overhead, frame pacing, inter-GPU sync).
 - gpuIndexSingle(): heuristic score derived from shader-like core counts * boost clock (GHz) * VRAM type multiplier * modest VRAM capacity factor.
 - PSU calculation now sums power / TDP values across all GPUs before applying 20% headroom.
 - Bottleneck ratio now uses combinedGpuIndex instead of single GPU index.
 - Upgrade recommendation text reflects multi-GPU context when imbalance detected.
*/

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

  // --- RAM & CPU Memory Speed Parsing Helpers ---
  const extractNumericFromString = (str) => {
    if (!str) return 0;
    const m = String(str).match(/([0-9]{3,5})/); // capture values like 3200, 5600 etc.
    return m ? parseInt(m[1], 10) : 0;
  };
  const extractCpuMaxMemorySpeed = (cpuObj) => {
    if (!cpuObj || typeof cpuObj !== 'object') return 0;
    let best = 0;
    const keys = Object.keys(cpuObj);
    for (const k of keys) {
      const kl = k.toLowerCase();
      if (
        (kl.includes('memory') || kl.includes('mem') || kl.includes('ram') || kl.includes('ddr')) &&
        (kl.includes('speed') || kl.includes('support') || kl.includes('max') || kl.includes('mhz') || kl.includes('ddr'))
      ) {
        const v = cpuObj[k];
        const num = extractNumericFromString(v);
        if (num > best) best = num;
      }
    }
    // Also scan values that look like DDR declarations inside name/spec arrays
    if (best === 0) {
      for (const k of keys) {
        const v = cpuObj[k];
        if (typeof v === 'string' && /ddr[3455]/i.test(v)) {
          const num = extractNumericFromString(v);
          if (num > best) best = num;
        }
      }
    }
    return best; // MHz
  };
  const extractRamModules = (parts) => {
    if (!parts) return [];
    const direct = parts.ram || parts.RAM || parts.rams || parts.RAMs;
    if (Array.isArray(direct)) return direct.filter(Boolean).map(r => r._raw || r);
    if (direct) return [direct._raw || direct];
    // fallback: search selectedParts values for anything with type containing 'ram'
    const arr = [];
    Object.values(parts).forEach(v => {
      if (!v) return;
      if (Array.isArray(v)) {
        v.forEach(it => {
          const raw = it?._raw || it;
            if (raw && (String(raw.type||raw.componentType||raw.Name||'').toLowerCase().includes('ram'))) arr.push(raw);
        });
      } else {
        const raw = v._raw || v;
        if (raw && (String(raw.type||raw.componentType||raw.Name||'').toLowerCase().includes('ram'))) arr.push(raw);
      }
    });
    return arr;
  };
  const extractRamFrequency = (ramObj) => {
    if (!ramObj || typeof ramObj !== 'object') return 0;
    let best = 0;
    const keys = Object.keys(ramObj);
    for (const k of keys) {
      const kl = k.toLowerCase();
      if (kl.includes('speed') || kl.includes('mhz') || kl.includes('freq')) {
        const num = extractNumericFromString(ramObj[k]);
        if (num > best) best = num;
      }
    }
    // Fallback: parse name/description
    if (best === 0) {
      ['name','Name','description','model'].forEach(n => {
        if (ramObj[n]) {
          const num = extractNumericFromString(ramObj[n]);
          if (num > best) best = num;
        }
      });
    }
    return best; // MHz
  };
  // NOTE: RAM frequency evaluation deferred until after cpuRaw is defined.

  const cpu = extractFirstPart(selectedParts, ['cpu', 'cpus', 'CPU', 'processor']) || selectedParts?.cpu || null;
  const gpu = extractFirstPart(selectedParts, ['gpus', 'gpu', 'GPU', 'graphics']) || (selectedParts?.gpus && selectedParts.gpus[0]) || null;

  const cpuRaw = cpu?._raw || cpu || null;
  const gpuRaw = gpu?._raw || gpu || null;

  // Now that cpuRaw exists, evaluate RAM vs CPU memory support.
  const ramModules = extractRamModules(selectedParts);
  const highestRamFrequency = ramModules.reduce((m, r) => Math.max(m, extractRamFrequency(r)), 0);
  const cpuMaxMemSpeed = extractCpuMaxMemorySpeed(cpuRaw);
  const ramBottleneck = cpuMaxMemSpeed > 0 && highestRamFrequency > 0 && highestRamFrequency > cpuMaxMemSpeed + 50; // tolerance 50MHz
  const ramBottleneckNote = ramBottleneck
    ? `RAM speed ${highestRamFrequency}MHz exceeds CPU supported ${cpuMaxMemSpeed}MHz. Consider a CPU with higher memory support or lower-speed RAM.`
    : '';

  // whether both CPU and GPU are present for a valid performance estimate
  const gpuArray = Array.isArray(selectedParts?.gpus) ? selectedParts.gpus.filter(Boolean).map(g => g._raw || g) : (gpuRaw ? [gpuRaw] : []);

  // Multi-GPU combined index with diminishing returns.
  // Rationale: Real-world multi-GPU scaling is sub-linear; apply weights to additional GPUs.
  // Weights chosen heuristically: 1st = 1.0, 2nd = 0.70, 3rd = 0.55, 4th = 0.45 (further GPUs: 0.40).
  const GPU_SCALING_WEIGHTS = [1.0, 0.70, 0.55, 0.45];
  const gpuIndexSingle = (gpuLike) => {
    if (!gpuLike) return 0;
    const getFirst = (obj, ...keys) => { for (const k of keys){ if(obj && Object.prototype.hasOwnProperty.call(obj,k) && obj[k]!=null) return obj[k]; const low=k.toLowerCase(); if(obj && Object.prototype.hasOwnProperty.call(obj,low) && obj[low]!=null) return obj[low]; const up=k.charAt(0).toUpperCase()+k.slice(1); if(obj && Object.prototype.hasOwnProperty.call(obj,up) && obj[up]!=null) return obj[up]; } return undefined; };
    const toNumber = (v)=>{ if(v==null) return 0; if(typeof v==='number') return v; const m=String(v).match(/[0-9]+(\.[0-9]+)?/); if(!m) return 0; const n=parseFloat(m[0]); return Number.isFinite(n)?n:0; };
    const findNumericByKeyPattern = (obj, patterns=['boost','clock','ghz','mhz','core','thread','cache','cuda','vram','power']) => { if(!obj||typeof obj!=='object') return 0; const keys=Object.keys(obj); for(const p of patterns){ for(const k of keys){ if(k.toLowerCase().includes(p)){ const n=toNumber(obj[k]); if(n>0) return n; } } } return 0; };
    const parseMHz = (v)=>{ if(v==null) return 0; const s=String(v).toLowerCase(); const n=toNumber(s); if(s.includes('ghz')) return n*1000; return n; };
    const vramInfo = (vramStr)=>{ const s=String(vramStr||'').toUpperCase(); const gb=toNumber(s); let type='GDDR6'; if(s.includes('GDDR7')) type='GDDR7'; else if(s.includes('GDDR6X')) type='GDDR6X'; else if(s.includes('GDDR6')) type='GDDR6'; return { gb, type }; };
    const cuda = toNumber(getFirst(gpuLike,'CudaCores','cuda_cores','Cuda')) || findNumericByKeyPattern(gpuLike,['cuda']);
    const cu = toNumber(getFirst(gpuLike,'ComputeUnits','compute_units')) || findNumericByKeyPattern(gpuLike,['computeunit','compute_units']);
    const xe = toNumber(getFirst(gpuLike,'XeCores','xe_cores')) || 0;
    let boostCandidateGpu = getFirst(gpuLike,'BoostFrequency','BoostClock','Boost','BoostMHz') || findNumericByKeyPattern(gpuLike,['boost','clock','ghz','mhz']);
    let boostMHz = parseMHz(boostCandidateGpu);
    if(!boostMHz && typeof boostCandidateGpu==='number' && boostCandidateGpu<1000) boostMHz = boostCandidateGpu * 1000;
    const boostGHz = boostMHz ? boostMHz/1000 : 0;
    const { gb: vramGB, type: vType } = vramInfo(getFirst(gpuLike,'Vram','VRAM','Memory'));
    const shaderLike = cuda || (cu*64) || (xe*128) || 0;
    const vTypeFactor = vType==='GDDR7'?1.12: vType==='GDDR6X'?1.06:1.0;
    const vramFactor = 1 + Math.min(0.25, Math.max(0, vramGB)/32);
    return (shaderLike * Math.max(1, boostGHz) * vTypeFactor * vramFactor)/1000;
  };

  const combinedGpuIndex = gpuArray.reduce((sum, g, idx) => {
    const base = gpuIndexSingle(g);
    const weight = GPU_SCALING_WEIGHTS[idx] || 0.40; // additional GPUs beyond list use 0.40
    return sum + base * weight;
  }, 0);

  // Replace old single gpuIndex usage with combined.
  const hasCpuGpu = !!cpuRaw && gpuArray.length > 0;

  // Adjust bottleneck ratio to use combinedGpuIndex
  const cpuIndex = (() => {
    if (!cpuRaw) return 0;
    const getFirst = (obj, ...keys) => { for (const k of keys){ if(obj && Object.prototype.hasOwnProperty.call(obj,k) && obj[k]!=null) return obj[k]; const low=k.toLowerCase(); if(obj && Object.prototype.hasOwnProperty.call(obj,low) && obj[low]!=null) return obj[low]; const up=k.charAt(0).toUpperCase()+k.slice(1); if(obj && Object.prototype.hasOwnProperty.call(obj,up) && obj[up]!=null) return obj[up]; } return undefined; };
    const toNumber = (v)=>{ if(v==null) return 0; if(typeof v==='number') return v; const m=String(v).match(/[0-9]+(\.[0-9]+)?/); if(!m) return 0; const n=parseFloat(m[0]); return Number.isFinite(n)?n:0; };
    const findNumericByKeyPattern = (obj, patterns=['core','cores','corecount','thread','threads','threadcount','boost','clock','ghz','mhz','cache']) => { if(!obj||typeof obj!=='object') return 0; const keys=Object.keys(obj); for(const p of patterns){ for(const k of keys){ if(k.toLowerCase().includes(p)){ const n=toNumber(obj[k]); if(n>0) return n; } } } return 0; };
    const parseGHz = (v)=>{ if(v==null) return 0; const s=String(v).toLowerCase(); if(s.includes('ghz')) return toNumber(s); return toNumber(s); };
    let cores = toNumber(getFirst(cpuRaw,'Cores','cores','CoreCount','coreCount')) || findNumericByKeyPattern(cpuRaw,['core','cores','corecount']);
    const threads = toNumber(getFirst(cpuRaw,'Threads','threads','ThreadCount')) || findNumericByKeyPattern(cpuRaw,['thread','threads','threadcount']);
    let boostCandidate = getFirst(cpuRaw,'BoostClock','Boost','BoostClockGHz','BoostClockMHz','BaseClock','Base') || findNumericByKeyPattern(cpuRaw,['boost','clock','ghz','mhz']);
    let boostGHz = parseGHz(boostCandidate);
    if(!boostGHz){
      const keys = Object.keys(cpuRaw||{});
      for(const k of keys){ if(k.toLowerCase().includes('mhz')){ const n=toNumber(cpuRaw[k]); if(n>0){ boostGHz = n/1000; break; } } }
    }
    const cacheL3 = toNumber(getFirst(cpuRaw,'L3Cache','Cache','cache','L3')) || findNumericByKeyPattern(cpuRaw,['cache']);
    const effThreads = Math.max(0, threads - cores);
    const base = (cores * 2 + effThreads) * Math.max(1, boostGHz);
    const cacheFactor = 1 + Math.min(0.4, cacheL3 / 128);
    return base * cacheFactor;
  })();

  const BALANCE_K = 22;
  let bottleneckNote = 'Select a CPU and GPU to estimate bottleneck.';
  let compatSeverity = 'good';
  if (cpuIndex > 0 && combinedGpuIndex > 0) {
    const ratioAdj = (combinedGpuIndex * BALANCE_K) / cpuIndex;
    const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
    if (ratioAdj > 2.0) {
      const pctCpu = clamp(Math.round((ratioAdj - 1) * 60), 3, 40);
      bottleneckNote = `Warning: CPU may bottleneck combined GPUs (~${pctCpu}% potential underutilization).`;
      compatSeverity = ratioAdj > 2.8 ? 'bad' : 'warn';
    } else if (ratioAdj < 0.6) {
      const severity = clamp((0.6 - ratioAdj) / 0.6, 0, 1);
      const pctGpu = clamp(Math.round(severity * 45), 5, 45);
      bottleneckNote = `Note: GPUs may be performance limiting (~${pctGpu}% GPU-side cap).`;
      compatSeverity = severity > 0.66 ? 'bad' : 'warn';
    } else {
      bottleneckNote = 'Good balance: CPU and GPU configuration looks well-matched.';
      compatSeverity = 'good';
    }
  }
  if (!(cpuIndex > 0 && combinedGpuIndex > 0)) {
    bottleneckNote = 'NO DATA';
  }

  // If CPU/GPU are balanced but RAM is bottlenecked, escalate severity to warning.
  if (ramBottleneck && compatSeverity === 'good' && cpuIndex > 0 && combinedGpuIndex > 0) {
    compatSeverity = 'warn';
    if (bottleneckNote.startsWith('Good balance')) {
      bottleneckNote += ' (RAM bottleneck detected)';
    }
  }

  // Upgrade recommendation with multi-GPU context
  let upgradeRecommendation = '';
  if (cpuIndex > 0 && combinedGpuIndex > 0) {
    const ratioAdj = (combinedGpuIndex * BALANCE_K) / cpuIndex;
    if (ratioAdj > 2.0) upgradeRecommendation = 'Consider upgrading the CPU to better feed multiple GPUs.';
    else if (ratioAdj < 0.6) upgradeRecommendation = 'Consider upgrading GPU(s) to better match this CPU.';
  }
  if (ramBottleneck && !upgradeRecommendation) {
    upgradeRecommendation = 'Consider a CPU with higher supported memory speed or using lower-frequency RAM.';
  }

  // --- PSU power: sum all GPU powers now ---
  const getNumericFrom = (obj, ...keys) => { if(!obj) return 0; const getFirst=(o,...ks)=>{ for(const k of ks){ if(o&&Object.prototype.hasOwnProperty.call(o,k)&&o[k]!=null) return o[k]; const low=k.toLowerCase(); if(o&&Object.prototype.hasOwnProperty.call(o,low)&&o[low]!=null) return o[low]; const up=k.charAt(0).toUpperCase()+k.slice(1); if(o&&Object.prototype.hasOwnProperty.call(o,up)&&o[up]!=null) return o[up]; } return undefined; }; const toNumber=(v)=>{ if(v==null) return 0; if(typeof v==='number') return v; const m=String(v).match(/[0-9]+(\.[0-9]+)?/); if(!m) return 0; const n=parseFloat(m[0]); return Number.isFinite(n)?n:0; }; return toNumber(getFirst(obj,...keys)); };
  const getNumericByPattern = (obj, patterns=['tdp','power','thermal']) => { if(!obj||typeof obj!=='object') return 0; const toNumber=(v)=>{ if(v==null) return 0; if(typeof v==='number') return v; const m=String(v).match(/[0-9]+(\.[0-9]+)?/); if(!m) return 0; const n=parseFloat(m[0]); return Number.isFinite(n)?n:0; }; for(const k of Object.keys(obj)){ const kl=k.toLowerCase(); if(patterns.some(p=>kl.includes(p))){ const n=toNumber(obj[k]); if(n>0) return n; } } return 0; };

  const cpuTDP = (() => { if(!cpuRaw) return 0; const getFirst=(o,...ks)=>{ for(const k of ks){ if(o&&Object.prototype.hasOwnProperty.call(o,k)&&o[k]!=null) return o[k]; const low=k.toLowerCase(); if(o&&Object.prototype.hasOwnProperty.call(o,low)&&o[low]!=null) return o[low]; const up=k.charAt(0).toUpperCase()+k.slice(1); if(o&&Object.prototype.hasOwnProperty.call(o,up)&&o[up]!=null) return o[up]; } return undefined; }; const toNumber=(v)=>{ if(v==null) return 0; if(typeof v==='number') return v; const m=String(v).match(/[0-9]+(\.[0-9]+)?/); if(!m) return 0; const n=parseFloat(m[0]); return Number.isFinite(n)?n:0; }; const getNumericByPattern=(obj,patterns=['maxtdp','tdp','thermal'])=>{ if(!obj||typeof obj!=='object') return 0; for(const k of Object.keys(obj)){ const kl=k.toLowerCase(); if(patterns.some(p=>kl.includes(p))){ const n=toNumber(obj[k]); if(n>0) return n; } } return 0; }; const maxTdp = getNumericFrom(cpuRaw,'MaxTDP','maxTDP','max_tdp','maxtdp'); if(maxTdp) return maxTdp; const nominal = getNumericFrom(cpuRaw,'TDP','Tdp','ThermalDesignPower','PackageTDP','PackageTDPWatts'); if(nominal) return nominal; return getNumericByPattern(cpuRaw,['maxtdp','tdp','thermal']); })();

  const gpuPowerTotal = gpuArray.reduce((sum,g)=>{
    const val = getNumericFrom(g,'PowerDraw','TDP','BoardPower','TypicalBoardPower','Power');
    if(val) return sum + val; // if we found a direct numeric property
    const fallback = getNumericByPattern(g,['power','tdp']);
    return sum + (fallback||0);
  },0);

  const psuPart = (selectedParts && selectedParts.psu) ? (selectedParts.psu._raw || selectedParts.psu || selectedParts.psu) : allParts.find(p => {
    const type = (p.type || p.componentType || p.name || p.Name || '').toString().toLowerCase();
    return type.includes('psu') || type.includes('power supply') || type.includes('power-supply');
  });
  const psuRaw = psuPart?._raw || psuPart || null;
  const psuSelected = !!psuPart;
  const psuWatt = psuRaw ? getNumericFrom(psuRaw,'Watt','Wattage','wattage','Power','Capacity','RatedPower','Output') : 0;

  const totalRequiredPower = Math.round(cpuTDP + gpuPowerTotal);
  const headroomMultiplier = 1.2; // 20% safety headroom
  const requiredWithHeadroom = Math.round(totalRequiredPower * headroomMultiplier);
  const showPowerWarning = psuWatt > 0 && requiredWithHeadroom > psuWatt;
  const powerWarningText = showPowerWarning
    ? `Power Warning: PSU ${psuWatt}W is less than estimated required ${requiredWithHeadroom}W (includes 20% headroom). CPU ${cpuTDP || 0}W + GPUs ${gpuPowerTotal || 0}W = ${totalRequiredPower}W.`
    : '';

  const powerCause = (() => {
    const c = cpuTDP || 0;
    const g = gpuPowerTotal || 0;
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
              className={`compat-badge ${!hasCpuGpu ? 'compat-unknown' : (compatSeverity === 'good' ? 'compat-good' : compatSeverity === 'warn' ? 'compat-warn' : 'compat-bad')}`}
            >
              {!hasCpuGpu ? 'NO DATA' : (compatSeverity === 'good' ? 'BALANCED' : compatSeverity === 'warn' ? 'WARNING' : 'BOTTLENECK')}
            </div>
          </div>
          <div className="compat-card-content">
            <p className="compat-description">{!hasCpuGpu ? 'NO DATA' : bottleneckNote}</p>
            {ramBottleneck && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <div className="compat-badge compat-warn compat-secondary">RAM BOTTLENECK</div>
                <div style={{ color: '#7f1d1d', fontWeight: 600 }}>{ramBottleneckNote}</div>
              </div>
            )}
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
                      ? `Power Check: PSU ${psuWatt || 'N/A'}W vs required ${requiredWithHeadroom}W (CPU ${cpuTDP || 0}W + GPUs ${gpuPowerTotal || 0}W = ${totalRequiredPower}W). ${psuWatt ? (requiredWithHeadroom > psuWatt ? 'Not enough.' : 'Sufficient.') : 'PSU not selected.'}`
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
