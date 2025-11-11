import React, { useCallback } from "react"

import { useTimer } from "../hooks"
import { cn } from "../lib/utils"
import Logo from "./Logo"

interface TopBarProps {
	isMeasuring?: boolean
	durationSeconds?: number
}

const TopBar: React.FC<TopBarProps> = ({ isMeasuring = false, durationSeconds = 60 }) => {
	const seconds = useTimer(isMeasuring, durationSeconds)
	const formatMinutes = useCallback((seconds: number) => ("0" + Math.floor(seconds / 60)).slice(-2), [])
	const formatSeconds = useCallback((seconds: number) => ("0" + (seconds % 60)).slice(-2), [])

	return (
		<div className="fixed top-0 left-0 right-0 w-full flex justify-between items-center h-[60px] z-[2] shadow-md bg-[#2d5016] transition-all duration-300 px-4 md:relative md:pl-[100px] md:pr-6">
			<div className="flex items-center gap-2">
				<Logo />
			</div>
			<div className="mr-[10px] flex items-center">
				{isMeasuring && (
					<div className="text-base text-white font-medium md:text-lg">
						Duration: {formatMinutes(seconds)}:{formatSeconds(seconds)}
					</div>
				)}
			</div>
		</div>
	)
}

export default TopBar
