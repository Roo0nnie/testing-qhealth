import { MeasurementResults, VitalSigns } from "../types"
import {
	calculateHighBloodPressureRisk,
	calculateHighFastingGlucoseRisk,
	calculateHighHbA1cRisk,
	calculateHighTotalCholesterolRisk,
	calculateLowHemoglobinRisk,
	convertWellnessLevelToString,
	convertSNSIndexToZone,
	convertPNSIndexToZone,
	convertASCVDRiskToLevel,
} from "../utils/riskLevelCalculator"

/**
 * GALE External API Configuration
 * Reads from environment variables
 */
interface GaleAPIConfig {
	baseURL: string
	apiToken: string
	systemName: string
	publisher: string
	enabled: boolean
}

/**
 * Get GALE API configuration from environment variables
 */
function getGaleAPIConfig(): GaleAPIConfig | null {

	// @ts-ignore - process.env variables are replaced by webpack DefinePlugin or available via dotenv
	const baseURL = process.env.GALE_API_BASE_URL
	const apiToken = process.env.GALE_API_KEY
	const systemName = process.env.GALE_SCAN_SOURCE_SYSTEM_NAME || "QHealth System"
	const publisher = process.env.GALE_SCAN_SOURCE_PUBLISHER || "QHealth"
	const enabled = process.env.GALE_API_ENABLED !== "false"

	if (!baseURL || !apiToken) {
		// console.warn("⚠️ GALE API configuration missing. GALE API calls will be disabled.", {
		// 	hasBaseURL: !!baseURL,
		// 	hasapiToken: !!apiToken,
		// 	baseURL: baseURL || "MISSING",
		// 	apiTokenLength: apiToken?.length || 0
		// })
		
		// TEMPORARY FALLBACK for development/testing
		// Remove this once env vars are working properly
		// console.log("🔄 Using hardcoded fallback configuration (DEVELOPMENT ONLY)")
		return {
			baseURL: "https://dev-external-api-gale.mangobeach-5e679f1c.southeastasia.azurecontainerapps.io",
			apiToken: "4ceLQ2rfOn5YSZLYzdpn0hj5PRGV2y02tPYdsJaq_lfftV2yIUMzBae-_wswvcLITDngb9Rxhm1MEUA2WeYUSQegFE_p1aJkghMSpEWDxbGZFEUxw1sD0Eal",
			systemName: "QHealth System",
			publisher: "QHealth",
			enabled: true,
		}
	}

	const config = {
		baseURL: baseURL.replace(/\/$/, ""), // Remove trailing slash
		apiToken,
		systemName,
		publisher,
		enabled,
	}

	// console.log("✅ GALE API Configuration Loaded:", {
	// 	baseURL: config.baseURL,
	// 	hasapiToken: !!config.apiToken,
	// 	apiTokenLength: config.apiToken.length,
	// 	systemName: config.systemName,
	// 	publisher: config.publisher,
	// 	enabled: config.enabled,
	// })

	return config
}

/**
 * Transform VitalSigns to flat JSON format for GALE API
 */
function transformVitalSignsToGaleFormat(vitalSigns: VitalSigns): Record<string, any> {
	// console.log("🔄 Transforming vital signs to GALE format...")
	// console.log("📊 Incoming vital signs data:", {
	// 	keys: Object.keys(vitalSigns),
	// 	vitalSigns: vitalSigns
	// })
	
	// DEBUG: Log each vital sign's structure
	// console.log("🔍 Detailed vital signs inspection:")
	// Object.entries(vitalSigns).forEach(([key, value]) => {
	// 	console.log(`  ${key}:`, {
	// 		hasValue: value && 'value' in value,
	// 		value: value?.value,
	// 		isEnabled: value?.isEnabled,
	// 		type: typeof value?.value
	// 	})
	// })
	
	// Initialize scanResult with only the fields we want to send
	// Filtered to exclude confidence fields, rri, and other unwanted fields
	const scanResult: Record<string, any> = {
		// Risk Indicators (must be first for ASCVD calculation)
		ascvd_risk: null,
		// ascvd_risk_level: null,
		
		// Basic Vital Signs
		blood_pressure: null, // Formatted as "106/69"
		cardiac_workload: null,
		heart_rate: null,
		hemoglobin: null,
		hemoglobin_a1c: null,
		lf_hf_ratio: null,
		low_hemoglobin_risk: null,
		mean_arterial_pressure: null,
		mean_rri: null,
		normalized_stress_index: null,
		pns_index: null,
		pns_zone: null,
		prq: null,
		pulse_pressure: null,
		respiration_rate: null,
		rmssd: null,
		sd1: null,
		sd2: null,
		sdnn: null,
		sns_index: null,
		sns_zone: null,
		spo2: null,
		stress_index: null,
		stress_level: null,
		wellness_index: null,
		wellness_level: null,
		heart_age: null,
		high_blood_pressure_risk: null,
		high_fasting_glucose_risk: null,
		high_hemoglobin_a1c_risk: null,
		high_total_cholesterol_risk: null,
	}

	// Helper to extract value from VitalSign (returns null if not enabled or missing)
	// Special handling for spo2: allow value even if isEnabled is false
	const getValue = <T>(vitalSign: { value: T | null; isEnabled: boolean } | undefined, allowWithoutEnabled: boolean = false): T | null => {
		if (!vitalSign) {
			return null
		}
		// Only return value if vital sign is enabled (unless allowWithoutEnabled is true)
		if (!vitalSign.isEnabled && !allowWithoutEnabled) {
			return null
		}
		// Check if value is null, undefined, or empty
		if (vitalSign.value === null || vitalSign.value === undefined) {
			return null
		}
		return vitalSign.value
	}
	
	// Helper to extract numeric value (converts string numbers to actual numbers)
	// Optionally rounds to specified decimal places
	// Special handling for spo2: allow value even if isEnabled is false
	const getNumericValue = (vitalSign: { value: any; isEnabled: boolean } | undefined, key?: string, decimals?: number, allowWithoutEnabled: boolean = false): number | null => {
		const value = getValue(vitalSign, allowWithoutEnabled)
		if (value === null) {
			if (key) {
				// console.log(`  ${key}: null (not enabled or no value)`)
			}
			return null
		}
		
		let numericValue: number | null = null
		
		// If it's already a number, use it
		if (typeof value === 'number') {
			numericValue = value
		} else if (typeof value === 'string') {
			// If it's a string that represents a number, parse it
			const parsed = parseFloat(value)
			if (!isNaN(parsed)) {
				numericValue = parsed
			}
		}
		
		if (numericValue === null) {
			return null
		}
		
		// Round to specified decimal places if provided
		if (decimals !== undefined) {
			return parseFloat(numericValue.toFixed(decimals))
		}
		
		return numericValue
	}

	// Helper to format risk value as "Low"/"Medium"/"High" string (matching ResultsModal display)
	const getRiskValue = (vitalSign: { value: any; isEnabled: boolean } | undefined, riskKey: string, vitalSigns: VitalSigns): string | null => {
		const value = getValue(vitalSign)
		if (value === null) {
			return null
		}

		// If it's already a string and matches risk levels, return it
		if (typeof value === 'string' && ["Low", "Medium", "High"].includes(value)) {
			return value
		}

		// Calculate risk level based on the risk key
		let riskLevel: string | null = null
		switch (riskKey) {
			case "high_blood_pressure_risk":
				riskLevel = calculateHighBloodPressureRisk(vitalSigns.bloodPressure?.value || null)
				break
			case "high_hemoglobin_a1c_risk":
				riskLevel = calculateHighHbA1cRisk(vitalSigns.hemoglobinA1c?.value || null)
				break
			case "low_hemoglobin_risk":
				riskLevel = calculateLowHemoglobinRisk(vitalSigns.hemoglobin?.value || null)
				break
			case "high_fasting_glucose_risk":
				// For glucose risk, we need the actual glucose value, but we'll use the risk value if it's a number
				if (typeof value === 'number') {
					riskLevel = calculateHighFastingGlucoseRisk(value)
				}
				break
			case "high_total_cholesterol_risk":
				// For cholesterol risk, we need the actual cholesterol value, but we'll use the risk value if it's a number
				if (typeof value === 'number') {
					riskLevel = calculateHighTotalCholesterolRisk(value)
				}
				break
		}

		return riskLevel || null
	}

	// Risk Indicators (must be first)
	// Convert ASCVD risk percentage to level string ("low", "medium", "high")
	const ascvdRiskValue = getNumericValue(vitalSigns.ascvdRisk, "ascvd_risk")
	if (ascvdRiskValue !== null) {
		const level = convertASCVDRiskToLevel(ascvdRiskValue)
		scanResult.ascvd_risk = level // Set as string: "low", "medium", or "high"
	} else {
		scanResult.ascvd_risk = null
	}
	
	// Basic Vital Signs
	// Format blood pressure as "106/69" string
	const bloodPressure = getValue(vitalSigns.bloodPressure)
	if (bloodPressure && typeof bloodPressure === 'object' && 'systolic' in bloodPressure && 'diastolic' in bloodPressure) {
		const systolic = typeof bloodPressure.systolic === 'string' ? parseFloat(bloodPressure.systolic) : bloodPressure.systolic
		const diastolic = typeof bloodPressure.diastolic === 'string' ? parseFloat(bloodPressure.diastolic) : bloodPressure.diastolic
		if (!isNaN(systolic) && !isNaN(diastolic)) {
			scanResult.blood_pressure = `${systolic}/${diastolic}`
		}
	}
	
	scanResult.cardiac_workload = getNumericValue(vitalSigns.cardiacWorkload, "cardiac_workload")
	scanResult.heart_rate = getNumericValue(vitalSigns.pulseRate, "heart_rate")
	scanResult.hemoglobin = getNumericValue(vitalSigns.hemoglobin, "hemoglobin")
	// Round hemoglobin_a1c to 1 decimal place (e.g., 5.9 instead of 5.91)
	scanResult.hemoglobin_a1c = getNumericValue(vitalSigns.hemoglobinA1c, "hemoglobin_a1c", 1)
	// Round lf_hf_ratio to 1 decimal place (e.g., 1.4 instead of 1.394)
	scanResult.lf_hf_ratio = getNumericValue(vitalSigns.lfhf, "lf_hf_ratio", 1)
	scanResult.low_hemoglobin_risk = getRiskValue(vitalSigns.lowHemoglobinRisk, "low_hemoglobin_risk", vitalSigns)
	scanResult.mean_arterial_pressure = getNumericValue(vitalSigns.meanArterialPressure, "mean_arterial_pressure")
	scanResult.mean_rri = getNumericValue(vitalSigns.meanRri, "mean_rri")
	scanResult.normalized_stress_index = getNumericValue(vitalSigns.normalizedStressIndex, "normalized_stress_index")
	// Convert pns_index from number to zone string ("high", "normal", "low")
	const pnsIndexValue = getNumericValue(vitalSigns.pnsIndex, "pns_index")
	scanResult.pns_index = convertPNSIndexToZone(pnsIndexValue)
	// Convert pns_zone from number to string ("high" instead of 2)
	const pnsZoneValue = getValue(vitalSigns.pnsZone)
	if (pnsZoneValue !== null) {
		if (typeof pnsZoneValue === 'number') {
			// Convert numeric zone value directly using threshold logic
			const zone = convertPNSIndexToZone(pnsZoneValue)
			// Fallback to using pnsIndex if available
			scanResult.pns_zone = zone || convertPNSIndexToZone(pnsIndexValue) || String(pnsZoneValue)
		} else if (typeof pnsZoneValue === 'string') {
			scanResult.pns_zone = pnsZoneValue.toLowerCase()
		} else {
			scanResult.pns_zone = String(pnsZoneValue)
		}
	} else {
		scanResult.pns_zone = null
	}
	scanResult.prq = getNumericValue(vitalSigns.prq, "prq")
	scanResult.pulse_pressure = getNumericValue(vitalSigns.pulsePressure, "pulse_pressure")
	scanResult.respiration_rate = getNumericValue(vitalSigns.respirationRate, "respiration_rate")
	scanResult.rmssd = getNumericValue(vitalSigns.rmssd, "rmssd")
	scanResult.sd1 = getNumericValue(vitalSigns.sd1, "sd1")
	scanResult.sd2 = getNumericValue(vitalSigns.sd2, "sd2")
	scanResult.sdnn = getNumericValue(vitalSigns.sdnn, "sdnn")
	// Convert sns_index from number to zone string ("high", "normal", "low")
	const snsIndexValue = getNumericValue(vitalSigns.snsIndex, "sns_index")
	scanResult.sns_index = convertSNSIndexToZone(snsIndexValue)
	// Convert sns_zone from number to string ("high" instead of 2)
	const snsZoneValue = getValue(vitalSigns.snsZone)
	if (snsZoneValue !== null) {
		if (typeof snsZoneValue === 'number') {
			// Convert numeric zone value directly using threshold logic
			const zone = convertSNSIndexToZone(snsZoneValue)
			// Fallback to using snsIndex if available
			scanResult.sns_zone = zone || convertSNSIndexToZone(snsIndexValue) || String(snsZoneValue)
		} else if (typeof snsZoneValue === 'string') {
			scanResult.sns_zone = snsZoneValue.toLowerCase()
		} else {
			scanResult.sns_zone = String(snsZoneValue)
		}
	} else {
		scanResult.sns_zone = null
	}
	// Special handling for spo2: allow value even if isEnabled is false
	// Check both 'spo2' and 'oxygenSaturation' property names (SDK may use either)
	const spo2VitalSign = vitalSigns.spo2 || (vitalSigns as any).oxygenSaturation
	scanResult.spo2 = getNumericValue(spo2VitalSign, "spo2", undefined, true)
	scanResult.stress_index = getNumericValue(vitalSigns.stressIndex, "stress_index")
	scanResult.stress_level = getNumericValue(vitalSigns.stressLevel, "stress_level")
	scanResult.wellness_index = getNumericValue(vitalSigns.wellnessIndex, "wellness_index")
	// Convert wellness_level from wellnessIndex number to string ("Low", "Medium", "High")
	const wellnessIndexValue = getNumericValue(vitalSigns.wellnessIndex, "wellness_index")
	if (wellnessIndexValue !== null) {
		const level = convertWellnessLevelToString(wellnessIndexValue)
		scanResult.wellness_level = level || null
	} else {
		scanResult.wellness_level = null
	}
	scanResult.heart_age = getNumericValue(vitalSigns.heartAge, "heart_age")
	scanResult.high_blood_pressure_risk = getRiskValue(vitalSigns.highBloodPressureRisk, "high_blood_pressure_risk", vitalSigns)
	scanResult.high_fasting_glucose_risk = getRiskValue(vitalSigns.highFastingGlucoseRisk, "high_fasting_glucose_risk", vitalSigns)
	scanResult.high_hemoglobin_a1c_risk = getRiskValue(vitalSigns.highHemoglobinA1CRisk, "high_hemoglobin_a1c_risk", vitalSigns)
	scanResult.high_total_cholesterol_risk = getRiskValue(vitalSigns.highTotalCholesterolRisk, "high_total_cholesterol_risk", vitalSigns)

	// Log detailed information about what was transformed
	const enabledWithValues: string[] = []
	const disabledWithValues: string[] = []
	const missing: string[] = []

	// Check each vital sign (only the ones we're sending)
	const vitalSignChecks = [
		{ key: 'ascvdRisk', name: 'ascvd_risk' },
		// { key: 'ascvdRiskLevel', name: 'ascvd_risk_level' },
		{ key: 'bloodPressure', name: 'blood_pressure' },
		{ key: 'cardiacWorkload', name: 'cardiac_workload' },
		{ key: 'pulseRate', name: 'heart_rate' },
		{ key: 'hemoglobin', name: 'hemoglobin' },
		{ key: 'hemoglobinA1c', name: 'hemoglobin_a1c' },
		{ key: 'lfhf', name: 'lf_hf_ratio' },
		{ key: 'lowHemoglobinRisk', name: 'low_hemoglobin_risk' },
		{ key: 'meanArterialPressure', name: 'mean_arterial_pressure' },
		{ key: 'meanRri', name: 'mean_rri' },
		{ key: 'normalizedStressIndex', name: 'normalized_stress_index' },
		{ key: 'pnsIndex', name: 'pns_index' },
		{ key: 'pnsZone', name: 'pns_zone' },
		{ key: 'prq', name: 'prq' },
		{ key: 'pulsePressure', name: 'pulse_pressure' },
		{ key: 'respirationRate', name: 'respiration_rate' },
		{ key: 'rmssd', name: 'rmssd' },
		{ key: 'sd1', name: 'sd1' },
		{ key: 'sd2', name: 'sd2' },
		{ key: 'sdnn', name: 'sdnn' },
		{ key: 'snsIndex', name: 'sns_index' },
		{ key: 'snsZone', name: 'sns_zone' },
		{ key: 'spo2', name: 'spo2' },
		{ key: 'stressIndex', name: 'stress_index' },
		{ key: 'stressLevel', name: 'stress_level' },
		{ key: 'wellnessIndex', name: 'wellness_index' },
		// { key: 'wellnessLevel', name: 'wellness_level' },
		{ key: 'heartAge', name: 'heart_age' },
		{ key: 'highBloodPressureRisk', name: 'high_blood_pressure_risk' },
		{ key: 'highFastingGlucoseRisk', name: 'high_fasting_glucose_risk' },
		{ key: 'highHemoglobinA1CRisk', name: 'high_hemoglobin_a1c_risk' },
		{ key: 'highTotalCholesterolRisk', name: 'high_total_cholesterol_risk' },
	]

	vitalSignChecks.forEach(({ key, name }) => {
		const vitalSign = (vitalSigns as any)[key]
		if (!vitalSign) {
			missing.push(name)
		} else if (vitalSign.value !== null && vitalSign.value !== undefined) {
			if (vitalSign.isEnabled) {
				enabledWithValues.push(name)
			} else {
				disabledWithValues.push(`${name} (value: ${JSON.stringify(vitalSign.value)})`)
			}
		}
	})

	// Count fields with actual values (not null)
	const fieldsWithValues = Object.keys(scanResult).filter(key => scanResult[key] !== null)


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

	const config = getGaleAPIConfig()

	if (!config || !config.enabled) {
	
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

		// Validate that scan_result has at least one non-null value
		const hasAnyValue = Object.values(scanResult).some(value => value !== null)
		if (!hasAnyValue) {
		
			return { success: false, error: "No vital signs data available to send" }
		}

		// Prepare request payload
		const payload = {
			scan_source_id: results.sessionId,
			scan_source_system_name: config.systemName,
			scan_source_publisher: config.publisher,
			scan_result: scanResult,
		}

		// console.log("📦 Prepared GALE API payload:", {
		// 	scan_source_id: payload.scan_source_id,
		// 	scan_source_system_name: payload.scan_source_system_name,
		// 	scan_source_publisher: payload.scan_source_publisher,
		// 	scan_result_fields: Object.keys(payload.scan_result).length,
		// 	scan_result: payload.scan_result
		// })

		// Validate payload structure
		if (!payload.scan_source_id || !payload.scan_source_system_name || !payload.scan_source_publisher) {
			throw new Error("Required payload fields are missing")
		}

		// Make API request
		// Use sessionId as patient_Id in the endpoint
		const patient_Id = results.sessionId
		const endpoint = `${config.baseURL}/api/external/${patient_Id}/scan/rppg/save`
		// console.log("🚀 Sending POST request to GALE API...", {
		// 	endpoint,
		// 	method: "POST",
		// 	hasapiToken: !!config.apiToken,
		// 	apiTokenLength: config.apiToken.length,
		// })

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": config.apiToken,
			},
			body: JSON.stringify(payload),
		})

		// console.log("📥 Received response from GALE API:", {
		// 	status: response.status,
		// 	statusText: response.statusText,
		// 	ok: response.ok,
		// 	headers: {
		// 		contentType: response.headers.get("content-type"),
		// 	}
		// })

		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unknown error")
			// console.error("❌ GALE API request failed:", {
			// 	status: response.status,
			// 	statusText: response.statusText,
			// 	error: errorText,
			// 	sessionId: results.sessionId,
			// 	endpoint,
			// })
			throw new Error(`GALE API request failed: ${response.status} ${response.statusText} - ${errorText}`)
		}

		const responseData = await response.json().catch(() => ({}))
		
		// console.log("📄 GALE API response data:", responseData)
		
		if (responseData.success === false) {
			// console.error("❌ GALE API returned success: false", {
			// 	response: responseData,
			// 	sessionId: results.sessionId,
			// })
			throw new Error("GALE API returned success: false")
		}

		// Log the complete request format that was successfully sent
		// console.log("📤 GALE API Request Format (Successfully Sent):", JSON.stringify(payload, null, 2))

		// console.log("✅ Successfully sent results to GALE API", {
		// 	sessionId: results.sessionId,
		// 	timestamp: results.timestamp,
		// 	response: responseData,
		// })

		return { success: true }
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error"
		// console.error("❌ Failed to send results to GALE API:", {
		// 	error: errorMessage,
		// 	sessionId: results.sessionId,
		// 	timestamp: results.timestamp,
		// 	fullError: error,
		// 	stack: error instanceof Error ? error.stack : undefined,
		// })

		// Don't throw - fail silently to not block user experience
		return { success: false, error: errorMessage }
	}
}