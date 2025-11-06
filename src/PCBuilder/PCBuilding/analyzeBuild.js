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
  
  // Enhanced suggestion system for CPU-GPU balance
  const getSuggestedComponents = (cpuRaw, gpuArray) => {
    const suggestions = { cpus: [], gpus: [] };
    
    if (cpuRaw && (!gpuArray || gpuArray.length === 0)) {
      // CPU selected first - suggest balanced GPUs
      const cpuCores = toNumber(getFirst(cpuRaw,'Cores','cores','CoreCount','coreCount')) || findNumericByKeyPattern(cpuRaw,['core','cores']);
      
      if (cpuCores === 4) {
        suggestions.gpus = [
          { name: 'NVIDIA GTX 1650', price: '₱8,000' },
          { name: 'AMD Radeon RX 6500 XT', price: '₱8,400' },
          { name: 'Intel Arc A380', price: '₱9,550' },
          { name: 'NVIDIA GTX 1660 Super', price: '₱12,500' },
          { name: 'AMD Radeon RX 6600', price: '₱12,495' }

        ];
      } else if (cpuCores === 6) {
        suggestions.gpus = [

          { name: 'AMD Radeon RX 6650 XT', price: '₱17,000' },
          { name: 'AMD Radeon RX 6600 XT', price: '₱15,500' },
          { name: 'AMD Radeon RX 6700 XT', price: '₱25,500' },
          { name: 'AMD Radeon RX 6750 XT', price: '₱28,900' },
          { name: 'NVIDIA RTX 3060 (12GB)', price: '₱18,000' },
          { name: 'NVIDIA RTX 3060', price: '₱18,895' },
          { name: 'NVIDIA RTX 3060 Ti', price: '₱23,950' },
          { name: 'NVIDIA RTX 3070', price: '₱32,500' },
          { name: 'AMD Radeon RX 7600 XT OC', price: '₱21,950' },
          { name: 'AMD Radeon RX 7600 Gaming OC 8G', price: '₱16,495' },
          { name: 'AMD Radeon RX 7700 XT OC ', price: '₱28,628' },
          { name: 'NVIDIA RTX 2060 (12GB)', price: '₱13,000' }
        ];
      } else if (cpuCores === 8) {
        suggestions.gpus = [
          { name: 'Intel Arc A770 (8GB)', price: '₱20,000' },
          { name: 'Asus RTX 4080 TUF Gaming OC', price: '₱69,995' },
          { name: 'Inno3D RTX 5080 X3', price: '₱73,740' },
          { name: 'Asus RTX 4080 Super TUF Gaming OC', price: '₱80,975' },
          { name: 'Gigabyte RTX 4080 Eagle OC', price: '₱82,350' },
          { name: 'AMD Radeon 7800 XT', price: '₱35,450' },
          { name: 'Asus RTX 4080 Super Strix', price: '₱96,350' }
        ];
      } else if (cpuCores >= 9) {
        suggestions.gpus = [
          { name: 'Asus Radeon RX 7900 XT', price: '₱62,995' },
          { name: 'ASRock Steel Legend Radeon RX 7900 GRE OC', price: '₱40,950' },
          { name: 'Sapphire Nitro+ Radeon RX 7900 XTX VAPORT-X OC', price: '₱54,950' },
          { name: 'Gigabyte RTX 4090 Gaming OC', price: '₱107,895' },
          { name: 'MSI RTX 4090 Gaming X Trio', price: '₱109,995' },
          { name: 'Asus RTX 4090 TUF Gaming OC', price: '₱121,995' },
          { name: 'Asus RTX 4090 Strix Gaming', price: '₱134,095' },
          { name: 'Asus RTX 4090 Strix LC', price: '₱146,800' },
          { name: 'Inno3D RTX 4090 iChill X3', price: '₱124,999' }
        ];
      }
    } else if (gpuArray && gpuArray.length > 0 && !cpuRaw) {
      // GPU selected first - suggest balanced CPUs
      const firstGpu = gpuArray[0];
      const cudaCores = toNumber(getFirst(firstGpu,'CudaCores','cuda_cores','Cuda')) || findNumericByKeyPattern(firstGpu,['cuda']);
      const computeUnits = toNumber(getFirst(firstGpu,'ComputeUnits','compute_units')) || findNumericByKeyPattern(firstGpu,['computeunit','compute_units']);
      const xeCores = toNumber(getFirst(firstGpu,'XeCores','xe_cores')) || 0;
      
      if (cudaCores > 0) {
        if (cudaCores >= 800 && cudaCores <= 1500) {
          suggestions.cpus = [
            { name: 'Intel Core i3-14100F', price: '₱5,295' },
            { name: 'Intel Core i3-14100', price: '₱6,995' },
            { name: 'AMD RYZEN 3 5300G', price: '₱9,050' }
          ];
        } else if (cudaCores >= 1600 && cudaCores <= 6000) {
          suggestions.cpus = [
            { name: 'Intel Core i5-13400F', price: '₱7,513' },
            { name: 'Intel Core i5-14400F', price: '₱8,375' },
            { name: 'Intel Core i5-12400F', price: '₱8,990' },
            { name: 'AMD Ryzen 5 5600X', price: '₱8,990' },
            { name: 'AMD Ryzen 5 7600', price: '₱11,370' },
            { name: 'AMD Ryzen 5 7600X', price: '₱12,370' },
            { name: 'Intel Core i5-12600', price: '₱14,000' },
            { name: 'Intel Core i5-14600K', price: '₱14,395' },
            { name: 'AMD Ryzen 5 7600X', price: '₱14,650' }
          ];
        } else if (cudaCores >= 6100 && cudaCores <= 12000) {
          suggestions.cpus = [
            { name: 'AMD Ryzen 7 5700X', price: '₱10,930' },
            { name: 'AMD Ryzen 7 7700', price: '₱11,985' },
            { name: 'Intel Core i7-12700', price: '₱13,650' },
            { name: 'AMD Ryzen 7 5800XT', price: '₱15,940' },
            { name: 'Intel Core i7-14700F', price: '₱18,226' },
            { name: 'Intel Core i7-13700K', price: '₱19,990' },
            { name: 'Intel Core Ultra 7 265K', price: '₱22,750' },
            { name: 'AMD Ryzen 7 7800X3D', price: '₱27,995' }
          ];
        } else if (cudaCores >= 12100) {
          suggestions.cpus = [
            { name: 'Intel Core i9-14900K', price: '₱31,478' },
            { name: 'Intel Core i9-14900KF', price: '₱35,950' },
            { name: 'AMD Ryzen 9 9950X3D', price: '₱43,550' },
            { name: 'AMD Ryzen 9 9900X', price: '₱24,950' },
            { name: 'AMD Ryzen 9 9950X', price: '₱36,750' },
            { name: 'AMD Ryzen 9 9900X3D', price: '₱24,950' },
            { name: 'AMD Ryzen 9 7950X3D', price: '₱32,999' },
            { name: 'AMD Ryzen 9 7900X', price: '₱21,895' }
          ];
        }
      } else if (computeUnits > 0) {
        if (computeUnits >= 16 && computeUnits <= 30) {
          suggestions.cpus = [
            { name: 'Intel Core i3-14100F', price: '₱5,295' },
            { name: 'Intel Core i3-14100', price: '₱6,995' },
            { name: 'AMD RYZEN 3 5300G', price: '₱9,050' }
          ];
        } else if (computeUnits >= 31 && computeUnits <= 54) {
          suggestions.cpus = [
            { name: 'Intel Core i5-13400F', price: '₱7,513' },
            { name: 'Intel Core i5-14400F', price: '₱8,375' },
            { name: 'Intel Core i5-12400F', price: '₱8,990' },
            { name: 'AMD Ryzen 5 5600X', price: '₱8,990' },
            { name: 'AMD Ryzen 5 7600', price: '₱11,370' },
            { name: 'AMD Ryzen 5 7600X', price: '₱12,370' },
            { name: 'Intel Core i5-12600', price: '₱14,000' },
            { name: 'Intel Core i5-14600K', price: '₱14,395' },
            { name: 'AMD Ryzen 5 7600X', price: '₱14,650' }
          ];
        } else if (computeUnits >= 55 && computeUnits <= 84) {
          suggestions.cpus = [
            { name: 'AMD Ryzen 7 5700X', price: '₱10,930' },
            { name: 'AMD Ryzen 7 7700', price: '₱11,985' },
            { name: 'Intel Core i7-12700', price: '₱13,650' },
            { name: 'AMD Ryzen 7 5800XT', price: '₱15,940' },
            { name: 'Intel Core i7-14700F', price: '₱18,226' },
            { name: 'Intel Core i7-13700K', price: '₱19,990' },
            { name: 'Intel Core Ultra 7 265K', price: '₱22,750' },
            { name: 'AMD Ryzen 7 7800X3D', price: '₱27,995' }
          ];
        } else if (computeUnits >= 85) {
          suggestions.cpus = [
            { name: 'Intel Core i9-14900K', price: '₱31,478' },
            { name: 'Intel Core i9-14900KF', price: '₱35,950' },
            { name: 'AMD Ryzen 9 9950X3D', price: '₱43,550' },
            { name: 'AMD Ryzen 9 9900X', price: '₱24,950' },
            { name: 'AMD Ryzen 9 9950X', price: '₱36,750' },
            { name: 'AMD Ryzen 9 9900X3D', price: '₱24,950' },
            { name: 'AMD Ryzen 9 7950X3D', price: '₱32,999' },
            { name: 'AMD Ryzen 9 7900X', price: '₱21,895' }
          ];
        }
      } else if (xeCores > 0) {
        if (xeCores >= 4 && xeCores <= 8) {
          suggestions.cpus = [
            { name: 'Intel Core i3-14100F', price: '₱5,295' },
            { name: 'Intel Core i3-14100', price: '₱6,995' },
            { name: 'AMD RYZEN 3 5300G', price: '₱9,050' }
          ];
        } else if (xeCores >= 9 && xeCores <= 16) {
          suggestions.cpus = [
            { name: 'Intel Core i5-13400F', price: '₱7,513' },
            { name: 'Intel Core i5-14400F', price: '₱8,375' },
            { name: 'Intel Core i5-12400F', price: '₱8,990' },
            { name: 'AMD Ryzen 5 5600X', price: '₱8,990' },
            { name: 'AMD Ryzen 5 7600', price: '₱11,370' },
            { name: 'AMD Ryzen 5 7600X', price: '₱12,370' },
            { name: 'Intel Core i5-12600', price: '₱14,000' },
            { name: 'Intel Core i5-14600K', price: '₱14,395' },
            { name: 'AMD Ryzen 5 7600X', price: '₱14,650' }
          ];
        } else if (xeCores >= 17 && xeCores <= 32) {
          suggestions.cpus = [
            { name: 'AMD Ryzen 7 5700X', price: '₱10,930' },
            { name: 'AMD Ryzen 7 7700', price: '₱11,985' },
            { name: 'Intel Core i7-12700', price: '₱13,650' },
            { name: 'AMD Ryzen 7 5800XT', price: '₱15,940' },
            { name: 'Intel Core i7-14700F', price: '₱18,226' },
            { name: 'Intel Core i7-13700K', price: '₱19,990' },
            { name: 'Intel Core Ultra 7 265K', price: '₱22,750' },
            { name: 'AMD Ryzen 7 7800X3D', price: '₱27,995' }
          ];
        } else if (xeCores >= 33) {
          suggestions.cpus = [
            { name: 'Intel Core i9-14900K', price: '₱31,478' },
            { name: 'Intel Core i9-14900KF', price: '₱35,950' },
            { name: 'AMD Ryzen 9 9950X3D', price: '₱43,550' },
            { name: 'AMD Ryzen 9 9900X', price: '₱24,950' },
            { name: 'AMD Ryzen 9 9950X', price: '₱36,750' },
            { name: 'AMD Ryzen 9 9900X3D', price: '₱24,950' },
            { name: 'AMD Ryzen 9 7950X3D', price: '₱32,999' },
            { name: 'AMD Ryzen 9 7900X', price: '₱21,895' }
          ];
        }
      }
    }
    
    return suggestions;
  };
  
  const suggestions = getSuggestedComponents(cpuRaw, gpuArray);
  const shouldShowSuggestions = (cpuRaw && (!gpuArray || gpuArray.length === 0)) || (gpuArray && gpuArray.length > 0 && !cpuRaw);
  
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
    let BuildSuitabilitynote = '';
    let laymanNote = '';
    let usageScores = { gaming: 0, office: 0, productivity: 0 };
    
    // CUDA Cores (NVIDIA) compatibility - Updated with more realistic thresholds
    if (cudaCores > 0) {
      if (cpuCores == 4 && cudaCores >= 800 && cudaCores <= 1500) {
        compatible = true;
        usageScores = { gaming: 60, office: 95, productivity: 55 };
        BuildSuitabilitynote = 'Great for everyday tasks like schoolwork and office use. Light gaming possible, but not for heavy graphics.';

      } else if (cpuCores == 6 && cudaCores >= 1600 && cudaCores <= 6000) {
        compatible = true;
        usageScores = { gaming: 85, office: 85, productivity: 75 };
        BuildSuitabilitynote = 'Balanced system for gaming, school, and light creative work. Slightly more powerful than needed for office tasks, so efficiency is a bit lower.';

      } else if (cpuCores == 8  && cudaCores >= 6100 && cudaCores <= 12000) {
        compatible = true;
        usageScores = { gaming: 90, office: 80, productivity: 90 };
        BuildSuitabilitynote = 'Powerful setup for gaming and productivity. For office work, it’s more than needed, higher power draw and heat make it less ideal for simple tasks.';

      } else if (cpuCores >= 9 && cudaCores >= 12100) {
        compatible = true;
        usageScores = { gaming: 85, office: 70, productivity: 95 };
        BuildSuitabilitynote = 'Top-tier hardware for advanced workloads. Excellent for gaming and professional use, but overpowered for basic office tasks and less power-efficient.';

      } else {
        compatible = false;
        if (cudaCores >= 12100 && cpuCores < 9) {
          severity = 'bad';
          note = `High-end GPU with ${cudaCores} CUDA cores requires at least 9-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i9-12900K, AMD Ryzen 9 5900X, or higher`;
          laymanNote = 'Your graphics card is too powerful for your processor. This means your processor might slow down your graphics card, preventing you from getting the best gaming performance.';
        } else if (cudaCores >= 6100 && cudaCores <= 12000 && cpuCores < 8) {
          severity = 'warn';
          note = `GPU with ${cudaCores} CUDA cores requires at least 8-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel Core i7 series or AMD Ryzen 7 series`;
          laymanNote = 'Your graphics card might be limited by your processor in demanding games or applications.';
        } else if (cudaCores >= 1600 && cudaCores <= 6000 && cpuCores < 6) {
          severity = 'warn';
          note = `GPU with ${cudaCores} CUDA cores requires at least 6-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel Core i5 series or AMD Ryzen 5 series`;
          laymanNote = 'Your graphics card might be limited by your processor in demanding games or applications.';
        } else if (cpuCores === 4 && cudaCores > 1500) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is underpowered for GPU with ${cudaCores} CUDA cores. Consider upgrading GPU to match CPU capability.\n\nSuggestion: GTX 1660 Super, RTX 3050, or RTX 4050`;
          laymanNote = 'Your processor is not powerful enough for this graphics card. Consider a graphics card that matches your processor\'s capabilities.';
        } else if (cpuCores === 6 && cudaCores < 1600) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is overpowered for GPU with ${cudaCores} CUDA cores. Consider upgrading GPU.\n\nSuggestion: RTX 3060 Ti, RTX 3070, or RTX 4060 Ti`;
          laymanNote = 'Your processor is more powerful than needed for this graphics card. You could get a better graphics card to match your processor\'s capabilities.';
        } else if (cpuCores >= 8 && cudaCores < 6100) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is overpowered for GPU with ${cudaCores} CUDA cores. Consider upgrading GPU.\n\nSuggestion: RX 7800XT, ARC 770 , RTX 4080`;
          laymanNote = 'Your processor is more powerful than needed for this graphics card. You could get a better graphics card to match your processor\'s capabilities.';
        } else {
          severity = 'warn';
          note = `${cpuCores}-core CPU may not be optimally matched for GPU with ${cudaCores} CUDA cores.`;
          laymanNote = 'Your processor and graphics card may not be optimally matched for best performance.';
        }
      }
    }
    // Computing Units (AMD Radeon) compatibility - Updated with more realistic thresholds
    else if (computeUnits > 0) {
      if (cpuCores == 4  && computeUnits >= 16 && computeUnits <= 30) {
        compatible = true;
        usageScores = { gaming: 60, office: 95, productivity: 55 };

        BuildSuitabilitynote = 'Great for everyday tasks like schoolwork and office use. Light gaming possible, but not for heavy graphics.';

      } else if (cpuCores == 6 && computeUnits >= 31 && computeUnits <= 54) {
        compatible = true;
        usageScores = { gaming: 85, office: 85, productivity: 75 };
        BuildSuitabilitynote = 'Balanced system for gaming, school, and light creative work. Slightly more powerful than needed for office tasks, so efficiency is a bit lower.';

      } else if (cpuCores == 8  && computeUnits >= 55 && computeUnits <= 84) {
        compatible = true;
        usageScores = { gaming: 90, office: 80, productivity: 90 };
        BuildSuitabilitynote = 'Powerful setup for gaming and productivity. For office work, it’s more than needed, higher power draw and heat make it less ideal for simple tasks.';

      } else if (cpuCores >= 8 && computeUnits >= 85) {
        compatible = true;
        usageScores = { gaming: 85, office: 70, productivity: 95 };
        BuildSuitabilitynote = 'Top-tier hardware for advanced workloads. Excellent for gaming and professional use, but overpowered for basic office tasks and less power-efficient.';

      } else {
        compatible = false;
        if (computeUnits >= 85 && cpuCores < 8) {
          severity = 'bad';
          note = `High-end GPU with ${computeUnits} compute units requires at least 8-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i7-12700K, AMD Ryzen 7 5800X, or higher`;
          laymanNote = 'Your graphics card is too powerful for your processor. This means your processor might slow down your graphics card, preventing you from getting the best gaming performance.';
        } else if (computeUnits >= 55 && computeUnits <= 84 && cpuCores < 8) {
          severity = 'warn';
          note = `GPU with ${computeUnits} compute units requires at least 8-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i7-12700K, AMD Ryzen 7 5800X, or higher`;
          laymanNote = 'Your graphics card might be limited by your processor in demanding games or applications.';
        } else if (computeUnits >= 31 && computeUnits <= 54 && cpuCores < 6) {
          severity = 'warn';
          note = `GPU with ${computeUnits} compute units requires at least 6-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i5-12600K, AMD Ryzen 5 5600X, or higher`;
          laymanNote = 'Your graphics card might be limited by your processor in demanding games or applications.';
        } else if (cpuCores === 4 && computeUnits > 30) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is underpowered for GPU with ${computeUnits} compute units. Consider upgrading GPU to match CPU capability.\n\nSuggestion: RX 6500 XT, RX 6600, or RX 7600`;
          laymanNote = 'Your processor is not powerful enough for this graphics card. Consider a graphics card that matches your processor\'s capabilities.';
        } else if (cpuCores === 6 && computeUnits < 31) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is overpowered for GPU with ${computeUnits} compute units. Consider upgrading GPU.\n\nSuggestion: RX 6700 XT, RX 7700 XT, or RX 7800 XT`;
          laymanNote = 'Your processor is more powerful than needed for this graphics card. You could get a better graphics card to match your processor\'s capabilities.';
        } else if (cpuCores >= 8 && computeUnits < 55) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is overpowered for GPU with ${computeUnits} compute units. Consider upgrading GPU.\n\nSuggestion: RX 6800 XT, RX 7800 XT, RX 7900 XT, or higher`;
          laymanNote = 'Your processor is more powerful than needed for this graphics card. You could get a better graphics card to match your processor\'s capabilities.';
        } else {
          severity = 'warn';
          note = `${cpuCores}-core CPU may not be optimally matched for GPU with ${computeUnits} compute units.`;
          laymanNote = 'Your processor and graphics card may not be optimally matched for best performance.';
        }
      }
    }
    // Xe Cores (Intel GPU) compatibility
    else if (xeCores > 0) {
      if (cpuCores === 4 && xeCores >= 4 && xeCores <= 8) {
        compatible = true;
        usageScores = { gaming: 60, office: 95, productivity: 55 };
        BuildSuitabilitynote = 'Great for everyday tasks like schoolwork and office use. Light gaming possible, but not for heavy graphics.';


      } else if (cpuCores === 6 && xeCores >= 9 && xeCores <= 16) {
        compatible = true;
        usageScores = { gaming: 85, office: 85, productivity: 75 };
        BuildSuitabilitynote = 'Balanced system for gaming, school, and light creative work. Slightly more powerful than needed for office tasks, so efficiency is a bit lower.';


      } else if (cpuCores === 8 && xeCores >= 17 && xeCores <= 32) {
        compatible = true;
        usageScores = { gaming: 90, office: 80, productivity: 90 };
        BuildSuitabilitynote = 'Powerful setup for gaming and productivity. For office work, it’s more than needed, higher power draw and heat make it less ideal for simple tasks.';

      } else if (cpuCores > 8 && xeCores >= 33 && xeCores <= 45) {
        compatible = true;
        usageScores = { gaming: 85, office: 70, productivity: 95 };
        BuildSuitabilitynote = 'Top-tier hardware for advanced workloads. Excellent for gaming and professional use, but overpowered for basic office tasks and less power-efficient.';


      } else {
        compatible = false;
        if (xeCores >= 33 && cpuCores < 8) {
          severity = 'bad';
          note = `High-end GPU with ${xeCores} Xe cores requires at least 8-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i7-12700K, AMD Ryzen 7 5800X, or higher`;
          laymanNote = 'Your graphics card is too powerful for your processor. This means your processor might slow down your graphics card, preventing you from getting the best gaming performance.';
        } else if (xeCores >= 17 && xeCores <= 32 && cpuCores < 8) {
          severity = 'warn';
          note = `GPU with ${xeCores} Xe cores requires at least 8-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i7-12700K, AMD Ryzen 7 5800X, or higher`;
          laymanNote = 'Your graphics card might be limited by your processor in demanding games or applications.';
        } else if (xeCores >= 9 && xeCores <= 16 && cpuCores < 6) {
          severity = 'warn';
          note = `GPU with ${xeCores} Xe cores requires at least 6-core CPU. Consider upgrading CPU.\n\nSuggestion: Intel i5-12600K, AMD Ryzen 5 5600X, or higher`;
          laymanNote = 'Your graphics card might be limited by your processor in demanding games or applications.';
        } else if (cpuCores === 4 && xeCores > 8) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is underpowered for GPU with ${xeCores} Xe cores. Consider upgrading GPU to match CPU capability.\n\nSuggestion: Intel Arc A380 or A580`;
          laymanNote = 'Your processor is not powerful enough for this graphics card. Consider a graphics card that matches your processor\'s capabilities.';
        } else if (cpuCores === 6 && xeCores < 9) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is overpowered for GPU with ${xeCores} Xe cores. Consider upgrading GPU.\n\nSuggestion: Intel Arc A750 or A770`;
          laymanNote = 'Your processor is more powerful than needed for this graphics card. You could get a better graphics card to match your processor\'s capabilities.';
        } else if (cpuCores >= 8 && xeCores < 17) {
          severity = 'warn';
          note = `${cpuCores}-core CPU is overpowered for GPU with ${xeCores} Xe cores. Consider upgrading GPU.\n\nSuggestion: Intel Arc A770 or higher-end GPU`;
          laymanNote = 'Your processor is more powerful than needed for this graphics card. You could get a better graphics card to match your processor\'s capabilities.';
        } else {
          severity = 'warn';
          note = `${cpuCores}-core CPU may not be optimally matched for GPU with ${xeCores} Xe cores.`;
          laymanNote = 'Your processor and graphics card may not be optimally matched for best performance.';
        }
      }
    }
    
    return { compatible, severity, note, laymanNote, usageScores, BuildSuitabilitynote };
  };
 
  let bottleneckNote = hasCpuGpu ? '' : 'NO DATA';
  let laymanExplanation = '';
  let usageScores = { gaming: 0, office: 0, productivity: 0 };
  let BuildSuitabilitynote = '';
  let compatSeverity = 'good';
  const cpuGpuCompat = checkCpuGpuCompatibility(cpuRaw, gpuArray);
  
  if (hasCpuGpu) {
    // Always provide default usage scores if we have CPU+GPU
    usageScores = { gaming: 75, office: 80, productivity: 70 };
    
    if (cpuGpuCompat.note) {
      bottleneckNote = cpuGpuCompat.note;
      laymanExplanation = cpuGpuCompat.laymanNote || '';
      usageScores = cpuGpuCompat.usageScores || usageScores;
      BuildSuitabilitynote = cpuGpuCompat.BuildSuitabilitynote || '';
      compatSeverity = cpuGpuCompat.severity;
    } else if (cpuGpuCompat.compatible) {
      bottleneckNote = 'Good balance: CPU and GPU configuration looks well-matched.';
      usageScores = cpuGpuCompat.usageScores || usageScores;
      BuildSuitabilitynote = cpuGpuCompat.BuildSuitabilitynote || '';
      compatSeverity = 'good';
    } else {
      bottleneckNote = 'Configuration detected but specific compatibility ranges not found.';
    }
  } 
  if (ramBottleneck && compatSeverity === 'good' && cpuIndex>0 && combinedGpuIndex>0) {
    compatSeverity = 'warn';
    if (bottleneckNote.startsWith('Good balance')) bottleneckNote += ' (RAM bottleneck detected)';
  }

  let upgradeRecommendation = '';
  if (ramBottleneck) {
    const suggestedRam = highestRamFrequency > 4800 ? 'DDR5-4800' : highestRamFrequency > 3600 ? 'DDR4-3200' : 'DDR4-2666';
    upgradeRecommendation = `Consider a CPU with higher supported memory speed or using lower-frequency RAM.\n\nSuggestion: ${suggestedRam} or upgrade to a newer CPU generation`;
  }

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
  const powerWarningText = showPowerWarning ? `Power Warning: PSU ${psuWatt}W is insufficient. Recommended range: ${minRecommendedPSU}W - ${maxRecommendedPSU}W (CPU ${cpuTDP||0}W + GPUs ${gpuPowerTotal||0}W = ${totalRequiredPower}W base).\n\nSuggestion: ${Math.ceil(minRecommendedPSU/50)*50}W 80+ Gold PSU` : showOverpoweredWarning ? `Note: PSU ${psuWatt}W exceeds recommended range (${minRecommendedPSU}W - ${maxRecommendedPSU}W). While functional, a lower wattage PSU would be more cost-effective.\n\nSuggestion: ${Math.ceil(maxRecommendedPSU/50)*50}W 80+ Gold PSU` : '';
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
    laymanExplanation,
    usageScores,
    BuildSuitabilitynote,
    upgradeRecommendation,
    ram: { highestRamFrequency, cpuMaxMemSpeed, ramBottleneck, ramBottleneckNote },
    power: { cpuTDP, gpuPowerTotal, psuWatt, totalRequiredPower, requiredWithHeadroom, minRecommendedPSU, maxRecommendedPSU, showPowerWarning, showOverpoweredWarning, isInRecommendedRange, powerWarningText, powerCause },
    suggestions,
    shouldShowSuggestions
  };
}

export default analyzeBuild;
