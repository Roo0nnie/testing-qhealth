import React, { useCallback, useEffect, useRef } from "react"

import useInsightGenieScan from "../hooks/useInsightGenieScan"
import { sendResultsToGaleAPI } from "../services/galeExternalAPI"
import { getQHealthAPI } from "../services/qhealthClientAPI"
import { MeasurementResults } from "../types"
import { SessionStatus } from "../types/api"
import InsightGenieResults from "./InsightGenieResults"
import TopBar from "./TopBar"
import { Alert } from "./alert"
import { Spinner } from "./ui/spinner"

interface InsightGenieMonitorProps {
	showMonitor: boolean
	sessionId?: string
	onRefreshSession?: () => void
}

const InsightGenieMonitor = ({
	showMonitor,
	sessionId,
	onRefreshSession,
}: InsightGenieMonitorProps) => {
	if (!showMonitor) return null

	const hasSentResultsRef = useRef(false)
	const broadcastedStartRef = useRef(false)
	const broadcastedFailRef = useRef(false)

	const {
		iframeUrl,
		scanState,
		vitalSigns,
		displayResults,
		error,
		scanTimeRemaining,
		iframeRef,
		resetScan,
	} = useInsightGenieScan({
		autoStart: true,
		sessionId,
		age: undefined,
		gender: undefined,
	})

	const isAnalyzing = scanState === "analyzing"
	const showIframe =
		(scanState === "positioning" || scanState === "analyzing") && !!iframeUrl

	useEffect(() => {
		hasSentResultsRef.current = false
		broadcastedStartRef.current = false
		broadcastedFailRef.current = false
		resetScan()
	}, [sessionId, resetScan])

	useEffect(() => {
		if (!isAnalyzing || !sessionId || broadcastedStartRef.current) return
		broadcastedStartRef.current = true
		const api = getQHealthAPI()
		api.broadcastEvent("MEASUREMENT_STARTED", {
			sessionId,
			timestamp: Date.now(),
		})
		api.updateSessionStatus(sessionId, SessionStatus.MEASURING).catch(() => {})
	}, [isAnalyzing, sessionId])

	useEffect(() => {
		if (
			scanState !== "complete" ||
			!vitalSigns ||
			!sessionId ||
			hasSentResultsRef.current
		) {
			return
		}
		hasSentResultsRef.current = true
		const measurementResults: MeasurementResults = {
			sessionId,
			vitalSigns,
			timestamp: Date.now(),
		}
		sendResultsToGaleAPI(measurementResults).catch(() => {})
	}, [scanState, vitalSigns, sessionId])

	useEffect(() => {
		if (
			scanState !== "error" ||
			!sessionId ||
			!error ||
			broadcastedFailRef.current
		) {
			return
		}
		broadcastedFailRef.current = true
		const api = getQHealthAPI()
		api.broadcastEvent("MEASUREMENT_FAILED", {
			sessionId,
			error: error.message,
			timestamp: Date.now(),
		})
		api.updateSessionStatus(sessionId, SessionStatus.FAILED).catch(() => {})
	}, [scanState, sessionId, error])

	const handleRescan = useCallback(() => {
		hasSentResultsRef.current = false
		broadcastedStartRef.current = false
		broadcastedFailRef.current = false
		if (onRefreshSession) {
			onRefreshSession()
		} else {
			resetScan()
		}
	}, [onRefreshSession, resetScan])

	const handleRefresh = useCallback(() => {
		if (onRefreshSession) onRefreshSession()
		else resetScan()
	}, [onRefreshSession, resetScan])

	if (scanState === "complete") {
		return (
			<div className="relative flex flex-col h-full w-full">
				<InsightGenieResults
					results={displayResults}
					onRescan={handleRescan}
					onHome={onRefreshSession}
				/>
			</div>
		)
	}

	return (
		<>
			<TopBar
				isMeasuring={isAnalyzing}
				remainingSeconds={scanTimeRemaining}
				onRefresh={handleRefresh}
				isRefreshing={false}
			/>

			<div className="flex flex-col w-full flex-1 overflow-hidden pt-[60px]">
				<div className="relative flex justify-center w-full flex-1 min-h-0">
					{showIframe ? (
						<iframe
							ref={iframeRef}
							id="insight-genie-iframe"
							src={iframeUrl!}
							allow="camera; microphone; autoplay; fullscreen"
							allowFullScreen
							className="w-full h-full border-0 bg-white"
							title="Insight-Genie face scan"
						/>
					) : (
						<div className="bg-background flex h-full w-full items-center justify-center text-center px-6">
							{scanState === "error" ? (
								<div className="flex flex-col items-center gap-3 max-w-[400px]">
									<p className="text-foreground text-base font-semibold">
										Scan service unavailable
									</p>
									<p className="text-foreground text-sm opacity-80">
										{error?.message ||
											"Unable to start scan. Please try again."}
									</p>
									<button
										onClick={handleRescan}
										className="mt-3 px-6 py-3 bg-[#2d5016] text-white rounded-full font-semibold transition-all hover:bg-[#4a7c2a] active:scale-95"
									>
										Try again
									</button>
								</div>
							) : (
								<div className="flex flex-col items-center gap-3">
									<Spinner size={48} />
									<p className="text-foreground text-base">
										Preparing scan...
									</p>
								</div>
							)}
						</div>
					)}
					<Alert error={error?.message} />
				</div>
			</div>
		</>
	)
}

export default InsightGenieMonitor
