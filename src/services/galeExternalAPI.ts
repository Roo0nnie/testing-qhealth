import { MeasurementResults, VitalSigns } from "../types"

/**
 * GALE External API Configuration
 * Reads from environment variables
 */
interface GaleAPIConfig {
	baseURL: string
	apiKey: string
	systemName: string
	publisher: string
	enabled: boolean
}

/**
 * Get GALE API configuration from environment variables
 */
function getGaleAPIConfig(): GaleAPIConfig | null {
	// Debug: Check what's available
	console.log("🔧 Environment Variables Check:", {
		// @ts-ignore
		GALE_API_BASE_URL: process.env.GALE_API_BASE_URL,
		// @ts-ignore
		GALE_API_KEY: process.env.GALE_API_KEY ? "***EXISTS***" : "MISSING",
		// @ts-ignore
		GALE_SCAN_SOURCE_SYSTEM_NAME: process.env.GALE_SCAN_SOURCE_SYSTEM_NAME,
		// @ts-ignore
		GALE_SCAN_SOURCE_PUBLISHER: process.env.GALE_SCAN_SOURCE_PUBLISHER,
		// @ts-ignore
		GALE_API_ENABLED: process.env.GALE_API_ENABLED,
		// @ts-ignore
		allEnvKeys: Object.keys(process.env || {}).filter(key => key.includes("GALE"))
	})

	// @ts-ignore - process.env variables are replaced by webpack DefinePlugin or available via dotenv
	const baseURL = process.env.GALE_API_BASE_URL
	// @ts-ignore
	const apiKey = process.env.GALE_API_KEY
	// @ts-ignore
	const systemName = process.env.GALE_SCAN_SOURCE_SYSTEM_NAME || "QHealth System"
	// @ts-ignore
	const publisher = process.env.GALE_SCAN_SOURCE_PUBLISHER || "QHealth"
	// @ts-ignore
	const enabled = process.env.GALE_API_ENABLED !== "false" // Default to true if not set

	if (!baseURL || !apiKey) {
		console.warn("⚠️ GALE API configuration missing. GALE API calls will be disabled.", {
			hasBaseURL: !!baseURL,
			hasApiKey: !!apiKey,
			baseURL: baseURL || "MISSING",
			apiKeyLength: apiKey?.length || 0
		})
		
		// TEMPORARY FALLBACK for development/testing
		// Remove this once env vars are working properly
		console.log("🔄 Using hardcoded fallback configuration (DEVELOPMENT ONLY)")
		return {
			baseURL: "https://dev-external-api-gale.mangobeach-5e679f1c.southeastasia.azurecontainerapps.io",
			apiKey: "4ceLQ2rfOn5YSZLYzdpn0hj5PRGV2y02tPYdsJaq_lfftV2yIUMzBae-_wswvcLITDngb9Rxhm1MEUA2WeYUSQegFE_p1aJkghMSpEWDxbGZFEUxw1sD0Eal",
			systemName: "QHealth System",
			publisher: "QHealth",
			enabled: true,
		}
	}

	const config = {
		baseURL: baseURL.replace(/\/$/, ""), // Remove trailing slash
		apiKey,
		systemName,
		publisher,
		enabled,
	}

	console.log("✅ GALE API Configuration Loaded:", {
		baseURL: config.baseURL,
		hasApiKey: !!config.apiKey,
		apiKeyLength: config.apiKey.length,
		systemName: config.systemName,
		publisher: config.publisher,
		enabled: config.enabled,
	})

	return config
}

/**
 * Transform VitalSigns to flat JSON format for GALE API
 */
function transformVitalSignsToGaleFormat(vitalSigns: VitalSigns): Record<string, any> {
	console.log("🔄 Transforming vital signs to GALE format...")
	const scanResult: Record<string, any> = {}

	// Helper to extract value from VitalSign
	const getValue = <T>(vitalSign: { value: T | null; isEnabled: boolean } | undefined): T | null => {
		if (!vitalSign || !vitalSign.isEnabled) {
			return null
		}
		return vitalSign.value
	}

	// Basic Vital Signs
	const pulseRate = getValue(vitalSigns.pulseRate)
	if (pulseRate !== null) scanResult.heart_rate = pulseRate

	const respirationRate = getValue(vitalSigns.respirationRate)
	if (respirationRate !== null) scanResult.respiration_rate = respirationRate

	const spo2 = getValue(vitalSigns.spo2)
	if (spo2 !== null) scanResult.spo2 = spo2

	const bloodPressure = getValue(vitalSigns.bloodPressure)
	if (bloodPressure !== null) {
		scanResult.blood_pressure_systolic = bloodPressure.systolic
		scanResult.blood_pressure_diastolic = bloodPressure.diastolic
	}

	// HRV Metrics
	const sdnn = getValue(vitalSigns.sdnn)
	if (sdnn !== null) scanResult.sdnn = sdnn

	const rmssd = getValue(vitalSigns.rmssd)
	if (rmssd !== null) scanResult.rmssd = rmssd

	const sd1 = getValue(vitalSigns.sd1)
	if (sd1 !== null) scanResult.sd1 = sd1

	const sd2 = getValue(vitalSigns.sd2)
	if (sd2 !== null) scanResult.sd2 = sd2

	const meanRri = getValue(vitalSigns.meanRri)
	if (meanRri !== null) scanResult.mean_rri = meanRri

	const rri = getValue(vitalSigns.rri)
	if (rri !== null) scanResult.rri = rri

	const lfhf = getValue(vitalSigns.lfhf)
	if (lfhf !== null) scanResult.lf_hf_ratio = lfhf

	// Stress & Wellness
	const stressLevel = getValue(vitalSigns.stressLevel)
	if (stressLevel !== null) scanResult.stress_level = stressLevel

	const stressIndex = getValue(vitalSigns.stressIndex)
	if (stressIndex !== null) scanResult.stress_index = stressIndex

	const normalizedStressIndex = getValue(vitalSigns.normalizedStressIndex)
	if (normalizedStressIndex !== null) scanResult.normalized_stress_index = normalizedStressIndex

	const wellnessIndex = getValue(vitalSigns.wellnessIndex)
	if (wellnessIndex !== null) scanResult.wellness_index = wellnessIndex

	const wellnessLevel = getValue(vitalSigns.wellnessLevel)
	if (wellnessLevel !== null) scanResult.wellness_level = wellnessLevel

	// Nervous System
	const snsIndex = getValue(vitalSigns.snsIndex)
	if (snsIndex !== null) scanResult.sns_index = snsIndex

	const snsZone = getValue(vitalSigns.snsZone)
	if (snsZone !== null) scanResult.sns_zone = snsZone

	const pnsIndex = getValue(vitalSigns.pnsIndex)
	if (pnsIndex !== null) scanResult.pns_index = pnsIndex

	const pnsZone = getValue(vitalSigns.pnsZone)
	if (pnsZone !== null) scanResult.pns_zone = pnsZone

	// Other Metrics
	const prq = getValue(vitalSigns.prq)
	if (prq !== null) scanResult.prq = prq

	const heartAge = getValue(vitalSigns.heartAge)
	if (heartAge !== null) scanResult.heart_age = heartAge

	const hemoglobin = getValue(vitalSigns.hemoglobin)
	if (hemoglobin !== null) scanResult.hemoglobin = hemoglobin

	const hemoglobinA1c = getValue(vitalSigns.hemoglobinA1c)
	if (hemoglobinA1c !== null) scanResult.hemoglobin_a1c = hemoglobinA1c

	const cardiacWorkload = getValue(vitalSigns.cardiacWorkload)
	if (cardiacWorkload !== null) scanResult.cardiac_workload = cardiacWorkload

	const meanArterialPressure = getValue(vitalSigns.meanArterialPressure)
	if (meanArterialPressure !== null) scanResult.mean_arterial_pressure = meanArterialPressure

	const pulsePressure = getValue(vitalSigns.pulsePressure)
	if (pulsePressure !== null) scanResult.pulse_pressure = pulsePressure

	// Risk Indicators
	const ascvdRisk = getValue(vitalSigns.ascvdRisk)
	if (ascvdRisk !== null) scanResult.ascvd_risk = ascvdRisk

	const ascvdRiskLevel = getValue(vitalSigns.ascvdRiskLevel)
	if (ascvdRiskLevel !== null) scanResult.ascvd_risk_level = ascvdRiskLevel

	const highBloodPressureRisk = getValue(vitalSigns.highBloodPressureRisk)
	if (highBloodPressureRisk !== null) scanResult.high_blood_pressure_risk = highBloodPressureRisk

	const highFastingGlucoseRisk = getValue(vitalSigns.highFastingGlucoseRisk)
	if (highFastingGlucoseRisk !== null) scanResult.high_fasting_glucose_risk = highFastingGlucoseRisk

	const highHemoglobinA1CRisk = getValue(vitalSigns.highHemoglobinA1CRisk)
	if (highHemoglobinA1CRisk !== null) scanResult.high_hemoglobin_a1c_risk = highHemoglobinA1CRisk

	const highTotalCholesterolRisk = getValue(vitalSigns.highTotalCholesterolRisk)
	if (highTotalCholesterolRisk !== null) scanResult.high_total_cholesterol_risk = highTotalCholesterolRisk

	const lowHemoglobinRisk = getValue(vitalSigns.lowHemoglobinRisk)
	if (lowHemoglobinRisk !== null) scanResult.low_hemoglobin_risk = lowHemoglobinRisk

	// Add confidence levels where available
	if (vitalSigns.pulseRate?.confidenceLevel !== undefined) {
		scanResult.pulse_rate_confidence = vitalSigns.pulseRate.confidenceLevel
	}
	if (vitalSigns.respirationRate?.confidenceLevel !== undefined) {
		scanResult.respiration_rate_confidence = vitalSigns.respirationRate.confidenceLevel
	}
	if (vitalSigns.sdnn?.confidenceLevel !== undefined) {
		scanResult.sdnn_confidence = vitalSigns.sdnn.confidenceLevel
	}
	if (vitalSigns.meanRri?.confidenceLevel !== undefined) {
		scanResult.mean_rri_confidence = vitalSigns.meanRri.confidenceLevel
	}
	if (vitalSigns.prq?.confidenceLevel !== undefined) {
		scanResult.prq_confidence = vitalSigns.prq.confidenceLevel
	}

	console.log("✅ Transformed scan result:", {
		totalFields: Object.keys(scanResult).length,
		fields: Object.keys(scanResult),
		sampleValues: {
			heart_rate: scanResult.heart_rate,
			respiration_rate: scanResult.respiration_rate,
			spo2: scanResult.spo2,
		}
	})

	return scanResult
}

/**
 * Send measurement results to GALE External API
 * @param results - Measurement results containing vital signs
 * @returns Promise resolving to success status
 */
export async function sendResultsToGaleAPI(
	results: MeasurementResults
): Promise<{ success: boolean; error?: string }> {
	console.log("📡 sendResultsToGaleAPI called with:", {
		hasSessionId: !!results.sessionId,
		sessionId: results.sessionId,
		hasVitalSigns: !!results.vitalSigns,
		timestamp: results.timestamp,
		vitalSignsKeys: results.vitalSigns ? Object.keys(results.vitalSigns) : []
	})

	const config = getGaleAPIConfig()

	if (!config || !config.enabled) {
		console.warn("⚠️ GALE API is disabled or not configured. Skipping API call.", {
			enabled: config?.enabled,
			hasBaseURL: !!config?.baseURL,
			hasApiKey: !!config?.apiKey,
		})
		return { success: false, error: "GALE API not configured" }
	}

	try {
		// Validate required fields
		if (!results.sessionId || results.sessionId.trim() === "") {
			throw new Error("sessionId is required but was not provided")
		}

		if (!results.vitalSigns) {
			throw new Error("vitalSigns are required but were not provided")
		}

		// Transform vital signs to GALE format
		const scanResult = transformVitalSignsToGaleFormat(results.vitalSigns)

		// Validate that scan_result is not empty
		if (Object.keys(scanResult).length === 0) {
			console.warn("⚠️ scan_result is empty - no vital signs data to send")
			return { success: false, error: "No vital signs data available to send" }
		}

		// Prepare request payload
		const payload = {
			scan_source_id: results.sessionId,
			scan_source_system_name: config.systemName,
			scan_source_publisher: config.publisher,
			scan_result: scanResult,
		}

		console.log("📦 Prepared GALE API payload:", {
			scan_source_id: payload.scan_source_id,
			scan_source_system_name: payload.scan_source_system_name,
			scan_source_publisher: payload.scan_source_publisher,
			scan_result_fields: Object.keys(payload.scan_result).length,
			scan_result_sample: {
				heart_rate: payload.scan_result.heart_rate,
				respiration_rate: payload.scan_result.respiration_rate,
			}
		})

		// Validate payload structure
		if (!payload.scan_source_id || !payload.scan_source_system_name || !payload.scan_source_publisher) {
			throw new Error("Required payload fields are missing")
		}

		// Make API request
		const endpoint = `${config.baseURL}/api/external/test_patient/scan/rppg/save`
		console.log("🚀 Sending POST request to GALE API...", {
			endpoint,
			method: "POST",
			hasApiKey: !!config.apiKey,
			apiKeyLength: config.apiKey.length,
		})

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": config.apiKey,
			},
			body: JSON.stringify(payload),
		})

		console.log("📥 Received response from GALE API:", {
			status: response.status,
			statusText: response.statusText,
			ok: response.ok,
			headers: {
				contentType: response.headers.get("content-type"),
			}
		})

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			console.error("❌ GALE API request failed:", {
				status: response.status,
				statusText: response.statusText,
				error: errorText,
				sessionId: results.sessionId,
				endpoint,
			})
			throw new Error(`GALE API request failed: ${response.status} ${response.statusText} - ${errorText}`)
		}

		const responseData = await response.json().catch(() => ({}))
		
		console.log("📄 GALE API response data:", responseData)
		
		if (responseData.success === false) {
			console.error("❌ GALE API returned success: false", {
				response: responseData,
				sessionId: results.sessionId,
			})
			throw new Error("GALE API returned success: false")
		}

		console.log("✅ Successfully sent results to GALE API", {
			sessionId: results.sessionId,
			timestamp: results.timestamp,
			response: responseData,
		})

		return { success: true }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		console.error("❌ Failed to send results to GALE API:", {
			error: errorMessage,
			sessionId: results.sessionId,
			timestamp: results.timestamp,
			fullError: error,
			stack: error instanceof Error ? error.stack : undefined,
		})

		// Don't throw - fail silently to not block user experience
		return { success: false, error: errorMessage }
	}
}