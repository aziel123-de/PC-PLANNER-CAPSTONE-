import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BuilderPage.css';
import PartSelector from '../../PCBuilder/PCBuilding/PartSelector';
import BuildSummary from '../../PCBuilder/PCBuilding/BuildSummary';
import analyzeBuild from '../../PCBuilder/PCBuilding/analyzeBuild';

function BuilderPageEdit() {
  const [selectedMOBO, setSelectedMOBO] = useState(null);
  const [selectedCPU, setSelectedCPU] = useState(null);
  const [selectedGPUs, setSelectedGPUs] = useState([]);
  const [selectedRAMs, setSelectedRAMs] = useState([]);
  const [selectedM2s, setSelectedM2s] = useState([]);
  const [selectedStorage, setSelectedStorage] = useState([]);
  const [selectedPSU, setSelectedPSU] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [dataLookup, setDataLookup] = useState(null);

  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');

  const [originalParts, setOriginalParts] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loadingBuild, setLoadingBuild] = useState(false);

  const navigate = useNavigate ? useNavigate() : null;

  useEffect(() => {
    let mounted = true;
    async function loadLookup() {
      const types = ['cpu','gpu','psu','mobo','ram','storage','m2','case'];
      const map = {};
      for (const t of types) {
        try {
          const resp = await fetch(`/api/components/${t}`);
          if (!resp.ok) throw new Error('fetch failed');
          const json = await resp.json();
          const key = t === 'case' ? 'case' : t;
          map[key] = Array.isArray(json) ? json : [];
        } catch (e) {
          // ignore
        }
      }
      if (mounted) setDataLookup(map);
    }
    loadLookup();
    return () => { mounted = false; };
  }, []);

  // Prefill from editingBuildId (localStorage) or loadedBuild fallback
  useEffect(() => {
    const id = localStorage.getItem('editingBuildId');
    setEditingId(id || null);
    const token = localStorage.getItem('token');
    async function fetchBuild(idToFetch) {
      if (!idToFetch) return;
      setLoadingBuild(true);
      try {
        const resp = await fetch(`/api/builds/${idToFetch}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!resp.ok) throw new Error('fetch build failed');
        const json = await resp.json();
        const parts = json.parts || {};
        applyPartsToState(parts);
        setTempName(json.name || '');
        setTempDescription(json.description || '');
        setOriginalParts(parts);
      } catch (e) {
        // fallback: try raw loadedBuild from localStorage
        try {
          const raw = localStorage.getItem('loadedBuild');
          if (raw) {
            const parsed = JSON.parse(raw);
            applyPartsToState(parsed || {});
            setOriginalParts(parsed || {});
          }
        } catch (ee) {}
      } finally { setLoadingBuild(false); }
    }

    // If we have an editing id, fetch; otherwise try loadedBuild
    if (id) fetchBuild(id);
    else {
      try {
        const raw = localStorage.getItem('loadedBuild');
        if (raw) {
          const parsed = JSON.parse(raw);
          applyPartsToState(parsed || {});
          setOriginalParts(parsed || {});
        }
      } catch (e) {}
    }

    // helper
    function applyPartsToState(parsed) {
      if (!parsed) return;
      if (parsed.mobo) setSelectedMOBO(parsed.mobo);
      if (parsed.cpu) setSelectedCPU(parsed.cpu);
      if (Array.isArray(parsed.gpus)) setSelectedGPUs(parsed.gpus);
      if (Array.isArray(parsed.rams)) setSelectedRAMs(parsed.rams);
      if (Array.isArray(parsed.m2s)) setSelectedM2s(parsed.m2s);
      if (Array.isArray(parsed.storage)) setSelectedStorage(parsed.storage);
      if (parsed.psu) setSelectedPSU(parsed.psu);
      if (parsed.case) setSelectedCase(parsed.case);
    }
  }, []);

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
    (selectedGPUs || []).forEach(x => x && items.push(x));
    (selectedRAMs || []).forEach(x => x && items.push(x));
    (selectedM2s || []).forEach(x => x && items.push(x));
    (selectedStorage || []).forEach(x => x && items.push(x));
    if (selectedPSU) items.push(selectedPSU);
    if (selectedCase) items.push(selectedCase);
    return items;
  };

  const computeTotalPrice = () => collectSelectedItems().reduce((sum, it) => {
    const p = getField(it, 'price', 'Price', 'cost') || 0;
    return sum + (Number(p) || 0);
  }, 0);

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

  const isChanged = () => {
    try {
      const a = originalParts || {};
      const b = buildSnapshot() || {};
      return JSON.stringify(a) !== JSON.stringify(b) || tempName !== ('' || tempName) || tempDescription !== ('' || tempDescription);
    } catch (e) { return true; }
  };

  const handleUpdateBuild = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('You must be logged in to update a build.'); return; }
    if (!editingId) { alert('No build selected for editing.'); return; }
    const parts = buildSnapshot();
    const total_price = computeTotalPrice();
    const analysis = analyzeBuild(parts);
    const warnings = analysis.warnings || [];
    const has_issues = analysis.hasIssues;
    try {
      const resp = await fetch(`/api/builds/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: tempName || undefined, description: tempDescription || undefined, parts, total_price, warnings, has_issues })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || resp.statusText);
      }
      // Update original snapshot so further edits require change
      setOriginalParts(parts);
      // Redirect to dashboard saved builds
      try {
  if (navigate) navigate('/dashboard?section=saved');
  else window.location.href = '/dashboard?section=saved';
      } catch (e) {
        window.location.href = '/dashboard';
      }
    } catch (e) {
      console.error('Update failed', e);
      alert('Update failed: ' + (e.message || 'Unknown error'));
    }
  };

  const isLoggedIn = Boolean(localStorage.getItem('token'));

  return (
    <main className='PC-Builder-Content' style={{ paddingTop: 80 }}>
      <div className='Note'>
        <h1 className='PC-Note-Title'>Edit Saved Build</h1>
        <h3 style={{ marginTop: 0, fontWeight: 400 }}>
          Update the parts in your saved build and click "Update Build" to save changes.
        </h3>
      </div>
      <div className="BuilderPageLayout">
        <div className="LeftColumn">
          <h1 className='PC-Parts-Buiderpage'>Computer Parts</h1>
          <PartSelector
            part={{ name: "Motherboard (MOBO)" }}
            selectedValue={selectedMOBO}
            setSelectedValue={(value) => {
              setSelectedMOBO(value);
              setSelectedRAMs([]);
              setSelectedGPUs([]);
              setSelectedM2s([]);
              setSelectedStorage([]);
            }}
            dataLookup={dataLookup}
          />
          <PartSelector part={{ name: "Processor (CPU)" }} selectedValue={selectedCPU} setSelectedValue={setSelectedCPU} selectedMOBO={selectedMOBO} dataLookup={dataLookup} />
          <PartSelector
            part={{ name: "Graphics Card (GPU)" }}
            selectedValue={selectedGPUs[0]}
            setSelectedValue={(value) => { const updated = [...selectedGPUs]; updated[0] = value; setSelectedGPUs(updated); }}
            dataLookup={dataLookup}
          />
          {Array.from({ length: Math.max(0, (gpuSlotsCount || 1) - 1) }).map((_, index) => (
            <PartSelector
              key={`gpu-${index + 1}`}
              part={{ name: "Graphics Card (GPU)" }}
              selectedValue={selectedGPUs[index + 1]}
              setSelectedValue={(value) => { const updated = [...selectedGPUs]; updated[index + 1] = value; setSelectedGPUs(updated); }}
              dataLookup={dataLookup}
            />
          ))}
          <PartSelector part={{ name: "Memory (RAM)" }} slotCount={ramSlotsCount || 0} selectedValues={selectedRAMs} setSelectedValues={setSelectedRAMs} selectedMOBO={selectedMOBO} dataLookup={dataLookup} />
          <PartSelector part={{ name: "M.2 SSD" }} slotCount={m2SlotsCount || 0} selectedValues={selectedM2s} setSelectedValues={setSelectedM2s} dataLookup={dataLookup} />
          <PartSelector part={{ name: "Storage" }} slotCount={storageSlotsCount || 0} selectedValues={selectedStorage} setSelectedValues={setSelectedStorage} dataLookup={dataLookup} />
          <PartSelector part={{ name: "Power Supply (PSU)" }} selectedValue={selectedPSU} setSelectedValue={setSelectedPSU} dataLookup={dataLookup} />
          <PartSelector part={{ name: "Case" }} selectedValue={selectedCase} setSelectedValue={setSelectedCase} dataLookup={dataLookup} selectedMOBO={selectedMOBO} />
        </div>
        <div className="RightColumn">
          <div style={{ marginBottom: 12 }}>
            {isLoggedIn ? (
              <button onClick={handleUpdateBuild} disabled={!dataLookup || !isChanged()}>{loadingBuild ? 'Loading...' : 'Update Build'}</button>
            ) : (
              <div style={{ color: 'var(--muted-text, #666)', fontSize: 14 }}>Sign in to update builds</div>
            )}
          </div>
          <div style={{ marginBottom: 10 }}>
            <input placeholder="Build name" value={tempName} onChange={e => setTempName(e.target.value)} style={{ width: '100%', padding: '.45rem', borderRadius: 6, border: '1px solid var(--cb-border)' }} />
            <textarea placeholder="Build description" value={tempDescription} onChange={e => setTempDescription(e.target.value)} rows={3} style={{ width: '100%', marginTop: 8, padding: '.45rem', borderRadius: 6, border: '1px solid var(--cb-border)' }} />
          </div>
          <BuildSummary selectedParts={buildSnapshot()} dataLookup={dataLookup} />
        </div>
      </div>
    </main>
  );
}

export default BuilderPageEdit;

