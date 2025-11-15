import React, { useMemo, useState } from "react"

import { VitalSigns } from "../types"
import { cn } from "../lib/utils"
import StatsBox from "./StatsBox"
import CategorySection from "./CategorySection"
import VitalSignInfoModal from "./VitalSignInfoModal"
import { getVitalSignInfo, getAllCategories } from "../data/vitalSignInfo"
import {
	calculateHighBloodPressureRisk,
	calculateHighFastingGlucoseRisk,
	calculateHighHbA1cRisk,
	calculateHighTotalCholesterolRisk,
	calculateLowHemoglobinRisk,
	convertWellnessLevelToString,
	convertStressLevelToString,
	convertSNSIndexToZone,
	convertPNSIndexToZone,
	convertZoneToString,
	convertZoneToRiskLevel,
	convertASCVDRiskToLevel,
	type RiskLevel,
	type ZoneString,
} from "../utils/riskLevelCalculator"

const Wrapper = ({
	isMobile = false,
	children,
	className,
}: {
	isMobile?: boolean
	children: React.ReactNode
	className?: string
}) => {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center min-h-[80px] bg-[rgba(255,255,255,0.95)] rounded-[3px] p-5 box-border transition-colors duration-300 w-full",
				isMobile
					? "relative overflow-visible"
					: "absolute max-h-[400px] overflow-y-auto bottom-[30px]",
				"md:max-h-[500px] md:p-6",
				className
			)}
		>
			{children}
		</div>
	)
}

interface IStats {
	/**
	 *  Object - contains health stats info
	 */
	vitalSigns: VitalSigns
	/**
	 *  Whether this is displayed in mobile results section (below button)
	 */
	isMobile?: boolean
}

// Helper function to format different value types matching API format
const formatValue = (value: any, type: string, vitalSignKey: string, vitalSigns: VitalSigns): string => {
	if (value === null || value === undefined) {
		return "--"
	}

	switch (type) {
		case "bloodPressure":
			if (value?.systolic && value?.diastolic) {
				return `${value.systolic}/${value.diastolic}`
			}
			return "--"
		case "rriArray":
			if (Array.isArray(value) && value.length > 0) {
				return `${value.length}`
			}
			return "--"
		case "percentage":
			return typeof value === "number" ? `${value.toFixed(1)}%` : String(value)
		case "risk":
			// Risk indicators should show text labels, not percentages
			if (typeof value === "string") {
				return value
			}
			if (typeof value === "number") {
				// Calculate risk level based on the value
				return calculateRiskLabel(vitalSignKey, value, vitalSigns)
			}
			return String(value)
		case "zone":
			// Zones should be lowercase strings
			if (typeof value === "string") {
				return value.toLowerCase()
			}
			// Convert numeric zone values to zone strings using threshold logic
			if (typeof value === "number") {
				// Convert SNS zone using SNS index if available
				if (vitalSignKey === "snsZone") {
					if (vitalSigns.snsIndex?.value) {
						const zone = convertSNSIndexToZone(vitalSigns.snsIndex.value as number)
						if (zone) return zone
					}
					// If no index available, convert the numeric zone value directly
					const zone = convertSNSIndexToZone(value)
					return zone || String(value)
				}
				// Convert PNS zone using PNS index if available
				if (vitalSignKey === "pnsZone") {
					if (vitalSigns.pnsIndex?.value) {
						const zone = convertPNSIndexToZone(vitalSigns.pnsIndex.value as number)
						if (zone) return zone
					}
					// If no index available, convert the numeric zone value directly
					const zone = convertPNSIndexToZone(value)
					return zone || String(value)
				}
			}
			return String(value)
		case "wellnessIndex":
			// Convert wellness index number to string ("Low", "Medium", "High")
			if (typeof value === "number") {
				const level = convertWellnessLevelToString(value)
				return level || String(value)
			}
			return String(value)
		case "stressLevel":
			// Convert stress level to lowercase string
			if (typeof value === "string") {
				return value.toLowerCase()
			}
			const stressLevel = convertStressLevelToString(value)
			return stressLevel || String(value)
		case "snsIndex":
			// Convert SNS index number to zone string
			if (typeof value === "number") {
				const zone = convertSNSIndexToZone(value)
				return zone || String(value)
			}
			return String(value)
		case "pnsIndex":
			// Convert PNS index number to zone string
			if (typeof value === "number") {
				const zone = convertPNSIndexToZone(value)
				return zone || String(value)
			}
			return String(value)
		case "number":
		default:
			if (typeof value === "number") {
				// Format to 1 decimal place for doubles
				return value % 1 === 0 ? String(value) : value.toFixed(1)
			}
			return String(value)
	}
}

// Calculate risk label for risk indicators
function calculateRiskLabel(key: string, value: number | string, vitalSigns: VitalSigns): string {
	switch (key) {
		case "highBloodPressureRisk":
			const bpRisk = calculateHighBloodPressureRisk(vitalSigns.bloodPressure?.value || null)
			return bpRisk || String(value)
		case "highHbA1cRisk":
		case "highHemoglobinA1CRisk":
			const hba1cRisk = calculateHighHbA1cRisk(vitalSigns.hemoglobinA1c?.value || null)
			return hba1cRisk || String(value)
		case "lowHemoglobinRisk":
			const hbRisk = calculateLowHemoglobinRisk(vitalSigns.hemoglobin?.value || null)
			return hbRisk || String(value)
		case "highFastingGlucoseRisk":
			const glucoseRisk = calculateHighFastingGlucoseRisk(value as number)
			return glucoseRisk || String(value)
		case "highTotalCholesterolRisk":
			const cholRisk = calculateHighTotalCholesterolRisk(value as number)
			return cholRisk || String(value)
		default:
			return String(value)
	}
}

// Get risk level for a vital sign
function getRiskLevel(key: string, vitalSigns: VitalSigns): RiskLevel | null {
	switch (key) {
		case "highBloodPressureRisk":
			return calculateHighBloodPressureRisk(vitalSigns.bloodPressure?.value || null)
		case "highHbA1cRisk":
		case "highHemoglobinA1CRisk":
			return calculateHighHbA1cRisk(vitalSigns.hemoglobinA1c?.value || null)
		case "lowHemoglobinRisk":
			return calculateLowHemoglobinRisk(vitalSigns.hemoglobin?.value || null)
		case "highFastingGlucoseRisk":
			return calculateHighFastingGlucoseRisk(
				vitalSigns.highFastingGlucoseRisk?.value as number | null
			)
		case "highTotalCholesterolRisk":
			return calculateHighTotalCholesterolRisk(
				vitalSigns.highTotalCholesterolRisk?.value as number | null
			)
		case "wellnessIndex":
			// Convert wellness index to level string
			const wellnessValue = vitalSigns.wellnessIndex?.value as number | null
			if (wellnessValue !== null && wellnessValue !== undefined) {
				const level = convertWellnessLevelToString(wellnessValue)
				return (level as RiskLevel) || null
			}
			return null
		case "ascvdRisk":
			const ascvdRisk = vitalSigns.ascvdRisk?.value as number | null
			if (ascvdRisk !== null && ascvdRisk !== undefined) {
				const level = convertASCVDRiskToLevel(ascvdRisk)
				if (level) {
					return (level.charAt(0).toUpperCase() + level.slice(1) as RiskLevel) || null
				}
			}
			return null
		case "snsIndex":
			// Convert SNS index to zone, then to risk level
			const snsIndexValue = vitalSigns.snsIndex?.value as number | null
			if (snsIndexValue !== null && snsIndexValue !== undefined) {
				const zone = convertSNSIndexToZone(snsIndexValue)
				return convertZoneToRiskLevel(zone)
			}
			return null
		case "snsZone":
			// Get zone string from snsZone value or convert from snsIndex
			const snsZoneValue = vitalSigns.snsZone?.value
			let snsZone: ZoneString | null = null
			if (typeof snsZoneValue === "string") {
				snsZone = convertZoneToString(snsZoneValue)
			} else if (typeof snsZoneValue === "number") {
				// Convert numeric zone value using threshold logic
				snsZone = convertSNSIndexToZone(snsZoneValue)
			} else if (vitalSigns.snsIndex?.value) {
				// Fallback to converting from index
				snsZone = convertSNSIndexToZone(vitalSigns.snsIndex.value as number)
			}
			return convertZoneToRiskLevel(snsZone)
		case "pnsIndex":
			// Convert PNS index to zone, then to risk level
			const pnsIndexValue = vitalSigns.pnsIndex?.value as number | null
			if (pnsIndexValue !== null && pnsIndexValue !== undefined) {
				const zone = convertPNSIndexToZone(pnsIndexValue)
				return convertZoneToRiskLevel(zone)
			}
			return null
		case "pnsZone":
			// Get zone string from pnsZone value or convert from pnsIndex
			const pnsZoneValue = vitalSigns.pnsZone?.value
			let pnsZone: ZoneString | null = null
			if (typeof pnsZoneValue === "string") {
				pnsZone = convertZoneToString(pnsZoneValue)
			} else if (typeof pnsZoneValue === "number") {
				// Convert numeric zone value using threshold logic
				pnsZone = convertPNSIndexToZone(pnsZoneValue)
			} else if (vitalSigns.pnsIndex?.value) {
				// Fallback to converting from index
				pnsZone = convertPNSIndexToZone(vitalSigns.pnsIndex.value as number)
			}
			return convertZoneToRiskLevel(pnsZone)
		default:
			return null
	}
}

const Stats = ({ vitalSigns, isMobile = false }: IStats) => {
	const [selectedVitalSignKey, setSelectedVitalSignKey] = useState<string | null>(null)

	const categorizedStats = useMemo(() => {
		const categories = getAllCategories()
		const result: Record<string, Array<{
			key: string
			title: string
			fullName: string
			unit: string
			value: string
			isEnabled: boolean
			riskLevel: RiskLevel | null
		}>> = {}

		// Initialize categories
		categories.forEach((category) => {
			result[category] = []
		})

		// Process each vital sign
		const allVitalSignKeys = [
			"pulseRate",
			"respirationRate",
			"spo2",
			'oxygenSaturation',
			"bloodPressure",
			"sdnn",
			"rmssd",
			"sd1",
			"sd2",
			"meanRri",
			"rri",
			"lfhf",
			"stressLevel",
			"stressIndex",
			"normalizedStressIndex",
			"wellnessIndex",
			"snsIndex",
			"snsZone",
			"pnsIndex",
			"pnsZone",
			"prq",
			"hemoglobin",
			"hemoglobinA1c",
			"cardiacWorkload",
			"meanArterialPressure",
			"pulsePressure",
			"highBloodPressureRisk",
			"highFastingGlucoseRisk",
			"highHemoglobinA1CRisk",
			"highTotalCholesterolRisk",
			"lowHemoglobinRisk",
			"ascvdRisk",
			// "ascvdRiskLevel",
			"heartAge",
		]

		allVitalSignKeys.forEach((key) => {
			const vitalSign = vitalSigns[key as keyof VitalSigns]
			const info = getVitalSignInfo(key)

			if (!info) {
				return
			}

			// Determine value type
			let valueType = "number"
			if (key === "bloodPressure") valueType = "bloodPressure"
			if (key === "rri") valueType = "rriArray"
			if (key === "wellnessIndex") valueType = "wellnessIndex"
			if (key === "snsIndex") valueType = "snsIndex"
			if (key === "pnsIndex") valueType = "pnsIndex"
			if (["snsZone", "pnsZone"].includes(key)) valueType = "zone"
			if (key.includes("Risk")) valueType = "risk"
			if (key === "ascvdRisk") valueType = "ascvdRisk"

			const isOxygenSaturation = key === "oxygenSaturation" || key === "spo2"
			let displayValue: string
			if (isOxygenSaturation) {
				
				if (!vitalSign?.isEnabled || vitalSign?.value === null || vitalSign?.value === undefined) {
					displayValue = "--"
				} else {
					displayValue = formatValue(vitalSign.value, valueType, key, vitalSigns)
				}
			} else {
				// For other vital signs, keep existing logic
				displayValue = vitalSign?.isEnabled || vitalSign?.value
					? formatValue(vitalSign.value, valueType, key, vitalSigns)
					: "--"
			}

			const riskLevel = getRiskLevel(key, vitalSigns)

			const category = result[info.category]
			if (category) {
				category.push({
					key,
					title: info.fullName,
					fullName: info.fullName,
					unit: info.unit,
					value: displayValue,
					isEnabled: vitalSign?.isEnabled || false,
					riskLevel,
				})
			}
		})

		// Remove empty categories
		Object.keys(result).forEach((categoryKey) => {
			const category = result[categoryKey]
			if (category && category.length === 0) {
				delete result[categoryKey]
			}
		})

		return result
	}, [vitalSigns])

	// Get the actual value for the selected vital sign
	const getActualValue = (key: string): string | number | null => {
		// For highBloodPressureRisk, show the actual Blood Pressure value
		if (key === "highBloodPressureRisk") {
			const bp = vitalSigns.bloodPressure?.value
			if (bp && typeof bp === "object") {
				const bloodPressure = bp as any
				if (bloodPressure?.systolic && bloodPressure?.diastolic) {
					return `${bloodPressure.systolic}/${bloodPressure.diastolic}`
				}
			}
			return null
		}
		
		const vitalSign = vitalSigns[key as keyof VitalSigns]
		if (!vitalSign) return null
		
		// Handle different value types
		if (vitalSign.value === null || vitalSign.value === undefined) {
			return null
		}
		
		// For blood pressure, format as "systolic/diastolic"
		if (key === "bloodPressure" && typeof vitalSign.value === "object") {
			const bp = vitalSign.value as any
			if (bp?.systolic && bp?.diastolic) {
				return `${bp.systolic}/${bp.diastolic}`
			}
			return null
		}
		
		// For arrays (like RRI), return the count
		if (Array.isArray(vitalSign.value)) {
			return vitalSign.value.length
		}
		
		return vitalSign.value
	}

	return (
		<>
			<Wrapper isMobile={isMobile}>
				<div className="w-full space-y-6">
					{Object.entries(categorizedStats).map(([category, stats]) => (
						<CategorySection key={category} category={category} count={stats.length}>
							<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
								{stats.map((stat) => (
									<StatsBox
										key={stat.key}
										title={stat.title}
										fullName={stat.fullName}
										value={stat.value}
										unit={stat.unit}
										riskLevel={stat.riskLevel}
										metricKey={stat.key}
										onClick={() => setSelectedVitalSignKey(stat.key)}
									/>
								))}
							</div>
						</CategorySection>
					))}
				</div>
			</Wrapper>
			
			{selectedVitalSignKey && (
				<VitalSignInfoModal
					vitalSignKey={selectedVitalSignKey}
					actualValue={getActualValue(selectedVitalSignKey)}
					isOpen={!!selectedVitalSignKey}
					onClose={() => setSelectedVitalSignKey(null)}
				/>
			)}
		</>
	)
}

export default Stats
