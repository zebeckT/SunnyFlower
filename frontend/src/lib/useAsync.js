import { useState, useEffect } from 'react';

export default function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fn().then(
      (data) => active && setState({ data, loading: false, error: null }),
      (error) => active && setState({ data: null, loading: false, error }),
    );
    return () => {
      active = false;
    };
  }, deps);

  return state;
}
