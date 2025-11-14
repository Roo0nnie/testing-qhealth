import React from "react"
import { cn } from "../lib/utils"
import { getRiskLevelColor } from "../utils/riskLevelCalculator"
import type { RiskLevel } from "../utils/riskLevelCalculator"

interface StatsBoxProps {
	title: string
	fullName?: string
	value: string | number
	unit?: string
	riskLevel?: RiskLevel | null
	icon?: React.ComponentType<{ className?: string; size?: number }>
	className?: string
}

const StatsBox = ({
	title,
	fullName,
	value,
	unit,
	riskLevel,
	icon: Icon,
	className,
}: StatsBoxProps) => {
	const displayName = fullName || title
	const riskColor = riskLevel ? getRiskLevelColor(riskLevel) : null

	return (
		<div
			className={cn(
				"flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md",
				className
			)}
		>
			{/* Icon and Title */}
			<div className="flex items-center gap-2">
				{Icon && <Icon className="h-5 w-5 text-gray-600" size={20} />}
				<div className="flex flex-col items-center text-center">
					<div className="text-xs font-semibold text-gray-700">{displayName}</div>
					{unit && <div className="text-xs text-gray-500">{unit}</div>}
				</div>
			</div>

			{/* Value */}
			<div className="flex flex-col items-center gap-1">
				{/* Only show value text if there's no risk level badge */}
				{!riskLevel && (
					<div className="text-lg font-bold text-[#2d5016]">{value ?? "--"}</div>
				)}
				{/* Risk Level Badge */}
				{riskLevel && (
					<div
						className={cn(
							"rounded-full px-2 py-0.5 text-xs font-semibold text-white",
							riskColor === "green" && "bg-green-500",
							riskColor === "yellow" && "bg-yellow-500",
							riskColor === "red" && "bg-red-500",
							riskColor === "gray" && "bg-gray-500"
						)}
					>
						{riskLevel}
					</div>
				)}
			</div>
		</div>
	)
}

export default StatsBox
