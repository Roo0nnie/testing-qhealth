import { useCallback, useEffect, useState } from 'react';
import { getAlertDescription } from '../lib/alertUtils';

const useError = (alert) => {
  const [errorMessage, setErrorMessage] = useState<string>();

  const displayError = useCallback((message: string) => {
    setErrorMessage(message);
  }, []);

  useEffect(() => {
    if (alert?.code === -1) {
      setErrorMessage('');
      return;
    }

    if (alert?.code) {
      const description = getAlertDescription(alert.code);
      displayError(description || `Error: ${alert.code}`);
    }
  }, [alert, displayError]);

  return errorMessage;
};
export default useError;
