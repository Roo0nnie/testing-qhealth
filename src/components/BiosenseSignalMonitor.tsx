import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
	HealthMonitorCodes,
	isIos,
	isMobile,
	isTablet,
	SessionState,
} from "@biosensesignal/web-sdk"
import { useMediaPredicate } from "react-media-hook"

import Mask from "../assets/mask.svg"
import {
	useError,
	useLicenseKey,
	useMonitor,
	usePageVisibility,
	usePrevious,
	useTimer,
	useWarning,
} from "../hooks"
import { DEFAULT_MEASUREMENT_DURATION } from "../hooks/useLicenseDetails"
import { storeResults } from "../services/api"
import { cn } from "../lib/utils"
import { VideoReadyState } from "../types"
import { Alert } from "./alert"
import ResultsModal from "./ResultsModal"
import StartButton from "./StartButton"
import TopBar from "./TopBar"
import { Spinner } from "./ui/spinner"

interface BiosenseSignalMonitorProps {
	showMonitor: boolean
	cameraId: string
	onLicenseStatus: (valid: boolean) => void
	sessionId?: string
}

const BiosenseSignalMonitor = ({
	showMonitor,
	cameraId,
	onLicenseStatus,
	sessionId,
}: BiosenseSignalMonitorProps) => {
	if (!showMonitor) {
		return null
	}

	const video = useRef<HTMLVideoElement>(null!)
	const [isMeasurementEnabled, setIsMeasurementEnabled] = useState<boolean>(false)
	const [startMeasuring, setStartMeasuring] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [loadingTimeoutPromise, setLoadingTimeoutPromise] = useState<number>()
	const isPageVisible = usePageVisibility()
	const isMediaTablet = useMediaPredicate("(min-width: 1000px)")
	const processingTime = DEFAULT_MEASUREMENT_DURATION
	const [licenseKey] = useLicenseKey()
	const { sessionState, vitalSigns, offlineMeasurements, error, warning, info } = useMonitor(
		video as any,
		cameraId,
		processingTime,
		licenseKey || "",
		"",
		startMeasuring
	)
	const prevSessionState = usePrevious(sessionState)
	const errorMessage = useError(error)
	const warningMessage = useWarning(warning)
	const [hasSentResults, setHasSentResults] = useState(false)
	const [isResultsModalOpen, setIsResultsModalOpen] = useState(false)

	const isMeasuring = useCallback(() => sessionState === SessionState.MEASURING, [sessionState])
	const timerSeconds = useTimer(isMeasuring(), processingTime)
	const prevTimerSeconds = usePrevious(timerSeconds)

	const isVideoReady = useCallback(
		() => video.current?.readyState === VideoReadyState.HAVE_ENOUGH_DATA,
		[]
	)

	const handleButtonClick = useCallback(() => {
		setIsLoading(true)
		if (sessionState === SessionState.ACTIVE) {
			setStartMeasuring(true)
			setLoadingTimeoutPromise(window.setTimeout(() => setIsLoading(true), processingTime * 1000))
		} else if (isMeasuring()) {
			clearTimeout(loadingTimeoutPromise)
			setStartMeasuring(false)
		}
	}, [sessionState, setIsLoading, processingTime, isMeasuring, loadingTimeoutPromise])

	// Send results to API when measurement completes on mobile with session ID
	useEffect(() => {
		const sendResultsToAPI = async () => {
			if (
				!isMobile() ||
				!sessionId ||
				sessionState !== SessionState.TERMINATED ||
				prevSessionState !== SessionState.MEASURING ||
				!vitalSigns ||
				hasSentResults
			) {
				return
			}

			try {
				const result = await storeResults(sessionId, vitalSigns)
				if (result.success) {
					setHasSentResults(true)
					console.log("Results sent successfully to API")
				} else {
					console.error("Failed to send results:", result.error)
				}
			} catch (err) {
				console.error("Error sending results to API:", err)
			}
		}

		sendResultsToAPI()
	}, [sessionState, prevSessionState, sessionId, vitalSigns, hasSentResults])

	useEffect(() => {
		if (isMeasuring()) {
			setIsLoading(false)
			if (errorMessage) {
				setIsMeasurementEnabled(false)
			} else {
				setIsMeasurementEnabled(true)
			}
			if (!isPageVisible) {
				setStartMeasuring(false)
			}
		} else if (
			(sessionState === SessionState.ACTIVE || sessionState === SessionState.TERMINATED) &&
			errorMessage
		) {
			setIsMeasurementEnabled(false)
		}
		if (sessionState === SessionState.ACTIVE && prevSessionState !== sessionState) {
			setStartMeasuring(false)
			setIsLoading(false)
		}
	}, [errorMessage, sessionState, isPageVisible, isMeasuring, prevSessionState])

	useEffect(() => {
		onLicenseStatus(!(error?.code in HealthMonitorCodes))
	}, [error, onLicenseStatus])

	// Show results modal when timer reaches 0
	useEffect(() => {
		if (
			timerSeconds === 1
		) {
			setIsResultsModalOpen(true)
		}
	}, [timerSeconds, prevTimerSeconds, vitalSigns])

	const handleCloseModal = useCallback(() => {
		setIsResultsModalOpen(false)
	}, [])

	const mobile = useMemo(() => isMobile(), [])
	const desktop = useMemo(() => !isTablet() && !isMobile(), [])

	return (
		<>
			<TopBar isMeasuring={isMeasuring()} durationSeconds={processingTime} />
			<div className="flex flex-col w-full justify-start items-center flex-1 overflow-hidden pt-[60px] md:w-fit md:justify-center md:pt-0 md:h-[calc(100vh-60px)]">
				<div
					className={cn(
						"w-full flex flex-col justify-start items-center h-full overflow-hidden",
						mobile && "h-[calc(100vh-60px)]"
					)}
				>
					<div
						className={cn(
							"relative flex justify-center w-full h-full",
							"md:w-[812px]",
							"xl:w-[1016px]"
						)}
					>
						<div className="w-full h-full -z-10">
							<img
								src={Mask}
								alt=""
								className={cn(
									"absolute w-full h-full z-[1] transition-opacity duration-300",
									desktop ? "object-contain" : "object-cover",
									isVideoReady() ? "opacity-100" : "opacity-0"
								)}
							/>
							<video
								ref={video}
								id="video"
								muted={true}
								playsInline={true}
								className={cn(
									"w-full h-full object-cover scale-x-[-1] bg-background transition-opacity duration-300",
									isVideoReady() ? "opacity-100" : "opacity-0"
								)}
							/>
						</div>
						<Alert error={errorMessage} warning={isMeasuring() ? warningMessage : undefined} info={isMeasuring() ? info.message : undefined} />
						{!isVideoReady() && licenseKey && (
							<div className="absolute top-0 left-0 w-full h-full flex justify-center items-center z-[2] bg-background">
								<Spinner size={48} />
							</div>
						)}
					</div>
					{isVideoReady() && (
						<div
							className={cn(
								"absolute bottom-[70px] left-1/2 -translate-x-1/2 z-[3]",
								"flex items-center justify-center",
								"md:left-auto md:right-[60px] md:translate-x-0 md:bottom-[70px]"
							)}
						>
							<StartButton
								isLoading={isLoading}
								isMeasuring={isMeasuring()}
								onClick={handleButtonClick}
							/>
						</div>
					)}
				</div>
			</div>
			<ResultsModal
				isOpen={isResultsModalOpen}
				vitalSigns={vitalSigns || null}
				onClose={handleCloseModal}
			/>
		</>
	)
}

export default BiosenseSignalMonitor
