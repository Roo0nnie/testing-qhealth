import React from "react"

import ErrorIcon from "../../assets/error-icon.svg"
import { cn } from "../../lib/utils"

interface ErrorAlertProps {
	message?: string
}

const ErrorAlert = ({ message }: ErrorAlertProps) => {
	if (!message) {
		return null
	}

	return (
		<div
			className={cn(
				"absolute top-[10px] left-1/2 -translate-x-1/2 w-[90%]",
				"flex items-center justify-start gap-4",
				"bg-gradient-to-r from-red-50 to-red-100/80",
				"border-b-2 border-red-400",
				"shadow-[0_4px_12px_-2px_rgba(220,38,38,0.3),0_2px_6px_-1px_rgba(220,38,38,0.2)]",
				"px-4 py-4 md:px-6 md:py-5",
				"animate-in slide-in-from-top-2 fade-in-0 duration-300",
				"backdrop-blur-sm",
				"rounded-xl"
			)}
		>
			<div className="flex-shrink-0">
				<img
					src={ErrorIcon}
					alt="Error"
					className="w-6 h-6 md:w-7 md:h-7 animate-pulse"
				/>
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-sm md:text-base font-medium text-red-800 leading-relaxed break-words">
					{message}
				</p>
			</div>
		</div>
	)
}

export default ErrorAlert
