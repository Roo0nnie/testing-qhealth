import { MeasurementResults, VitalSigns } from "../types"

/**
 * Store measurement results in localStorage
 * For local development - in production this would use Vercel serverless functions
 */
export const storeResults = async (
	sessionId: string,
	vitalSigns: VitalSigns
): Promise<{ success: boolean; error?: string }> => {
	try {
		const data = {
			sessionId,
			vitalSigns,
			timestamp: Date.now(),
		}
		localStorage.setItem(`qhealth-session-${sessionId}`, JSON.stringify(data))
		console.log("Results stored in localStorage:", sessionId)
		return { success: true }
	} catch (error) {
		console.error("Error storing results:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}

/**
 * Retrieve measurement results from localStorage by session ID
 * For local development - in production this would use Vercel serverless functions
 */
export const getResults = async (
	sessionId: string
): Promise<{ success: boolean; data?: MeasurementResults; error?: string }> => {
	try {
		const stored = localStorage.getItem(`qhealth-session-${sessionId}`)
		
		if (!stored) {
			return {
				success: false,
				error: "Session not found",
			}
		}

		const data = JSON.parse(stored)

		// Check if session expired (older than 1 hour)
		const oneHourAgo = Date.now() - 60 * 60 * 1000
		if (data.timestamp < oneHourAgo) {
			localStorage.removeItem(`qhealth-session-${sessionId}`)
			return {
				success: false,
				error: "Session expired",
			}
		}

		return {
			success: true,
			data: {
				sessionId: data.sessionId,
				vitalSigns: data.vitalSigns,
				timestamp: data.timestamp,
			},
		}
	} catch (error) {
		console.error("Error retrieving results:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}
