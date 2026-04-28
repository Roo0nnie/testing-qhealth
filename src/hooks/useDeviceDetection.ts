import { useEffect, useState } from "react"
import UAParser from "ua-parser-js"

interface DeviceDetection {
	isMobile: boolean
	isDesktop: boolean
	isTablet: boolean
}

function detect(): DeviceDetection {
	const parser = new UAParser(navigator.userAgent)
	const device = parser.getDevice()
	const os = parser.getOS()
	const uaMobile = device.type === "mobile"
	const uaTablet = device.type === "tablet"
	const osLooksMobile =
		os?.name === "Android" ||
		os?.name === "iOS" ||
		os?.name === "iPadOS" ||
		os?.name === "Windows Phone"

	const screenWidth = window.innerWidth
	const isSmallScreen = screenWidth < 768

	const detectedTablet = uaTablet
	const detectedMobile = (uaMobile || osLooksMobile) && !uaTablet
	const detectedDesktop = !detectedMobile && !detectedTablet && !isSmallScreen

	return {
		isMobile: detectedMobile,
		isDesktop: detectedDesktop,
		isTablet: detectedTablet,
	}
}

const useDeviceDetection = (): DeviceDetection => {
	const [deviceDetection, setDeviceDetection] = useState<DeviceDetection>(() => detect())

	useEffect(() => {
		const handleResize = () => setDeviceDetection(detect())
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	return deviceDetection
}

export default useDeviceDetection
