import alertsData from '../data/alerts.json';

interface AlertInfo {
  name: string;
  cause: string;
  solution: string;
}

type AlertsData = Record<string, AlertInfo>;

/**
 * Gets the user-friendly description (cause) for an alert code
 * @param code - The numeric alert code
 * @returns The cause description if found, otherwise returns the code as a string
 */
export function getAlertDescription(code: number | undefined): string {
  if (!code || code === -1) {
    return '';
  }

  const alerts = alertsData as AlertsData;
  const codeString = String(code);
  const alertInfo = alerts[codeString];

  if (alertInfo && alertInfo.cause) {
    return alertInfo.cause;
  }

  // Fallback to showing the code if not found
  return String(code);
}

/**
 * Gets the full alert information for an alert code
 * @param code - The numeric alert code
 * @returns The alert info object if found, otherwise null
 */
export function getAlertInfo(code: number | undefined): AlertInfo | null {
  if (!code || code === -1) {
    return null;
  }

  const alerts = alertsData as AlertsData;
  const codeString = String(code);
  return alerts[codeString] || null;
}

