import { useState } from "react";

/**
 * Hook para operaciones CRUD genéricas
 */
export function useEntityCrud<T>(apiEndpoint: string) {
  const [loading, setLoading] = useState(false);

  const deleteEntity = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const res = await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Error eliminando ${apiEndpoint}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchEntity = async (id: string): Promise<T | null> => {
    try {
      setLoading(true);
      const res = await fetch(`${apiEndpoint}/${id}`);
      if (!res.ok) throw new Error(`Error cargando ${apiEndpoint}`);
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveEntity = async (
    data: Partial<T>,
    id?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const url = id ? `${apiEndpoint}/${id}` : apiEndpoint;
      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(`Error guardando ${apiEndpoint}`);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    deleteEntity,
    fetchEntity,
    saveEntity,
  };
}
