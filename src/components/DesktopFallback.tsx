import React from "react"

import useResultsPolling from "../hooks/useResultsPolling"
import DesktopResults from "./DesktopResults"
import QRCodeDisplay from "./QRCodeDisplay"

interface DesktopFallbackProps {
	sessionId: string
}

/**
 * Desktop fallback component
 * Shows QR code for scanning, polls for results, and displays them when received
 */
const DesktopFallback: React.FC<DesktopFallbackProps> = ({ sessionId }) => {
	const { results, isLoading, error, isPolling } = useResultsPolling(
		sessionId,
		true // Always enabled for desktop
	)

	// If results are received, show results view
	if (results) {
		return (
			<div className="flex flex-col items-center justify-center w-full h-full min-h-screen p-10 py-10 bg-background transition-colors duration-300">
				<DesktopResults
					results={results}
					isLoading={isLoading}
					error={error}
					isPolling={isPolling}
				/>
			</div>
		)
	}

	// Otherwise show QR code with polling status
	return (
		<div className="flex flex-col items-center justify-center w-full h-full min-h-screen p-10 py-10 bg-background transition-colors duration-300">
			<QRCodeDisplay sessionId={sessionId} />
			{error && (
				<div className="mt-5 px-6 py-3 bg-[#fee] border border-[#fcc] rounded-xl text-[#c33] max-w-[500px] shadow-md">
					{error}
				</div>
			)}
		</div>
	)
}

export default DesktopFallback
