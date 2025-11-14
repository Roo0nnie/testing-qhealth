import { MeasurementResults, VitalSigns } from "../types"
import {
	calculateHighBloodPressureRisk,
	calculateHighFastingGlucoseRisk,
	calculateHighHbA1cRisk,
	calculateHighTotalCholesterolRisk,
	calculateLowHemoglobinRisk,
	convertASCVDRiskToCategory,
	convertASCVDRiskToLevel,
	convertSNSIndexToZone,
	convertStressLevelToString,
	convertWellnessLevelToString,
	convertZoneToString,
} from "./riskLevelCalculator"

export interface ScanResult {
	pulse_rate: number | null
	respiration_rate: number | null
	spo2: number | null
	"blood Pressure": string | null // Combined format: "110/70"
	sdnn: number | null
	rmssd: number | null
	sd1: number | null
	sd2: number | null
	mean_rri: number | null
	rri: number[] | null
	lf_hf_ratio: number | null
	stress_level: string | null // "low", "normal", "mild", "high", "veryhigh"
	stress_index: number | null
	normalized_stress_index: number | null
	wellness_index: number | null
	wellness_level: string | null // "Low", "Medium", "High"
	sns_index: number | null
	sns_zone: string | null // "low", "normal", "high"
	pns_index: number | null
	pns_zone: string | null // "low", "normal", "high"
	prq: number | null
	hemoglobin: number | null
	hemoglobin_a1c: number | null
	cardiac_workload: number | null
	mean_arterial_pressure: number | null
	pulse_pressure: number | null
	high_blood_pressure_risk: string | null // "Low", "Medium", "High"
	high_fasting_glucose_risk: string | null // "Low", "High"
	high_hemoglobin_a1c_risk: string | null // "Low", "Medium", "High"
	high_total_cholesterol_risk: string | null // "Low", "Medium", "High"
	low_hemoglobin_risk: string | null // "Low", "High"
	heart_age: number | null
	ascvd_risk: number | null
	ascvd_risk_level: string | null // "low", "medium", "high"
	pulse_rate_confidence?: number
	respiration_rate_confidence?: number
	prq_confidence?: number
}

/**
 * Transform internal VitalSigns format to API scan_result format
 */
export function transformVitalSignsToScanResult(vitalSigns: VitalSigns): ScanResult {
	// Calculate risk levels
	const highBloodPressureRisk = calculateHighBloodPressureRisk(
		vitalSigns.bloodPressure?.value || null
	)
	const highHbA1cRisk = calculateHighHbA1cRisk(vitalSigns.hemoglobinA1c?.value || null)
	const lowHemoglobinRisk = calculateLowHemoglobinRisk(vitalSigns.hemoglobin?.value || null)
	const highFastingGlucoseRisk = calculateHighFastingGlucoseRisk(
		vitalSigns.highFastingGlucoseRisk?.value as number | null
	)
	const highTotalCholesterolRisk = calculateHighTotalCholesterolRisk(
		vitalSigns.highTotalCholesterolRisk?.value as number | null
	)

	// Format blood pressure
	let bloodPressureFormatted: string | null = null
	if (vitalSigns.bloodPressure?.value) {
		const bp = vitalSigns.bloodPressure.value
		bloodPressureFormatted = `${bp.systolic}/${bp.diastolic}`
	}

	// Convert wellness level
	const wellnessLevelString = convertWellnessLevelToString(
		vitalSigns.wellnessLevel?.value as number | null
	)

	// Convert stress level
	const stressLevelString = convertStressLevelToString(vitalSigns.stressLevel?.value || null)

	// Convert zones
	const snsZoneString = vitalSigns.snsZone?.value
		? convertSNSIndexToZone(vitalSigns.snsIndex?.value as number | null) ||
		  convertZoneToString(vitalSigns.snsZone.value)
		: null
	const pnsZoneString = convertZoneToString(vitalSigns.pnsZone?.value || null)

	// Convert ASCVD risk level
	const ascvdRiskLevel = vitalSigns.ascvdRisk?.value
		? convertASCVDRiskToLevel(vitalSigns.ascvdRisk.value as number)
		: convertZoneToString(vitalSigns.ascvdRiskLevel?.value as string | null)

	// Handle RRI array
	let rriArray: number[] | null = null
	if (vitalSigns.rri?.value) {
		if (Array.isArray(vitalSigns.rri.value)) {
			// Extract numeric values from RRI array
			rriArray = vitalSigns.rri.value.map((item: any) => {
				if (typeof item === "number") {
					return item
				}
				if (item && typeof item === "object" && "value" in item) {
					return item.value
				}
				return null
			}).filter((val: any) => val !== null) as number[]
		}
	}

	// Get SpO2 value with fallback to check both 'spo2' and 'oxygenSaturation' property names
	const spo2Value = vitalSigns.spo2?.value ?? (vitalSigns as any).oxygenSaturation?.value ?? null

	return {
		pulse_rate: vitalSigns.pulseRate?.value || null,
		respiration_rate: vitalSigns.respirationRate?.value || null,
		spo2: spo2Value,
		"blood Pressure": bloodPressureFormatted,
		sdnn: vitalSigns.sdnn?.value || null,
		rmssd: vitalSigns.rmssd?.value || null,
		sd1: vitalSigns.sd1?.value || null,
		sd2: vitalSigns.sd2?.value || null,
		mean_rri: vitalSigns.meanRri?.value || null,
		rri: rriArray,
		lf_hf_ratio: vitalSigns.lfhf?.value || null,
		stress_level: stressLevelString,
		stress_index: vitalSigns.stressIndex?.value as number | null,
		normalized_stress_index: vitalSigns.normalizedStressIndex?.value || null,
		wellness_index: vitalSigns.wellnessIndex?.value || null,
		wellness_level: wellnessLevelString,
		sns_index: vitalSigns.snsIndex?.value as number | null,
		sns_zone: snsZoneString,
		pns_index: vitalSigns.pnsIndex?.value || null,
		pns_zone: pnsZoneString,
		prq: vitalSigns.prq?.value || null,
		hemoglobin: vitalSigns.hemoglobin?.value || null,
		hemoglobin_a1c: vitalSigns.hemoglobinA1c?.value || null,
		cardiac_workload: vitalSigns.cardiacWorkload?.value || null,
		mean_arterial_pressure: vitalSigns.meanArterialPressure?.value || null,
		pulse_pressure: vitalSigns.pulsePressure?.value || null,
		high_blood_pressure_risk: highBloodPressureRisk,
		high_fasting_glucose_risk: highFastingGlucoseRisk,
		high_hemoglobin_a1c_risk: highHbA1cRisk,
		high_total_cholesterol_risk: highTotalCholesterolRisk,
		low_hemoglobin_risk: lowHemoglobinRisk,
		heart_age: vitalSigns.heartAge?.value || null,
		ascvd_risk: vitalSigns.ascvdRisk?.value as number | null,
		ascvd_risk_level: ascvdRiskLevel,
		pulse_rate_confidence: vitalSigns.pulseRate?.confidenceLevel as number | undefined,
		respiration_rate_confidence: vitalSigns.respirationRate?.confidenceLevel as number | undefined,
		prq_confidence: vitalSigns.prq?.confidenceLevel as number | undefined,
	}
}

/**
 * Transform MeasurementResults to API format with scan_result
 */
export function transformMeasurementResultsToAPIFormat(
	results: MeasurementResults
): { scan_result: ScanResult } {
	return {
		scan_result: transformVitalSignsToScanResult(results.vitalSigns),
	}
}

