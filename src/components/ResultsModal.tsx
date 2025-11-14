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
	if (!vitalSigns) {
		return null
	}

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden [&>button]:top-6">
				<DialogHeader className="px-3 pt-6 pb-6 border-b shadow-sm flex-shrink-0 text-left">
					<DialogTitle className="text-base font-bold text-gray-800">Measurement Results</DialogTitle>
				</DialogHeader>
				<div className="flex-1 overflow-y-auto min-h-0">
					<Stats vitalSigns={vitalSigns} isMobile={true} />
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default ResultsModal

