import { useCallback, useEffect, useRef, useState } from "react"

import {
	authenticateInstitution,
	createDefaultRequest,
	generateVideoToken,
} from "../services/insightGenieAPI"
import {
	extractInsightGenieResults,
	mapInsightGenieToVitalSigns,
} from "../services/insightGenieAdapter"
import { VitalSigns } from "../types"
import { HealthResult, ScanState } from "../types/insightGenie"

interface UseInsightGenieScanOptions {
	autoStart: boolean
	sessionId?: string
	age?: number
	gender?: string
}

interface UseInsightGenieScanResult {
	iframeUrl: string | null
	scanState: ScanState
	vitalSigns: VitalSigns | null
	displayResults: HealthResult[]
	error: { message: string } | null
	conditionStatus: any
	scanTimeRemaining: number | null
	iframeRef: React.MutableRefObject<HTMLIFrameElement | null>
	resetScan: () => void
}

function parseScanTimeRemaining(data: any): number | null {
	const candidates = [
		data?.scanTimeRemaining,
		data?.timeRemaining,
		data?.remainingSeconds,
		data?.seconds,
		data?.value,
	]
	for (const c of candidates) {
		if (typeof c === "number" && !isNaN(c)) return Math.max(0, Math.round(c))
		if (typeof c === "string") {
			const parsed = parseFloat(c)
			if (!isNaN(parsed)) return Math.max(0, Math.round(parsed))
		}
	}
	return null
}

const COMPLETION_INDICATOR_KEYS = [
	"vital_signs",
	"vitalSigns",
	"holistic_health",
	"holisticHealth",
	"health_risks",
	"healthRisks",
	"scores",
]

function looksLikeCompletionPayload(data: any): boolean {
	if (!data || typeof data !== "object") return false
	for (const key of COMPLETION_INDICATOR_KEYS) {
		if (data[key]) return true
	}
	const nested = data.analysisData || data.healthData || data.results || data.data
	if (nested && typeof nested === "object") {
		for (const key of COMPLETION_INDICATOR_KEYS) {
			if (nested[key]) return true
		}
	}
	return false
}

const useInsightGenieScan = ({
	autoStart,
	sessionId,
	age,
	gender,
}: UseInsightGenieScanOptions): UseInsightGenieScanResult => {
	const [iframeUrl, setIframeUrl] = useState<string | null>(null)
	const [scanState, setScanState] = useState<ScanState>("idle")
	const [vitalSigns, setVitalSigns] = useState<VitalSigns | null>(null)
	const [displayResults, setDisplayResults] = useState<HealthResult[]>([])
	const [error, setError] = useState<{ message: string } | null>(null)
	const [conditionStatus, setConditionStatus] = useState<any>(null)
	const [scanTimeRemaining, setScanTimeRemaining] = useState<number | null>(null)

	const iframeRef = useRef<HTMLIFrameElement | null>(null)
	const requestInFlightRef = useRef(false)
	const resetCounterRef = useRef(0)

	const resetScan = useCallback(() => {
		resetCounterRef.current += 1
		setIframeUrl(null)
		setScanState("idle")
		setVitalSigns(null)
		setDisplayResults([])
		setError(null)
		setConditionStatus(null)
		setScanTimeRemaining(null)
		requestInFlightRef.current = false
	}, [])

	useEffect(() => {
		if (!autoStart) return
		if (!sessionId) return
		if (requestInFlightRef.current) return
		if (scanState !== "idle") return

		requestInFlightRef.current = true
		setScanState("authenticating")
		setError(null)

		;(async () => {
			try {
				await authenticateInstitution()
				const request = createDefaultRequest(sessionId, age, gender)
				const response = await generateVideoToken(request)
				if (!response.success || !response.videoIframeUrl) {
					throw new Error("Insight-Genie did not return a videoIframeUrl")
				}
				setIframeUrl(response.videoIframeUrl)
				setScanState("positioning")
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err)
				setError({ message })
				setScanState("error")
				requestInFlightRef.current = false
			}
		})()
	}, [autoStart, sessionId, age, gender, scanState])

	useEffect(() => {
		if (scanState !== "positioning" && scanState !== "analyzing") return

		const handleMessage = (event: MessageEvent) => {
			const iframe = iframeRef.current
			if (!iframe || event.source !== iframe.contentWindow) return

			const data = event.data
			if (!data || typeof data !== "object") return

			switch (data.action) {
				case "onAnalysisStart":
					setScanState("analyzing")
					setConditionStatus({ analyzing: true })
					return

				case "conditionStatus":
					setConditionStatus({
						centered: data.faceDetected ?? data.centered ?? false,
						lighting: data.lightingGood ?? data.lighting ?? false,
						movement: data.tooMuchMovement ?? data.movement ?? false,
					})
					return

				case "scanTimeRemaining": {
					const seconds = parseScanTimeRemaining(data)
					if (seconds !== null) setScanTimeRemaining(seconds)
					return
				}

				case "onHealthAnalysisFinished":
					try {
						const mapped = mapInsightGenieToVitalSigns(data)
						const display = extractInsightGenieResults(data)
						setVitalSigns(mapped)
						setDisplayResults(display)
						setScanState("complete")
					} catch (err) {
						const message = err instanceof Error ? err.message : String(err)
						setError({ message })
						setScanState("error")
					}
					return

				case "failedToGetResults":
				case "failedToGetHealthAnalysisResult":
				case "failedToGetVoiceAnalysisResult":
				case "failedToLoadPage":
					setError({ message: data.message || `Insight-Genie reported: ${data.action}` })
					setScanState("error")
					return

				default:
					if (looksLikeCompletionPayload(data)) {
						const mapped = mapInsightGenieToVitalSigns(data)
						const display = extractInsightGenieResults(data)
						setVitalSigns(mapped)
						setDisplayResults(display)
						setScanState("complete")
					}
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [scanState])

	return {
		iframeUrl,
		scanState,
		vitalSigns,
		displayResults,
		error,
		conditionStatus,
		scanTimeRemaining,
		iframeRef,
		resetScan,
	}
}

export default useInsightGenieScan
