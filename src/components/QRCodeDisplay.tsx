import React, { useMemo } from "react"
// @ts-ignore - qrcode.react doesn't have full TypeScript support
import { QRCodeSVG } from "qrcode.react"

interface QRCodeDisplayProps {
	sessionId: string
	mobileUrl?: string
}

/**
 * QR Code display component
 * Generates QR code with mobile URL + session ID
 * Uses current window origin if mobileUrl is not provided
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ sessionId, mobileUrl }) => {
	// Use current origin if mobileUrl not provided, fallback to default
	const baseUrl = useMemo(() => {
		if (mobileUrl) {
			return mobileUrl
		}
		if (typeof window !== "undefined") {
			return window.location.origin
		}
		return "https://testing-qhealth-lcwz2m2vf-ro0nnies-projects.vercel.app"
	}, [mobileUrl])

	const qrCodeUrl = `${baseUrl}?sessionId=${sessionId}`

	return (
		<div className="flex flex-col items-center justify-center gap-5 p-10">
			<div className="text-center max-w-[400px]">
				<h2 className="text-2xl font-semibold mb-4 text-foreground transition-colors duration-300">
					Scan with Your Phone
				</h2>
				<p className="text-base text-muted-foreground leading-relaxed mb-3 transition-colors duration-300">
					This feature requires a mobile phone camera. Please scan the QR code below with your phone
					to continue with the measurement.
				</p>
			</div>
			<div className="p-5 bg-card rounded-lg shadow-md transition-colors duration-300">
				<QRCodeSVG value={qrCodeUrl} size={256} level="M" />
			</div>
			<div className="text-xs text-muted-foreground font-mono mt-3 break-all transition-colors duration-300">
				Session ID: {sessionId}
			</div>
		</div>
	)
}

export default QRCodeDisplay
