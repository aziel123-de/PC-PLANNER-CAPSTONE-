import React, { useState, useEffect } from 'react';
import './BuilderPage.css';
import PartSelector from '../../PCBuilder/PCBuilding/PartSelector';
import BuildSummary from '../../PCBuilder/PCBuilding/BuildSummary';
import SaveBuildModal from '../../PCBuilder/PCBuilding/SaveBuildModal';
import BuildNameModal from '../../PCBuilder/PCBuilding/BuildNameModal';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import analyzeBuild from '../../PCBuilder/PCBuilding/analyzeBuild';

export default function BuilderPageEdit(){
  const [selectedMOBO, setSelectedMOBO] = useState(null);
  const [selectedCPU, setSelectedCPU] = useState(null);
  const [selectedCPUCooler, setSelectedCPUCooler] = useState(null);
  const [selectedGPUs, setSelectedGPUs] = useState([null]);
  const [selectedRAMs, setSelectedRAMs] = useState([null]);
  const [selectedM2s, setSelectedM2s] = useState([null]);
  const [selectedStorage, setSelectedStorage] = useState([null]);
  const [selectedPSU, setSelectedPSU] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedKeyboard, setSelectedKeyboard] = useState(null);
  const [selectedMouse, setSelectedMouse] = useState(null);
  const [selectedHeadset, setSelectedHeadset] = useState(null);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [selectedCaseFans, setSelectedCaseFans] = useState([null]);
  const [dataLookup, setDataLookup] = useState(null);
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalData, setSaveModalData] = useState({ buildId: '', buildName: '', hasIssues: false, warnings: [] });
  const [showNameModal, setShowNameModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: 'Alert' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', title: 'Confirm', onConfirm: null });
  const [pendingUsage, setPendingUsage] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const types = ['cpu','cpu-cooler','gpu','psu','mobo','ram','storage','m2','case','case-fans','keyboard','mouse','headset','monitor'];
      const map = {};
      for (const t of types) {
        try {
          const resp = await fetch(`/api/components/${t}`);
          if (!resp.ok) throw new Error('fetch failed');
          const json = await resp.json();
          const key = t === 'case' ? 'case' : t === 'cpu-cooler' ? 'cpuCooler' : t === 'case-fans' ? 'caseFans' : t;
          map[key] = Array.isArray(json) ? json : [];
        } catch (e) {}
      }
      if (mounted) setDataLookup(map);
    }
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('loadedBuild');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.mobo) setSelectedMOBO(parsed.mobo);
      if (parsed.cpu) setSelectedCPU(parsed.cpu);
      if (parsed.cpuCooler) setSelectedCPUCooler(parsed.cpuCooler);
      if (Array.isArray(parsed.gpus)) setSelectedGPUs(parsed.gpus);
      if (Array.isArray(parsed.rams)) setSelectedRAMs(parsed.rams);
      if (Array.isArray(parsed.m2s)) setSelectedM2s(parsed.m2s);
      if (Array.isArray(parsed.storage)) setSelectedStorage(parsed.storage);
      if (parsed.psu) setSelectedPSU(parsed.psu);
      if (parsed.case) setSelectedCase(parsed.case);
      if (parsed.keyboard) setSelectedKeyboard(parsed.keyboard);
      if (parsed.mouse) setSelectedMouse(parsed.mouse);
      if (parsed.headset) setSelectedHeadset(parsed.headset);
      if (parsed.monitor) setSelectedMonitor(parsed.monitor);
      if (Array.isArray(parsed.caseFans)) setSelectedCaseFans(parsed.caseFans);
      
      // Load existing build name and description for editing
      const buildName = localStorage.getItem('editingBuildName');
      const buildDescription = localStorage.getItem('editingBuildDescription');
      if (buildName) setTempName(buildName);
      if (buildDescription) setTempDescription(buildDescription);
    } catch (e) {}
    localStorage.removeItem('loadedBuild');
  }, []);

  const buildSummaryParts = {
    mobo: selectedMOBO, cpu: selectedCPU, cpuCooler: selectedCPUCooler, gpus: selectedGPUs, rams: selectedRAMs,
    m2s: selectedM2s, storage: selectedStorage, psu: selectedPSU, case: selectedCase,
    keyboard: selectedKeyboard, mouse: selectedMouse, headset: selectedHeadset, monitor: selectedMonitor,
    caseFans: selectedCaseFans,
  };

  const getField = (obj, ...keys) => {
    if (!obj) return undefined;
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] !== undefined) return obj[k];
      const low = k.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(obj, low) && obj[low] !== undefined) return obj[low];
      const up = k.charAt(0).toUpperCase() + k.slice(1);
      if (Object.prototype.hasOwnProperty.call(obj, up) && obj[up] !== undefined) return obj[up];
    }
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

  const collectSelectedItems = () => {
    const items = [];
    if (selectedMOBO) items.push(selectedMOBO);
    if (selectedCPU) items.push(selectedCPU);
    if (selectedCPUCooler) items.push(selectedCPUCooler);
    (selectedGPUs || []).forEach(x => x && items.push(x));
    (selectedRAMs || []).forEach(x => x && items.push(x));
    (selectedM2s || []).forEach(x => x && items.push(x));
    (selectedStorage || []).forEach(x => x && items.push(x));
    if (selectedPSU) items.push(selectedPSU);
    if (selectedCase) items.push(selectedCase);
    if (selectedKeyboard) items.push(selectedKeyboard);
    if (selectedMouse) items.push(selectedMouse);
    if (selectedHeadset) items.push(selectedHeadset);
    if (selectedMonitor) items.push(selectedMonitor);
    (selectedCaseFans || []).forEach(x => x && items.push(x));
    return items;
  };

  const computeTotalPrice = () => {
    return collectSelectedItems().reduce((sum, it) => {
      const p = getField(it, 'price', 'Price', 'cost') || 0;
      return sum + (Number(p) || 0);
    }, 0);
  };

  const buildSnapshot = () => ({
    mobo: selectedMOBO, cpu: selectedCPU, cpuCooler: selectedCPUCooler, gpus: (selectedGPUs || []).filter(Boolean),
    rams: (selectedRAMs || []).filter(Boolean), m2s: (selectedM2s || []).filter(Boolean),
    storage: (selectedStorage || []).filter(Boolean), psu: selectedPSU, case: selectedCase,
    keyboard: selectedKeyboard, mouse: selectedMouse, headset: selectedHeadset, monitor: selectedMonitor,
    caseFans: (selectedCaseFans || []).filter(Boolean)
  });

  const handleSaveBuild = async (usageSnapshot) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertModal({ show: true, message: 'You must be logged in to save a build.', title: 'Login Required' });
      return;
    }

    const hasComponents = selectedMOBO || selectedCPU || selectedCPUCooler || selectedPSU || selectedCase ||
      (selectedGPUs && selectedGPUs.some(gpu => gpu)) ||
      (selectedRAMs && selectedRAMs.some(ram => ram)) ||
      (selectedM2s && selectedM2s.some(m2 => m2)) ||
      (selectedStorage && selectedStorage.some(storage => storage)) ||
      (selectedCaseFans && selectedCaseFans.some(fan => fan)) ||
      selectedKeyboard || selectedMouse || selectedHeadset || selectedMonitor;

    if (!hasComponents) {
      setAlertModal({ show: true, message: 'Please select at least one component before saving your build.', title: 'No Components Selected' });
      return;
    }

    // Always show name modal to allow editing of name and description
    setPendingUsage(usageSnapshot || null);
    setShowNameModal(true);
  };

  const performSaveBuild = async (name, description) => {
    const parts = buildSnapshot();
    const total_price = computeTotalPrice();
    const analysis = analyzeBuild(parts);
    const warnings = analysis.warnings || [];
    const has_issues = analysis.hasIssues;
    const usage = pendingUsage && pendingUsage.scores ? pendingUsage : { scores: analysis.usageScores || { gaming: 0, office: 0, productivity: 0 }, note: analysis.BuildSuitabilitynote || '' };
    
    // Check if we're editing an existing build
    const editingBuildId = localStorage.getItem('editingBuildId');
    const isEditing = !!editingBuildId;
    
    try {
      const url = isEditing ? `/api/builds/${editingBuildId}` : '/api/builds';
      const method = isEditing ? 'PUT' : 'POST';
      
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ name, description, parts, total_price, warnings, has_issues, usage })
      });
      
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || resp.statusText);
      }
      
      const data = await resp.json();
      
      // Keep the last saved name and description for next save
      setTempName(name);
      setTempDescription(description);
      
      // Don't clear components - keep them for continued editing
      
      setSaveModalData({ buildId: data.id || editingBuildId || '(id unknown)', buildName: name, hasIssues: has_issues, warnings: warnings });
      setShowSaveModal(true);
      
      // Redirect to dashboard saved builds after successful save
      setTimeout(() => {
        window.location.href = '/dashboard?section=saved';
      }, 2000);
    } catch (e) {
      console.error('Save build failed', e);
      setAlertModal({ show: true, message: 'Save failed: ' + (e.message || 'Unknown error'), title: 'Save Error' });
    }
  };

  const handleNameModalSave = async (name, description) => {
    setShowNameModal(false);
    await performSaveBuild(name, description);
  };

  const handleClearBuild = () => {
    setConfirmModal({
      show: true, title: 'Clear All Components',
      message: 'Are you sure you want to clear all components? This action cannot be undone.',
      onConfirm: () => {
        setSelectedMOBO(null); setSelectedCPU(null); setSelectedCPUCooler(null); setSelectedGPUs([null]); setSelectedRAMs([null]);
        setSelectedM2s([null]); setSelectedStorage([null]); setSelectedPSU(null); setSelectedCase(null);
        setSelectedKeyboard(null); setSelectedMouse(null); setSelectedHeadset(null); setSelectedMonitor(null);
        setSelectedCaseFans([null]);
        setConfirmModal({ show: false, message: '', title: 'Confirm', onConfirm: null });
      }
    });
  };

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (
    <>
      <main className='PC-Builder-Content' style={{ paddingTop: 20 }}>
        <div className='Note'>
          <h1 className='PC-Note-Title'> Note on Compatibility Availability</h1>
          <h3>
            PC Planner focuses on components readily available in the Philippine market.
            Some older components or certain Chinese brands may not be included due to
            local availability issues. All prices are in Philippine Peso (₱) and are approximate.
          </h3>
        </div>
        
        <div className="EditModeBanner">Editing Saved Build (changes can be re-saved under a new name)</div>
        
        <div className="BuilderPageLayout">
          <div className="LeftColumn">
            <h1 className='PC-Parts-Buiderpage'>Computer Parts</h1>
            <PartSelector part={{ name: "Motherboard (MOBO)" }} selectedValue={selectedMOBO} setSelectedValue={(value) => {
              setSelectedMOBO(value); setSelectedRAMs([null]); setSelectedGPUs([null]); setSelectedM2s([null]); setSelectedStorage([null]);
              if (selectedCPU && value) {
                const getSocket = (obj) => obj?.socket || obj?.Socket || obj?._raw?.socket || obj?._raw?.Socket;
                const cpuSock = getSocket(selectedCPU); const mSock = getSocket(value);
                if (cpuSock && mSock) {
                  const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
                  if (normalize(cpuSock) !== normalize(mSock)) setSelectedCPU(null);
                }
              }
            }} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Processor (CPU)" }} selectedValue={selectedCPU} setSelectedValue={setSelectedCPU} selectedMOBO={selectedMOBO} dataLookup={dataLookup} />
            <PartSelector part={{ name: "CPU Cooler" }} selectedValue={selectedCPUCooler} setSelectedValue={setSelectedCPUCooler} selectedCPU={selectedCPU} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Graphics Card (GPU)" }} selectedValue={selectedGPUs[0]} setSelectedValue={(value) => {
              const updated = [...selectedGPUs]; updated[0] = value; setSelectedGPUs(updated);
            }} dataLookup={dataLookup} selectedGPUs={selectedGPUs} />
            {selectedGPUs.slice(1).map((gpu, index) => (
              <div key={`gpu-${index + 1}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <h1 style={{ margin: 0 }}>Graphics Card (GPU) {index + 2}</h1>
                  <button type="button" onClick={() => {
                    const updated = selectedGPUs.filter((_, i) => i !== index + 1); setSelectedGPUs(updated);
                  }} style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
                </div>
                <PartSelector part={{ name: "Graphics Card (GPU)" }} selectedValue={gpu} setSelectedValue={(value) => {
                  const updated = [...selectedGPUs]; updated[index + 1] = value; setSelectedGPUs(updated);
                }} dataLookup={dataLookup} selectedGPUs={selectedGPUs} />
              </div>
            ))}
            {selectedGPUs.length < (gpuSlotsCount || 2) && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <button type="button" onClick={() => setSelectedGPUs([...selectedGPUs, null])} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '8px', padding: '12px 16px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>+ Add Graphics Card</button>
              </div>
            )}
            <PartSelector part={{ name: "Memory (RAM)" }} slotCount={ramSlotsCount || 8} selectedValues={selectedRAMs} setSelectedValues={setSelectedRAMs} selectedMOBO={selectedMOBO} dataLookup={dataLookup} />
            <PartSelector part={{ name: "M.2 SSD" }} slotCount={m2SlotsCount || 4} selectedValues={selectedM2s} setSelectedValues={setSelectedM2s} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Storage" }} slotCount={storageSlotsCount || 6} selectedValues={selectedStorage} setSelectedValues={setSelectedStorage} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Power Supply (PSU)" }} selectedValue={selectedPSU} setSelectedValue={setSelectedPSU} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Case" }} selectedValue={selectedCase} setSelectedValue={setSelectedCase} dataLookup={dataLookup} selectedMOBO={selectedMOBO} />
            <PartSelector
              part={{ name: "Case Fans" }}
              slotCount={6}
              selectedValues={selectedCaseFans}
              setSelectedValues={setSelectedCaseFans}
              dataLookup={dataLookup}
            />
            <h1 style={{ textAlign: 'left' }}>Peripherals</h1>
            <PartSelector part={{ name: "Keyboard" }} selectedValue={selectedKeyboard} setSelectedValue={setSelectedKeyboard} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Mouse" }} selectedValue={selectedMouse} setSelectedValue={setSelectedMouse} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Headset" }} selectedValue={selectedHeadset} setSelectedValue={setSelectedHeadset} dataLookup={dataLookup} />
            <PartSelector part={{ name: "Monitor" }} selectedValue={selectedMonitor} setSelectedValue={setSelectedMonitor} dataLookup={dataLookup} />
          </div>
          <div className="RightColumn">
            <BuildSummary selectedParts={buildSummaryParts} dataLookup={dataLookup} onSaveBuild={handleSaveBuild} onClearBuild={handleClearBuild} isLoggedIn={isLoggedIn} isEditing={true} />
          </div>
        </div>
      </main>
      
  <BuildNameModal isOpen={showNameModal} onClose={() => setShowNameModal(false)} onSave={handleNameModalSave} initialName={tempName} initialDescription={tempDescription} isEditing={true} />
      <SaveBuildModal isOpen={showSaveModal} onClose={() => setShowSaveModal(false)} buildId={saveModalData.buildId} buildName={saveModalData.buildName} hasIssues={saveModalData.hasIssues} warnings={saveModalData.warnings} />
      <AlertModal isOpen={alertModal.show} onClose={() => setAlertModal({ show: false, message: '', title: 'Alert' })} title={alertModal.title} message={alertModal.message} />
      <ConfirmModal isOpen={confirmModal.show} onClose={() => setConfirmModal({ show: false, message: '', title: 'Confirm', onConfirm: null })} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} />
    </>
  );
}
