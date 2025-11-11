import React, { useEffect, useState } from "react"

import { useCameras, useDisableZoom } from "../hooks"
import useDeviceDetection from "../hooks/useDeviceDetection"
import useSession from "../hooks/useSession"
import BiosenseSignalMonitor from "./BiosenseSignalMonitor"
import DesktopFallback from "./DesktopFallback"
import { Spinner } from "./ui/spinner"
import { Toaster } from "./ui/sonner"

const App = () => {
	const { isDesktop } = useDeviceDetection()
	const session = useSession(isDesktop)
	const { cameras, error: cameraError, isLoading: isCameraLoading } = useCameras()
	const [cameraId, setCameraId] = useState<string>()
	const [isLicenseValid, setIsLicenseValid] = useState(false)
	const [hasTimedOut, setHasTimedOut] = useState(false)
	useDisableZoom()

	if (isDesktop && session) {
		return <DesktopFallback sessionId={session.sessionId} />
	}

	const updateLicenseStatus = (valid: boolean) => {
		setIsLicenseValid(valid)
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
			/>
			<Toaster />
		</div>
	)
}

export default App
