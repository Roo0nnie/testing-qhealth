import React from "react"

interface InfoAlertProps {
	message?: string
}

const InfoAlert = ({ message }: InfoAlertProps) => {
	if (!message) {
		return null
	}

	return (
		<div className="absolute top-[10px] h-[70px] w-[90%] flex justify-center items-center bg-[rgba(255,255,255,0.95)] py-[13px] px-[50px] box-border rounded-xl shadow-md">
			<div className="p-[5px] text-sm text-[#c33] text-center">{message}</div>
		</div>
	)
}

export default InfoAlert
