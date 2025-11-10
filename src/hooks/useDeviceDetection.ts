import { useEffect, useState } from "react"
import { isMobile, isTablet } from "@biosensesignal/web-sdk"
import UAParser from "ua-parser-js"

interface DeviceDetection {
	isMobile: boolean
	isDesktop: boolean
	isTablet: boolean
}

/**
 * Enhanced device detection hook that combines multiple detection methods
 * for reliable mobile vs desktop detection
 */
const useDeviceDetection = (): DeviceDetection => {
	const [deviceDetection, setDeviceDetection] = useState<DeviceDetection>(() => {
		// Initial detection
		const parser = new UAParser(navigator.userAgent)
		const device = parser.getDevice()
		const uaMobile = device.type === "mobile"
		const uaTablet = device.type === "tablet"

		// SDK detection
		const sdkMobile = isMobile()
		const sdkTablet = isTablet()

		// Screen size check (fallback)
		const screenWidth = window.innerWidth
		const isSmallScreen = screenWidth < 768

		// Combined logic: prioritize SDK detection, then UA parser, then screen size
		const detectedMobile = sdkMobile || (uaMobile && !uaTablet)
		const detectedTablet = sdkTablet || uaTablet
		const detectedDesktop = !detectedMobile && !detectedTablet && !isSmallScreen

		return {
			isMobile: detectedMobile,
			isDesktop: detectedDesktop,
			isTablet: detectedTablet,
		}
	})

	useEffect(() => {
		// Re-check on window resize (for responsive testing)
		const handleResize = () => {
			const parser = new UAParser(navigator.userAgent)
			const device = parser.getDevice()
			const uaMobile = device.type === "mobile"
			const uaTablet = device.type === "tablet"

			const sdkMobile = isMobile()
			const sdkTablet = isTablet()

			const screenWidth = window.innerWidth
			const isSmallScreen = screenWidth < 768

			const detectedMobile = sdkMobile || (uaMobile && !uaTablet)
			const detectedTablet = sdkTablet || uaTablet
			const detectedDesktop = !detectedMobile && !detectedTablet && !isSmallScreen

			setDeviceDetection({
				isMobile: detectedMobile,
				isDesktop: detectedDesktop,
				isTablet: detectedTablet,
			})
		}

		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	return deviceDetection
}

export default useDeviceDetection
