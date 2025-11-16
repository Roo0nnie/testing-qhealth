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
								"bg-primary-main shadow-lg shadow-primary-main/30"
							)}
						>
							<Heart className="w-8 h-8 text-white" />
						</div>
					</div>
					<DialogTitle className="text-2xl font-bold text-center text-black">
						{vitalSignInfo.fullName}
					</DialogTitle>
					<div className="flex justify-center mt-2">
						<span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
							{vitalSignInfo.category}
						</span>
					</div>
				</DialogHeader>

				{/* Actual Result Value - Prominently Displayed */}
				<div className="flex-shrink-0 my-4 p-4 bg-white rounded-lg border-2 border-gray-200">
					<div className="text-center">
						<div className="text-sm text-gray-600 mb-1">Your Result</div>
						<div className="text-3xl font-bold text-gray-900">
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
								<div className="p-2 rounded-lg bg-gray-100">
									<Info className="w-5 h-5 text-gray-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
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
								<div className="p-2 rounded-lg bg-gray-100">
									<Activity className="w-5 h-5 text-gray-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
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
								<div className="p-2 rounded-lg bg-gray-100">
									<Heart className="w-5 h-5 text-gray-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
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
								<div className="p-2 rounded-lg bg-gray-100">
									<Lightbulb className="w-5 h-5 text-gray-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
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
								<div className="p-2 rounded-lg bg-gray-100">
									<ShieldCheck className="w-5 h-5 text-gray-600" />
								</div>
								<h3 className="text-lg font-bold text-gray-900">
									Affecting Factors
								</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{vitalSignInfo.factors.map((factor, index) => (
									<span
										key={index}
										className="px-3 py-1.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-300"
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
						className="w-full py-3 rounded-lg font-semibold text-white transition-colors bg-primary-main hover:opacity-90"
					>
						Close
					</button>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default VitalSignInfoModal

