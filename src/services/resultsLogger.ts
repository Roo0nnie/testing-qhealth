import { MeasurementResults } from "../types"

export interface LoggingOptions {
	enabled?: boolean
	format?: "detailed" | "summary" | "json"
}

/**
 * Logs measurement results to console in a structured, readable format
 */
export function logMeasurementResults(
	results: MeasurementResults,
	options: LoggingOptions = { enabled: true, format: "detailed" }
): void {
	if (!options.enabled) {
		return
	}

	if (options.format === "json") {
		console.log("📊 Measurement Results (JSON):", JSON.stringify(results, null, 2))
		return
	}

	// Group vital signs by category
	const categories = {
		"Basic Vital Signs": [
			{ key: "pulseRate", label: "Pulse Rate (BPM)" },
			{ key: "respirationRate", label: "Respiration Rate (RPM)" },
			{ key: "spo2", label: "SpO₂ (%)" },
			{ key: "bloodPressure", label: "Blood Pressure (mmHg)" },
		],
		"HRV Metrics": [
			{ key: "sdnn", label: "SDNN (ms)" },
			{ key: "rmssd", label: "RMSSD (ms)" },
			{ key: "sd1", label: "SD1 (ms)" },
			{ key: "sd2", label: "SD2 (ms)" },
			{ key: "meanRri", label: "Mean RRi (ms)" },
			{ key: "rri", label: "RRi Array" },
			{ key: "lfhf", label: "LF/HF Ratio" },
		],
		"Stress & Wellness": [
			{ key: "stressLevel", label: "Stress Level" },
			{ key: "stressIndex", label: "Stress Index" },
			{ key: "normalizedStressIndex", label: "Normalized Stress Index" },
			{ key: "wellnessIndex", label: "Wellness Index" },
		],
		"Nervous System": [
			{ key: "snsIndex", label: "SNS Index" },
			{ key: "snsZone", label: "SNS Zone" },
			{ key: "pnsIndex", label: "PNS Index" },
			{ key: "pnsZone", label: "PNS Zone" },
		],
		"Other Metrics": [
			{ key: "prq", label: "PRQ" },
			{ key: "heartAge", label: "Heart Age" },
			{ key: "hemoglobin", label: "Hemoglobin (g/dL)" },
			{ key: "hemoglobinA1c", label: "Hemoglobin A1c (%)" },
			{ key: "cardiacWorkload", label: "Cardiac Workload" },
			{ key: "meanArterialPressure", label: "Mean Arterial Pressure (mmHg)" },
			{ key: "pulsePressure", label: "Pulse Pressure (mmHg)" },
		],
		"Risk Indicators": [
			{ key: "ascvdRisk", label: "ASCVD Risk" },
			{ key: "highBloodPressureRisk", label: "High BP Risk" },
			{ key: "highFastingGlucoseRisk", label: "High Glucose Risk" },
			{ key: "highHemoglobinA1CRisk", label: "High HbA1c Risk" },
			{ key: "highTotalCholesterolRisk", label: "High Cholesterol Risk" },
			{ key: "lowHemoglobinRisk", label: "Low Hemoglobin Risk" },
		],
	}

	// Format value for display
	const formatValue = (value: any, key: string): string => {
		if (value === null || value === undefined) {
			return "N/A"
		}

		if (key === "bloodPressure" && value.systolic && value.diastolic) {
			return `${value.systolic}/${value.diastolic}`
		}

		if (key === "rri" && Array.isArray(value)) {
			return `${value.length} values`
		}

		return String(value)
	}

	// Main logging
	console.group("📊 Measurement Results")
	console.log("Session ID:", results.sessionId)
	console.log("Timestamp:", new Date(results.timestamp).toISOString())
	console.log("")

	if (options.format === "summary") {
		// Summary format - only enabled vital signs
		let hasAnyResults = false
		Object.entries(categories).forEach(([categoryName, items]) => {
			const enabledItems = items.filter(item => {
				const vs = results.vitalSigns[item.key as keyof typeof results.vitalSigns]
				return vs?.isEnabled
			})

			if (enabledItems.length > 0) {
				if (!hasAnyResults) {
					console.log("Enabled Vital Signs:")
					hasAnyResults = true
				}
				enabledItems.forEach(item => {
					const vs = results.vitalSigns[item.key as keyof typeof results.vitalSigns]
					if (!vs) return
					const value = formatValue(vs.value, item.key)
					const confidence =
						"confidenceLevel" in vs && vs.confidenceLevel
							? ` (confidence: ${vs.confidenceLevel})`
							: ""
					console.log(`  ${item.label}: ${value}${confidence}`)
				})
			}
		})
	} else {
		// Detailed format - all categories
		Object.entries(categories).forEach(([categoryName, items]) => {
			console.group(categoryName)
			items.forEach(item => {
				const vs = results.vitalSigns[item.key as keyof typeof results.vitalSigns]
				if (vs) {
					const value = formatValue(vs.value, item.key)
					const status = vs.isEnabled ? "✓" : "✗"
					const confidence =
						"confidenceLevel" in vs && vs.confidenceLevel
							? ` (confidence: ${vs.confidenceLevel})`
							: ""
					console.log(`${status} ${item.label}: ${value}${confidence}`)
				} else {
					console.log(`✗ ${item.label}: N/A (not available)`)
				}
			})
			console.groupEnd()
		})
	}

	console.groupEnd()
}
