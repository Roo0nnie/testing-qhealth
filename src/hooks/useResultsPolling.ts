import { useEffect, useRef, useState } from "react"

import { getResults } from "../services/api"
import { MeasurementResults } from "../types"

interface UseResultsPollingReturn {
	results: MeasurementResults | null
	isLoading: boolean
	error: string | null
	isPolling: boolean
}

/**
 * Hook to poll for measurement results
 * Polls every 2-3 seconds, with exponential backoff after 30 seconds
 * Stops after 10 minutes or when results are received
 */
const useResultsPolling = (sessionId: string | null, enabled: boolean): UseResultsPollingReturn => {
	const [results, setResults] = useState<MeasurementResults | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isPolling, setIsPolling] = useState(false)

	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
	const startTimeRef = useRef<number | null>(null)
	const pollCountRef = useRef(0)

	useEffect(() => {
		if (!enabled || !sessionId || results) {
			// Stop polling if disabled, no session ID, or results already received
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current)
				pollingIntervalRef.current = null
			}
			setIsPolling(false)
			return
		}

		// Start polling
		setIsPolling(true)
		setIsLoading(true)
		setError(null)
		startTimeRef.current = Date.now()
		pollCountRef.current = 0

		const poll = async () => {
			pollCountRef.current += 1
			const elapsed = Date.now() - (startTimeRef.current || Date.now())

			// Timeout after 10 minutes
			if (elapsed > 10 * 60 * 1000) {
				setIsPolling(false)
				setIsLoading(false)
				setError("Session expired. Please scan the QR code again.")
				if (pollingIntervalRef.current) {
					clearInterval(pollingIntervalRef.current)
					pollingIntervalRef.current = null
				}
				return
			}

			try {
				const response = await getResults(sessionId)

				if (response.success && response.data) {
					// Results received - stop polling
					setResults(response.data)
					setIsLoading(false)
					setIsPolling(false)
					if (pollingIntervalRef.current) {
						clearInterval(pollingIntervalRef.current)
						pollingIntervalRef.current = null
					}
				} else if (response.error === "Session not found") {
					// Session not found yet - continue polling
					setError(null)
				} else {
					// Other error
					setError(response.error || "Failed to retrieve results")
				}
			} catch (err) {
				console.error("Polling error:", err)
				// Continue polling on error
				setError(err instanceof Error ? err.message : "Network error")
			}
		}

		// Initial poll
		poll()

		// Calculate polling interval with exponential backoff
		const getPollInterval = () => {
			const elapsed = Date.now() - (startTimeRef.current || Date.now())
			if (elapsed > 30 * 1000) {
				// After 30 seconds, poll every 5 seconds
				return 5000
			}
			// Initially poll every 2-3 seconds
			return 2500
		}

		// Set up polling interval
		pollingIntervalRef.current = setInterval(() => {
			poll()
		}, getPollInterval())

		// Cleanup on unmount or when dependencies change
		return () => {
			if (pollingIntervalRef.current) {
				clearInterval(pollingIntervalRef.current)
				pollingIntervalRef.current = null
			}
			setIsPolling(false)
		}
	}, [enabled, sessionId, results])

	return {
		results,
		isLoading,
		error,
		isPolling,
	}
}

export default useResultsPolling
