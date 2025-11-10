import React from "react"

import { MeasurementResults } from "../types"
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
	if (error && !isPolling) {
		return (
			<div className="flex flex-col items-center justify-center gap-6 p-10 w-full">
				<div className="text-center px-5 py-5 bg-[#fee] border border-[#fcc] rounded-xl text-[#c33] max-w-[500px] shadow-md">
					<strong>Error:</strong> {error}
				</div>
			</div>
		)
	}

	if (isLoading || isPolling) {
		return (
			<div className="flex flex-col items-center justify-center gap-6 p-10 w-full">
				<div className="text-center px-5 py-5 text-muted-foreground">
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
		<div className="flex flex-col items-center justify-center gap-6 p-10 w-full">
			<div className="text-center mb-6">
				<h2 className="text-[28px] font-semibold text-[#333] mb-2">Measurement Complete!</h2>
				<p className="text-base text-[#666]">Your vital signs have been measured successfully.</p>
			</div>
			<div className="w-full max-w-[800px] relative min-h-[400px]">
				<Stats vitalSigns={results.vitalSigns} />
			</div>
			<div className="text-sm text-[#999] text-center mt-6">Measured at: {formattedDate}</div>
		</div>
	)
}

export default DesktopResults
