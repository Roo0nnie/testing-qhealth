import React, { useEffect, useState } from "react"

import { useCameras, useDisableZoom } from "../hooks"
import useDeviceDetection from "../hooks/useDeviceDetection"
import useSession from "../hooks/useSession"
import { getQHealthAPI, initializeAPIFromURL } from "../services/qhealthClientAPI"
import { SessionStatus } from "../types/api"
import BiosenseSignalMonitor from "./BiosenseSignalMonitor"
import DesktopFallback from "./DesktopFallback"
import { Spinner } from "./ui/spinner"
import { Toaster } from "./ui/sonner"

const App = () => {
	const { isDesktop } = useDeviceDetection()
	const { session, refreshSession } = useSession(isDesktop)
	const { cameras, error: cameraError, isLoading: isCameraLoading } = useCameras()
	const [cameraId, setCameraId] = useState<string>()
	const [isLicenseValid, setIsLicenseValid] = useState(false)
	const [hasTimedOut, setHasTimedOut] = useState(false)
	const [isRetryingPermission, setIsRetryingPermission] = useState(false)
	useDisableZoom()


	// Initialize QHealth Client API (only once)
	useEffect(() => {
		// Initialize API from URL parameters
		initializeAPIFromURL()
	}, [])

	// Update session info when session changes
	useEffect(() => {
		if (session) {
			const api = getQHealthAPI()
			api.setSessionInfo({
				sessionId: session.sessionId,
				status: SessionStatus.ACTIVE,
				createdAt: session.createdAt,
				measurementCount: 0,
				expiresAt: session.createdAt + 60 * 60 * 1000, // 1 hour
			})

			// Update session info in adapter
			api
				.updateSessionStatus(session.sessionId, SessionStatus.ACTIVE, {
					createdAt: session.createdAt,
					expiresAt: session.createdAt + 60 * 60 * 1000,
				})
				.catch(err => {
					console.error("Failed to update session info:", err)
				})

			// Broadcast SESSION_CREATED event
			api.broadcastEvent("SESSION_CREATED", {
				sessionId: session.sessionId,
				createdAt: session.createdAt,
			})
		}
	}, [session])

	if (isDesktop && session) {
		return <DesktopFallback sessionId={session.sessionId} />
	}

	const updateLicenseStatus = (valid: boolean) => {
		setIsLicenseValid(valid)
	}

	const handleRetryCameraPermission = async () => {
		try {
			setIsRetryingPermission(true)

			// Check if mediaDevices API is available
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				console.error("Camera access is not supported in this browser")
				// Still refresh to show the error message again
				window.location.reload()
				return
			}

			// Request camera permission
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ video: true })
				// Stop the stream immediately - we only needed it to get permission
				stream.getTracks().forEach(track => track.stop())
			} catch (permissionError: any) {
				// Permission was denied or error occurred
				// Still refresh the page to show updated state
				console.log("Permission request result:", permissionError.name)
			}

			// Refresh the page after permission request (whether granted or denied)
			// This will reload the camera setup with the new permission state
			window.location.reload()
		} catch (err) {
			console.error("Error retrying camera permission:", err)
			// Refresh anyway to reset state
			window.location.reload()
		}
	}

	useEffect(() => {
		if (!cameras?.length) return
		setCameraId(cameras[0]?.deviceId)
	}, [cameras])

	useEffect(() => {
		if (isCameraLoading && !cameraError) {
			const timeout = setTimeout(() => {
				setHasTimedOut(true)
			}, 10000) // 10 second timeout

			return () => clearTimeout(timeout)
		} else if (!isCameraLoading) {
			setHasTimedOut(false)
		}
	}, [isCameraLoading, cameraError])
	if (cameraError) {
		const errorMessage = cameraError

		const isIosSafari =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent)

		let instructions = ""
		if (isIosSafari && cameraError?.includes("permission")) {
			instructions =
				"\n\nOn iPhone: Go to Settings > Safari > Camera, and make sure it's enabled for this website."
		}

		return (
			<div className="relative flex h-full w-full flex-col items-center justify-start">
				<div className="flex h-full w-full flex-col items-center justify-center gap-5 p-5 text-center">
					<h2 className="text-foreground m-0 text-xl font-semibold">Camera Setup Error</h2>
					<p className="text-foreground m-0 max-w-[500px] text-base leading-relaxed">
						{errorMessage}
						{instructions}
					</p>
					<p className="text-foreground m-0 text-sm opacity-80">
						Please refresh the page after granting camera permissions.
					</p>
					<button
						onClick={handleRetryCameraPermission}
						disabled={isRetryingPermission}
						className="mt-2 px-6 py-3 bg-[#2d5016] text-white rounded-lg font-semibold text-base transition-all duration-300 shadow-md hover:bg-[#4a7c2a] hover:scale-105 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
					>
						{isRetryingPermission ? "Requesting Permission..." : "Allow Camera & Refresh"}
					</button>
				</div>
			</div>
		)
	}

	if (isCameraLoading || !cameraId || cameras.length === 0) {
		return (
			<div className="relative flex h-full w-full flex-col items-center justify-start">
				<div className="flex h-full w-full flex-col items-center justify-center gap-4 p-5">
					<Spinner size={32} />
					<p className="text-foreground m-0 text-center text-base">Setting up camera...</p>
					{hasTimedOut && (
						<p className="text-foreground m-0 text-sm opacity-70">
							This is taking longer than usual. Please ensure camera permissions are granted.
						</p>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden max-h-screen">
			<BiosenseSignalMonitor
				showMonitor={true}
				cameraId={cameraId}
				onLicenseStatus={updateLicenseStatus}
				sessionId={session?.sessionId}
				onRefreshSession={refreshSession}
			/>
			<Toaster />
		</div>
	)
}

export default App
