// Shared build analysis utility
// Produces a normalized set of metrics + warnings used by both BuildSummary UI and save payload.
// Returns structure:
// {
//   warnings: string[],
//   hasIssues: boolean,
//   cpuIndex, combinedGpuIndex, ratioAdj, compatSeverity, bottleneckNote,
//   ram: { highestRamFrequency, cpuMaxMemSpeed, ramBottleneck, ramBottleneckNote },
//   power: { cpuTDP, gpuPowerTotal, psuWatt, totalRequiredPower, requiredWithHeadroom, showPowerWarning, powerWarningText, powerCause }
// }

export function analyzeBuild(selectedParts) {
  selectedParts = selectedParts || {};

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
  const toNumber = (v) => { if (v == null) return 0; if (typeof v === 'number') return v; const m = String(v).match(/[0-9]+(\.[0-9]+)?/); if (!m) return 0; const n = parseFloat(m[0]); return Number.isFinite(n) ? n : 0; };
  const parseGHz = (v)=>{ if(v==null) return 0; const s=String(v).toLowerCase(); if(s.includes('ghz')) return toNumber(s); return toNumber(s); };
  const parseMHz = (v)=>{ if(v==null) return 0; const s=String(v).toLowerCase(); const n=toNumber(s); if(s.includes('ghz')) return n*1000; return n; };

  const extractFirstPart = (container, names=[]) => {
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
  const extractNumericFromString = (str) => { if(!str) return 0; const m = String(str).match(/([0-9]{3,5})/); return m ? parseInt(m[1],10) : 0; };
  const extractCpuMaxMemorySpeed = (cpuObj) => {
    if(!cpuObj||typeof cpuObj!=='object') return 0; let best=0; const keys=Object.keys(cpuObj);
    for(const k of keys){ const kl=k.toLowerCase(); if((kl.includes('memory')||kl.includes('mem')||kl.includes('ram')||kl.includes('ddr')) && (kl.includes('speed')||kl.includes('support')||kl.includes('max')||kl.includes('mhz')||kl.includes('ddr'))){ const num=extractNumericFromString(cpuObj[k]); if(num>best) best=num; }}
    if(best===0){ for(const k of keys){ const v=cpuObj[k]; if(typeof v==='string' && /ddr[3455]/i.test(v)){ const num=extractNumericFromString(v); if(num>best) best=num; } } }
    return best;
  };
  const extractRamModules = (parts) => {
    if(!parts) return []; const direct = parts.ram || parts.RAM || parts.rams || parts.RAMs; if(Array.isArray(direct)) return direct.filter(Boolean).map(r=>r._raw||r); if(direct) return [direct._raw||direct]; const arr=[]; Object.values(parts).forEach(v=>{ if(!v) return; if(Array.isArray(v)){ v.forEach(it=>{ const raw=it?._raw||it; if(raw && (String(raw.type||raw.componentType||raw.Name||'').toLowerCase().includes('ram'))) arr.push(raw); }); } else { const raw=v._raw||v; if(raw && (String(raw.type||raw.componentType||raw.Name||'').toLowerCase().includes('ram'))) arr.push(raw); } }); return arr;
  };
  const extractRamFrequency = (ramObj) => {
    if(!ramObj||typeof ramObj!=='object') return 0; let best=0; const keys=Object.keys(ramObj); for(const k of keys){ const kl=k.toLowerCase(); if(kl.includes('speed')||kl.includes('mhz')||kl.includes('freq')){ const num=extractNumericFromString(ramObj[k]); if(num>best) best=num; }} if(best===0){ ['name','Name','description','model'].forEach(n=>{ if(ramObj[n]){ const num=extractNumericFromString(ramObj[n]); if(num>best) best=num; } }); } return best; };
  const findNumericByKeyPattern = (obj, patterns=['boost','clock','ghz','mhz','core','thread','cache','cuda','vram','power']) => { if(!obj||typeof obj!=='object') return 0; const keys=Object.keys(obj); for(const p of patterns){ for(const k of keys){ if(k.toLowerCase().includes(p)){ const n=toNumber(obj[k]); if(n>0) return n; } } } return 0; };

  const cpu = extractFirstPart(selectedParts,['cpu','cpus','CPU','processor']) || selectedParts?.cpu || null;
  const firstGpu = extractFirstPart(selectedParts,['gpus','gpu','GPU','graphics']) || (selectedParts?.gpus && selectedParts.gpus[0]) || null;
  const cpuRaw = cpu?._raw||cpu||null; const gpuRaw = firstGpu?._raw||firstGpu||null;
  const cpuCooler = extractFirstPart(selectedParts,['cpuCooler','cpu_cooler','CPU_Cooler']) || selectedParts?.cpuCooler || null;
  const cpuCoolerRaw = cpuCooler?._raw||cpuCooler||null;
  const gpuArray = Array.isArray(selectedParts?.gpus) ? selectedParts.gpus.filter(Boolean).map(g=>g._raw||g) : (gpuRaw ? [gpuRaw] : []);

  // RAM vs CPU support
  const ramModules = extractRamModules(selectedParts);
  const highestRamFrequency = ramModules.reduce((m,r)=> Math.max(m, extractRamFrequency(r)), 0);
  const cpuMaxMemSpeed = extractCpuMaxMemorySpeed(cpuRaw);
  const ramBottleneck = cpuMaxMemSpeed>0 && highestRamFrequency>0 && highestRamFrequency > cpuMaxMemSpeed + 50;
  const ramBottleneckNote = ramBottleneck ? `RAM speed ${highestRamFrequency}MHz exceeds CPU supported ${cpuMaxMemSpeed}MHz. Consider a CPU with higher memory support or lower-speed RAM.` : '';

  // GPU heuristic index
  const vramInfo = (vramStr)=>{ const s=String(vramStr||'').toUpperCase(); const gb=toNumber(s); let type='GDDR6'; if(s.includes('GDDR7')) type='GDDR7'; else if(s.includes('GDDR6X')) type='GDDR6X'; else if(s.includes('GDDR6')) type='GDDR6'; return { gb, type }; };
  const gpuIndexSingle = (gpuLike) => { 
    if(!gpuLike) return 0; 
    const cuda = toNumber(getFirst(gpuLike,'CudaCores','cuda_cores','Cuda')) || findNumericByKeyPattern(gpuLike,['cuda']); 
    const cu = toNumber(getFirst(gpuLike,'ComputeUnits','compute_units')) || findNumericByKeyPattern(gpuLike,['computeunit','compute_units']); 
    const xe = toNumber(getFirst(gpuLike,'XeCores','xe_cores')) || 0; 
    let boostCandidate = getFirst(gpuLike,'BoostFrequency','BoostClock','Boost','BoostMHz') || findNumericByKeyPattern(gpuLike,['boost','clock','ghz','mhz']); 
    let boostMHz = parseMHz(boostCandidate); 
    if(!boostMHz && typeof boostCandidate==='number' && boostCandidate<1000) boostMHz = boostCandidate*1000; 
    const boostGHz = boostMHz ? boostMHz/1000 : 0; 
    const { gb: vramGB, type: vType } = vramInfo(getFirst(gpuLike,'Vram','VRAM','Memory')); 
    const shaderLike = cuda || (cu*64) || (xe*128) || 0; 
    
    // Enhanced factors for high-end GPUs
    const vTypeFactor = vType==='GDDR7'?1.15: vType==='GDDR6X'?1.08:1.0; 
    const vramFactor = 1 + Math.min(0.3, Math.max(0, vramGB)/28); // Better VRAM scaling
    const clockFactor = boostGHz >= 2.5 ? 1.1 : boostGHz >= 2.0 ? 1.05 : 1.0; // Bonus for high clocks
    const shaderFactor = shaderLike >= 10000 ? 1.1 : shaderLike >= 7000 ? 1.05 : 1.0; // Bonus for high shader count
    
    return (shaderLike * Math.max(1, boostGHz) * vTypeFactor * vramFactor * clockFactor * shaderFactor)/1000; 
  };
  const GPU_SCALING_WEIGHTS = [1.0,0.75,0.60,0.50]; // Improved multi-GPU scaling
  const combinedGpuIndex = gpuArray.reduce((sum,g,idx)=>{ const base=gpuIndexSingle(g); const weight=GPU_SCALING_WEIGHTS[idx]||0.40; return sum + base*weight; },0);

  // CPU heuristic index
  const cpuIndex = (()=>{ 
    if(!cpuRaw) return 0; 
    const cores = toNumber(getFirst(cpuRaw,'Cores','cores','CoreCount','coreCount')) || findNumericByKeyPattern(cpuRaw,['core','cores','corecount']); 
    const threads = toNumber(getFirst(cpuRaw,'Threads','threads','ThreadCount')) || findNumericByKeyPattern(cpuRaw,['thread','threads','threadcount']); 
    let boostCandidate = getFirst(cpuRaw,'BoostClock','Boost','BoostClockGHz','BoostClockMHz','BaseClock','Base') || findNumericByKeyPattern(cpuRaw,['boost','clock','ghz','mhz']); 
    let boostGHz = parseGHz(boostCandidate); 
    if(!boostGHz){ 
      const keys = Object.keys(cpuRaw||{}); 
      for(const k of keys){ 
        if(k.toLowerCase().includes('mhz')){ 
          const n=toNumber(cpuRaw[k]); 
          if(n>0){ boostGHz=n/1000; break; } 
        } 
      } 
    } 
    const cacheL3 = toNumber(getFirst(cpuRaw,'L3Cache','Cache','cache','L3')) || findNumericByKeyPattern(cpuRaw,['cache']); 
    const effThreads = Math.max(0, threads - cores); 
    
    // Enhanced calculation for modern high-end CPUs
    const coreWeight = cores >= 16 ? 2.5 : cores >= 8 ? 2.2 : 2.0; // Higher weight for more cores
    const threadWeight = effThreads > 0 ? 1.2 : 1.0; // Bonus for hyperthreading
    const clockWeight = boostGHz >= 5.0 ? 1.3 : boostGHz >= 4.5 ? 1.2 : 1.0; // Bonus for high clocks
    
    const base = (cores * coreWeight + effThreads * threadWeight) * Math.max(1, boostGHz) * clockWeight; 
    const cacheFactor = 1 + Math.min(0.5, cacheL3 / 100); // Improved cache scaling
    
    return base * cacheFactor; 
  })();

  const hasCpuGpu = !!cpuRaw && gpuArray.length>0;
  // Check CPU-GPU compatibility based on core counts and GPU specifications
  const checkCpuGpuCompatibility = (cpuRaw, gpuArray) => {
    if (!cpuRaw || !gpuArray || gpuArray.length === 0) return { compatible: false, severity: 'good', note: '' };
    
    const cpuCores = toNumber(getFirst(cpuRaw,'Cores','cores','CoreCount','coreCount')) || findNumericByKeyPattern(cpuRaw,['core','cores']);
    if (cpuCores === 0) return { compatible: false, severity: 'good', note: '' };
    
    const firstGpu = gpuArray[0];
    const cudaCores = toNumber(getFirst(firstGpu,'CudaCores','cuda_cores','Cuda')) || findNumericByKeyPattern(firstGpu,['cuda']);
    const computeUnits = toNumber(getFirst(firstGpu,'ComputeUnits','compute_units')) || findNumericByKeyPattern(firstGpu,['computeunit','compute_units']);
    const xeCores = toNumber(getFirst(firstGpu,'XeCores','xe_cores')) || 0;
    
    let compatible = false;
    let severity = 'good';
    let note = '';
    
    // CUDA Cores (NVIDIA) compatibility
    if (cudaCores > 0) {
      if (cpuCores === 4 && cudaCores >= 800 && cudaCores <= 1500) {
        compatible = true;
      } else if (cpuCores === 6 && cudaCores >= 1600 && cudaCores <= 6000) {
        compatible = true;
      } else if (cpuCores === 8 && cudaCores >= 6000 && cudaCores <= 12000) {
        compatible = true;
      } else if (cpuCores > 9 && cudaCores >= 12000 && cudaCores <= 20000) {
        compatible = true;
      } else {
        compatible = false;
        if (cudaCores > 20000 || (cpuCores === 4 && cudaCores > 1500) || (cpuCores === 6 && cudaCores > 6000) || (cpuCores === 8 && cudaCores > 12000)) {
          severity = (cpuCores === 4 && cudaCores >= 6000) ? 'bad' : 'warn';
          note = `GPU with ${cudaCores} CUDA cores may be bottlenecked by ${cpuCores}-core CPU. Consider upgrading CPU.`;
        } else {
          severity = 'warn';
          note = `${cpuCores}-core CPU may be overpowered for GPU with ${cudaCores} CUDA cores. Consider upgrading GPU.`;
        }
      }
    }
    // Computing Units (AMD Radeon) compatibility
    else if (computeUnits > 0) {
      if (cpuCores === 4 && computeUnits >= 16 && computeUnits <= 30) {
        compatible = true;
      } else if (cpuCores === 6 && computeUnits >= 30 && computeUnits <= 54) {
        compatible = true;
      } else if (cpuCores === 8 && computeUnits >= 55 && computeUnits <= 84) {
        compatible = true;
      } else if (cpuCores > 9 && computeUnits >= 85 && computeUnits <= 100) {
        compatible = true;
      } else {
        compatible = false;
        if (computeUnits > 100 || (cpuCores === 4 && computeUnits > 30) || (cpuCores === 6 && computeUnits > 54) || (cpuCores === 8 && computeUnits > 84)) {
          severity = (cpuCores === 4 && computeUnits >= 55) ? 'bad' : 'warn';
          note = `GPU with ${computeUnits} compute units may be bottlenecked by ${cpuCores}-core CPU. Consider upgrading CPU.`;
        } else {
          severity = 'warn';
          note = `${cpuCores}-core CPU may be overpowered for GPU with ${computeUnits} compute units. Consider upgrading GPU.`;
        }
      }
    }
    // Xe Cores (Intel GPU) compatibility
    else if (xeCores > 0) {
      if (cpuCores === 4 && xeCores >= 4 && xeCores <= 8) {
        compatible = true;
      } else if (cpuCores === 6 && xeCores >= 9 && xeCores <= 16) {
        compatible = true;
      } else if (cpuCores === 8 && xeCores >= 24 && xeCores <= 32) {
        compatible = true;
      } else if (cpuCores > 9 && xeCores >= 33 && xeCores <= 45) {
        compatible = true;
      } else {
        compatible = false;
        if (xeCores > 45 || (cpuCores === 4 && xeCores > 8) || (cpuCores === 6 && xeCores > 16) || (cpuCores === 8 && xeCores > 32)) {
          severity = (cpuCores === 4 && xeCores >= 24) ? 'bad' : 'warn';
          note = `GPU with ${xeCores} Xe cores may be bottlenecked by ${cpuCores}-core CPU. Consider upgrading CPU.`;
        } else {
          severity = 'warn';
          note = `${cpuCores}-core CPU may be overpowered for GPU with ${xeCores} Xe cores. Consider upgrading GPU.`;
        }
      }
    }
    
    return { compatible, severity, note };
  };
 
  let bottleneckNote = hasCpuGpu ? '' : 'NO DATA';
  let compatSeverity = 'good';
  const cpuGpuCompat = checkCpuGpuCompatibility(cpuRaw, gpuArray);
  
  if (hasCpuGpu) {
    if (cpuGpuCompat.note) {
      bottleneckNote = cpuGpuCompat.note;
      compatSeverity = cpuGpuCompat.severity;
    } else if (cpuGpuCompat.compatible) {
      bottleneckNote = 'Good balance: CPU and GPU configuration looks well-matched.';
      compatSeverity = 'good';
    } else {
      bottleneckNote = 'NO DATA';
    }
  } 
  if (ramBottleneck && compatSeverity === 'good' && cpuIndex>0 && combinedGpuIndex>0) {
    compatSeverity = 'warn';
    if (bottleneckNote.startsWith('Good balance')) bottleneckNote += ' (RAM bottleneck detected)';
  }

  let upgradeRecommendation = '';
  if (ramBottleneck) upgradeRecommendation = 'Consider a CPU with higher supported memory speed or using lower-frequency RAM.';

  // Power logic
  const getNumericFrom = (obj, ...keys) => { if(!obj) return 0; return toNumber(getFirst(obj,...keys)); };
  const getNumericByPattern = (obj, patterns=['tdp','power','thermal']) => { if(!obj||typeof obj!=='object') return 0; for(const k of Object.keys(obj)){ const kl=k.toLowerCase(); if(patterns.some(p=>kl.includes(p))){ const n=toNumber(obj[k]); if(n>0) return n; } } return 0; };
  const cpuTDP = (()=>{ if(!cpuRaw) return 0; const maxTdp = getNumericFrom(cpuRaw,'MaxTDP','maxTDP','max_tdp','maxtdp'); if(maxTdp) return maxTdp; const nominal = getNumericFrom(cpuRaw,'TDP','Tdp','ThermalDesignPower','PackageTDP','PackageTDPWatts'); if(nominal) return nominal; return getNumericByPattern(cpuRaw,['maxtdp','tdp','thermal']); })();
  const gpuPowerTotal = gpuArray.reduce((sum,g)=>{ const val=getNumericFrom(g,'PowerDraw','TDP','BoardPower','TypicalBoardPower','Power'); if(val) return sum+val; const fallback=getNumericByPattern(g,['power','tdp']); return sum + (fallback||0); },0);
  const psuPart = (selectedParts && selectedParts.psu) ? (selectedParts.psu._raw || selectedParts.psu) : null;
  const psuRaw = psuPart?._raw||psuPart||null;
  const psuWatt = psuRaw ? getNumericFrom(psuRaw,'Watt','Wattage','wattage','Power','Capacity','RatedPower','Output') : 0;
  const totalRequiredPower = Math.round(cpuTDP + gpuPowerTotal);
  const requiredWithHeadroom = Math.round(totalRequiredPower * 1.2);
  const minRecommendedPSU = Math.max(500, Math.round(totalRequiredPower * 1.25));
  const maxRecommendedPSU = Math.max(750, Math.round(totalRequiredPower * 1.6));
  const showPowerWarning = psuWatt>0 && requiredWithHeadroom > psuWatt;
  const showOverpoweredWarning = psuWatt>0 && psuWatt > maxRecommendedPSU;
  const isInRecommendedRange = psuWatt>0 && psuWatt >= minRecommendedPSU && psuWatt <= maxRecommendedPSU;
  const powerWarningText = showPowerWarning ? `Power Warning: PSU ${psuWatt}W is insufficient. Recommended range: ${minRecommendedPSU}W - ${maxRecommendedPSU}W (CPU ${cpuTDP||0}W + GPUs ${gpuPowerTotal||0}W = ${totalRequiredPower}W base).` : showOverpoweredWarning ? `Note: PSU ${psuWatt}W exceeds recommended range (${minRecommendedPSU}W - ${maxRecommendedPSU}W). While functional, a lower wattage PSU would be more cost-effective.` : '';
  const powerCause = (()=>{ const c=cpuTDP||0; const g=gpuPowerTotal||0; if(c===0 && g===0) return 'unknown'; const total=c+g; if(total===0) return 'unknown'; const cShare=c/total; const gShare=g/total; if(cShare>=0.65) return 'cpu'; if(gShare>=0.65) return 'gpu'; return 'both'; })();

  // Build warnings
  const warnings = [];
  if (ramBottleneck) warnings.push(ramBottleneckNote);
  if (showPowerWarning) warnings.push(powerWarningText);
  if (showOverpoweredWarning) warnings.push(powerWarningText);
  // Always include bottleneck note when severity is bad, and include for warn even if it begins with 'Note:'
  if (compatSeverity === 'bad') {
    if (bottleneckNote) warnings.push(bottleneckNote);
  } else if (compatSeverity === 'warn') {
    if (bottleneckNote) warnings.push(bottleneckNote);
  }

  // Additional generic checks (socket, RAM type, GPU count) using lightweight logic
  const normalize = (s)=> String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const mobo = selectedParts.mobo?._raw || selectedParts.mobo || null;
  const cpuSock = getFirst(cpuRaw,'socket','Socket');
  const mSock = getFirst(mobo,'socket','Socket');
  if(cpuSock && mSock && normalize(cpuSock) && normalize(mSock) && normalize(cpuSock)!==normalize(mSock)) warnings.push('CPU socket does not match motherboard');
  const mRam = normalize(getFirst(mobo,'ram_type','ramType','Ram_type'));
  const ramParts = selectedParts.rams || selectedParts.RAMs || [];
  if(mRam){ for(const r of (Array.isArray(ramParts)?ramParts:[])){ const rType = normalize(getFirst(r,'ram_type','ramType','Ram_type')); if(r && rType && rType !== mRam){ warnings.push('Memory type incompatible with motherboard'); break; } } }
  const allowedGpu = toNumber(getFirst(mobo,'gpu_slots','gpuSlots','Gpu_slots','gpuSlots')) || 1;
  const gpuCount = gpuArray.length;
  if(gpuCount > allowedGpu) warnings.push('More GPUs than motherboard supports');

  // Treat any non-good severity OR showPowerWarning OR ramBottleneck as an issue (overpowered PSU is just informational)
  const hasIssues = compatSeverity !== 'good' || ramBottleneck || showPowerWarning;

  return {
    warnings,
    hasIssues,
    cpuIndex,
    combinedGpuIndex,
    compatSeverity,
    bottleneckNote,
    upgradeRecommendation,
    ram: { highestRamFrequency, cpuMaxMemSpeed, ramBottleneck, ramBottleneckNote },
    power: { cpuTDP, gpuPowerTotal, psuWatt, totalRequiredPower, requiredWithHeadroom, minRecommendedPSU, maxRecommendedPSU, showPowerWarning, showOverpoweredWarning, isInRecommendedRange, powerWarningText, powerCause }
  };
}

export default analyzeBuild;
