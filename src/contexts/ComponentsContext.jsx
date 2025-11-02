import React, { createContext, useContext, useEffect, useState } from 'react';

const ComponentsContext = createContext(null);

export function useComponents() {
  return useContext(ComponentsContext);
}

export function ComponentsProvider({ children }) {
  const [dataLookup, setDataLookup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      const types = ['cpu','cpu-cooler','gpu','psu','mobo','ram','storage','m2','case','case-fans','monitor','keyboard','mouse','headset'];
      const map = {};
      for (const t of types) {
        try {
          const resp = await fetch(`/api/components/${t}`);
          if (!resp.ok) throw new Error('fetch failed');
          const json = await resp.json();
          const key = t === 'case' ? 'case' : t === 'cpu-cooler' ? 'cpuCooler' : t === 'case-fans' ? 'case-fans' : t;
          map[key] = Array.isArray(json) ? json : [];
          // debug log
          // eslint-disable-next-line no-console
          console.log(`[ComponentsProvider] fetched ${t}:`, Array.isArray(json) ? json.length : 'N/A');
        } catch (e) {
          // leave empty array for consumers to fallback to local lists
          map[t === 'case' ? 'case' : t === 'cpu-cooler' ? 'cpuCooler' : t] = [];
          // eslint-disable-next-line no-console
          console.warn(`[ComponentsProvider] failed fetch for ${t}:`, e.message);
        }
      }
      if (mounted) {
        setDataLookup(map);
        setLoading(false);
      }
    }
    loadAll();
    return () => { mounted = false; };
  }, []);

  const value = { dataLookup, loading };
  return (
    <ComponentsContext.Provider value={value}>
      {children}
    </ComponentsContext.Provider>
  );
}

export default ComponentsContext;
