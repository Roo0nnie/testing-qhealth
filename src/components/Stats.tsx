import React, { useMemo } from "react"

import { VitalSigns } from "../types"
import { cn } from "../lib/utils"
import StatsBox from "./StatsBox"

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

const BoxesWrapper = ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="grid grid-cols-2 gap-5 w-full md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-6">
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

// Helper function to format different value types
const formatValue = (value: any, type: string): string => {
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
			// RRI is an array of RRIValue objects
			if (Array.isArray(value) && value.length > 0) {
				return `${value.length} values`
			}
			return "--"
		case "percentage":
			return typeof value === "number" ? `${value}%` : String(value)
		case "risk":
			if (typeof value === "number") {
				return `${value}%`
			}
			return String(value)
		case "zone":
			return String(value)
		case "number":
		default:
			return typeof value === "number" ? String(value) : String(value)
	}
}

// Configuration for all vital signs with display names and formatting
const vitalSignsConfig = [
	// Basic Vital Signs
	{ key: "pulseRate", title: "PR", type: "number" },
	{ key: "respirationRate", title: "RR", type: "number" },
	{ key: "spo2", title: "SpO₂", type: "number" },
	{ key: "bloodPressure", title: "BP", type: "bloodPressure" },

	// HRV Metrics
	{ key: "sdnn", title: "SDNN", type: "number" },
	{ key: "rmssd", title: "RMSSD", type: "number" },
	{ key: "sd1", title: "SD1", type: "number" },
	{ key: "sd2", title: "SD2", type: "number" },
	{ key: "meanRri", title: "Mean RRi", type: "number" },
	{ key: "rri", title: "RRi", type: "rriArray" }, // Array type
	{ key: "lfhf", title: "LF/HF Ratio", type: "number" },

	// Stress & Wellness
	{ key: "stressLevel", title: "SL", type: "number" },
	{ key: "stressIndex", title: "Stress Index", type: "number" },
	{ key: "normalizedStressIndex", title: "NSI", type: "number" },
	{ key: "wellnessIndex", title: "Wellness Index", type: "number" },
	{ key: "wellnessLevel", title: "Wellness Level", type: "number" },

	// Nervous System
	{ key: "snsIndex", title: "SNS Index", type: "number" },
	{ key: "snsZone", title: "SNS Zone", type: "zone" },
	{ key: "pnsIndex", title: "PNS Index", type: "number" },
	{ key: "pnsZone", title: "PNS Zone", type: "zone" },

	// Other Metrics
	{ key: "prq", title: "PRQ", type: "number" },
	// { key: 'heartAge', title: 'Heart Age', type: 'number' },
	{ key: "hemoglobin", title: "Hemoglobin", type: "number" },
	{ key: "hemoglobinA1c", title: "HbA1c", type: "number" },
	{ key: "cardiacWorkload", title: "Cardiac Workload", type: "number" },
	{ key: "meanArterialPressure", title: "Mean Arterial Pressure", type: "number" },
	{ key: "pulsePressure", title: "Pulse Pressure", type: "number" },

	// Risk Indicators
	// { key: 'ascvdRisk', title: 'ASCVD Risk', type: 'risk' },
	// { key: 'ascvdRiskLevel', title: 'ASCVD Risk Level', type: 'risk' },
	{ key: "highBloodPressureRisk", title: "High BP Risk", type: "risk" },
	{ key: "highFastingGlucoseRisk", title: "High Glucose Risk", type: "risk" },
	{ key: "highHemoglobinA1CRisk", title: "High HbA1c Risk", type: "risk" },
	{ key: "highTotalCholesterolRisk", title: "High Cholesterol Risk", type: "risk" },
	{ key: "lowHemoglobinRisk", title: "Low Hemoglobin Risk", type: "risk" },
]

const Stats = ({ vitalSigns, isMobile = false }: IStats) => {
	const statsToDisplay = useMemo(() => {
		const stats = vitalSignsConfig.map((config) => {
			const vitalSign = vitalSigns[config.key as keyof VitalSigns]

			// If vital sign doesn't exist, show it as disabled
			if (!vitalSign) {
				return {
					...config,
					value: "N/A",
					isEnabled: false,
				}
			}

			const displayValue = vitalSign.isEnabled
				? formatValue(vitalSign.value, config.type)
				: "N/A"

			return {
				...config,
				value: displayValue,
				isEnabled: vitalSign.isEnabled,
			}
		})

		return stats
	}, [vitalSigns])

	return (
		<Wrapper isMobile={isMobile}>
			<BoxesWrapper>
				{statsToDisplay.map((stat) => (
					<StatsBox key={stat.key} title={stat.title} value={stat.value} />
				))}
			</BoxesWrapper>
		</Wrapper>
	)
}

export default Stats
