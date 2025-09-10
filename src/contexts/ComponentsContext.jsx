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
          // leave empty array for consumers to fallback to local lists
          map[t === 'case' ? 'case' : t] = [];
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
