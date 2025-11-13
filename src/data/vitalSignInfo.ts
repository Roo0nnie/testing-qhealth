import React from "react"
import { Heart, Wind, Droplet, Activity, Brain, TrendingUp, Shield, AlertTriangle } from "lucide-react"

export interface VitalSignInfo {
	key: string
	fullName: string
	unit: string
	icon: React.ComponentType<{ className?: string; size?: number }>
	category: string
	color: string
}

export const vitalSignsMetadata: VitalSignInfo[] = [
	// Primary Vitals
	{
		key: "pulseRate",
		fullName: "Heart Rate",
		unit: "bpm",
		icon: Heart as React.ComponentType<{ className?: string; size?: number }>,
		category: "Primary Vitals",
		color: "red",
	},
	{
		key: "respirationRate",
		fullName: "Respiration Rate",
		unit: "breaths/min",
		icon: Wind as React.ComponentType<{ className?: string; size?: number }>,
		category: "Primary Vitals",
		color: "blue",
	},
	{
		key: "spo2",
		fullName: "Oxygen Saturation",
		unit: "SpO₂ %",
		icon: Droplet as React.ComponentType<{ className?: string; size?: number }>,
		category: "Primary Vitals",
		color: "cyan",
	},
	{
		key: "bloodPressure",
		fullName: "Blood Pressure",
		unit: "mmHg",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "Cardiovascular",
		color: "purple",
	},

	// HRV Metrics
	{
		key: "sdnn",
		fullName: "SDNN",
		unit: "ms",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "HRV Metrics",
		color: "teal",
	},
	{
		key: "rmssd",
		fullName: "RMSSD",
		unit: "ms",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "HRV Metrics",
		color: "teal",
	},
	{
		key: "sd1",
		fullName: "SD1",
		unit: "ms",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "HRV Metrics",
		color: "teal",
	},
	{
		key: "sd2",
		fullName: "SD2",
		unit: "ms",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "HRV Metrics",
		color: "teal",
	},
	{
		key: "meanRri",
		fullName: "Mean RR Interval",
		unit: "ms",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>		,
		category: "HRV Metrics",
		color: "teal",
	},
	{
		key: "rri",
		fullName: "RR Interval",
		unit: "intervals",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "HRV Metrics",
		color: "teal",
	},
	{
		key: "lfhf",
		fullName: "LF/HF Ratio",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "HRV Metrics",
		color: "teal",
	},

	// Stress & Wellness
	{
		key: "stressLevel",
		fullName: "Stress Level",
		unit: "",
		icon: Brain as React.ComponentType<{ className?: string; size?: number }>,
		category: "Stress & Wellness",
		color: "orange",
	},
	{
		key: "stressIndex",
		fullName: "Stress Index",
		unit: "",
		icon: TrendingUp as React.ComponentType<{ className?: string; size?: number }>,
		category: "Stress & Wellness",
		color: "orange",
	},
	{
		key: "normalizedStressIndex",
		fullName: "Normalized Stress Index",
		unit: "",
		icon: TrendingUp as React.ComponentType<{ className?: string; size?: number }>,
		category: "Stress & Wellness",
		color: "orange",
	},
	{
		key: "wellnessIndex",
		fullName: "Wellness Index",
		unit: "",
		icon: Shield as React.ComponentType<{ className?: string; size?: number }>,
		category: "Stress & Wellness",
		color: "green",
	},
	{
		key: "wellnessLevel",
		fullName: "Wellness Level",
		unit: "",
		icon: Shield as React.ComponentType<{ className?: string; size?: number }>,
		category: "Stress & Wellness",
		color: "green",
	},

	// Nervous System
	{
		key: "snsIndex",
		fullName: "SNS Index",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "ANS Balance",
		color: "amber",
	},
	{
		key: "snsZone",
		fullName: "SNS Zone",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "ANS Balance",
		color: "orange",
	},
	{
		key: "pnsIndex",
		fullName: "PNS Index",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "ANS Balance",
		color: "green",
	},
	{
		key: "pnsZone",
		fullName: "PNS Zone",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "ANS Balance",
		color: "lightGreen",
	},

	// Other Metrics
	{
		key: "prq",
		fullName: "PRQ",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "Other Metrics",
		color: "lightBlue",
	},
	{
		key: "hemoglobin",
		fullName: "Hemoglobin",
		unit: "g/dL",
		icon: Droplet as React.ComponentType<{ className?: string; size?: number }>,
		category: "Blood Analysis",
		color: "red",
	},
	{
		key: "hemoglobinA1c",
		fullName: "Hemoglobin A1C",
		unit: "%",
		icon: Droplet as React.ComponentType<{ className?: string; size?: number }>,
		category: "Blood Analysis",
		color: "pink",
	},
	{
		key: "cardiacWorkload",
		fullName: "Cardiac Workload",
		unit: "",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "Cardiovascular",
		color: "purple",
	},
	{
		key: "meanArterialPressure",
		fullName: "Mean Arterial Pressure",
		unit: "mmHg",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "Cardiovascular",
		color: "purple",
	},
	{
		key: "pulsePressure",
		fullName: "Pulse Pressure",
		unit: "mmHg",
		icon: Activity as React.ComponentType<{ className?: string; size?: number }>,
		category: "Cardiovascular",
		color: "purple",
	},

	// Risk Indicators
	{
		key: "highBloodPressureRisk",
		fullName: "High BP Risk",
		unit: "",
		icon: AlertTriangle as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "red",
	},
	{
		key: "highFastingGlucoseRisk",
		fullName: "High Glucose Risk",
		unit: "",
		icon: AlertTriangle as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "orange",
	},
	{
		key: "highHemoglobinA1CRisk",
		fullName: "High HbA1c Risk",
		unit: "",
		icon: AlertTriangle as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "red",
	},
	{
		key: "highTotalCholesterolRisk",
		fullName: "High Cholesterol Risk",
		unit: "",
		icon: AlertTriangle as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "deepOrange",
	},
	{
		key: "lowHemoglobinRisk",
		fullName: "Low Hemoglobin Risk",
		unit: "",
		icon: AlertTriangle as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "amber",
	},
	{
		key: "ascvdRisk",
		fullName: "ASCVD Risk",
		unit: "%",
		icon: Heart as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "red",
	},
	{
		key: "ascvdRiskLevel",
		fullName: "ASCVD Risk Level",
		unit: "",
		icon: Shield as React.ComponentType<{ className?: string; size?: number }>,
		category: "Risk Assessment",
		color: "red",
	},
	{
		key: "heartAge",
		fullName: "Heart Age",
		unit: "years",
		icon: Heart as React.ComponentType<{ className?: string; size?: number }>,
		category: "Heart Health",
		color: "pink",
	},
]

export function getVitalSignInfo(key: string): VitalSignInfo | undefined {
	return vitalSignsMetadata.find((info) => info.key === key)
}

export function getVitalSignsByCategory(category: string): VitalSignInfo[] {
	return vitalSignsMetadata.filter((info) => info.category === category)
}

export function getAllCategories(): string[] {
	return Array.from(new Set(vitalSignsMetadata.map((info) => info.category)))
}
