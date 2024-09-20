// useAsync.js

import { useState, useCallback, useEffect } from 'react';

export const useAsync = (asyncFn, immediate = false) => {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFn(...params);
      setValue(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
      throw error;
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
};
