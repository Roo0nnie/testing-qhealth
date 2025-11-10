import React from "react"

interface WarningAlertProps {
	message?: string
}

const WarningAlert = ({ message }: WarningAlertProps) => {
	if (!message) {
		return null
	}

	return (
		<div className="absolute left-0 bottom-0 h-[70px] w-full flex justify-center items-center bg-[rgba(45,80,22,0.9)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
			<div className="p-[5px] text-sm text-white text-center">{message}</div>
		</div>
	)
}

export default WarningAlert
