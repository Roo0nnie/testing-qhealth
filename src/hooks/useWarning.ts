import { useCallback, useEffect, useState } from 'react';
import { getAlertDescription } from '../lib/alertUtils';

const useWarning = (alert: any) => {
	const [warningMessage, setWarningMessage] = useState<string>()

	const startDismissTimeout = useCallback((seconds: number) => {
		setTimeout(() => {
			setWarningMessage("")
		}, seconds * 1000)
	}, [])

	const displayWarning = useCallback((message: string) => {
		setWarningMessage(message);
		startDismissTimeout(4);
	}, [startDismissTimeout]);

	useEffect(() => {
		if (alert?.code === -1) {
			setWarningMessage("")
			return
		}

		if (alert?.code) {
			const description = getAlertDescription(alert.code);
			displayWarning(description || `Warning: ${alert.code}`);
		}
	}, [alert, displayWarning]);

	return warningMessage
}
export default useWarning
