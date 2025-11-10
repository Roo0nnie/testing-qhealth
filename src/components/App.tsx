import React, { useEffect, useState } from "react"
import styled from "styled-components"

import { useCameras, useDisableZoom } from "../hooks"
import useDeviceDetection from "../hooks/useDeviceDetection"
import useSession from "../hooks/useSession"
import BiosenseSignalMonitor from "./BiosenseSignalMonitor"
import DesktopFallback from "./DesktopFallback"
import { Flex } from "./shared/Flex"
import { Spinner } from "./ui/spinner"

const Container = styled(Flex)`
	height: 100%;
	width: 100%;
	position: relative;
	flex-direction: column;
	justify-content: start;
	align-items: center;
`

const LoadingContainer = styled(Flex)`
	height: 100%;
	width: 100%;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 16px;
	padding: 20px;
`

const LoadingText = styled.p`
	font-size: 16px;
	color: ${({ theme }) => theme.colors.text.primary};
	margin: 0;
	text-align: center;
`

const ErrorContainer = styled(Flex)`
	height: 100%;
	width: 100%;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: 20px;
	padding: 20px;
	text-align: center;
`

const ErrorText = styled.p`
	font-size: 16px;
	color: ${({ theme }) => theme.colors.text.primary};
	margin: 0;
	line-height: 1.5;
	max-width: 500px;
`

const ErrorTitle = styled.h2`
	font-size: 20px;
	color: ${({ theme }) => theme.colors.text.primary};
	margin: 0;
	font-weight: 600;
`

const App = () => {
	const { isDesktop } = useDeviceDetection()
	const session = useSession(isDesktop)
	const { cameras, error: cameraError, isLoading: isCameraLoading } = useCameras()
	const [cameraId, setCameraId] = useState<string>()
	const [isLicenseValid, setIsLicenseValid] = useState(false)
	const [hasTimedOut, setHasTimedOut] = useState(false)
	useDisableZoom()

	// Desktop: Show QR code fallback
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

	// Timeout handling - show error if camera setup takes too long
	useEffect(() => {
		if (isCameraLoading && !cameraError) {
			const timeout = setTimeout(() => {
				setHasTimedOut(true)
			}, 10000) // 10 second timeout

			return () => clearTimeout(timeout)
		} else if (!isCameraLoading) {
			// Reset timeout state when camera finishes loading (successfully or with error)
			setHasTimedOut(false)
		}
	}, [isCameraLoading, cameraError])

	// Show error if camera setup failed
	// Only show timeout error if we're still loading after timeout
	if (cameraError) {
		const errorMessage = cameraError

		// Check if user is on iOS Safari for specific instructions
		const isIosSafari =
			/iPad|iPhone|iPod/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS/.test(navigator.userAgent)

		let instructions = ""
		if (isIosSafari && cameraError?.includes("permission")) {
			instructions =
				"\n\nOn iPhone: Go to Settings > Safari > Camera, and make sure it's enabled for this website."
		}

		return (
			<Container>
				<ErrorContainer>
					<ErrorTitle>Camera Setup Error</ErrorTitle>
					<ErrorText>
						{errorMessage}
						{instructions}
					</ErrorText>
					<ErrorText style={{ fontSize: "14px", opacity: 0.8 }}>
						Please refresh the page after granting camera permissions.
					</ErrorText>
				</ErrorContainer>
			</Container>
		)
	}

	// Show loading indicator when camera is being set up
	if (isCameraLoading || !cameraId || cameras.length === 0) {
		return (
			<Container>
				<LoadingContainer>
					<Spinner size={32} />
					<LoadingText>Setting up camera...</LoadingText>
					{hasTimedOut && (
						<LoadingText style={{ fontSize: "14px", opacity: 0.7 }}>
							This is taking longer than usual. Please ensure camera permissions are granted.
						</LoadingText>
					)}
				</LoadingContainer>
			</Container>
		)
	}

	return (
		<Container>
			<BiosenseSignalMonitor
				showMonitor={true}
				cameraId={cameraId}
				onLicenseStatus={updateLicenseStatus}
				sessionId={session?.sessionId}
			/>
		</Container>
	)
}

export default App
