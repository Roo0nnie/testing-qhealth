import React from "react"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog"
import { getVitalSignInfo } from "../data/vitalSignInfo"
import { cn } from "../lib/utils"
import { Info, Activity, Heart, Lightbulb, ShieldCheck } from "lucide-react"

interface VitalSignInfoModalProps {
	vitalSignKey: string
	actualValue: string | number | null
	isOpen: boolean
	onClose: () => void
}

const colorMap: Record<string, string> = {
	red: "bg-red-500",
	blue: "bg-blue-500",
	cyan: "bg-cyan-500",
	purple: "bg-purple-500",
	teal: "bg-teal-500",
	orange: "bg-orange-500",
	green: "bg-green-500",
	amber: "bg-amber-500",
	lightGreen: "bg-green-400",
	lightBlue: "bg-blue-400",
	pink: "bg-pink-500",
	deepOrange: "bg-orange-600",
}

const colorTextMap: Record<string, string> = {
	red: "text-red-600",
	blue: "text-blue-600",
	cyan: "text-cyan-600",
	purple: "text-purple-600",
	teal: "text-teal-600",
	orange: "text-orange-600",
	green: "text-green-600",
	amber: "text-amber-600",
	lightGreen: "text-green-500",
	lightBlue: "text-blue-500",
	pink: "text-pink-600",
	deepOrange: "text-orange-700",
}

const colorBgMap: Record<string, string> = {
	red: "bg-red-50",
	blue: "bg-blue-50",
	cyan: "bg-cyan-50",
	purple: "bg-purple-50",
	teal: "bg-teal-50",
	orange: "bg-orange-50",
	green: "bg-green-50",
	amber: "bg-amber-50",
	lightGreen: "bg-green-50",
	lightBlue: "bg-blue-50",
	pink: "bg-pink-50",
	deepOrange: "bg-orange-50",
}

const VitalSignInfoModal = ({
	vitalSignKey,
	actualValue,
	isOpen,
	onClose,
}: VitalSignInfoModalProps) => {
	const vitalSignInfo = getVitalSignInfo(vitalSignKey)

	if (!vitalSignInfo) {
		return null
	}

	const colorClass = colorMap[vitalSignInfo.color] || "bg-gray-500"
	const textColorClass = colorTextMap[vitalSignInfo.color] || "text-gray-600"
	const bgColorClass = colorBgMap[vitalSignInfo.color] || "bg-gray-50"

	const formatValue = (value: string | number | null): string => {
		if (value === null || value === undefined) return "N/A"
		if (typeof value === "number") {
			return value % 1 === 0 ? String(value) : value.toFixed(1)
		}
		return String(value)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
				<DialogHeader className="flex-shrink-0">
					<div className="flex items-center justify-center mb-4">
						<div
							className={cn(
								"w-16 h-16 rounded-full flex items-center justify-center",
								bgColorClass
							)}
						>
							<Heart className={cn("w-8 h-8", textColorClass)} />
						</div>
					</div>
					<DialogTitle className={cn("text-2xl font-bold text-center", textColorClass)}>
						{vitalSignInfo.fullName}
					</DialogTitle>
					<div className="flex justify-center mt-2">
						<span
							className={cn(
								"px-3 py-1 rounded-full text-sm font-semibold",
								bgColorClass,
								textColorClass
							)}
						>
							{vitalSignInfo.category}
						</span>
					</div>
				</DialogHeader>

				{/* Actual Result Value - Prominently Displayed */}
				<div className="flex-shrink-0 my-4 p-4 bg-white rounded-lg border-2 border-gray-200">
					<div className="text-center">
						<div className="text-sm text-gray-600 mb-1">Your Result</div>
						<div className={cn("text-3xl font-bold", textColorClass)}>
							{formatValue(actualValue)}
							{vitalSignInfo.unit && actualValue !== "N/A" && (
								<span className="text-lg text-gray-500 ml-2">
									{vitalSignInfo.unit}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto space-y-4 pr-2">
					{/* Description */}
					{vitalSignInfo.description && (
						<div className="bg-white rounded-lg border border-gray-200 p-4">
							<div className="flex items-center gap-3 mb-3">
								<div className={cn("p-2 rounded-lg", bgColorClass)}>
									<Info className={cn("w-5 h-5", textColorClass)} />
								</div>
								<h3 className={cn("text-lg font-bold", textColorClass)}>
									Description
								</h3>
							</div>
							<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
								{vitalSignInfo.description}
							</p>
						</div>
					)}

					{/* Normal Range */}
					{vitalSignInfo.normalRange && (
						<div className="bg-white rounded-lg border border-gray-200 p-4">
							<div className="flex items-center gap-3 mb-3">
								<div className={cn("p-2 rounded-lg", bgColorClass)}>
									<Activity className={cn("w-5 h-5", textColorClass)} />
								</div>
								<h3 className={cn("text-lg font-bold", textColorClass)}>
									Normal Range
								</h3>
							</div>
							<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
								{vitalSignInfo.normalRange}
							</p>
						</div>
					)}

					{/* Clinical Significance */}
					{vitalSignInfo.clinicalSignificance && (
						<div className="bg-white rounded-lg border border-gray-200 p-4">
							<div className="flex items-center gap-3 mb-3">
								<div className={cn("p-2 rounded-lg", bgColorClass)}>
									<Heart className={cn("w-5 h-5", textColorClass)} />
								</div>
								<h3 className={cn("text-lg font-bold", textColorClass)}>
									Clinical Significance
								</h3>
							</div>
							<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
								{vitalSignInfo.clinicalSignificance}
							</p>
						</div>
					)}

					{/* Interpretation */}
					{vitalSignInfo.interpretation && (
						<div className="bg-white rounded-lg border border-gray-200 p-4">
							<div className="flex items-center gap-3 mb-3">
								<div className={cn("p-2 rounded-lg", bgColorClass)}>
									<Lightbulb className={cn("w-5 h-5", textColorClass)} />
								</div>
								<h3 className={cn("text-lg font-bold", textColorClass)}>
									Interpretation
								</h3>
							</div>
							<p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
								{vitalSignInfo.interpretation}
							</p>
						</div>
					)}

					{/* Affecting Factors */}
					{vitalSignInfo.factors && vitalSignInfo.factors.length > 0 && (
						<div className="bg-white rounded-lg border border-gray-200 p-4">
							<div className="flex items-center gap-3 mb-3">
								<div className={cn("p-2 rounded-lg", bgColorClass)}>
									<ShieldCheck className={cn("w-5 h-5", textColorClass)} />
								</div>
								<h3 className={cn("text-lg font-bold", textColorClass)}>
									Affecting Factors
								</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{vitalSignInfo.factors.map((factor, index) => (
									<span
										key={index}
										className={cn(
											"px-3 py-1.5 rounded-full text-xs font-medium border",
											bgColorClass,
											textColorClass,
											"border-opacity-30"
										)}
									>
										{factor}
									</span>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Close Button */}
				<div className="flex-shrink-0 pt-4 border-t">
					<button
						onClick={onClose}
						className={cn(
							"w-full py-3 rounded-lg font-semibold text-white transition-colors",
							colorClass,
							"hover:opacity-90"
						)}
					>
						Close
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default VitalSignInfoModal

