import React, { useState } from 'react';
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

  return (
    <>
      <main className='PC-Builder-Content'>
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
            />
            <PartSelector part={{ name: "Processor (CPU)" }} selectedValue={selectedCPU} setSelectedValue={setSelectedCPU} selectedMOBO={selectedMOBO} />
            <PartSelector
              part={{ name: "Graphics Card (GPU)" }}
              selectedValue={selectedGPUs[0]}
              setSelectedValue={(value) => {
                const updated = [...selectedGPUs];
                updated[0] = value;
                setSelectedGPUs(updated);
              }}
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
              />
            ))}
      {Array.from({ length: ramSlotsCount || 0 }).map((_, index) => (
              <PartSelector
                key={`ram-${index}`}
                part={{ name: "Memory (RAM)" }}
                selectedValue={selectedRAMs[index]}
                setSelectedValue={(value) => {
                  const updated = [...selectedRAMs];
                  updated[index] = value;
                  setSelectedRAMs(updated);
                }}
                selectedMOBO={selectedMOBO}
              />
            ))}
      {Array.from({ length: m2SlotsCount || 0 }).map((_, index) => (
              <PartSelector
                key={`m2-${index}`}
                part={{ name: "M.2 SSD" }}
                selectedValue={selectedM2s[index]}
                setSelectedValue={(value) => {
                  const updated = [...selectedM2s];
                  updated[index] = value;
                  setSelectedM2s(updated);
                }}
              />
            ))}
      {Array.from({ length: storageSlotsCount || 0 }).map((_, index) => (
              <PartSelector
                key={`storage-${index}`}
                part={{ name: "Storage" }}
                selectedValue={selectedStorage[index]}
                setSelectedValue={(value) => {
                  const updated = [...selectedStorage];
                  updated[index] = value;
                  setSelectedStorage(updated);
                }}
              />
            ))}
            <PartSelector part={{ name: "Power Supply (PSU)" }} selectedValue={selectedPSU} setSelectedValue={setSelectedPSU} />
            <PartSelector part={{ name: "Case" }} selectedValue={selectedCase} setSelectedValue={setSelectedCase} />
            <h1>Pheripirals</h1>
          </div>
          <div className="RightColumn">
            <BuildSummary selectedParts={buildSummaryParts} />
          </div>
        </div>
      </main>
    </>
  );
}

export default BuilderPage;
