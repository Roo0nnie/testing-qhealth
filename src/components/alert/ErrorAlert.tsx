import React from "react"

import ErrorIcon from "../../assets/error-icon.svg"

interface ErrorAlertProps {
	message?: string
}

const ErrorAlert = ({ message }: ErrorAlertProps) => {
	if (!message) {
		return null
	}

	return (
		<div className="absolute bottom-0 h-[120px] w-full flex justify-start items-center bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-1px_rgba(0,0,0,0.06)]">
			<img src={ErrorIcon} alt="" className="ml-[30px]" />
			<div className="px-5 pl-[10px] text-sm text-foreground text-left">{message}</div>
		</div>
	)
}

export default ErrorAlert
