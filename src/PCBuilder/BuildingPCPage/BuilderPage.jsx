import React, { useState, useEffect } from 'react';
import './BuilderPage.css';
import PartSelector from '../PCBuilding/PartSelector';
import BuildSummary from '../PCBuilding/BuildSummary';
import SaveBuildModal from '../PCBuilding/SaveBuildModal';
import BuildNameModal from '../PCBuilding/BuildNameModal';
import AlertModal from '../../components/AlertModal';
import ConfirmModal from '../../components/ConfirmModal';
import analyzeBuild from '../PCBuilding/analyzeBuild';
import { FaArrowUp } from 'react-icons/fa';
import moboIcon from '../../assets/mobo.png';
import cpuIcon from '../../assets/cpu.png';
import coolerIcon from '../../assets/cooler.png';
import gpuIcon from '../../assets/gpu.png';
import ramIcon from '../../assets/ram.png';
import m2Icon from '../../assets/m.2.png';
import storageIcon from '../../assets/storage.png';
import psuIcon from '../../assets/psu.png';
import caseIcon from '../../assets/case.png';
import casefanIcon from '../../assets/casefan.png';
import keyboardIcon from '../../assets/keyboard.png';
import mouseIcon from '../../assets/mouse.png';
import headsetIcon from '../../assets/headset.png';
import monitorIcon from '../../assets/monitor.png';

function BuilderPage() {
  const [selectedMOBO, setSelectedMOBO] = useState(null);
  const [selectedCPU, setSelectedCPU] = useState(null);
  const [selectedCPUCooler, setSelectedCPUCooler] = useState(null);
  const [selectedGPUs, setSelectedGPUs] = useState([null]); // Start with one GPU slot
  const [selectedRAMs, setSelectedRAMs] = useState([null]); // Start with one RAM slot
  const [selectedM2s, setSelectedM2s] = useState([null]); // Start with one M.2 slot
  const [selectedStorage, setSelectedStorage] = useState([null]); // Start with one Storage slot
  const [selectedPSU, setSelectedPSU] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedKeyboard, setSelectedKeyboard] = useState(null);
  const [selectedMouse, setSelectedMouse] = useState(null);
  const [selectedHeadset, setSelectedHeadset] = useState(null);
  const [selectedMonitor, setSelectedMonitor] = useState(null);
  const [selectedCaseFans, setSelectedCaseFans] = useState([null]); // Start with one fan slot
  const [dataLookup, setDataLookup] = useState(null);

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
          // normalize key for lookup
          const key = t === 'case' ? 'case' : t === 'cpu-cooler' ? 'cpuCooler' : t === 'case-fans' ? 'caseFans' : t;
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

  // We intentionally remove edit/update mode: BuilderPage is for creating new builds only.
  // Retain name/description locally so user doesn't have to retype if they save multiple variants.
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  // Modal state for save build results
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveModalData, setSaveModalData] = useState({
    buildId: '',
    buildName: '',
    hasIssues: false,
    warnings: []
  });

  // Modal state for build name input
  const [showNameModal, setShowNameModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, message: '', title: 'Alert' });
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', title: 'Confirm', onConfirm: null });

  // Prefill from a previously loaded build or saved draft
  useEffect(() => {
    try {
      // First check for loaded build (from saved builds)
      const loadedRaw = localStorage.getItem('loadedBuild');
      if (loadedRaw) {
        const parsed = JSON.parse(loadedRaw);
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
        localStorage.removeItem('loadedBuild');
        return;
      }
      
      // Otherwise check for draft build (auto-saved when navigating away)
      const draftRaw = localStorage.getItem('builderDraft');
      if (draftRaw) {
        const parsed = JSON.parse(draftRaw);
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
      }
    } catch (e) {
      // ignore JSON errors
    }
    // Clear ephemeral items after capture
    localStorage.removeItem('editingBuildId');
    localStorage.removeItem('editingBuildName');
    localStorage.removeItem('editingBuildDescription');
  }, []);

  // Compose build summary parts as needed for BuildSummary
  const buildSummaryParts = {
    mobo: selectedMOBO,
    cpu: selectedCPU,
    cpuCooler: selectedCPUCooler,
    gpus: selectedGPUs,
    rams: selectedRAMs,
    m2s: selectedM2s,
    storage: selectedStorage,
    psu: selectedPSU,
    case: selectedCase,
    keyboard: selectedKeyboard,
    mouse: selectedMouse,
    headset: selectedHeadset,
    monitor: selectedMonitor,
    caseFans: selectedCaseFans,
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
      const n = Number(p) || 0;
      return sum + n;
    }, 0);
  };

  // Build snapshot & analysis will be done via shared analyzeBuild utility when saving.

  const buildSnapshot = () => ({
    mobo: selectedMOBO,
    cpu: selectedCPU,
    cpuCooler: selectedCPUCooler,
    gpus: (selectedGPUs || []).filter(Boolean),
    rams: (selectedRAMs || []).filter(Boolean),
    m2s: (selectedM2s || []).filter(Boolean),
    storage: (selectedStorage || []).filter(Boolean),
    psu: selectedPSU,
    case: selectedCase,
    keyboard: selectedKeyboard,
    mouse: selectedMouse,
    headset: selectedHeadset,
    monitor: selectedMonitor,
    caseFans: (selectedCaseFans || []).filter(Boolean)
  });

  const handleSaveBuild = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAlertModal({ show: true, message: 'You must be logged in to save a build.', title: 'Login Required' });
      return;
    }

    // Check if any components are selected
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

    // If we don't have a name, show the name modal
    if (!tempName) {
      setShowNameModal(true);
      return;
    }

    // If we have a name, proceed with saving
    await performSaveBuild(tempName, tempDescription);
  };

  const performSaveBuild = async (name, description) => {
    const parts = buildSnapshot();
    const total_price = computeTotalPrice();
    const analysis = analyzeBuild(parts);
    const warnings = analysis.warnings || [];
    const has_issues = analysis.hasIssues;
    
    try {
      const resp = await fetch('/api/builds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description, parts, total_price, warnings, has_issues })
      });
      
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || resp.statusText);
      }
      
      const data = await resp.json();
      setTempName(name);
      setTempDescription(description);
      
      // Clear all components and draft after successful save
      setSelectedMOBO(null);
      setSelectedCPU(null);
      setSelectedCPUCooler(null);
      setSelectedGPUs([null]);
      setSelectedRAMs([null]);
      setSelectedM2s([null]);
      setSelectedStorage([null]);
      setSelectedPSU(null);
      setSelectedCase(null);
      setSelectedKeyboard(null);
      setSelectedMouse(null);
      setSelectedHeadset(null);
      setSelectedMonitor(null);
      setSelectedCaseFans([null]);
      localStorage.removeItem('builderDraft');
      
      // Show success modal
      setSaveModalData({
        buildId: data.id || '(id unknown)',
        buildName: name,
        hasIssues: has_issues,
        warnings: warnings
      });
      setShowSaveModal(true);
    } catch (e) {
      console.error('Save build failed', e);
      setAlertModal({ show: true, message: 'Save failed: ' + (e.message || 'Unknown error'), title: 'Save Error' });
    }
  };

  const handleNameModalSave = async (name, description) => {
    setShowNameModal(false);
    await performSaveBuild(name, description);
  };

  const handleNameModalClose = () => {
    setShowNameModal(false);
  };

  const handleClearBuild = () => {
    setConfirmModal({
      show: true,
      title: 'Clear All Components',
      message: 'Are you sure you want to clear all components? This action cannot be undone.',
      onConfirm: () => {
        setSelectedMOBO(null);
        setSelectedCPU(null);
        setSelectedCPUCooler(null);
        setSelectedGPUs([null]);
        setSelectedRAMs([null]);
        setSelectedM2s([null]);
        setSelectedStorage([null]);
        setSelectedPSU(null);
        setSelectedCase(null);
        setSelectedKeyboard(null);
        setSelectedMouse(null);
        setSelectedHeadset(null);
        setSelectedMonitor(null);
        setSelectedCaseFans([null]);
        localStorage.removeItem('builderDraft');
        setConfirmModal({ show: false, message: '', title: 'Confirm', onConfirm: null });
      }
    });
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

  // Auto-save draft when components change
  useEffect(() => {
    const hasAnyComponent = selectedMOBO || selectedCPU || selectedCPUCooler || selectedPSU || selectedCase ||
      (selectedGPUs && selectedGPUs.some(gpu => gpu)) ||
      (selectedRAMs && selectedRAMs.some(ram => ram)) ||
      (selectedM2s && selectedM2s.some(m2 => m2)) ||
      (selectedStorage && selectedStorage.some(storage => storage)) ||
      (selectedCaseFans && selectedCaseFans.some(fan => fan)) ||
      selectedKeyboard || selectedMouse || selectedHeadset || selectedMonitor;
    
    if (hasAnyComponent) {
      const draft = buildSnapshot();
      localStorage.setItem('builderDraft', JSON.stringify(draft));
    } else {
      localStorage.removeItem('builderDraft');
    }
  }, [selectedMOBO, selectedCPU, selectedCPUCooler, selectedGPUs, selectedRAMs, selectedM2s, selectedStorage, selectedPSU, selectedCase, selectedCaseFans, selectedKeyboard, selectedMouse, selectedHeadset, selectedMonitor]);

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  const scrollToTop = () => {
    console.log('Scroll to top clicked!');
    // Try multiple scroll methods to ensure it works
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

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
        <div className="BuilderPageLayout">
          <div className="LeftColumn">
            <h1 className='PC-Parts-Buiderpage'>Computer Parts</h1>
            <PartSelector
              part={{ name: "Motherboard (MOBO)" }}
              selectedValue={selectedMOBO}
              setSelectedValue={(value) => {
                // update selected MOBO and reset dependent selectors
                setSelectedMOBO(value);
                setSelectedRAMs([null]);
                setSelectedGPUs([null]);
                setSelectedM2s([null]);
                setSelectedStorage([null]);

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
              partIcon={moboIcon}
            />
            <PartSelector part={{ name: "Processor (CPU)" }} selectedValue={selectedCPU} setSelectedValue={setSelectedCPU} selectedMOBO={selectedMOBO} dataLookup={dataLookup} partIcon={cpuIcon} />
            <PartSelector part={{ name: "CPU Cooler" }} selectedValue={selectedCPUCooler} setSelectedValue={setSelectedCPUCooler} selectedCPU={selectedCPU} dataLookup={dataLookup} partIcon={coolerIcon} />
            <PartSelector
              part={{ name: "Graphics Card (GPU)" }}
              selectedValue={selectedGPUs[0]}
              setSelectedValue={(value) => {
                setSelectedGPUs([value]);
              }}
              dataLookup={dataLookup}
              partIcon={gpuIcon}
            />

            <PartSelector
              part={{ name: "Memory (RAM)" }}
              slotCount={ramSlotsCount || 8}
              selectedValues={selectedRAMs}
              setSelectedValues={setSelectedRAMs}
              selectedMOBO={selectedMOBO}
              selectedCPU={selectedCPU}
              dataLookup={dataLookup}
              partIcon={ramIcon}
            />
            <PartSelector
              part={{ name: "M.2 SSD" }}
              slotCount={m2SlotsCount || 4}
              selectedValues={selectedM2s}
              setSelectedValues={setSelectedM2s}
              dataLookup={dataLookup}
              partIcon={m2Icon}
            />
            <PartSelector
              part={{ name: "Storage" }}
              slotCount={storageSlotsCount || 6}
              selectedValues={selectedStorage}
              setSelectedValues={setSelectedStorage}
              dataLookup={dataLookup}
              partIcon={storageIcon}
            />
            <PartSelector part={{ name: "Power Supply (PSU)" }} selectedValue={selectedPSU} setSelectedValue={setSelectedPSU} dataLookup={dataLookup} partIcon={psuIcon} />
            <PartSelector part={{ name: "Case" }} selectedValue={selectedCase} setSelectedValue={setSelectedCase} dataLookup={dataLookup} selectedMOBO={selectedMOBO} partIcon={caseIcon} />
            <PartSelector
              part={{ name: "Case Fans" }}
              slotCount={6}
              selectedValues={selectedCaseFans}
              setSelectedValues={setSelectedCaseFans}
              dataLookup={dataLookup}
              partIcon={casefanIcon}
            />
            <h1 style={{ textAlign: 'left' }}>Peripherals</h1>
            <PartSelector part={{ name: "Keyboard" }} selectedValue={selectedKeyboard} setSelectedValue={setSelectedKeyboard} dataLookup={dataLookup} partIcon={keyboardIcon} />
            <PartSelector part={{ name: "Mouse" }} selectedValue={selectedMouse} setSelectedValue={setSelectedMouse} dataLookup={dataLookup} partIcon={mouseIcon} />
            <PartSelector part={{ name: "Headset" }} selectedValue={selectedHeadset} setSelectedValue={setSelectedHeadset} dataLookup={dataLookup} partIcon={headsetIcon} />
            <PartSelector part={{ name: "Monitor" }} selectedValue={selectedMonitor} setSelectedValue={setSelectedMonitor} dataLookup={dataLookup} partIcon={monitorIcon} />
          </div>
          <div className="RightColumn">
            <BuildSummary 
              selectedParts={buildSummaryParts} 
              dataLookup={dataLookup}
              onSaveBuild={handleSaveBuild}
              onClearBuild={handleClearBuild}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </main>
      
      {/* Build Name Input Modal */}
      <BuildNameModal
        isOpen={showNameModal}
        onClose={handleNameModalClose}
        onSave={handleNameModalSave}
        initialName={tempName}
        initialDescription={tempDescription}
      />

      {/* Save Build Modal */}
      <SaveBuildModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        buildId={saveModalData.buildId}
        buildName={saveModalData.buildName}
        hasIssues={saveModalData.hasIssues}
        warnings={saveModalData.warnings}
      />

      {/* Custom Alert Modal */}
      <AlertModal
        isOpen={alertModal.show}
        onClose={() => setAlertModal({ show: false, message: '', title: 'Alert' })}
        title={alertModal.title}
        message={alertModal.message}
      />

      {/* Custom Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, message: '', title: 'Confirm', onConfirm: null })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      {/* Scroll to Top Button */}
      <button 
        onClick={scrollToTop}
        aria-label="Scroll to top"
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          zIndex: 9999,
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
          e.target.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        <FaArrowUp />
      </button>
    </>
  );
}

export default BuilderPage;
