import { MeasurementResults, VitalSigns } from "../types"

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
	const apiToken = process.env.GALE_API_KEY
	// @ts-ignore
	const systemName = process.env.GALE_SCAN_SOURCE_SYSTEM_NAME || "QHealth System"
	// @ts-ignore
	const publisher = process.env.GALE_SCAN_SOURCE_PUBLISHER || "QHealth"
	// @ts-ignore
	const enabled = process.env.GALE_API_ENABLED !== "false" // Default to true if not set

	if (!baseURL || !apiToken) {
		console.warn("⚠️ GALE API configuration missing. GALE API calls will be disabled.", {
			hasBaseURL: !!baseURL,
			hasapiToken: !!apiToken,
			baseURL: baseURL || "MISSING",
			apiTokenLength: apiToken?.length || 0
		})
		
		// TEMPORARY FALLBACK for development/testing
		// Remove this once env vars are working properly
		console.log("🔄 Using hardcoded fallback configuration (DEVELOPMENT ONLY)")
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

	console.log("✅ GALE API Configuration Loaded:", {
		baseURL: config.baseURL,
		hasapiToken: !!config.apiToken,
		apiTokenLength: config.apiToken.length,
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
	console.log("📊 Incoming vital signs data:", {
		keys: Object.keys(vitalSigns),
		vitalSigns: vitalSigns
	})
	
	// DEBUG: Log each vital sign's structure
	console.log("🔍 Detailed vital signs inspection:")
	Object.entries(vitalSigns).forEach(([key, value]) => {
		console.log(`  ${key}:`, {
			hasValue: value && 'value' in value,
			value: value?.value,
			isEnabled: value?.isEnabled,
			type: typeof value?.value
		})
	})
	
	// Initialize scanResult with all fields set to null
	// This ensures the API always receives a consistent structure with all 31+ fields
	const scanResult: Record<string, any> = {
		// Basic Vital Signs
		pulse_rate: null,
		respiration_rate: null,
		spo2: null,
		blood_pressure_systolic: null,
		blood_pressure_diastolic: null,
		
		// HRV Metrics
		sdnn: null,
		rmssd: null,
		sd1: null,
		sd2: null,
		mean_rri: null,

		rri: null,
		lf_hf_ratio: null,
		
		// Stress & Wellness
		stress_level: null,
		stress_index: null,
		normalized_stress_index: null,

		wellness_index: null,
		wellness_level: null,
		
		// Nervous System
		sns_index: null,
		sns_zone: null,
		pns_index: null,

		pns_zone: null,
		
		// Other Metrics
		prq: null,
		hemoglobin: null,
		hemoglobin_a1c: null,
		cardiac_workload: null,
        
		mean_arterial_pressure: null,
		pulse_pressure: null,
		
		// Risk Indicators
	
		high_blood_pressure_risk: null,
		high_fasting_glucose_risk: null,
		high_hemoglobin_a1c_risk: null,
		high_total_cholesterol_risk: null,
		low_hemoglobin_risk: null,
	}

	// Helper to extract value from VitalSign (returns null if not enabled or missing)
	const getValue = <T>(vitalSign: { value: T | null; isEnabled: boolean } | undefined): T | null => {
		if (!vitalSign) {
			return null
		}
		// Only return value if vital sign is enabled
		if (!vitalSign.isEnabled) {
			return null
		}
		// Check if value is null, undefined, or empty
		if (vitalSign.value === null || vitalSign.value === undefined) {
			return null
		}
		return vitalSign.value
	}
	
	// Helper to extract numeric value (converts string numbers to actual numbers)
	const getNumericValue = (vitalSign: { value: any; isEnabled: boolean } | undefined, key?: string): number | null => {
		const value = getValue(vitalSign)
		if (value === null) {
			if (key) {
				console.log(`  ${key}: null (not enabled or no value)`)
			}
			return null
		}
		
		// If it's already a number, return it
		if (typeof value === 'number') {
			if (key) {
				console.log(`  ${key}: ${value} (number)`)
			}
			return value
		}
		
		// If it's a string that represents a number, parse it
		if (typeof value === 'string') {
			const parsed = parseFloat(value)
			if (!isNaN(parsed)) {
				if (key) {
				
				}
				return parsed
			}
		}
		
		if (key) {
		
		}
		return null
	}

	// Helper to format risk value as percentage string (e.g., 1 → "1%")
	const getRiskValue = (vitalSign: { value: any; isEnabled: boolean } | undefined, key?: string): string | null => {
		const value = getValue(vitalSign)
		if (value === null) {
			if (key) {
			
			}
			return null
		}

		// If it's already a string with %, return it
		if (typeof value === 'string' && value.includes('%')) {
			if (key) {
				
			}
			return value
		}

		// If it's a number, format it as percentage string
		if (typeof value === 'number') {
			const formatted = `${value}%`
			if (key) {
			
			}
			return formatted
		}

		// If it's a string number, parse and format
		if (typeof value === 'string') {
			const parsed = parseFloat(value)
			if (!isNaN(parsed)) {
				const formatted = `${parsed}%`
				if (key) {
				
				}
				return formatted
			}
		}

		// Default: convert to string
		const formatted = String(value)
		if (key) {
			
		}
		return formatted
	}

	scanResult.pulse_rate = getNumericValue(vitalSigns.pulseRate, "pulse_rate")
	scanResult.respiration_rate = getNumericValue(vitalSigns.respirationRate, "respiration_rate")
	scanResult.spo2 = getNumericValue(vitalSigns.spo2, "spo2")

	// FIX: Extract systolic and diastolic separately
	const bloodPressure = getValue(vitalSigns.bloodPressure)
	if (bloodPressure && typeof bloodPressure === 'object' && 'systolic' in bloodPressure && 'diastolic' in bloodPressure) {
		// Handle numeric values or string numbers
		const systolic = typeof bloodPressure.systolic === 'string' ? parseFloat(bloodPressure.systolic) : bloodPressure.systolic
		const diastolic = typeof bloodPressure.diastolic === 'string' ? parseFloat(bloodPressure.diastolic) : bloodPressure.diastolic
		scanResult.blood_pressure_systolic = isNaN(systolic) ? null : systolic
		scanResult.blood_pressure_diastolic = isNaN(diastolic) ? null : diastolic
	} else {
	}

	scanResult.sdnn = getNumericValue(vitalSigns.sdnn, "sdnn")
	scanResult.rmssd = getNumericValue(vitalSigns.rmssd, "rmssd")
	scanResult.sd1 = getNumericValue(vitalSigns.sd1, "sd1")
	scanResult.sd2 = getNumericValue(vitalSigns.sd2, "sd2")
	scanResult.mean_rri = getNumericValue(vitalSigns.meanRri, "mean_rri")
	scanResult.rri = getValue(vitalSigns.rri) // Keep as array
	if (scanResult.rri !== null) {
		
	} else {
	}
	scanResult.lf_hf_ratio = getNumericValue(vitalSigns.lfhf, "lf_hf_ratio")

	scanResult.stress_level = getNumericValue(vitalSigns.stressLevel, "stress_level")
	scanResult.stress_index = getNumericValue(vitalSigns.stressIndex, "stress_index")
	scanResult.normalized_stress_index = getNumericValue(vitalSigns.normalizedStressIndex, "normalized_stress_index")
	scanResult.wellness_index = getNumericValue(vitalSigns.wellnessIndex, "wellness_index")
	scanResult.wellness_level = getNumericValue(vitalSigns.wellnessLevel, "wellness_level")

	scanResult.sns_index = getNumericValue(vitalSigns.snsIndex, "sns_index")
	const snsZone = getValue(vitalSigns.snsZone)
	scanResult.sns_zone = snsZone

	scanResult.pns_index = getNumericValue(vitalSigns.pnsIndex, "pns_index")
	const pnsZone = getValue(vitalSigns.pnsZone)
	scanResult.pns_zone = pnsZone
	
	scanResult.prq = getNumericValue(vitalSigns.prq, "prq")
	scanResult.heart_age = getNumericValue(vitalSigns.heartAge, "heart_age")
	scanResult.hemoglobin = getNumericValue(vitalSigns.hemoglobin, "hemoglobin")
	scanResult.hemoglobin_a1c = getNumericValue(vitalSigns.hemoglobinA1c, "hemoglobin_a1c")
	scanResult.cardiac_workload = getNumericValue(vitalSigns.cardiacWorkload, "cardiac_workload")
	scanResult.mean_arterial_pressure = getNumericValue(vitalSigns.meanArterialPressure, "mean_arterial_pressure")
	scanResult.pulse_pressure = getNumericValue(vitalSigns.pulsePressure, "pulse_pressure")

	scanResult.ascvd_risk = getRiskValue(vitalSigns.ascvdRisk, "ascvd_risk")
	scanResult.ascvd_risk_level = getRiskValue(vitalSigns.ascvdRiskLevel, "ascvd_risk_level")
	scanResult.high_blood_pressure_risk = getRiskValue(vitalSigns.highBloodPressureRisk, "high_blood_pressure_risk")
	scanResult.high_fasting_glucose_risk = getRiskValue(vitalSigns.highFastingGlucoseRisk, "high_fasting_glucose_risk")
	scanResult.high_hemoglobin_a1c_risk = getRiskValue(vitalSigns.highHemoglobinA1CRisk, "high_hemoglobin_a1c_risk")
	scanResult.high_total_cholesterol_risk = getRiskValue(vitalSigns.highTotalCholesterolRisk, "high_total_cholesterol_risk")
	scanResult.low_hemoglobin_risk = getRiskValue(vitalSigns.lowHemoglobinRisk, "low_hemoglobin_risk")

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

	// Log detailed information about what was transformed
	const enabledWithValues: string[] = []
	const disabledWithValues: string[] = []
	const missing: string[] = []

	// Check each vital sign
	const vitalSignChecks = [
		{ key: 'pulseRate', name: 'pulse_rate' },
		{ key: 'respirationRate', name: 'respiration_rate' },
		{ key: 'spo2', name: 'spo2' },
		{ key: 'bloodPressure', name: 'blood_pressure' },
		{ key: 'sdnn', name: 'sdnn' },

		{ key: 'rmssd', name: 'rmssd' },
		{ key: 'sd1', name: 'sd1' },
		{ key: 'sd2', name: 'sd2' },
		{ key: 'meanRri', name: 'mean_rri' },
		{ key: 'rri', name: 'rri' },

		{ key: 'lfhf', name: 'lf_hf_ratio' },
		{ key: 'stressLevel', name: 'stress_level' },
		{ key: 'stressIndex', name: 'stress_index' },
		{ key: 'normalizedStressIndex', name: 'normalized_stress_index' },
		{ key: 'wellnessIndex', name: 'wellness_index' },

		{ key: 'wellnessLevel', name: 'wellness_level' },
		{ key: 'snsIndex', name: 'sns_index' },
		{ key: 'snsZone', name: 'sns_zone' },
		{ key: 'pnsIndex', name: 'pns_index' },
		{ key: 'pnsZone', name: 'pns_zone' },

		{ key: 'prq', name: 'prq' },
		{ key: 'hemoglobin', name: 'hemoglobin' },
		{ key: 'hemoglobinA1c', name: 'hemoglobin_a1c' },
		{ key: 'cardiacWorkload', name: 'cardiac_workload' },
		{ key: 'meanArterialPressure', name: 'mean_arterial_pressure' },

		{ key: 'pulsePressure', name: 'pulse_pressure' },
		{ key: 'highBloodPressureRisk', name: 'high_blood_pressure_risk' },
		{ key: 'highFastingGlucoseRisk', name: 'high_fasting_glucose_risk' },
		{ key: 'highHemoglobinA1CRisk', name: 'high_hemoglobin_a1c_risk' },
        
		{ key: 'highTotalCholesterolRisk', name: 'high_total_cholesterol_risk' },
		{ key: 'lowHemoglobinRisk', name: 'low_hemoglobin_risk' },
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

		console.log("📦 Prepared GALE API payload:", {
			scan_source_id: payload.scan_source_id,
			scan_source_system_name: payload.scan_source_system_name,
			scan_source_publisher: payload.scan_source_publisher,
			scan_result_fields: Object.keys(payload.scan_result).length,
			scan_result: payload.scan_result
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
			hasapiToken: !!config.apiToken,
			apiTokenLength: config.apiToken.length,
		})

		const response = await fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": config.apiToken,
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

		// Log the complete request format that was successfully sent
		console.log("📤 GALE API Request Format (Successfully Sent):", JSON.stringify(payload, null, 2))

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