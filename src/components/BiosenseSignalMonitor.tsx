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
	useWarning,
} from "../hooks"
import { DEFAULT_MEASUREMENT_DURATION } from "../hooks/useLicenseDetails"
import { cn } from "../lib/utils"
import { getQHealthAPI } from "../services/qhealthClientAPI"
import { MeasurementResults, VideoReadyState } from "../types"
import { SessionStatus } from "../types/api"
import { ErrorAlert, InfoAlert, WarningAlert } from "./alert"
import StartButton from "./StartButton"
import Stats from "./Stats"
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

	const isMeasuring = useCallback(() => sessionState === SessionState.MEASURING, [sessionState])

	const isVideoReady = useCallback(
		() => video.current?.readyState === VideoReadyState.HAVE_ENOUGH_DATA,
		[]
	)

	const handleButtonClick = useCallback(() => {
		setIsLoading(true)
		if (sessionState === SessionState.ACTIVE) {
			setStartMeasuring(true)
			setLoadingTimeoutPromise(window.setTimeout(() => setIsLoading(true), processingTime * 1000))

			// Broadcast MEASUREMENT_STARTED event
			if (sessionId) {
				const api = getQHealthAPI()
				api.broadcastEvent("MEASUREMENT_STARTED", {
					sessionId,
					timestamp: Date.now(),
				})
				api.updateSessionStatus(sessionId, SessionStatus.MEASURING).catch(err => {
					console.error("Failed to update session status:", err)
				})
			}
		} else if (isMeasuring()) {
			clearTimeout(loadingTimeoutPromise)
			setStartMeasuring(false)
		}
	}, [sessionState, setIsLoading, processingTime, isMeasuring, loadingTimeoutPromise, sessionId])

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
				// Store results via QHealth API (handles storage + broadcasting)
				const api = getQHealthAPI()
				const measurementResults: MeasurementResults = {
					sessionId,
					vitalSigns,
					timestamp: Date.now(),
				}

				await api.storeMeasurementResults(sessionId, measurementResults)
				await api.updateSessionStatus(sessionId, SessionStatus.COMPLETED)
				setHasSentResults(true)
				console.log("Results stored successfully")
			} catch (err) {
				console.error("Error storing results:", err)

				// Broadcast error event
				const api = getQHealthAPI()
				api.broadcastEvent("ERROR", {
					code: "STORAGE_ERROR",
					message: err instanceof Error ? err.message : "Failed to store results",
				})
			}
		}

		sendResultsToAPI()
	}, [sessionState, prevSessionState, sessionId, vitalSigns, hasSentResults])

	useEffect(() => {
		if (isMeasuring()) {
			setIsLoading(false)
			if (errorMessage) {
				setIsMeasurementEnabled(false)
				// Broadcast MEASUREMENT_FAILED event on error
				if (sessionId) {
					const api = getQHealthAPI()
					api.broadcastEvent("MEASUREMENT_FAILED", {
						sessionId,
						error: errorMessage,
						timestamp: Date.now(),
					})
					api.updateSessionStatus(sessionId, SessionStatus.FAILED).catch(err => {
						console.error("Failed to update session status:", err)
					})
				}
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
	}, [errorMessage, sessionState, isPageVisible, isMeasuring, prevSessionState, sessionId])

	useEffect(() => {
		onLicenseStatus(!(error?.code in HealthMonitorCodes))
	}, [error, onLicenseStatus])

	const mobile = useMemo(() => isMobile(), [])
	const desktop = useMemo(() => !isTablet() && !isMobile(), [])

	return (
		<>
			<TopBar isMeasuring={isMeasuring()} durationSeconds={processingTime} />
			<div className="flex w-full flex-1 flex-col items-center justify-start md:w-fit md:justify-center">
				<div
					className={cn(
						"flex w-auto flex-col items-center justify-start",
						mobile && "my-10 mb-[60px] h-full sm:my-10 sm:mb-[60px]"
					)}
				>
					<div
						className={cn(
							"relative flex w-full justify-center",
							mobile && "h-full",
							"md:h-[609px] md:w-[812px]",
							"xl:h-[762px] xl:w-[1016px]"
						)}
					>
						<div className="-z-10 h-full w-full">
							<img
								src={Mask}
								alt=""
								className={cn(
									"absolute z-[1] h-full w-full transition-opacity duration-300",
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
									"bg-background h-full w-full scale-x-[-1] object-cover transition-opacity duration-300",
									isVideoReady() ? "opacity-100" : "opacity-0"
								)}
							/>
						</div>
						{(isMeasuring() ? !errorMessage && !warningMessage : !errorMessage) &&
							isMeasurementEnabled && <Stats vitalSigns={vitalSigns} />}
						<ErrorAlert message={errorMessage} />
						{isMeasuring() && <WarningAlert message={warningMessage} />}
						{isMeasuring() && <InfoAlert message={info.message} />}
						{!isVideoReady() && licenseKey && (
							<div className="bg-background absolute left-0 top-0 z-[2] flex h-full w-full items-center justify-center">
								<Spinner size={48} />
							</div>
						)}
					</div>
					{isVideoReady() && (
						<div
							className={cn(
								"z-[3] -mt-[30px] flex w-full flex-[2] flex-col items-center justify-start",
								"sm:mt-[50px]",
								"md:absolute md:bottom-[42%] md:right-0 md:mr-[60px] md:mt-0 md:h-auto md:w-auto md:p-0"
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
		</>
	)
}

export default BiosenseSignalMonitor
