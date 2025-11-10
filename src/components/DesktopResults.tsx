import React, { useEffect, useRef } from "react"

import { getQHealthAPI } from "../services/qhealthClientAPI"
import { MeasurementResults } from "../types"
import { SessionStatus } from "../types/api"
import Stats from "./Stats"
import { Spinner } from "./ui/spinner"

interface DesktopResultsProps {
	results: MeasurementResults | null
	isLoading: boolean
	error: string | null
	isPolling: boolean
}

/**
 * Component to display measurement results on desktop
 * Shows loading state, error state, or results
 */
const DesktopResults: React.FC<DesktopResultsProps> = ({
	results,
	isLoading,
	error,
	isPolling,
}) => {
	const hasBroadcastedRef = useRef(false)

	// Broadcast MEASUREMENT_COMPLETE event when results are received
	useEffect(() => {
		if (results && !hasBroadcastedRef.current) {
			hasBroadcastedRef.current = true
			const api = getQHealthAPI()

			// Store results via API
			api.storeMeasurementResults(results.sessionId, results).catch(err => {
				console.error("Failed to store measurement results:", err)
			})

			// Update session status
			api.updateSessionStatus(results.sessionId, SessionStatus.COMPLETED).catch(err => {
				console.error("Failed to update session status:", err)
			})
		}
	}, [results])

	if (error && !isPolling) {
		return (
			<div className="flex w-full flex-col items-center justify-center gap-6 p-10">
				<div className="max-w-[500px] rounded-xl border border-[#fcc] bg-[#fee] px-5 py-5 text-center text-[#c33] shadow-md">
					<strong>Error:</strong> {error}
				</div>
			</div>
		)
	}

	if (isLoading || isPolling) {
		return (
			<div className="flex w-full flex-col items-center justify-center gap-6 p-10">
				<div className="text-muted-foreground px-5 py-5 text-center">
					<Spinner size={32} />
					<p className="mt-4">
						Waiting for measurement results...
						<br />
						<small>Please complete the measurement on your phone</small>
					</p>
				</div>
			</div>
		)
	}

	if (!results) {
		return null
	}

	const formattedDate = new Date(results.timestamp).toLocaleString()

	return (
		<div className="flex w-full flex-col items-center justify-center gap-6 p-10">
			<div className="mb-6 text-center">
				<h2 className="mb-2 text-[28px] font-semibold text-[#333]">Measurement Complete!</h2>
				<p className="text-base text-[#666]">Your vital signs have been measured successfully.</p>
			</div>
			<div className="relative min-h-[400px] w-full max-w-[800px]">
				<Stats vitalSigns={results.vitalSigns} />
			</div>
			<div className="mt-6 text-center text-sm text-[#999]">Measured at: {formattedDate}</div>
		</div>
	)
}

export default DesktopResults
