function ComponentSpecs({ part }) {
  if (!part) return null;

  // prefer values from the top-level part object, then from part._raw
  const raw = part._raw || {};

  const lookup = (obj, key) => {
    if (!obj) return undefined;
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] !== undefined) return obj[key];
    const low = key.toLowerCase();
    if (Object.prototype.hasOwnProperty.call(obj, low) && obj[low] !== undefined) return obj[low];
    const up = key.charAt(0).toUpperCase() + key.slice(1);
    if (Object.prototype.hasOwnProperty.call(obj, up) && obj[up] !== undefined) return obj[up];
    return undefined;
  };

  // find first match across a list of candidate keys on part then raw
  const find = (...candidates) => {
    for (const k of candidates) {
      const v = lookup(part, k);
      if (v !== undefined) return v;
      const vr = lookup(raw, k);
      if (vr !== undefined) return vr;
    }
    return undefined;
  };

  // canonicalize common fields
  const displayName = find('name', 'Name', 'Name');
  const displayType = find('type', 'Type', 'componentType');
  const displayPrice = find('price', 'Price');

  // build a normalized object with common canonical keys
  const normalized = {
    id: find('id', 'Id'),
    name: displayName,
    price: displayPrice,
    type: displayType,
    socket: find('socket', 'Socket'),
    chipset: find('chipset', 'Chipset'),
    ramType: find('ramType', 'RamType', 'Ramtype'),
    formFactor: find('formFactor', 'FormFactor'),
    interface: find('interface', 'Interface'),
    cores: find('Cores', 'cores'),
    threads: find('Threads', 'threads'),
    tdp: find('TDP', 'tdp'),
    powerDraw: find('PowerDraw', 'powerdraw'),
    vram: find('Vram', 'vram', 'VRAM'),
    maxTdp: find('MaxTDP', 'MaxTdp', 'maxTDP'),
    ramMax: find('RamMax', 'ramMax'),
    cache: find('cache', 'Cache', 'L3Cache', 'L2Cache')
  };

  // helper to format values for display
  const format = (v) => {
    if (v === null || v === undefined) return null;
    if (Array.isArray(v)) return v.join(', ');
    if (typeof v === 'object') {
      // if object has simple primitives, show key:val pairs
      const entries = Object.entries(v).filter(([, val]) => val !== undefined && val !== null);
      if (entries.length > 0 && entries.every(([, val]) => typeof val !== 'object')) {
        return entries.map(([k, val]) => `${k}: ${val}`).join(', ');
      }
      try { return JSON.stringify(v); } catch (e) { return String(v); }
    }
    return String(v);
  };

  // curated order for display (label -> normalized key)
  const displayOrder = [
    ['Socket', 'socket'],
    ['Chipset', 'chipset'],
    ['Form Factor', 'formFactor'],
    ['Interface', 'interface'],
    ['RAM Type', 'ramType'],
    ['RAM Max', 'ramMax'],
    ['Cores', 'cores'],
    ['Threads', 'threads'],
    ['Cache', 'cache'],
    ['TDP', 'tdp'],
    ['Power Draw', 'powerDraw'],
    ['VRAM', 'vram']
  ];

  const entries = [];
  for (const [label, key] of displayOrder) {
    const val = normalized[key];
    const f = format(val);
    if (f) entries.push([label, f]);
  }

  // fallback: include any other primitive top-level fields from part or raw
  const seen = new Set(['id','name','price','type','_raw', ...displayOrder.map(([,k])=>k)]);
  const collectPrimitives = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const low = k.toLowerCase();
      if (seen.has(k) || seen.has(low)) continue;
      if (v === null || v === undefined) continue;
      if (typeof v === 'object' && !Array.isArray(v)) continue; // skip complex objects
      const f = format(v);
      if (f) entries.push([String(k).replace(/([A-Z])/g, ' $1').replace(/^./, s=>s.toUpperCase()), f]);
      seen.add(k);
    }
  };

  collectPrimitives(part);
  collectPrimitives(raw);

  // If an explicit type isn't provided, try to infer type from characteristic fields
  const explicitType = normalized.type || lookup(part, 'type') || lookup(raw, 'type') || '';
  let inferredType = explicitType || '';
  if (!inferredType) {
    // Prefer CPU/GPU detection first (CPUs have socket but should not be classified as motherboards simply for having a socket)
    if (normalized.cores || normalized.threads || lookup(part, 'Cores') || lookup(part, 'Threads')) {
      inferredType = 'CPU';
    } else if (normalized.vram || normalized.powerDraw || lookup(part, 'CudaCores') || lookup(part, 'ComputeUnits') || lookup(raw, 'ComputeUnits')) {
      inferredType = 'GPU';
    } else if (normalized.chipset || lookup(part, 'socket') || lookup(raw, 'socket') || lookup(part, 'RamSlots') || lookup(part, 'GpuSlots') || lookup(raw, 'M2Slots')) {
      // motherboard detection requires chipset/socket or expansion slots (strong signals)
      inferredType = 'Motherboard';
    } else if (normalized.formFactor) {
      // formFactor alone (ATX/Micro-ATX/etc.) is often a Case/Chassis, not necessarily a motherboard
      inferredType = 'Case';
    } else if (lookup(part, 'wattage') || lookup(raw, 'wattage') || lookup(part, 'watt')) {
      inferredType = 'PSU';
    } else if (normalized.ramType || lookup(part, 'RamType') || lookup(raw, 'RamType')) {
      inferredType = 'RAM';
    }
  }

  // If normalized fields strongly indicate CPU/GPU, prefer them regardless of a generic explicitType
  if (!/cpu|gpu|motherboard/i.test(inferredType)) {
    if (normalized.cores || normalized.threads) inferredType = 'CPU';
    else if (normalized.vram || normalized.powerDraw || lookup(part, 'CudaCores') || lookup(part, 'ComputeUnits')) inferredType = 'GPU';
  }

  const lowerType = String(inferredType).toLowerCase();
  // Map common categories to explicit short labels instead of the generic "Component"
  let titleType;
  if (/(mobo|motherboard)/.test(lowerType)) titleType = 'MOBO';
  else if (/(cpu|processor)/.test(lowerType)) titleType = 'CPU';
  else if (/(gpu|graphics|videocard|video ?card)/.test(lowerType)) titleType = 'GPU';
  else titleType = inferredType ? String(inferredType) : 'Component';
  const titleName = normalized.name || (part.Name || part.name) || (raw.Name || raw.name) || 'Component';
  const titlePrice = Number(normalized.price || 0);

  return (
    <div className='ComponentSpecsContainer'>
      <h1>{titleType}</h1>
      <h2>{titleName}</h2>
      <p>₱{titlePrice.toLocaleString()}</p>
      <ul>
        {entries.map(([label, value]) => (
          <li key={label}>
            <strong>{label}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ComponentSpecs;