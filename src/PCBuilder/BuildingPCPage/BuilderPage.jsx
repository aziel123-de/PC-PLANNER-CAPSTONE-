import React, { useState, useEffect } from 'react';
import './BuilderPage.css';
import PartSelector from '../PCBuilding/PartSelector';
import BuildSummary from '../PCBuilding/BuildSummary';

function BuilderPage() {
  const [selectedMOBO, setSelectedMOBO] = useState(null);
  const [selectedCPU, setSelectedCPU] = useState(null);
  const [selectedGPUs, setSelectedGPUs] = useState([]);
  const [selectedRAMs, setSelectedRAMs] = useState([]);
  const [selectedM2s, setSelectedM2s] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState([]);
  const [selectedPSU, setSelectedPSU] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [dataLookup, setDataLookup] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const types = ['cpu','gpu','psu','mobo','ram','storage','m2','case'];
      const map = {};
      for (const t of types) {
        try {
          const resp = await fetch(`/api/components/${t}`);
          if (!resp.ok) throw new Error('fetch failed');
          const json = await resp.json();
          // normalize key for lookup
          const key = t === 'case' ? 'case' : t;
          map[key] = Array.isArray(json) ? json : [];
        } catch (e) {
          // ignore; fallback will occur in PartSelector
        }
      }
      if (mounted) setDataLookup(map);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Prefill from a previously loaded build saved in localStorage (if present)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('loadedBuild');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // Expecting keys: mobo, cpu, gpus, rams, m2s, storage, psu, case
      if (parsed.mobo) setSelectedMOBO(parsed.mobo);
      if (parsed.cpu) setSelectedCPU(parsed.cpu);
      if (Array.isArray(parsed.gpus)) setSelectedGPUs(parsed.gpus);
      if (Array.isArray(parsed.rams)) setSelectedRAMs(parsed.rams);
      if (Array.isArray(parsed.m2s)) setSelectedM2s(parsed.m2s);
      if (Array.isArray(parsed.storage)) setSelectedStorage(parsed.storage);
      if (parsed.psu) setSelectedPSU(parsed.psu);
      if (parsed.case) setSelectedCase(parsed.case);
      // Clear after applying so it doesn't reapply on next visit
      localStorage.removeItem('loadedBuild');
    } catch (e) {
      // ignore JSON errors
    }
  }, []);

  // Compose build summary parts as needed for BuildSummary
  const buildSummaryParts = {
    mobo: selectedMOBO,
    cpu: selectedCPU,
    gpus: selectedGPUs,
    rams: selectedRAMs,
    m2s: selectedM2s,
    storage: selectedStorage,
    psu: selectedPSU,
    case: selectedCase,
  };

  // helper to read a field with multiple possible capitalizations and from _raw
  const getField = (obj, ...keys) => {
    if (!obj) return undefined;
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) return obj[k];
      const low = k.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(obj, low) && obj[low] !== undefined) return obj[low];
      const up = k.charAt(0).toUpperCase() + k.slice(1);
      if (Object.prototype.hasOwnProperty.call(obj, up) && obj[up] !== undefined) return obj[up];
    }
    // try _raw if present
    const raw = obj._raw || {};
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(raw, k) && raw[k] !== undefined) return raw[k];
      const low = k.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(raw, low) && raw[low] !== undefined) return raw[low];
      const up = k.charAt(0).toUpperCase() + k.slice(1);
      if (Object.prototype.hasOwnProperty.call(raw, up) && raw[up] !== undefined) return raw[up];
    }
    return undefined;
  };

  const ramSlotsCount = Number(getField(selectedMOBO, 'ramSlots', 'RamSlots', 'Ram_slots') || 0);
  const gpuSlotsCount = Number(getField(selectedMOBO, 'gpuSlots', 'GpuSlots', 'Gpu_slots') || 1);
  const m2SlotsCount = Number(getField(selectedMOBO, 'm2Slots', 'M2Slots', 'M2_Slots') || 0);
  const storageSlotsCount = Number(getField(selectedMOBO, 'storageSlots', 'StorageSlots', 'Storage_Slots') || 0);

  // Collect items for pricing
  const collectSelectedItems = () => {
    const items = [];
    if (selectedMOBO) items.push(selectedMOBO);
    if (selectedCPU) items.push(selectedCPU);
    (selectedGPUs || []).forEach(x => x && items.push(x));
    (selectedRAMs || []).forEach(x => x && items.push(x));
    (selectedM2s || []).forEach(x => x && items.push(x));
    (selectedStorage || []).forEach(x => x && items.push(x));
    if (selectedPSU) items.push(selectedPSU);
    if (selectedCase) items.push(selectedCase);
    return items;
  };

  const computeTotalPrice = () => {
    return collectSelectedItems().reduce((sum, it) => {
      const p = getField(it, 'price', 'Price', 'cost') || 0;
      const n = Number(p) || 0;
      return sum + n;
    }, 0);
  };

  // Basic warning analysis
  const analyzeBuild = () => {
    const warnings = [];
    const normalize = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // CPU ↔ MOBO socket
    const cpuSock = getField(selectedCPU, 'socket', 'Socket');
    const mSock = getField(selectedMOBO, 'socket', 'Socket');
    if (cpuSock && mSock && normalize(cpuSock) && normalize(mSock) && normalize(cpuSock) !== normalize(mSock)) {
      warnings.push('CPU socket does not match motherboard');
    }

    // RAM type mismatch
    const mRam = normalize(getField(selectedMOBO, 'ram_type', 'ramType', 'Ram_type'));
    if (mRam) {
      for (const r of (selectedRAMs || [])) {
        const rType = normalize(getField(r, 'ram_type', 'ramType', 'Ram_type'));
        if (r && rType && rType !== mRam) {
          warnings.push('Memory type incompatible with motherboard');
          break;
        }
      }
    }

    // GPU slot count
    const allowedGpu = Number(getField(selectedMOBO, 'gpu_slots', 'gpuSlots', 'Gpu_slots') || getField(selectedMOBO, 'gpuSlots', 'GpuSlots') || 1);
    const gpuCount = (selectedGPUs || []).filter(Boolean).length;
    if (gpuCount > allowedGpu) warnings.push('More GPUs than motherboard supports');

    // Power estimation
    const cpuTdp = Number(getField(selectedCPU, 'max_tdp', 'MaxTDP', 'maxTDP', 'tdp') || 0);
    const gpuTdp = (selectedGPUs || []).reduce((sum, g) => sum + (Number(getField(g, 'tdp', 'TDP', 'power') || 150) || 0), 0);
    const other = 50; // misc components buffer
    const required = cpuTdp + gpuTdp + other + 100; // headroom
    const psuW = Number(getField(selectedPSU, 'wattage', 'Wattage', 'power', 'rating') || 0);
    if (psuW && required > psuW) warnings.push(`Estimated PSU insufficient (need ~${required}W vs ${psuW}W)`);
    if (!psuW && (cpuTdp || gpuTdp)) warnings.push('Missing PSU wattage');

    // Simple bottleneck heuristic
    if (cpuTdp && gpuCount) {
      const avgGpu = gpuTdp / gpuCount;
      if (cpuTdp < 35 && avgGpu > 150) warnings.push('Low-power CPU may bottleneck GPU');
    }

    return warnings;
  };

  const buildSnapshot = () => ({
    mobo: selectedMOBO,
    cpu: selectedCPU,
    gpus: (selectedGPUs || []).filter(Boolean),
    rams: (selectedRAMs || []).filter(Boolean),
    m2s: (selectedM2s || []).filter(Boolean),
    storage: (selectedStorage || []).filter(Boolean),
    psu: selectedPSU,
    case: selectedCase
  });

  const handleSaveBuild = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to save a build.');
      return;
    }
    const name = window.prompt('Enter a name for this build');
    if (!name) return;
    const description = window.prompt('Optional description') || '';
    const parts = buildSnapshot();
    const total_price = computeTotalPrice();
    const warnings = analyzeBuild();
    const has_issues = warnings.length > 0;
    try {
      const resp = await fetch('/api/builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, parts, total_price, warnings, has_issues })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || resp.statusText);
      }
      const data = await resp.json();
      alert('Build saved: ' + data.id + (has_issues ? '\nWarnings: ' + warnings.join('; ') : '\nNo issues detected'));
    } catch (e) {
      console.error('Save build failed', e);
      alert('Save failed: ' + (e.message || 'Unknown error'));
    }
  };

  useEffect(() => {
    if (!selectedMOBO || !selectedCase) return;
    const normalizeForm = (raw) => {
      if (!raw) return '';
      const v = raw.toString().toLowerCase();
      if (v.includes('mini') && v.includes('itx')) return 'mini-itx';
      if (v.includes('m-atx') || v.includes('micro-atx') || v.includes('matx') || v.includes('microatx')) return 'matx';
      if (v.includes('e-atx') || v.includes('eatx')) return 'e-atx';
      if (v.includes('atx')) return 'atx';
      return v.replace(/\s+/g,'')
    };
    const mFF = normalizeForm(selectedMOBO.formFactor || selectedMOBO.FormFactor || selectedMOBO._raw?.formFactor || selectedMOBO._raw?.FormFactor);
    const cFFText = selectedCase.formFactor || selectedCase.FormFactor || selectedCase._raw?.formFactor || selectedCase._raw?.FormFactor || '';
    const cFFNorm = normalizeForm(cFFText);

    const mapAcceptable = (ff) => {
      switch (ff) {
        case 'mini-itx': return new Set(['mini-itx']);
        case 'matx': return new Set(['matx','atx','e-atx']);
        case 'atx': return new Set(['atx','matx','mini-itx']);
        case 'e-atx': return new Set(['e-atx','atx','matx','mini-itx']);
        default: return null; // unknown -> accept
      }
    };

    const acceptable = mapAcceptable(mFF);
    if (!acceptable) return; // unknown mobo form factor -> skip

    // If explicit case form factor is not acceptable, reset
    if (cFFNorm && !acceptable.has(cFFNorm)) {
      setSelectedCase(null);
      return;
    }

    // Fallback: search text for any mention of acceptable tokens
    const text = cFFText.toString().toLowerCase();
    const tokensFound = Array.from(acceptable).some(tok => text.includes(tok));
    if (!tokensFound) {
      setSelectedCase(null);
    }
  }, [selectedMOBO, selectedCase]);

  return (
    <>
      <main className='PC-Builder-Content' style={{ paddingTop: 80 }}>
        <div className='Note'>
          <h1 className='PC-Note-Title'>Note on Compatibility Availability</h1>
          <h3>
            PC Planner focuses on components readily available in the Philippine market.
            Some older components or certain Chinese brands may not be included due to
            local availability issues. All prices are in Philippine Peso (₱) and are approximate.
          </h3>
        </div>
        <div className="BuilderPageLayout">
          <div className="LeftColumn">
            <h1 className='PC-Parts-Buiderpage'>Computer Parts</h1>
            <PartSelector
              part={{ name: "Motherboard (MOBO)" }}
              selectedValue={selectedMOBO}
              setSelectedValue={(value) => {
                // update selected MOBO and reset dependent selectors
                setSelectedMOBO(value);
                setSelectedRAMs([]);
                setSelectedGPUs([]);
                setSelectedM2s([]);
                setSelectedStorage([]);

                // if a CPU is already selected, invalidate it when sockets don't match
                if (selectedCPU && value) {
                  const getSocket = (obj) => {
                    if (!obj) return undefined;
                    return obj.socket || obj.Socket || obj._raw?.socket || obj._raw?.Socket;
                  };
                  const cpuSock = getSocket(selectedCPU);
                  const mSock = getSocket(value);
                  if (cpuSock && mSock) {
                    const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (normalize(cpuSock) !== normalize(mSock)) setSelectedCPU(null);
                  }
                }
              }}
              dataLookup={dataLookup}
            />
            <PartSelector part={{ name: "Processor (CPU)" }} selectedValue={selectedCPU} setSelectedValue={setSelectedCPU} selectedMOBO={selectedMOBO} dataLookup={dataLookup} />
            <PartSelector
              part={{ name: "Graphics Card (GPU)" }}
              selectedValue={selectedGPUs[0]}
              setSelectedValue={(value) => {
                const updated = [...selectedGPUs];
                updated[0] = value;
                setSelectedGPUs(updated);
              }}
              dataLookup={dataLookup}
            />
      {Array.from({ length: Math.max(0, (gpuSlotsCount || 1) - 1) }).map((_, index) => (
              <PartSelector
                key={`gpu-${index + 1}`}
                part={{ name: "Graphics Card (GPU)" }}
        selectedValue={selectedGPUs[index + 1]}
                setSelectedValue={(value) => {
                  const updated = [...selectedGPUs];
                  updated[index + 1] = value;
                  setSelectedGPUs(updated);
                }}
                dataLookup={dataLookup}
              />
            ))}
            <PartSelector
              part={{ name: "Memory (RAM)" }}
              slotCount={ramSlotsCount || 0}
              selectedValues={selectedRAMs}
              setSelectedValues={setSelectedRAMs}
              selectedMOBO={selectedMOBO}
              dataLookup={dataLookup}
            />
            <PartSelector
              part={{ name: "M.2 SSD" }}
              slotCount={m2SlotsCount || 0}
              selectedValues={selectedM2s}
              setSelectedValues={setSelectedM2s}
              dataLookup={dataLookup}
            />
            <PartSelector
              part={{ name: "Storage" }}
              slotCount={storageSlotsCount || 0}
              selectedValues={selectedStorage}
              setSelectedValues={setSelectedStorage}
              dataLookup={dataLookup}
            />
            <PartSelector part={{ name: "Power Supply (PSU)" }} selectedValue={selectedPSU} setSelectedValue={setSelectedPSU} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Case" }} selectedValue={selectedCase} setSelectedValue={setSelectedCase} dataLookup={dataLookup} selectedMOBO={selectedMOBO} />
            <h1>Pheripirals</h1>
          </div>
          <div className="RightColumn">
            <div style={{ marginBottom: 12 }}>
              <button onClick={handleSaveBuild} disabled={!dataLookup}>Save Build</button>
            </div>
            <BuildSummary selectedParts={buildSummaryParts} dataLookup={dataLookup} />
          </div>
        </div>
      </main>
    </>
  );
}

export default BuilderPage;
