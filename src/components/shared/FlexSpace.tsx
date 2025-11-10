import React from "react"

import { cn } from "../../lib/utils"

interface FlexSpaceProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode
}

export const FlexSpace: React.FC<FlexSpaceProps> = ({ children, className, ...props }) => {
	return (
		<div className={cn("flex justify-between items-center", className)} {...props}>
			{children}
		</div>
	)
}
