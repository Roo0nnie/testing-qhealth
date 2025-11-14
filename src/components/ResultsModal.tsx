import React, { useEffect } from "react"

import { VitalSigns } from "../types"
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog"
import Stats from "./Stats"

interface ResultsModalProps {
	isOpen: boolean
	vitalSigns: VitalSigns | null
	onClose: () => void
}

const ResultsModal = ({ isOpen, vitalSigns, onClose }: ResultsModalProps) => {
	// Log vital signs when modal opens
	useEffect(() => {
		if (isOpen && vitalSigns) {
			console.log('🔔 ResultsModal Opened - Inspecting Vital Signs:')
			console.log('📊 Total Vital Signs:', Object.keys(vitalSigns).length)
			console.log('🔑 All Keys:', Object.keys(vitalSigns))
			console.log('📦 Full Vital Signs Object:', vitalSigns)
			
			// Log each vital sign's structure
			Object.entries(vitalSigns).forEach(([key, value]) => {
				console.log(`  ${key}:`, {
					value: (value as any)?.value,
					isEnabled: (value as any)?.isEnabled,
					confidenceLevel: (value as any)?.confidenceLevel,
					valueType: typeof (value as any)?.value,
					isArray: Array.isArray((value as any)?.value),
				})
			})
		}
	}, [isOpen, vitalSigns])

	if (!vitalSigns) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
					<DialogTitle className="text-xl font-semibold">Measurement Results</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto min-h-0">
					<Stats vitalSigns={vitalSigns} isMobile={true} />
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ResultsModal

