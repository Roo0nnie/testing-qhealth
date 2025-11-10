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
`

const LoadingText = styled.p`
	font-size: 16px;
	color: ${({ theme }) => theme.colors.text.primary};
	margin: 0;
`

const App = () => {
	const { isDesktop } = useDeviceDetection()
	const session = useSession(isDesktop)
	const cameras = useCameras()
	const [cameraId, setCameraId] = useState<string>()
	const [isLicenseValid, setIsLicenseValid] = useState(false)
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

	// Show loading indicator when camera is not set
	const isCameraLoading = !cameraId || cameras.length === 0

	if (isCameraLoading) {
		return (
			<Container>
				<LoadingContainer>
					<Spinner size={32} />
					<LoadingText>Setting up camera...</LoadingText>
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
