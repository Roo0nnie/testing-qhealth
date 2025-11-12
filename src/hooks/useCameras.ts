import { useEffect, useState } from "react"

interface UseCamerasResult {
	cameras: MediaDeviceInfo[]
	error: string | null
	isLoading: boolean
	requestPermission: () => Promise<boolean>
}

const useCameras = (): UseCamerasResult => {
	const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	const requestPermission = async (): Promise<boolean> => {
		try {
			setIsLoading(true)
			setError(null)

			// Request camera permission with better mobile constraints
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					facingMode: "user", // Prefer front camera on mobile
					width: { ideal: 1280 },
					height: { ideal: 720 }
				}
			})

			// Stop the stream immediately
			stream.getTracks().forEach(track => track.stop())

			// Enumerate devices after permission granted
			const devices = await navigator.mediaDevices.enumerateDevices()
			const videoDevices = devices.filter(device => device.kind === "videoinput")

			if (videoDevices.length === 0) {
				throw new Error("No camera devices found. Please ensure a camera is connected and try again.")
			}

			setCameras(videoDevices)
			setIsLoading(false)
			return true
		} catch (err: any) {
			console.error("Error requesting camera permission:", err)
			
			let errorMessage = "Failed to access camera. "
			
			if (err.name === "NotAllowedError") {
				// Check if we're on iOS Safari
				const isIosSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
					!/CriOS|FxiOS|OPiOS/.test(navigator.userAgent)
				
				errorMessage = "Camera permission was denied. "
				if (isIosSafari) {
					errorMessage += "On iPhone: Go to Settings > Safari > Camera, and enable it for this website."
				} else {
					errorMessage += "Please allow camera access in your browser settings and refresh the page."
				}
			} else if (err.name === "NotFoundError") {
				errorMessage = "No camera found. Please ensure a camera is connected to your device."
			} else if (err.name === "NotReadableError") {
				errorMessage = "Camera is being used by another application. Please close other apps using the camera and try again."
			} else if (err.name === "OverconstrainedError") {
				errorMessage = "Camera doesn't support the requested settings. Trying with default settings..."
				// Retry with minimal constraints
				try {
					const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true })
					fallbackStream.getTracks().forEach(track => track.stop())
					
					const devices = await navigator.mediaDevices.enumerateDevices()
					const videoDevices = devices.filter(device => device.kind === "videoinput")
					
					if (videoDevices.length > 0) {
						setCameras(videoDevices)
						setIsLoading(false)
						return true
					}
				} catch (fallbackErr) {
					console.error("Fallback camera request failed:", fallbackErr)
				}
			} else {
				errorMessage += err.message || "Unknown error occurred."
			}
			
			setError(errorMessage)
			setCameras([])
			setIsLoading(false)
			return false
		}
	}

	useEffect(() => {
		let isCancelled = false

		const initCamera = async () => {
			// Check if mediaDevices API is available
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				if (!isCancelled) {
					setError(
						"Camera access is not supported in this browser. Please use a modern browser like Safari, Chrome, or Firefox."
					)
					setIsLoading(false)
				}
				return
			}

			// Check current permission state (if supported)
			if (navigator.permissions) {
				try {
					const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName })
					
					if (permissionStatus.state === 'granted') {
						// Permission already granted, enumerate devices directly
						const devices = await navigator.mediaDevices.enumerateDevices()
						const videoDevices = devices.filter(device => device.kind === "videoinput")
						
						if (videoDevices.length > 0 && !isCancelled) {
							setCameras(videoDevices)
							setIsLoading(false)
							return
						}
					} else if (permissionStatus.state === 'denied') {
						// Permission explicitly denied
						if (!isCancelled) {
							const isIosSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && 
								!/CriOS|FxiOS|OPiOS/.test(navigator.userAgent)
							
							let message = "Camera permission was previously denied. "
							if (isIosSafari) {
								message += "On iPhone: Go to Settings > Safari > Camera, and enable it for this website."
							} else {
								message += "Please allow camera access in your browser settings."
							}
							
							setError(message)
							setIsLoading(false)
						}
						return
					}
				} catch (permErr) {
					// Permissions API not fully supported, continue with normal flow
					console.log("Permissions API not available:", permErr)
				}
			}

			// Request permission automatically on first load
			if (!isCancelled) {
				await requestPermission()
			}
		}

		initCamera()

		return () => {
			isCancelled = true
		}
	}, [])

	return { cameras, error, isLoading, requestPermission }
}

export default useCameras