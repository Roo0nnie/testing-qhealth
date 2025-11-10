import { useEffect, useState } from "react"

interface UseCamerasResult {
	cameras: MediaDeviceInfo[]
	error: string | null
	isLoading: boolean
}

const useCameras = (): UseCamerasResult => {
	const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		let stream: MediaStream | null = null
		let isCancelled = false

		;(async () => {
			try {
				setIsLoading(true)
				setError(null)

				// Check if mediaDevices API is available
				if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
					throw new Error(
						"Camera access is not supported in this browser. Please use a modern browser like Safari, Chrome, or Firefox."
					)
				}

				// On iOS Safari, we must request camera permissions first
				// before enumerateDevices() will return proper device information
				try {
					// Request camera permission with a temporary stream
					stream = await navigator.mediaDevices.getUserMedia({ video: true })

					// Stop the stream immediately - we only needed it to get permission
					stream.getTracks().forEach(track => track.stop())
					stream = null

					// Check if component was unmounted
					if (isCancelled) return
				} catch (permissionError: any) {
					if (isCancelled) return

					if (permissionError.name === "NotAllowedError") {
						throw new Error(
							"Camera permission was denied. Please allow camera access in your browser settings and refresh the page."
						)
					} else if (permissionError.name === "NotFoundError") {
						throw new Error("No camera found. Please ensure a camera is connected to your device.")
					} else if (permissionError.name === "NotReadableError") {
						throw new Error(
							"Camera is being used by another application. Please close other apps using the camera and try again."
						)
					} else {
						throw new Error(
							`Failed to access camera: ${permissionError.message || "Unknown error"}. Please check your camera settings.`
						)
					}
				}

				// Now enumerate devices - this will work properly after permissions are granted
				const devices = await navigator.mediaDevices.enumerateDevices()

				if (isCancelled) return

				const videoDevices = devices.filter(device => device.kind === "videoinput")

				if (videoDevices.length === 0) {
					throw new Error(
						"No camera devices found. Please ensure a camera is connected and try again."
					)
				}

				setCameras(videoDevices)
			} catch (err: any) {
				if (isCancelled) return

				console.error("Error setting up camera:", err)
				setError(err.message || "Failed to set up camera. Please try refreshing the page.")
				setCameras([])
			} finally {
				if (!isCancelled) {
					setIsLoading(false)
				}
			}
		})()

		// Cleanup function to stop any streams if component unmounts
		return () => {
			isCancelled = true
			if (stream) {
				stream.getTracks().forEach(track => track.stop())
			}
		}
	}, [])

	return { cameras, error, isLoading }
}

export default useCameras
