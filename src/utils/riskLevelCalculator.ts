import { BloodPressureValue, VitalSigns } from "../types"

export type RiskLevel = "Low" | "Medium" | "High" | "Normal"
export type ASCVDRiskCategory = "Below 1%" | "Between 1%-30%" | "Above 30%"
export type ASCVDRiskLevel = "low" | "medium" | "high"
export type StressLevelString = "low" | "normal" | "mild" | "high" | "veryhigh"
export type ZoneString = "low" | "normal" | "high"

/**
 * Calculate High Blood Pressure Risk level
 */
export function calculateHighBloodPressureRisk(
	bloodPressure: BloodPressureValue | null
): RiskLevel | null {
	if (!bloodPressure || !bloodPressure.systolic || !bloodPressure.diastolic) {
		return null
	}

	const { systolic, diastolic } = bloodPressure

	// High: Systolic >= 140 OR Diastolic >= 95
	if (systolic >= 140 || diastolic >= 95) {
		return "High"
	}

	// Medium: Systolic 129-139 OR Diastolic 90-94
	if ((systolic >= 129 && systolic <= 139) || (diastolic >= 90 && diastolic <= 94)) {
		return "Medium"
	}

	// Low: Systolic < 129 AND Diastolic < 90
	return "Low"
}

/**
 * Calculate High HbA1c Risk level (goods)
 */
export function calculateHighHbA1cRisk(hemoglobinA1c: number | null): RiskLevel | null {
	if (hemoglobinA1c === null || hemoglobinA1c === undefined) {
		return null
	}

	if (hemoglobinA1c >= 6.5) {
		return "High"
	}
	if (hemoglobinA1c >= 6 && hemoglobinA1c < 6.4) {
		return "Medium"
	}
	return "Low"
}

/**
 * Calculate Low Hemoglobin Risk level
 */
export function calculateLowHemoglobinRisk(hemoglobin: number | null): RiskLevel | null {
	if (hemoglobin === null || hemoglobin === undefined) {
		return null
	}

	if (hemoglobin < 12.0) {
		return "High"
	}
	return "Low"
}

/**
 * Calculate High Fasting Glucose Risk level
 */
export function calculateHighFastingGlucoseRisk(glucose: number | null): RiskLevel | null {
	if (glucose === null || glucose === undefined) {
		return null
	}

	if (glucose > 100) {
		return "High"
	}
	return "Low"
}

/**
 * Calculate High Total Cholesterol Risk level
 */
export function calculateHighTotalCholesterolRisk(cholesterol: number | null): RiskLevel | null {
	if (cholesterol === null || cholesterol === undefined) {
		return null
	}

	if (cholesterol >= 240) {
		return "High"
	}
	if (cholesterol >= 201 && cholesterol <= 240) {
		return "Medium"
	}
	return "Low"
}

/**
 * Convert wellness level number to string
 * 1-4 = Low, 5-7 = Medium, 8-10 = High
 */
export function convertWellnessLevelToString(wellnessLevel: number | null): string | null {
	if (wellnessLevel === null || wellnessLevel === undefined) {
		return null
	}

	if (wellnessLevel >= 1 && wellnessLevel <= 2) {
		return "Low"
	}
	if (wellnessLevel >= 4 && wellnessLevel <= 7) {
		return "Medium"
	}
	if (wellnessLevel >= 8 && wellnessLevel <= 10) {
		return "High"
	}

	return null
}

/**
 * Convert ASCVD Risk percentage to category string
 */
export function convertASCVDRiskToCategory(ascvdRisk: number | null): ASCVDRiskCategory | null {
	if (ascvdRisk === null || ascvdRisk === undefined) {
		return null
	}

	if (ascvdRisk < 1) {
		return "Below 1%"
	}
	if (ascvdRisk >= 1 && ascvdRisk <= 30) {
		return "Between 1%-30%"
	}
	return "Above 30%"
}

/**
 * Convert ASCVD Risk percentage to level string
 * Low: Below 1%, Medium: 1%-30% (inclusive), High: Above 30%
 * Returns lowercase string for internal use (will be capitalized when sent to API)
 */
export function convertASCVDRiskToLevel(ascvdRisk: number | null): ASCVDRiskLevel | null {
	if (ascvdRisk === null || ascvdRisk === undefined) {
		return null
	}

	if (ascvdRisk < 10) {
		return "low"
	}
	if (ascvdRisk >= 10 && ascvdRisk <= 20) {
		return "medium"
	}
	return "high"
}

/**
 * Convert stress level to lowercase string
 */
export function convertStressLevelToString(stressLevel: number | string | null): StressLevelString | null {
	if (stressLevel === null || stressLevel === undefined) {
		return null
	}

	if (typeof stressLevel === "string") {
		const lower = stressLevel.toLowerCase()
		if (["low", "normal", "mild", "high", "veryhigh"].includes(lower)) {
			return lower as StressLevelString
		}
	}

	// If it's a number, we might need to map it (this depends on SDK implementation)
	// For now, return null if it's not a recognized string
	return null
}

/**
 * Convert SNS index to zone string
 * high when > 1, normal when >= -1 && <= 1, low when < -1
 */
export function convertSNSIndexToZone(snsIndex: number | null): ZoneString | null {
	if (snsIndex === null || snsIndex === undefined) {
		return null
	}

	if (snsIndex > 1) {
		return "high"
	}
	if (snsIndex >= -1 && snsIndex <= 1) {
		return "normal"
	}
	if (snsIndex < -1) {
		return "low"
	}

	return null
}

/**
 * Convert PNS index to zone string
 * high when > 1, normal when >= -1 && <= 1, low when < -1
 */
export function convertPNSIndexToZone(pnsIndex: number | null): ZoneString | null {
	if (pnsIndex === null || pnsIndex === undefined) {
		return null
	}

	if (pnsIndex > 1) {
		return "high"
	}
	if (pnsIndex >= -1 && pnsIndex <= 1) {
		return "normal"
	}
	if (pnsIndex < -1) {
		return "low"
	}

	return null
}

/**
 * Convert zone value to lowercase string
 */
export function convertZoneToString(zone: number | string | null): ZoneString | null {
	if (zone === null || zone === undefined) {
		return null
	}

	if (typeof zone === "string") {
		const lower = zone.toLowerCase()
		if (["low", "normal", "high"].includes(lower)) {
			return lower as ZoneString
		}
	}

	// If it's a number, return null (zones should be strings)
	return null
}

/**
 * Convert zone string to risk level for color mapping
 * Maps zone strings to RiskLevel format
 */
export function convertZoneToRiskLevel(zone: ZoneString | null): RiskLevel | null {
	if (zone === null || zone === undefined) {
		return null
	}

	switch (zone.toLowerCase()) {
		case "low":
			return "Low"
		case "normal":
			return "Normal"
		case "high":
			return "High"
		default:
			return null
	}
}

/**
 * Get risk level color for display
 * @param riskLevel - The risk level (Low, Medium, High, Normal)
 * @param metricKey - Optional metric key to apply metric-specific color schemes
 */
export function getRiskLevelColor(riskLevel: RiskLevel | null, metricKey?: string): string {
	if (!riskLevel) {
		return "gray"
	}

	// Apply metric-specific color schemes
	if (metricKey) {
		// SNS INDEX, SNS Zone: High=red (bad), Low=green (good), Normal=yellow
		if (metricKey === "snsIndex" || metricKey === "snsZone") {
			switch (riskLevel) {
				case "High":
					return "red"
				case "Low":
					return "green"
				case "Normal":
					return "yellow"
				default:
					return "gray"
			}
		}

		// PNS Index, PNS Zone: High=green (good), Low=red (bad), Normal=yellow
		if (metricKey === "pnsIndex" || metricKey === "pnsZone") {
			switch (riskLevel) {
				case "High":
					return "green"
				case "Low":
					return "red"
				case "Normal":
					return "yellow"
				default:
					return "gray"
			}
		}

		// High Blood Pressure Risk: High=red, Medium=green, Low=yellow
		if (metricKey === "highBloodPressureRisk") {
			switch (riskLevel) {
				case "High":
					return "red"
				case "Medium":
					return "green"
				case "Low":
					return "yellow"
				default:
					return "gray"
			}
		}

		// High Fasting Glucose Risk, Low Hemoglobin Risk: High=red, Low=green
		if (metricKey === "highFastingGlucoseRisk" || metricKey === "lowHemoglobinRisk") {
			switch (riskLevel) {
				case "High":
					return "red"
				case "Low":
					return "green"
				default:
					return "gray"
			}
		}

		// High HbA1c Risk, High Total Cholesterol Risk, ASCVD Risk, Wellness Score: High=red, Medium=green, Low=yellow
		if (
			metricKey === "highHbA1cRisk" ||
			metricKey === "highHemoglobinA1CRisk" ||
			metricKey === "highTotalCholesterolRisk" ||
			metricKey === "ascvdRisk" ||
			metricKey === "wellnessIndex"
		) {
			switch (riskLevel) {
				case "High":
					return "red"
				case "Medium":
					return "green"
				case "Low":
					return "yellow"
				default:
					return "gray"
			}
		}
	}

	// Default color scheme for metrics without specific rules
	switch (riskLevel) {
		case "Low":
			return "green"
		case "Medium":
			return "yellow"
		case "Normal":
			return "yellow"
		case "High":
			return "red"
		default:
			return "gray"
	}
}

