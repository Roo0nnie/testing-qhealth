import React from "react"

import { cn } from "../../lib/utils"

interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
	children?: React.ReactNode
}

export const Flex: React.FC<FlexProps> = ({ children, className, ...props }) => {
	return (
		<div className={cn("flex", className)} {...props}>
			{children}
		</div>
	)
}
