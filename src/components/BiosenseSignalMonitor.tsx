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
	import { cn } from "../lib/utils"
	import ResultsModal from "./ResultsModal"
	import { Alert } from "./alert"
	import { getQHealthAPI } from "../services/qhealthClientAPI"
	import { sendResultsToGaleAPI } from "../services/galeExternalAPI"
	import { MeasurementResults, VideoReadyState } from "../types"
	import { SessionStatus } from "../types/api"
	import StartButton from "./StartButton"
	import TopBar from "./TopBar"
	import { Spinner } from "./ui/spinner"

	interface BiosenseSignalMonitorProps {
		showMonitor: boolean
		cameraId: string
		onLicenseStatus: (valid: boolean) => void
		sessionId?: string
		onRefreshSession?: () => void
	}

	const BiosenseSignalMonitor = ({
		showMonitor,
		cameraId,
		onLicenseStatus,
		sessionId,
		onRefreshSession,
	}: BiosenseSignalMonitorProps) => {
		if (!showMonitor) {
			return null
		}

	const video = useRef<HTMLVideoElement>(null!)
	const [isMeasurementEnabled, setIsMeasurementEnabled] = useState<boolean>(false)
	const [startMeasuring, setStartMeasuring] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(false)
	const [loadingTimeoutPromise, setLoadingTimeoutPromise] = useState<number>()
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
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
	const vitalSignsRef = useRef(vitalSigns)

	// Keep ref updated with latest vitalSigns
	useEffect(() => {
		vitalSignsRef.current = vitalSigns
	}, [vitalSigns])

	// Reset hasSentResults when sessionId changes
	useEffect(() => {
		setHasSentResults(false)
		setIsResultsModalOpen(false)
		setIsRefreshing(false)
	}, [sessionId])

	const isMeasuring = useCallback(() => sessionState === SessionState.MEASURING, [sessionState])
	const timerSeconds = useTimer(isMeasuring(), processingTime)

	// Function to check if vital signs data is complete (has at least minimum required values)
	const isVitalSignsDataComplete = useCallback((vitalSigns: any, minimumValues: number = 4): boolean => {
		if (!vitalSigns) {
			return false
		}

		let valueCount = 0

		// Count vital signs that have non-null values and are enabled
		Object.values(vitalSigns).forEach((vitalSign: any) => {
			if (vitalSign && vitalSign.isEnabled) {
				// Check if value exists and is not null/undefined
				if (vitalSign.value !== null && vitalSign.value !== undefined) {
					// For blood pressure, check if it's an object with systolic/diastolic
					if (typeof vitalSign.value === 'object' && !Array.isArray(vitalSign.value)) {
						if (vitalSign.value.systolic !== null && vitalSign.value.systolic !== undefined &&
							vitalSign.value.diastolic !== null && vitalSign.value.diastolic !== undefined) {
							valueCount++
						}
					} else {
						valueCount++
					}
				}
			}
		})

		const isComplete = valueCount >= minimumValues
		
		return isComplete
	}, [])

		const isVideoReady = useCallback(
			() => video.current?.readyState === VideoReadyState.HAVE_ENOUGH_DATA,
			[]
		)

		const handleButtonClick = useCallback(() => {
			setIsLoading(true)
			if (sessionState === SessionState.ACTIVE) {
				setStartMeasuring(true)
				setHasSentResults(false)
				setLoadingTimeoutPromise(window.setTimeout(() => setIsLoading(true), processingTime * 1000))

				if (sessionId) {
					const api = getQHealthAPI()
					api.broadcastEvent("MEASUREMENT_STARTED", {
						sessionId,
						timestamp: Date.now(),
					})
					api.updateSessionStatus(sessionId, SessionStatus.MEASURING).catch(err => {
					})
				}
			} else if (isMeasuring()) {
				clearTimeout(loadingTimeoutPromise)
				setStartMeasuring(false)
			}
		}, [sessionState, setIsLoading, processingTime, isMeasuring, loadingTimeoutPromise, sessionId])

	useEffect(() => {
		if (timerSeconds === 1 && vitalSigns && sessionId && !hasSentResults) {
			
			// Show results modal immediately
			setIsResultsModalOpen(true)
			
			const waitForDataAndSend = async () => {
				const MAX_WAIT_TIME = 10000
				const CHECK_INTERVAL = 200 
				const MINIMUM_VALUES = 4 
				const startTime = Date.now()

				while (true) {
					const currentVitalSigns = vitalSignsRef.current
					if (isVitalSignsDataComplete(currentVitalSigns, MINIMUM_VALUES)) {
						break
					}

					// Check timeout
					if (Date.now() - startTime > MAX_WAIT_TIME) {
						break
					}

					await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL))
				}

				const finalVitalSigns = vitalSignsRef.current
				try {
					const measurementResults: MeasurementResults = {
						sessionId,
						vitalSigns: finalVitalSigns,
						timestamp: Date.now(),
					}

					setHasSentResults(true)

					await sendResultsToGaleAPI(measurementResults)
					
		
				} catch (err) {
				}
			}

			waitForDataAndSend()
		}
	}, [timerSeconds, vitalSigns, sessionId, hasSentResults, isVitalSignsDataComplete])

		useEffect(() => {
			if (isMeasuring()) {
				setIsLoading(false)
				if (errorMessage) {
					setIsMeasurementEnabled(false)
					if (sessionId) {
						const api = getQHealthAPI()
						api.broadcastEvent("MEASUREMENT_FAILED", {
							sessionId,
							error: errorMessage,
							timestamp: Date.now(),
						})
						api.updateSessionStatus(sessionId, SessionStatus.FAILED).catch(err => {
							// console.error("Failed to update session status:", err)
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

	const handleCloseModal = useCallback(() => {
		setIsResultsModalOpen(false)
		// Refresh session after modal is closed
		if (onRefreshSession) {
			onRefreshSession()
		}
	}, [onRefreshSession])

	const handleRefresh = useCallback(() => {
		if (onRefreshSession) {
			setIsRefreshing(true)
			onRefreshSession()
			// Reset refreshing state after a short delay to allow UI update
			// The state will also reset when sessionId changes
			setTimeout(() => {
				setIsRefreshing(false)
			}, 500)
		}
	}, [onRefreshSession])

		const mobile = useMemo(() => isMobile(), [])
		const desktop = useMemo(() => !isTablet() && !isMobile(), [])

		return (
			<>
			<TopBar 
				isMeasuring={isMeasuring()} 
				durationSeconds={processingTime} 
				onRefresh={handleRefresh}
				isRefreshing={isRefreshing}
			/>

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
							<Alert error={errorMessage} warning={isMeasuring() ? warningMessage : undefined} info={isMeasuring() ? info.message : undefined} />
							{!isVideoReady() && licenseKey && (
								<div className="bg-background absolute left-0 top-0 z-[2] flex h-full w-full items-center justify-center">
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