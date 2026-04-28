import React from "react"

import { HealthResult, ResultCategory } from "../types/insightGenie"

interface InsightGenieResultsProps {
	results: HealthResult[]
	onRescan: () => void
	onHome?: () => void
}

const SECTIONS: { key: ResultCategory; label: string }[] = [
	{ key: "cardiovascular", label: "Cardiovascular" },
	{ key: "heart", label: "Heart" },
	{ key: "hrv", label: "HRV" },
	{ key: "blood", label: "Blood" },
	{ key: "other", label: "Other" },
]

const STATUS_BADGE_CLASS: Record<string, string> = {
	Good: "bg-yellow-100 text-yellow-700",
	Average: "bg-orange-100 text-orange-700",
	Poor: "bg-red-100 text-red-700",
}

const Card = ({ result }: { result: HealthResult }) => (
	<div className="relative flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-h-[140px]">
		<span
			className={`px-3 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
				STATUS_BADGE_CLASS[result.status] || STATUS_BADGE_CLASS.Good
			}`}
		>
			{result.status}
		</span>
		<div className="mt-3 text-2xl font-extrabold text-gray-900 text-center leading-tight">
			{result.value}
		</div>
		<div className="mt-1 text-xs text-gray-600 text-center leading-snug">{result.title}</div>
		{result.normalRange && (
			<div className="mt-1 text-[10px] text-gray-400">{result.normalRange}</div>
		)}
	</div>
)

const InsightGenieResults = ({ results, onRescan, onHome }: InsightGenieResultsProps) => {
	const grouped = SECTIONS.map(section => ({
		...section,
		items: results.filter(r => r.category === section.key),
	})).filter(section => section.items.length > 0)

	return (
		<div className="w-full h-full overflow-y-auto bg-gradient-to-b from-sky-50 to-blue-50">
			<div className="max-w-3xl mx-auto px-4 py-6 pb-28">
				<div className="flex flex-col items-center text-center mb-6">
					<div className="bg-green-500 rounded-full p-2 mb-3">
						<svg
							className="w-8 h-8 text-white"
							fill="none"
							stroke="currentColor"
							strokeWidth={3}
							viewBox="0 0 24 24"
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-2xl font-extrabold text-green-600">Face Scan Complete</h2>
					<p className="text-sm text-green-600 mt-1">
						Your health analysis has been completed successfully!
					</p>
					<h3 className="text-xl font-bold text-gray-900 mt-4">Health Assessment Report</h3>
					<p className="text-xs text-gray-500 mt-1">
						Your personalized health insights based on facial analysis
					</p>
				</div>

				{grouped.length === 0 && (
					<div className="bg-white rounded-2xl p-6 text-center text-gray-500 shadow-sm">
						No results were returned from the scan.
					</div>
				)}

				{grouped.map(section => (
					<div key={section.key} className="mb-5">
						<div className="bg-green-500 text-white font-bold rounded-t-2xl px-5 py-3">
							{section.label}
						</div>
						<div className="bg-white rounded-b-2xl p-4 shadow-sm border-x border-b border-gray-100">
							<div
								className={`grid gap-3 ${
									section.items.length === 1
										? "grid-cols-1"
										: section.items.length === 2
											? "grid-cols-2"
											: "grid-cols-2 sm:grid-cols-3"
								}`}
							>
								{section.items.map((r, i) => (
									<Card key={`${r.title}-${i}`} result={r} />
								))}
							</div>
						</div>
					</div>
				))}

				<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-center gap-3 shadow-lg">
					{onHome && (
						<button
							onClick={onHome}
							className="flex-1 max-w-[160px] flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-blue-500 text-blue-600 font-semibold transition-all hover:bg-blue-50 active:scale-95"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 12l9-9 9 9M5 10v10h14V10"
								/>
							</svg>
							Home
						</button>
					)}
					<button
						onClick={onRescan}
						className="flex-1 max-w-[200px] flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow-md transition-all hover:shadow-lg active:scale-95"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4 4v6h6M20 20v-6h-6M5 19A9 9 0 0119 5"
							/>
						</svg>
						Rescan
					</button>
				</div>
			</div>
		</div>
	)
}

export default InsightGenieResults
