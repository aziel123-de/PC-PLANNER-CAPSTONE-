import './PartSelector.css';
import Select from 'react-select';

function PartSelector({ part, selectedValue, setSelectedValue, selectedMOBO, selectedCPU, dataLookup, slotCount, selectedValues, setSelectedValues, selectedGPUs, onAddGPU, onRemoveGPU, gpuIndex }) {
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
    if (partName.includes('case')) return mapByCanonical.case;
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

  // GPU SLI/CrossFire compatibility filtering
  if (part.name === "Graphics Card (GPU)" && selectedGPUs && selectedGPUs[0] && selectedValue !== selectedGPUs[0]) {
    const firstGPU = selectedGPUs[0];
    const firstGPUName = (firstGPU.name || '').toLowerCase();
    
    // Extract brand and model from first GPU
    const isNvidia = firstGPUName.includes('rtx') || firstGPUName.includes('gtx') || firstGPUName.includes('nvidia');
    const isAMD = firstGPUName.includes('rx') || firstGPUName.includes('radeon') || firstGPUName.includes('amd');
    
    // Extract model number (e.g., "4090" from "RTX 4090")
    const modelMatch = firstGPUName.match(/(\d{4}|\d{3})/); // Match 3-4 digit numbers
    const firstModel = modelMatch ? modelMatch[1] : null;
    
    options = options.filter(gpu => {
      const gpuName = (gpu.name || '').toLowerCase();
      const gpuIsNvidia = gpuName.includes('rtx') || gpuName.includes('gtx') || gpuName.includes('nvidia');
      const gpuIsAMD = gpuName.includes('rx') || gpuName.includes('radeon') || gpuName.includes('amd');
      
      // Must be same brand
      if (isNvidia && !gpuIsNvidia) return false;
      if (isAMD && !gpuIsAMD) return false;
      
      // Must be same model for SLI/CrossFire
      if (firstModel) {
        const gpuModelMatch = gpuName.match(/(\d{4}|\d{3})/);
        const gpuModel = gpuModelMatch ? gpuModelMatch[1] : null;
        return gpuModel === firstModel;
      }
      
      return true;
    });
  }

  // Compatibility filtering
  if (selectedMOBO) {
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

    const moboFF = normalizeFormFactor(selectedMOBO.formFactor || selectedMOBO.FormFactor || selectedMOBO._raw?.formFactor || selectedMOBO._raw?.FormFactor);

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

    switch (part.name) {
      case "Processor (CPU)":
        options = options.filter(cpu => {
          const cpuSocket = cpu.socket || cpu._raw?.Socket || cpu._raw?.socket;
          const mSocket = selectedMOBO.socket || selectedMOBO.Socket || selectedMOBO._raw?.Socket || selectedMOBO._raw?.socket;
          if (mSocket) {
            return cpuSocket ? socketMatch(cpuSocket, mSocket) : false;
          }
          return true;
        });
        break;
      case "CPU Cooler":
        if (selectedCPU) {
          const cpuSocket = selectedCPU.socket || selectedCPU._raw?.Socket || selectedCPU._raw?.socket;
          if (cpuSocket) {
            options = options.filter(cooler => {
              const coolerSocket = cooler.socket || cooler._raw?.Socket || cooler._raw?.socket;
              return coolerSocket ? socketMatch(coolerSocket, cpuSocket) : true;
            });
          }
        }
        break;
      case "Memory (RAM)":
        options = options.filter(ram => {
          const ramTypes = parseRamTypes(ram.ramType || ram.ram_type || ram.type || ram._raw?.RamType || ram._raw?.Ramtype || ram._raw?.ram_type || ram._raw?.type);
            const mTypes = parseRamTypes(selectedMOBO.ramType || selectedMOBO.ram_type || selectedMOBO.RamType || selectedMOBO._raw?.RamType || selectedMOBO._raw?.ramType || selectedMOBO._raw?.ram_type);
          if (ramTypes.length > 0 && mTypes.length > 0) {
            if (!ramTypes.some(rt => mTypes.includes(rt))) return false;
          } else {
            const ramPrimary = ram.ramType || ram.ram_type || ram.type;
            const moboPrimary = selectedMOBO.ramType || selectedMOBO.ram_type;
            if (ramPrimary && moboPrimary) {
              if (!(normalizeStr(ramPrimary).includes(normalizeStr(moboPrimary)) || normalizeStr(moboPrimary).includes(normalizeStr(ramPrimary)))) return false;
            }
          }
          
          // Filter by CPU RAM max frequency
          if (selectedCPU) {
            const cpuRamMax = selectedCPU.ram_max || selectedCPU._raw?.ram_max || selectedCPU._raw?.RamMax;
            const ramFreq = ram.frequency_mhz || ram._raw?.frequency_mhz || ram._raw?.Frequency;
            if (cpuRamMax && ramFreq && Number(ramFreq) > Number(cpuRamMax)) {
              return false;
            }
          }
          
          return true;
        });
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
  }

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

  // multi-slot support for RAM / M.2 / Storage with dynamic add/remove
  const multiTypes = ['Memory (RAM)', 'M.2 SSD', 'Storage'];
  const isMulti = multiTypes.includes(part.name) && Array.isArray(selectedValues);

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

    return (
      <div className="PartSelectorContainer">
        <h1>{part.name}</h1>
        <h4>Select {part.name} for your build</h4>
        {options.length === 0 && (
          <div className="EmptyOptionsHint">No {part.name} options loaded.</div>
        )}
        <div className="MultiSlotWrapper">
          {valuesArr.map((val, idx) => (
            <div key={idx} className="SlotSelect">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
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
                placeholder={`-- Select ${part.name} ${idx + 1} --`}
                menuHeight={200}
                maxMenuHeight={200}
              />
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
    );
  }

  return (
    <div className="PartSelectorContainer">
      <h1>{part.name}</h1>
      <h4>Select a {part.name} for your build</h4>
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
        isClearable // Add this prop
        placeholder={`-- Select ${part.name} --`}
        menuHeight={200}
        maxMenuHeight={200}
      />
    </div>
  );
}

export default PartSelector;
