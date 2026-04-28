import {
	FaceScanRequest,
	FaceScanResponse,
	InsightGenieAuthResponse,
} from "../types/insightGenie"

interface InsightGenieConfig {
	baseURL: string
	apiKey: string
	apiSecret: string
}

function getInsightGenieConfig(): InsightGenieConfig | null {
	// @ts-ignore - process.env values are inlined by webpack DefinePlugin
	const baseURL = process.env.INSIGHT_GENIE_BASE_URL
	// @ts-ignore
	const apiKey = process.env.INSIGHT_GENIE_API_KEY
	// @ts-ignore
	const apiSecret = process.env.INSIGHT_GENIE_API_SECRET

	if (!baseURL || !apiKey || !apiSecret) {
		return null
	}

	return {
		baseURL: baseURL.replace(/\/$/, ""),
		apiKey,
		apiSecret,
	}
}

let cachedTokenPromise: Promise<string> | null = null

export async function authenticateInstitution(): Promise<string> {
	if (cachedTokenPromise) {
		return cachedTokenPromise
	}

	const config = getInsightGenieConfig()
	if (!config) {
		throw new Error("Insight-Genie API not configured (missing env variables)")
	}

	cachedTokenPromise = (async () => {
		const response = await fetch(`${config.baseURL}/auth/authenticate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				key: config.apiKey,
				secret: config.apiSecret,
			}),
		})

		if (!response.ok) {
			cachedTokenPromise = null
			const errorText = await response.text().catch(() => "")
			throw new Error(
				`Insight-Genie auth failed: ${response.status} ${response.statusText} - ${errorText}`
			)
		}

		const data: InsightGenieAuthResponse = await response.json()
		if (!data.token) {
			cachedTokenPromise = null
			throw new Error("Insight-Genie auth response did not include a token")
		}
		return data.token
	})()

	return cachedTokenPromise
}

export async function generateVideoToken(
	request: FaceScanRequest
): Promise<FaceScanResponse> {
	const config = getInsightGenieConfig()
	if (!config) {
		throw new Error("Insight-Genie API not configured (missing env variables)")
	}

	const token = await authenticateInstitution()

	const response = await fetch(`${config.baseURL}/face-scan/generate-video-token`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(request),
	})

	if (!response.ok) {
		const errorText = await response.text().catch(() => "")
		throw new Error(
			`Insight-Genie generateVideoToken failed: ${response.status} ${response.statusText} - ${errorText}`
		)
	}

	return response.json()
}

export function createDefaultRequest(
	clientId: string,
	age?: number,
	gender?: string
): FaceScanRequest {
	const request: FaceScanRequest = {
		clientId,
		showResults: "display",
		noDesign: false,
		faceOutline: true,
		buttonBgColor: "#2d5016",
		buttonTextColor: "#ffffff",
		isVoiceAnalysisOn: false,
		forceFrontCamera: true,
		language: "en",
		showDisclaimer: true,
	}

	if (age !== undefined) request.age = age
	if (gender !== undefined) request.gender = gender

	return request
}

export function isInsightGenieConfigured(): boolean {
	return getInsightGenieConfig() !== null
}
