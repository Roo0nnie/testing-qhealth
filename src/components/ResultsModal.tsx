import React from "react"

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
	if (!vitalSigns) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
				<DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
					<DialogTitle className="text-xl font-semibold">Measurement Results</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
					<Stats vitalSigns={vitalSigns} isMobile={true} />
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ResultsModal

