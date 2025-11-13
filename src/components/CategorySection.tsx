import React from "react"
import { cn } from "../lib/utils"

interface CategorySectionProps {
	category: string
	count: number
	children: React.ReactNode
}

const categoryColors: Record<string, string> = {
	"Primary Vitals": "bg-blue-700",
	"Cardiovascular": "bg-purple-700",
	"Stress & Wellness": "bg-orange-700",
	"HRV Metrics": "bg-teal-700",
	"ANS Balance": "bg-green-700",
	"Risk Assessment": "bg-red-700",
	"Blood Analysis": "bg-pink-700",
	"Heart Health": "bg-pink-700",
	"Other Metrics": "bg-gray-700",
}

export default function CategorySection({ category, count, children }: CategorySectionProps) {
	const colorClass = categoryColors[category] || "bg-gray-700"

	return (
		<div className="mb-6">
			{/* Category Header */}
			<div className="mb-4 flex items-center gap-3">
				<div className={cn("h-5 w-1 rounded-full", colorClass)} />
				<h3 className="text-base font-bold text-gray-800">{category}</h3>
				<div
					className={cn(
						"rounded-full px-2 py-0.5 text-xs font-bold text-white",
						colorClass
					)}
				>
					{count}
				</div>
			</div>

			{/* Category Content */}
			<div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
				{children}
			</div>
		</div>
	)
}

