const OPEN_DB_REPO = process.env.BUILDKCORES_OPEN_DB_REPO || 'buildcores/buildcores-open-db';
const OPEN_DB_REF = process.env.BUILDKCORES_OPEN_DB_REF || 'main';
const OPEN_DB_API_BASE = `https://api.github.com/repos/${OPEN_DB_REPO}/contents/open-db`;
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const CATEGORY_MAP = {
  cpu: { folder: 'CPU', label: 'CPU' },
  'cpu-cooler': { folder: 'CPUCooler', label: 'CPU Cooler' },
  gpu: { folder: 'GPU', label: 'GPU' },
  psu: { folder: 'PSU', label: 'PSU' },
  mobo: { folder: 'Motherboard', label: 'Motherboard' },
  ram: { folder: 'RAM', label: 'RAM' },
  storage: { folder: 'Storage', label: 'Storage' },
  m2: { folder: 'Storage', label: 'M.2 / NVMe' },
  case: { folder: 'PCCase', label: 'Case' },
  'case-fans': { folder: 'CaseFan', label: 'Case Fan' },
  keyboard: { folder: 'Keyboard', label: 'Keyboard' },
  mouse: { folder: 'Mouse', label: 'Mouse' },
  headset: { folder: 'Headphones', label: 'Headset' },
  monitor: { folder: 'Monitor', label: 'Monitor' },
};

const cache = new Map();

async function httpFetch(url, options = {}) {
  if (typeof fetch !== 'function') {
    throw new Error('fetch is not available in this runtime');
  }
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'PCPlannerWebsite',
    ...(options.headers || {}),
  };
  return fetch(url, { ...options, headers });
}

async function fetchJson(url) {
  const response = await httpFetch(url);
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`GitHub request failed (${response.status}) for ${url}: ${body.slice(0, 200)}`);
  }
  return response.json();
}

function valueToText(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(valueToText).filter(Boolean).join(' ');
  if (typeof value === 'object') return Object.values(value).map(valueToText).filter(Boolean).join(' ');
  return String(value);
}

function collectSearchText(value, output = [], seen = new Set()) {
  if (value === null || value === undefined) return output;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value).trim();
    if (text) output.push(text);
    return output;
  }
  if (Array.isArray(value)) {
    for (const entry of value) collectSearchText(entry, output, seen);
    return output;
  }
  if (typeof value !== 'object' || seen.has(value)) return output;
  seen.add(value);
  for (const [key, entry] of Object.entries(value)) {
    const normalizedKey = key.replace(/[_-]/g, ' ').trim();
    if (normalizedKey && normalizedKey.length <= 32) output.push(normalizedKey);
    collectSearchText(entry, output, seen);
  }
  return output;
}

function normalizeCapacity(value) {
  if (value === null || value === undefined) return undefined;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function normalizeCommonFields(componentType, raw) {
  const metadata = raw.metadata || {};
  const specifications = raw.specifications || {};
  const normalized = {
    id: raw.opendb_id || metadata.opendb_id || metadata.id || raw.id || undefined,
    name: metadata.name || raw.name || raw.title || raw.model || raw.series || raw.opendb_id || 'Unknown component',
    type: CATEGORY_MAP[componentType]?.label || componentType,
    componentType,
    manufacturer: metadata.manufacturer || raw.manufacturer || raw.brand || undefined,
    brand: metadata.manufacturer || raw.manufacturer || raw.brand || undefined,
    series: metadata.series || raw.series || undefined,
    variant: metadata.variant || raw.variant || undefined,
    price: 0,
    _raw: raw,
  };

  const searchText = collectSearchText(raw, [])
    .filter(Boolean)
    .slice(0, 300)
    .join(' ');
  if (searchText) normalized.searchText = searchText;

  if (componentType === 'cpu') {
    normalized.socket = raw.socket || specifications.socket || metadata.socket || undefined;
    normalized.cores = raw.cores?.total ?? raw.cores?.performance ?? raw.cores?.efficiency ?? undefined;
    normalized.threads = raw.cores?.threads ?? specifications.threads ?? undefined;
    normalized.base_clock_ghz = raw.clocks?.performance?.base ?? raw.clocks?.base ?? undefined;
    normalized.boost_clock_ghz = raw.clocks?.performance?.boost ?? raw.clocks?.boost ?? undefined;
    normalized.cache = raw.cache || undefined;
    normalized.tdp = specifications.tdp ?? raw.tdp ?? undefined;
    normalized.ramType = Array.isArray(specifications.memory?.types) ? specifications.memory.types.join(', ') : specifications.memory?.types || undefined;
    normalized.ramMax = normalizeCapacity(specifications.memory?.maxSupport);
  }

  if (componentType === 'cpu-cooler') {
    normalized.socket = raw.socket || specifications.socket || metadata.socket || undefined;
    normalized.tdp = specifications.tdp ?? raw.tdp ?? undefined;
    normalized.formFactor = raw.formFactor || raw.form_factor || specifications.formFactor || specifications.form_factor || undefined;
  }

  if (componentType === 'gpu') {
    normalized.vram = raw.memory?.capacity ?? raw.vram ?? specifications.vram ?? undefined;
    normalized.powerDraw = raw.power_draw_w ?? raw.powerDraw ?? specifications.powerDraw ?? undefined;
    normalized.boost_clock_mhz = raw.clocks?.boost ?? raw.boost_clock_mhz ?? undefined;
  }

  if (componentType === 'psu') {
    normalized.wattage = raw.wattage ?? specifications.wattage ?? undefined;
    normalized.rating = raw.rating || specifications.rating || undefined;
    normalized.modular = raw.modular ?? specifications.modular ?? undefined;
  }

  if (componentType === 'mobo') {
    normalized.socket = raw.socket || specifications.socket || metadata.socket || undefined;
    normalized.chipset = raw.chipset || specifications.chipset || undefined;
    normalized.formFactor = raw.formFactor || raw.form_factor || specifications.formFactor || specifications.form_factor || undefined;
    normalized.ramType = raw.ramType || raw.ram_type || specifications.ramType || specifications.ram_type || undefined;
    normalized.ramSlots = raw.ramSlots ?? raw.ram_slots ?? specifications.ramSlots ?? specifications.ram_slots ?? undefined;
    normalized.gpuSlots = raw.gpuSlots ?? raw.gpu_slots ?? specifications.gpuSlots ?? specifications.gpu_slots ?? undefined;
    normalized.storageSlots = raw.storageSlots ?? raw.storage_slots ?? specifications.storageSlots ?? specifications.storage_slots ?? undefined;
    normalized.m2Slots = raw.m2Slots ?? raw.m2_slots ?? specifications.m2Slots ?? specifications.m2_slots ?? undefined;
  }

  if (componentType === 'ram') {
    normalized.ramType = raw.type || raw.ramType || raw.ram_type || specifications.type || specifications.types || undefined;
    normalized.frequency_mhz = raw.frequency_mhz ?? raw.frequency ?? specifications.frequency_mhz ?? specifications.frequency ?? undefined;
    normalized.capacity_gb = raw.capacity_gb ?? raw.capacity ?? specifications.capacity_gb ?? specifications.capacity ?? undefined;
  }

  if (componentType === 'storage' || componentType === 'm2') {
    normalized.interface = raw.interface || raw.Interface || specifications.interface || specifications.Interface || undefined;
    normalized.capacity_gb = raw.capacity_gb ?? raw.capacity ?? specifications.capacity_gb ?? specifications.capacity ?? undefined;
    normalized.power_w = raw.power_w ?? raw.power ?? specifications.power_w ?? specifications.power ?? undefined;
    normalized.formFactor = raw.formFactor || raw.form_factor || specifications.formFactor || specifications.form_factor || undefined;
  }

  if (componentType === 'case') {
    normalized.formFactor = raw.formFactor || raw.form_factor || specifications.formFactor || specifications.form_factor || undefined;
    normalized.color = raw.color || specifications.color || undefined;
  }

  if (componentType === 'case-fans') {
    normalized.size_mm = raw.size_mm ?? raw.size ?? specifications.size_mm ?? specifications.size ?? undefined;
    normalized.formFactor = raw.formFactor || raw.form_factor || specifications.formFactor || specifications.form_factor || undefined;
  }

  if (componentType === 'keyboard' || componentType === 'mouse' || componentType === 'headset' || componentType === 'monitor') {
    normalized.formFactor = raw.formFactor || raw.form_factor || specifications.formFactor || specifications.form_factor || undefined;
  }

  return normalized;
}

function isM2Record(record) {
  const text = [
    record?.interface,
    record?._raw?.interface,
    record?._raw?.specifications?.interface,
    record?._raw?.metadata?.name,
    record?.name,
  ]
    .map(valueToText)
    .join(' ')
    .toLowerCase();
  return /m\.2|\bm2\b|nvme|pcie\s*4|pcie\s*5/.test(text);
}

function mapWithConcurrency(items, concurrency, iterator) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workerCount = Math.max(1, Math.min(concurrency, items.length));

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await iterator(items[currentIndex], currentIndex);
    }
  }

  return Promise.all(Array.from({ length: workerCount }, () => worker())).then(() => results);
}

async function loadBuildCoresCategory(componentType) {
  const cached = cache.get(componentType);
  if (cached) {
    if (cached.data && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) return cached.data;
    if (cached.promise) return cached.promise;
  }

  const promise = (async () => {
    const category = CATEGORY_MAP[componentType];
    if (!category) return [];

    const dirUrl = `${OPEN_DB_API_BASE}/${category.folder}?ref=${encodeURIComponent(OPEN_DB_REF)}`;
    const entries = await fetchJson(dirUrl);
    const files = Array.isArray(entries)
      ? entries.filter((entry) => entry && entry.type === 'file' && entry.name && entry.name.endsWith('.json') && entry.download_url)
      : [];

    const records = await mapWithConcurrency(files, 8, async (entry) => {
      const raw = await fetchJson(entry.download_url);
      return normalizeCommonFields(componentType, raw);
    });

    if (componentType === 'm2') {
      return records.filter(Boolean).filter(isM2Record);
    }

    if (componentType === 'storage') {
      return records.filter(Boolean).filter((record) => !isM2Record(record));
    }

    return records.filter(Boolean);
  })();

  cache.set(componentType, { promise });

  try {
    const data = await promise;
    cache.set(componentType, { data, fetchedAt: Date.now() });
    return data;
  } catch (error) {
    cache.delete(componentType);
    throw error;
  }
}

module.exports = {
  loadBuildCoresCategory,
  CATEGORY_MAP,
};