import React from "react"

import { cn } from "../lib/utils"
import { FlexSpace } from "./shared/FlexSpace"

interface StatsBoxProps {
	title: string
	value: string | number
	className?: string
}

const StatsBox = ({ title, value, className }: StatsBoxProps) => {
	return (
		<FlexSpace className={cn("flex-col items-center gap-[5px] h-[40px]", className)}>
			<div className="flex flex-col justify-center text-center items-center text-foreground text-sm font-semibold leading-4 transition-colors duration-300">
				{title}
			</div>
			<div className="flex flex-col justify-between items-center">
				<div className="text-sm text-[#2d5016] font-bold transition-colors duration-300">
					{value ?? "--"}
				</div>
			</div>
		</FlexSpace>
	)
}

export default StatsBox
