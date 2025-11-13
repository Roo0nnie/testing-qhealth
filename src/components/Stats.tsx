import React, { useMemo } from "react"

import { VitalSigns } from "../types"
import { cn } from "../lib/utils"
import StatsBox from "./StatsBox"
import CategorySection from "./CategorySection"
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
	convertZoneToString,
	convertASCVDRiskToLevel,
	type RiskLevel,
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
				return `${value.length} intervals`
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
			// Convert SNS index to zone if needed
			if (vitalSignKey === "snsZone" && vitalSigns.snsIndex?.value) {
				const zone = convertSNSIndexToZone(vitalSigns.snsIndex.value as number)
				return zone || String(value)
			}
			return String(value)
		case "wellnessLevel":
			// Convert wellness level number to string
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
		case "wellnessLevel":
			const wellnessValue = vitalSigns.wellnessLevel?.value as number | null
			if (wellnessValue !== null && wellnessValue !== undefined) {
				const level = convertWellnessLevelToString(wellnessValue)
				return (level as RiskLevel) || null
			}
			return null
		case "ascvdRiskLevel":
			const ascvdRisk = vitalSigns.ascvdRisk?.value as number | null
			if (ascvdRisk !== null && ascvdRisk !== undefined) {
				const level = convertASCVDRiskToLevel(ascvdRisk)
				if (level) {
					return (level.charAt(0).toUpperCase() + level.slice(1) as RiskLevel) || null
				}
			}
			return null
		default:
			return null
	}
}

const Stats = ({ vitalSigns, isMobile = false }: IStats) => {
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
			icon: React.ComponentType<{ className?: string; size?: number }>
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
			"wellnessLevel",
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
			"ascvdRiskLevel",
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
			if (key === "wellnessLevel") valueType = "wellnessLevel"
			if (key === "stressLevel") valueType = "stressLevel"
			if (["snsZone", "pnsZone"].includes(key)) valueType = "zone"
			if (key.includes("Risk")) valueType = "risk"
			if (key === "ascvdRisk") valueType = "percentage"
			if (key === "ascvdRiskLevel") valueType = "zone"

			const displayValue = vitalSign?.isEnabled
				? formatValue(vitalSign.value, valueType, key, vitalSigns)
				: "N/A"

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
					icon: info.icon,
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

	return (
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
									icon={stat.icon}
								/>
							))}
						</div>
					</CategorySection>
				))}
			</div>
		</Wrapper>
	)
}

export default Stats
