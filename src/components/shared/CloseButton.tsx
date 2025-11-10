import React from "react"

import Cancel from "../../assets/cancel.svg"

interface CloseButtonProps {
	onClick: () => void
	className?: string
}

const CloseButton = ({ onClick, className }: CloseButtonProps) => {
	return (
		<img
			src={Cancel}
			onClick={onClick}
			className={className || "h-[17px] w-[17px] p-[5px] cursor-pointer"}
			alt="Close"
		/>
	)
}

export default CloseButton
