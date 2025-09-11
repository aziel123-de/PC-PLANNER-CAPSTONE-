import './PartSelector.css';
import Select from 'react-select';
import {
  moboOptions as moboLocal,
  cpuOptions as cpuLocal,
  gpuOptions as gpuLocal,
  psuOptions as psuLocal,
  ramOptions as ramLocal,
  storageOptions as storageLocal,
  m2Options as m2Local,
  caseOptions as caseLocal
} from './PCcomponentsDatabase';

const partOptionsMap = {
  "Motherboard (MOBO)": moboLocal,
  "Processor (CPU)": cpuLocal,
  "Graphics Card (GPU)": gpuLocal,
  "Power Supply (PSU)": psuLocal,
  "Memory (RAM)": ramLocal,
  "Storage": storageLocal,
  "M.2 SSD": m2Local,
  "Case": caseLocal,
};

function PartSelector({ part, selectedValue, setSelectedValue, selectedMOBO, dataLookup, slotCount, selectedValues, setSelectedValues }) {
  const resolvedMap = {
    "Motherboard (MOBO)": dataLookup?.mobo || moboLocal,
    "Processor (CPU)": dataLookup?.cpu || cpuLocal,
    "Graphics Card (GPU)": dataLookup?.gpu || gpuLocal,
    "Power Supply (PSU)": dataLookup?.psu || psuLocal,
    "Memory (RAM)": dataLookup?.ram || ramLocal,
    "Storage": dataLookup?.storage || storageLocal,
    "M.2 SSD": dataLookup?.m2 || m2Local,
    "Case": dataLookup?.case || caseLocal,
  };

  let options = resolvedMap[part.name] || [];

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
      formFactor: getFirst(opt, 'formFactor', 'FormFactor'),
      interface: getFirst(opt, 'interface', 'Interface'),
      type: getFirst(opt, 'type', 'Type', 'componentType', 'component'),
      // keep original object for any extra fields
      _raw: opt,
    };
    return normalized;
  };

  // normalize all options early so compatibility checks work
  options = options.map(normalize);

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
      // allow loose matches where one contains the other (e.g., 'lga1700' vs 'lga1700a')
      if (sa.includes(sb) || sb.includes(sa)) return true;
      return false;
    };

    const parseRamTypes = (s) => {
      if (!s) return [];
      return s.toString().split(/[,;&\\/]|\band\b|&/i).map(x => x.replace(/[^a-z0-9]/gi, '').toLowerCase()).filter(Boolean);
    };

    switch (part.name) {
      case "Processor (CPU)":
        options = options.filter(cpu => {
          const cpuSocket = cpu.socket || cpu._raw?.Socket || cpu._raw?.socket;
          const mSocket = selectedMOBO.socket || selectedMOBO.Socket || selectedMOBO._raw?.Socket || selectedMOBO._raw?.socket;
          // if motherboard socket is present, require CPU socket to be present and match
          if (mSocket) {
            return cpuSocket ? socketMatch(cpuSocket, mSocket) : false;
          }
          // if no motherboard socket known, keep cpu options
          return true;
        });
        break;
      case "Memory (RAM)":
        options = options.filter(ram => {
          const ramTypes = parseRamTypes(ram.ramType || ram.type || ram._raw?.RamType || ram._raw?.Ramtype || ram._raw?.type);
          const mTypes = parseRamTypes(selectedMOBO.ramType || selectedMOBO.RamType || selectedMOBO._raw?.RamType || selectedMOBO._raw?.ramType);
          if (ramTypes.length > 0 && mTypes.length > 0) {
            return ramTypes.some(rt => mTypes.includes(rt));
          }
          // fallback to loose string compare
          if ((ram.ramType || ram.type) && selectedMOBO.ramType) {
            return normalizeStr(ram.ramType || ram.type).includes(normalizeStr(selectedMOBO.ramType)) || normalizeStr(selectedMOBO.ramType).includes(normalizeStr(ram.ramType || ram.type));
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
        options = options.filter(c => {
          const ff = c.formFactor || '';
          const target = selectedMOBO.formFactor || selectedMOBO.FormFactor || '';
          return String(ff).toLowerCase().includes(String(target).toLowerCase());
        });
        break;
      default:
        break;
    }
  }

  // React-Select expects { value, label } format
  const reactSelectOptions = options.map(opt => ({
    value: opt.id,
    label: `${opt.name} (₱${Number(opt.price || 0).toLocaleString()})`,
    data: opt
  }));

  // multi-slot support for RAM / M.2 / Storage
  const multiTypes = ['Memory (RAM)', 'M.2 SSD', 'Storage'];
  const isMulti = multiTypes.includes(part.name) && (slotCount > 1 || Array.isArray(selectedValues));

  if (isMulti) {
    const count = Number(slotCount) || (Array.isArray(selectedValues) ? selectedValues.length : 0);
    const valuesArr = Array.from({ length: Math.max(0, count) }).map((_, i) => (Array.isArray(selectedValues) ? selectedValues[i] : null));

    const handleChangeAt = (index, selectedOption) => {
      const newArr = Array.from(valuesArr);
      newArr[index] = selectedOption ? selectedOption.data : null;
      if (typeof setSelectedValues === 'function') setSelectedValues(newArr);
      else if (typeof setSelectedValue === 'function') setSelectedValue(newArr);
    };

    return (
      <div className="PartSelectorContainer">
        <h1>{part.name}</h1>
        <h4>Select {part.name} for your build</h4>
        <div className="MultiSlotWrapper">
          {valuesArr.map((val, idx) => (
            <div key={idx} className="SlotSelect">
              <label className="SlotLabel">{part.name} Slot {idx + 1}</label>
              <Select
                className="PartSelector"
                value={val ? { value: val.id, label: `${val.name} (₱${Number(val.price || 0).toLocaleString()})`, data: val } : null}
                onChange={(opt) => handleChangeAt(idx, opt)}
                options={reactSelectOptions}
                isSearchable
                isClearable
                placeholder={`-- Select ${part.name} Slot ${idx + 1} --`}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="PartSelectorContainer">
      <h1>{part.name}</h1>
      <h4>Select a {part.name} for your build</h4>
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
      />
    </div>
  );
}

export default PartSelector;
