import { useEffect, useState } from "react";

/**
 * Hook para cargar datos desde una API
 */
export function useFetchData<T>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Error cargando ${endpoint}`);
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error(err);
        setError(`No se pudieron cargar los datos de ${endpoint}.`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [endpoint]);

  return { data, loading, error };
}
