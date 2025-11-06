import './PartSelector.css';
import Select from 'react-select';
import { useState, useEffect } from 'react';

function PartSelector({ part, selectedValue, setSelectedValue, selectedMOBO, selectedCPU, dataLookup, slotCount, selectedValues, setSelectedValues, partIcon }) {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [iconImg, setIconImg] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState(null);
  const [multiSlotImgs, setMultiSlotImgs] = useState({}); // idx -> url
  const firstSelected = Array.isArray(selectedValues) ? selectedValues[0] : null;
  const [otherSelected, setOtherSelected] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Flexible part name resolution (case-insensitive, allow synonyms)
  const partName = (part?.name || '').toLowerCase();
  const mapByCanonical = {
    mobo: dataLookup?.mobo || [],
    cpu: dataLookup?.cpu || [],
    cpucooler: dataLookup?.cpuCooler || [],
    gpu: dataLookup?.gpu || [],
    psu: dataLookup?.psu || [],
    ram: dataLookup?.ram || [],
    storage: dataLookup?.storage || [],
    m2: dataLookup?.m2 || [],
    case: dataLookup?.case || [],
    casefans: dataLookup?.caseFans || [],
    keyboard: dataLookup?.keyboard || [],
    mouse: dataLookup?.mouse || [],
    headset: dataLookup?.headset || [],
    monitor: dataLookup?.monitor || [],
  };

  const resolveArray = () => {
    // direct exact matches
    if (mapByCanonical[partName]) return mapByCanonical[partName];
    // substring logic
    if (partName.includes('motherboard') || partName.includes('mobo')) return mapByCanonical.mobo;
    if (partName.includes('cooler')) return mapByCanonical.cpucooler;
    if (partName.includes('processor') || partName.includes('cpu')) return mapByCanonical.cpu;
    if (partName.includes('graphics') || partName.includes('gpu')) return mapByCanonical.gpu;
    if (partName.includes('power') || partName.includes('psu')) return mapByCanonical.psu;
    if (partName.includes('memory') || partName.includes('ram')) return mapByCanonical.ram;
    if (partName.includes('m.2') || partName.includes('nvme') || partName === 'm2') return mapByCanonical.m2;
    if (partName.includes('storage') || partName.includes('hdd') || partName.includes('ssd')) return mapByCanonical.storage;
    if (partName.includes('case') && !partName.includes('fan')) return mapByCanonical.case;
    if (partName.includes('fan') || partName.includes('case fan')) return mapByCanonical.casefans;
    if (partName.includes('keyboard')) return mapByCanonical.keyboard;
    if (partName.includes('mouse')) return mapByCanonical.mouse;
    if (partName.includes('headset') || partName.includes('headphone')) return mapByCanonical.headset;
    if (partName.includes('monitor') || partName.includes('display')) return mapByCanonical.monitor;
    return [];
  };

  let options = resolveArray();

  // normalize keys from the database (handles mixed capitalization)
  const getFirst = (obj, ...keys) => {
    for (const k of keys) {
      if (obj == null) continue;
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) return obj[k];
      const low = k.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(obj, low) && obj[low] !== undefined) return obj[low];
      const up = k.charAt(0).toUpperCase() + k.slice(1);
      if (Object.prototype.hasOwnProperty.call(obj, up) && obj[up] !== undefined) return obj[up];
    }
    return undefined;
  };

  const normalize = (opt) => {
    if (!opt) return opt;
    const normalized = {
      id: getFirst(opt, 'id', 'Id', 'ID'),
      name: getFirst(opt, 'name', 'Name', 'label') || String(getFirst(opt, 'id') || ''),
      price: getFirst(opt, 'price', 'Price') || 0,
      socket: getFirst(opt, 'socket', 'Socket'),
      chipset: getFirst(opt, 'chipset', 'Chipset'),
      ramType: getFirst(opt, 'ramType', 'RamType', 'Ramtype'),
      formFactor: getFirst(opt, 'formFactor', 'FormFactor', 'form_factor'),
      interface: getFirst(opt, 'interface', 'Interface'),
      type: getFirst(opt, 'type', 'Type', 'componentType', 'component'),
      // snake_case support
      ram_type: getFirst(opt, 'ram_type'),
      // keep original object for any extra fields
      _raw: opt,
    };
    return normalized;
  };

  // normalize all options early so compatibility checks work
  options = options.map(normalize);

  // Top-level: fetch DB image for single-select icon (by name only)
  useEffect(() => {
    let active = true;
    const item = selectedValue;
    async function load() {
      try {
        if (!item || !item.name) { if (active) setIconImg(null); return; }
        if (item.image) { if (active) setIconImg(null); return; }
        const cache = (typeof window !== 'undefined') ? (window.__imgCache = window.__imgCache || new Map()) : null;
        const key = `imgdbname:${item.name}`;
        if (cache && cache.has(key)) { if (active) setIconImg(cache.get(key)); return; }
        const base = import.meta?.env?.VITE_BACKEND_URL || '';
        const url = `${base}/api/items/image/by-name?name=${encodeURIComponent(item.name)}`;
        const r = await fetch(url);
        if (!r.ok) { if (active) setIconImg(null); return; }
        const row = await r.json();
        const imgUrl = row?.image_url || null;
        if (active) {
          setIconImg(imgUrl);
          if (cache && imgUrl) cache.set(key, imgUrl);
        }
      } catch { if (active) setIconImg(null); }
    }
    load();
    return () => { active = false; };
  }, [selectedValue && selectedValue.name]);


  // effective selections: combine props with otherSelected events so any selector can drive filtering
  const effectiveMOBO = selectedMOBO || otherSelected['Motherboard (MOBO)'] || otherSelected['Motherboard'] || null;
  const effectiveCPU = selectedCPU || otherSelected['Processor (CPU)'] || otherSelected['CPU'] || null;

  // No GPU filtering needed for single GPU setup

  // Compatibility helpers (shared)
  const normalizeStr = (s) => (s || '').toString().trim().toLowerCase();
  const normalizeId = (s) => normalizeStr(s).replace(/[^a-z0-9]/g, '');
  const socketMatch = (a, b) => {
    if (!a || !b) return false;
    const sa = normalizeId(a);
    const sb = normalizeId(b);
    if (!sa || !sb) return false;
    if (sa === sb) return true;
    if (sa.includes(sb) || sb.includes(sa)) return true;
    return false;
  };

  const parseRamTypes = (s) => {
    if (!s) return [];
    return s.toString().split(/[,;&\\/]|\band\b|&/i).map(x => x.replace(/[^a-z0-9]/gi, '').toLowerCase()).filter(Boolean);
  };

  // Helper: form factor normalization (adds handling for ambiguous 'mini-atx' -> micro-atx)
  const normalizeFormFactor = (raw) => {
    if (!raw) return '';
    const v = raw.toString().toLowerCase();
    if (/mini\s*-?itx|mitx/.test(v)) return 'mini-itx';
    if (/e\s*-?atx|eatx/.test(v)) return 'e-atx';
    if (/micro\s*-?atx|m\s*-?atx|matx|microatx|mini\s*-?atx/.test(v)) return 'matx'; // treat 'mini-atx' as micro-atx (dataset quirk)
    if (/\batx\b/.test(v) || v.startsWith('atx')) return 'atx';
    return v.replace(/\s+/g,'');
  };

  const moboFF = effectiveMOBO ? normalizeFormFactor(effectiveMOBO.formFactor || effectiveMOBO.FormFactor || effectiveMOBO._raw?.formFactor || effectiveMOBO._raw?.FormFactor) : '';

    // Define what a case supports by parsing all advertised form factors and applying hierarchy
    // Hierarchy (small -> large): mini-itx (1), matx (2), atx (3), e-atx (4)
    const FF_RANK = { 'mini-itx': 1, 'matx': 2, 'atx': 3, 'e-atx': 4 };
    const parseCaseSupported = (raw) => {
      const text = (raw || '').toString().toLowerCase();
      const supports = new Set();
      if (/e\s*-?atx|eatx/.test(text)) supports.add('e-atx');
      if (/micro\s*-?atx|m\s*-?atx|matx|microatx|mini\s*-?atx/.test(text)) supports.add('matx');
      if (/mini\s*-?itx|mitx/.test(text)) supports.add('mini-itx');
      // Detect pure ATX (avoid counting inside e-atx or matx by negative lookbehind not widely supported -> manual check)
      if ((/(^|[^a-z])atx([^a-z]|$)/.test(text)) && !supports.has('e-atx')) supports.add('atx');
      return supports;
    };
    const caseSupportsMobo = (caseObj) => {
      if (!moboFF) return true;
      const raw = caseObj.formFactor || caseObj.FormFactor || caseObj._raw?.formFactor || caseObj._raw?.FormFactor || '';
      const supports = parseCaseSupported(raw);
      // If nothing parsed, fall back to normalized single value
      if (supports.size === 0) {
        const single = normalizeFormFactor(raw);
        if (single) supports.add(single);
      }
      const mRank = FF_RANK[moboFF] || 0;
      if (moboFF === 'e-atx') return supports.has('e-atx');
      if (moboFF === 'atx') return supports.has('atx') || supports.has('e-atx');
      if (moboFF === 'matx') return ['matx','atx','e-atx'].some(f => supports.has(f));
      if (moboFF === 'mini-itx') return ['mini-itx','matx','atx','e-atx'].some(f => supports.has(f));
      // Unknown fallback
      return true;
    };

  // Symmetric, start-anywhere compatibility filtering
  switch (part.name) {
    case "Motherboard (MOBO)":
      // If CPU chosen elsewhere, filter MOBOs by socket
      if (effectiveCPU) {
        const cpuSocket = effectiveCPU.socket || effectiveCPU._raw?.Socket || effectiveCPU._raw?.socket;
        if (cpuSocket) {
          options = options.filter(mobo => {
            const mSocket = mobo.socket || mobo._raw?.Socket || mobo._raw?.socket;
            return mSocket ? socketMatch(mSocket, cpuSocket) : true;
          });
        }
      }
      // If RAM chosen elsewhere (array), filter MOBO by supported RAM type
      {
        const ramSel = otherSelected['Memory (RAM)'];
        const ramList = Array.isArray(ramSel?.slots) ? ramSel.slots.filter(Boolean) : [];
        if (ramList.length > 0) {
          const pickedTypes = new Set();
          for (const r of ramList) {
            const types = parseRamTypes(r?.ramType || r?.ram_type || r?._raw?.RamType || r?._raw?.ram_type || r?._raw?.type);
            types.forEach(t => pickedTypes.add(t));
          }
          if (pickedTypes.size > 0) {
            options = options.filter(mobo => {
              const mTypes = parseRamTypes(mobo.ramType || mobo.ram_type || mobo._raw?.RamType || mobo._raw?.ramType || mobo._raw?.ram_type);
              if (mTypes.length === 0) return true;
              return mTypes.some(t => pickedTypes.has(t));
            });
          }
        }
      }
      break;
      case "Processor (CPU)":
      if (effectiveMOBO) {
        options = options.filter(cpu => {
          const cpuSocket = cpu.socket || cpu._raw?.Socket || cpu._raw?.socket;
          const mSocket = effectiveMOBO.socket || effectiveMOBO.Socket || effectiveMOBO._raw?.Socket || effectiveMOBO._raw?.socket;
          if (mSocket) {
            return cpuSocket ? socketMatch(cpuSocket, mSocket) : false;
          }
          return true;
        });
      }
        break;
      case "CPU Cooler":
      {
        const cpuRef = effectiveCPU;
        const cpuSocket = cpuRef ? (cpuRef.socket || cpuRef._raw?.Socket || cpuRef._raw?.socket) : null;
        if (cpuSocket) {
          options = options.filter(cooler => {
            const coolerSocket = cooler.socket || cooler._raw?.Socket || cooler._raw?.socket;
            return coolerSocket ? socketMatch(coolerSocket, cpuSocket) : true;
          });
        }
      }
        break;
      case "Memory (RAM)":
      if (effectiveMOBO) {
        options = options.filter(ram => {
          const ramTypes = parseRamTypes(ram.ramType || ram.ram_type || ram.type || ram._raw?.RamType || ram._raw?.Ramtype || ram._raw?.ram_type || ram._raw?.type);
          const mTypes = parseRamTypes(effectiveMOBO?.ramType || effectiveMOBO?.ram_type || effectiveMOBO?.RamType || effectiveMOBO?._raw?.RamType || effectiveMOBO?._raw?.ramType || effectiveMOBO?._raw?.ram_type);
          if (ramTypes.length > 0 && mTypes.length > 0) {
            if (!ramTypes.some(rt => mTypes.includes(rt))) return false;
          } else {
            const ramPrimary = ram.ramType || ram.ram_type || ram.type;
            const moboPrimary = effectiveMOBO?.ramType || effectiveMOBO?.ram_type;
            if (ramPrimary && moboPrimary) {
              if (!(normalizeStr(ramPrimary).includes(normalizeStr(moboPrimary)) || normalizeStr(moboPrimary).includes(normalizeStr(ramPrimary)))) return false;
            }
          }
          // Filter by CPU RAM max frequency
          if (effectiveCPU) {
            const cpuRamMax = effectiveCPU.ram_max || effectiveCPU._raw?.ram_max || effectiveCPU._raw?.RamMax;
            const ramFreq = ram.frequency_mhz || ram._raw?.frequency_mhz || ram._raw?.Frequency;
            if (cpuRamMax && ramFreq && Number(ramFreq) > Number(cpuRamMax)) {
              return false;
            }
          }
          return true;
        });
      }
        break;
      case "Storage":
        options = options.filter(storage => (storage.interface || '').toString().toLowerCase() === "sata");
        break;
      case "M.2 SSD":
        options = options.filter(m2 => (m2.interface || '').toString().toLowerCase() === "nvme");
        break;
      case "Case":
        options = options.filter(c => caseSupportsMobo(c));
        break;
    default:
      break;
  }

  // Utility functions for suggestions
  const toNumber = (v) => { if (v == null) return 0; if (typeof v === 'number') return v; const m = String(v).match(/[0-9]+(\.[0-9]+)?/); if (!m) return 0; const n = parseFloat(m[0]); return Number.isFinite(n) ? n : 0; };
  const findNumericByKeyPattern = (obj, patterns=['core','cores']) => { if(!obj||typeof obj!=='object') return 0; const keys=Object.keys(obj); for(const p of patterns){ for(const k of keys){ if(k.toLowerCase().includes(p)){ const n=toNumber(obj[k]); if(n>0) return n; } } } return 0; };
  
  // Get suggestions for current selection context
  const getSuggestions = () => {
    // Simple suggestion logic based on current context
    if (part.name === "Graphics Card (GPU)" && effectiveCPU && !selectedValue) {
      const cpuCores = toNumber(getFirst(effectiveCPU,'Cores','cores','CoreCount','coreCount')) || findNumericByKeyPattern(effectiveCPU,['core','cores']);
      if (cpuCores === 4) {
        return ['GTX 1650 Super', 'GTX 1660', 'RTX 3050', 'RX 6500 XT', 'RX 6600'];
      } else if (cpuCores === 6) {
        return ['RTX 3060', 'RTX 4060', 'RTX 3060 Ti', 'RX 6600 XT', 'RX 7600'];
      } else if (cpuCores === 8) {
        return ['RTX 3070', 'RTX 4070', 'RTX 4070 Ti', 'RX 7700 XT', 'RX 7800 XT'];
      } else if (cpuCores >= 9) {
        return ['RTX 4080', 'RTX 4090', 'RX 7900 XT', 'RX 7900 XTX'];
      }
    } else if (part.name === "Processor (CPU)" && otherSelected['Graphics Card (GPU)'] && !selectedValue) {
      const firstGpu = otherSelected['Graphics Card (GPU)'];
      const cudaCores = toNumber(getFirst(firstGpu,'CudaCores','cuda_cores','Cuda')) || findNumericByKeyPattern(firstGpu,['cuda']);
      const computeUnits = toNumber(getFirst(firstGpu,'ComputeUnits','compute_units')) || findNumericByKeyPattern(firstGpu,['computeunit','compute_units']);
      
      if (cudaCores > 0) {
        if (cudaCores >= 800 && cudaCores <= 1500) {
          return ['Intel Core i3-12100F', 'Intel Core i5-11400F', 'AMD Ryzen 5 4500'];
        } else if (cudaCores >= 1600 && cudaCores <= 6000) {
          return ['Intel Core i5-12400F', 'AMD Ryzen 5 5600X', 'Intel Core i5-13400F'];
        } else if (cudaCores >= 6100 && cudaCores <= 12000) {
          return ['Intel Core i7-12700F', 'AMD Ryzen 7 5800X', 'Intel Core i7-13700F'];
        } else if (cudaCores >= 12100) {
          return ['Intel Core i9-12900K', 'AMD Ryzen 9 5900X', 'Intel Core i9-13900K'];
        }
      } else if (computeUnits > 0) {
        if (computeUnits >= 16 && computeUnits <= 30) {
          return ['Intel Core i3-12100F', 'Intel Core i5-11400F', 'AMD Ryzen 5 4500'];
        } else if (computeUnits >= 31 && computeUnits <= 54) {
          return ['Intel Core i5-12400F', 'AMD Ryzen 5 5600X', 'Intel Core i5-13400F'];
        } else if (computeUnits >= 55 && computeUnits <= 84) {
          return ['Intel Core i7-12700F', 'AMD Ryzen 7 5800X', 'Intel Core i7-13700F'];
        } else if (computeUnits >= 85) {
          return ['Intel Core i9-12900K', 'AMD Ryzen 9 5900X', 'Intel Core i9-13900K'];
        }
      }
    }
    return [];
  };
  
  const suggestions = getSuggestions();
  
  // React-Select expects { value, label } format
  const reactSelectOptions = options.map(opt => {
    let label = `${opt.name} (₱${Number(opt.price || 0).toLocaleString()})`;
    
    // Add socket for Motherboard
    if (part.name === "Motherboard (MOBO)") {
      const socket = opt.socket || opt._raw?.socket || opt._raw?.Socket;
      if (socket) {
        label = `${opt.name} - ${socket} (₱${Number(opt.price || 0).toLocaleString()})`;
      }
    }
    
    // Add frequency for RAM components
    if (part.name === "Memory (RAM)") {
      const frequency = opt._raw?.frequency_mhz || opt.frequency_mhz || opt._raw?.Frequency || opt.frequency;
      if (frequency) {
        label = `${opt.name} - ${frequency}MHz (₱${Number(opt.price || 0).toLocaleString()})`;
      }
    }
    
    return {
      value: opt.id,
      label,
      data: opt
    };
  });

  // Broadcast selection changes so other PartSelector instances can react
  useEffect(() => {
    const name = part?.name || '';
    const handler = (e) => {
      // update otherSelected map when others broadcast
      const { detail } = e;
      if (!detail || !detail.partName) return;
      setOtherSelected(prev => ({ ...prev, [detail.partName]: detail.value }));
    };
    window.addEventListener('pc-part-selected', handler);
    return () => window.removeEventListener('pc-part-selected', handler);
  }, []);

  // Fire event when selectedValue changes from this selector
  useEffect(() => {
    const partName = part?.name || '';
    const payload = { partName, value: selectedValue || null };
    const ev = new CustomEvent('pc-part-selected', { detail: payload });
    window.dispatchEvent(ev);
  }, [selectedValue]);

  // multi-slot support for RAM / M.2 / Storage / Case Fans with dynamic add/remove
  const multiTypes = ['Memory (RAM)', 'M.2 SSD', 'Storage', 'Case Fans'];
  const isMulti = multiTypes.includes(part.name) && Array.isArray(selectedValues);

  // Broadcast RAM multi-slot selection so other selectors (e.g., MOBO) can filter by RAM type
  useEffect(() => {
    if (!isMulti) return;
    if (part.name !== 'Memory (RAM)') return;
    const payload = { partName: 'Memory (RAM)', value: { slots: selectedValues || [] } };
    const ev = new CustomEvent('pc-part-selected', { detail: payload });
    window.dispatchEvent(ev);
  }, [isMulti, part?.name, selectedValues]);

  if (isMulti) {
    const valuesArr = selectedValues || [];
    const maxSlots = Number(slotCount) || 8; // fallback max

    const handleChangeAt = (index, selectedOption) => {
      const newArr = [...valuesArr];
      newArr[index] = selectedOption ? selectedOption.data : null;
      setSelectedValues(newArr);
    };

    const addSlot = () => {
      if (valuesArr.length < maxSlots) {
        setSelectedValues([...valuesArr, null]);
      }
    };

    const removeSlot = (index) => {
      const newArr = valuesArr.filter((_, i) => i !== index);
      setSelectedValues(newArr);
    };

    // Fetch DB-backed icon for each slot independently (by name only)
    useEffect(() => {
      let active = true;
      const base = import.meta?.env?.VITE_BACKEND_URL || '';
      const cache = (typeof window !== 'undefined') ? (window.__imgCache = window.__imgCache || new Map()) : null;
      const next = {};
      const promises = (valuesArr || []).map(async (val, idx) => {
        try {
          if (!val || !val.name) { next[idx] = null; return; }
          if (val.image) { next[idx] = null; return; }
          const key = `imgdbname:${val.name}`;
          if (cache && cache.has(key)) { next[idx] = cache.get(key); return; }
          const url = `${base}/api/items/image/by-name?name=${encodeURIComponent(val.name)}`;
          const r = await fetch(url);
          if (!r.ok) { next[idx] = null; return; }
          const row = await r.json();
          const imgUrl = row?.image_url || null;
          next[idx] = imgUrl;
          if (cache && imgUrl) cache.set(key, imgUrl);
        } catch { next[idx] = null; }
      });
      Promise.all(promises).then(() => {
        if (active) setMultiSlotImgs(next);
      });
      return () => { active = false; };
    }, [valuesArr]);

    return (
      <div className="PartSelectorContainer">
        <div className="PartSelectorContent">
        <h1 className ='part-name-title'> {part.name}</h1>
        {options.length === 0 && (
          <div className="EmptyOptionsHint">No {part.name} options loaded.</div>
        )}
        <div className="MultiSlotWrapper">
          {valuesArr.map((val, idx) => (
            <div key={idx} className="SlotSelect">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div
                  className="PartIconPlaceholder"
                  onClick={() => {
                    if(val) {
                      setModalData(val);
                      const full = val?.image || multiSlotImgs[idx] || null;
                      setModalImageUrl(full);
                      setShowModal(true);
                    }
                  }}
                  style={{ cursor: val ? 'pointer' : 'default' }}
                >
                  {val?.image ? (
                    <img src={val.image} alt={`${part.name} ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : multiSlotImgs[idx] ? (
                    <img src={multiSlotImgs[idx]} alt={`${part.name} ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    partIcon && <img src={partIcon} alt={`${part.name} ${idx+1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap: 8, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label className="SlotLabel">{part.name} {idx + 1}</label>
                    {valuesArr.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeSlot(idx)}
                        style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <h4 className='part-name-select'> Select {part.name} {idx + 1} for your build</h4>
                  <Select
                    className="PartSelector"
                    value={val ? (() => {
                      let label = `${val.name} (₱${Number(val.price || 0).toLocaleString()})`;
                      if (part.name === "Memory (RAM)") {
                        const frequency = val._raw?.frequency_mhz || val.frequency_mhz || val._raw?.Frequency || val.frequency;
                        if (frequency) {
                          label = `${val.name} - ${frequency}MHz (₱${Number(val.price || 0).toLocaleString()})`;
                        }
                      }
                      return { value: val.id, label, data: val };
                    })() : null}
                    onChange={(opt) => handleChangeAt(idx, opt)}
                    options={reactSelectOptions}
                    isSearchable
                    isClearable
                    onInputChange={(input) => input.slice(0, 10)}
                    placeholder={`-- Select ${part.name} ${idx + 1} --`}
                    menuHeight={200}
                    maxMenuHeight={200}
                  />
                </div>
              </div>
            </div>
          ))}
          {valuesArr.length < maxSlots && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={addSlot}
                style={{ 
                  background: '#059669', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '12px 16px', 
                  fontSize: '14px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px'
                }}
              >
                + Add {part.name}
              </button>
            </div>
          )}
        </div>
        </div>
        {showModal && modalData && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setShowModal(false)}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '500px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
              {modalImageUrl && <img src={modalImageUrl} alt={modalData.name} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', marginBottom: '20px' }} />}
              <h2 style={{ margin: '0 0 20px 0' }}>{modalData.name}</h2>
              <div><strong>Brand:</strong> {modalData._raw?.brand || modalData.brand || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="PartSelectorContainer">
      <div className="PartIconPlaceholder" onClick={() => {
        if(selectedValue) {
          setModalData(selectedValue);
          const full = selectedValue?.image || iconImg || null;
          setModalImageUrl(full);
          setShowModal(true);
        }
      }} style={{ cursor: selectedValue ? 'pointer' : 'default' }}>
        {selectedValue?.image ? (
          <img src={selectedValue.image} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : iconImg ? (
          <img src={iconImg} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          partIcon && <img src={partIcon} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        )}
      </div>
      <div className="PartSelectorContent">
      <h1>{part.name}</h1>
      <h4>Select a {part.name} for your build</h4>
      
      {/* Smart Suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginBottom: 12, padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0c4a6e' }}>
              ⚙️ Recommended for your build:
            </span>
            <button 
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0c4a6e',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {showSuggestions ? 'Hide' : 'Show'}
            </button>
          </div>
          {showSuggestions && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {suggestions.slice(0, 5).map((suggestion, idx) => (
                <span key={idx} style={{
                  background: part.name === "Graphics Card (GPU)" ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '3px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}>
                  {suggestion}
                </span>
              ))}
              {suggestions.length > 5 && (
                <span style={{
                  background: '#e5e7eb',
                  color: '#6b7280',
                  padding: '3px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}>
                  +{suggestions.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      )}
      
      {options.length === 0 && (
        <div className="EmptyOptionsHint">No {part.name} options loaded.</div>
      )}
      <Select
        className="PartSelector"
        value={selectedValue ? {
          value: selectedValue.id,
          label: `${selectedValue.name} (₱${Number(selectedValue.price || 0).toLocaleString()})`,
          data: selectedValue
        } : null}
        onChange={(selectedOption) => {
          setSelectedValue(selectedOption ? selectedOption.data : null);
        }}
        options={reactSelectOptions}
        isSearchable
        isClearable
        onInputChange={(input) => input.slice(0, 10)}
        placeholder={`-- Select ${part.name} --`}
        menuHeight={200}
        maxMenuHeight={200}
      />
      </div>
      {showModal && modalData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }} onClick={() => setShowModal(false)}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '500px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>×</button>
            {modalImageUrl && <img src={modalImageUrl} alt={modalData.name} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', marginBottom: '20px' }} />}
            <h2 style={{ margin: '0 0 20px 0' }}>{modalData.name}</h2>
            <div><strong>Brand:</strong> {modalData._raw?.brand || modalData.brand || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PartSelector;
