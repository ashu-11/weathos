import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then(r  => setData(r.data))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line
  }, deps);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export function useAsync(asyncFn) {
  const [state, setState] = useState({ loading: false, data: null, error: null });
  const run = useCallback(async (...args) => {
    setState({ loading: true, data: null, error: null });
    try {
      const r = await asyncFn(...args);
      setState({ loading: false, data: r.data, error: null });
      return r.data;
    } catch (e) {
      const err = e.response?.data?.error || e.message;
      setState({ loading: false, data: null, error: err });
      throw err;
    }
  }, [asyncFn]);
  return { ...state, run };
}
