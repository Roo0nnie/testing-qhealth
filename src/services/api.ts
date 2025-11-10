import { MeasurementResults, VitalSigns } from "../types"

// Use relative URLs - works in both dev and production
const API_BASE_URL = ""

/**
 * Store measurement results on the server
 */
export const storeResults = async (
	sessionId: string,
	vitalSigns: VitalSigns
): Promise<{ success: boolean; error?: string }> => {
	try {
		const response = await fetch(`${API_BASE_URL}/api/store-results`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				sessionId,
				vitalSigns,
			}),
		})

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
		}

		const data = await response.json()
		return { success: data.success === true }
	} catch (error) {
		console.error("Error storing results:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}

/**
 * Retrieve measurement results by session ID
 */
export const getResults = async (
	sessionId: string
): Promise<{ success: boolean; data?: MeasurementResults; error?: string }> => {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/get-results?sessionId=${encodeURIComponent(sessionId)}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			}
		)

		if (response.status === 404) {
			return {
				success: false,
				error: "Session not found",
			}
		}

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}))
			throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
		}

		const data = await response.json()

		if (data.success && data.vitalSigns) {
			return {
				success: true,
				data: {
					sessionId: data.sessionId,
					vitalSigns: data.vitalSigns,
					timestamp: data.timestamp,
				},
			}
		}

		return {
			success: false,
			error: "Invalid response format",
		}
	} catch (error) {
		console.error("Error retrieving results:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		}
	}
}
