import { createLocalStorageStateHook } from 'use-local-storage-state';
import { useMemo } from 'react';

export const DEFAULT_MEASUREMENT_DURATION = 60;
export const MIN_MEASUREMENT_DURATION = 20;
export const MAX_MEASUREMENT_DURATION = 180;

// Get license key from environment variable
// Note: webpack DefinePlugin replaces process.env.LICENSE_KEY with the actual string value at build time
const getLicenseKeyFromEnv = (): string | null => {
  // @ts-ignore - process.env.LICENSE_KEY is replaced by webpack DefinePlugin at build time with the actual string value
  // After DefinePlugin replacement, this becomes a direct string literal (e.g., "3E130C-5A3C34-..." or "")
  const envKey: string = process.env.LICENSE_KEY || '';
  // Return null if empty string, otherwise return the key
  return envKey && envKey.trim() !== '' ? envKey : null;
};

const useLocalStorageLicenseKey = createLocalStorageStateHook('licenseKey', null);

// Custom hook that prioritizes environment variable over localStorage
export const useLicenseKey = (): [string | null, (value: string | null) => void] => {
  const [localStorageLicenseKey, setLocalStorageLicenseKey] = useLocalStorageLicenseKey();
  
  // Get env license key (memoized to avoid re-computation)
  const envLicenseKey = useMemo(() => getLicenseKeyFromEnv(), []);

  // If env license key exists, use it; otherwise use localStorage
  const licenseKey = envLicenseKey || localStorageLicenseKey;

  const setLicenseKey = (value: string | null) => {
    if (!envLicenseKey) {
      setLocalStorageLicenseKey(value);
    }
  };

  return [licenseKey, setLicenseKey];
};

export const useProductId = createLocalStorageStateHook('productId', null);
export const useMeasurementDuration = createLocalStorageStateHook(
  'measurementDuration',
  DEFAULT_MEASUREMENT_DURATION,
);
