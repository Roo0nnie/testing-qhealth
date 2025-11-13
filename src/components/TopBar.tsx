import React, { useCallback } from "react"

import { useTimer } from "../hooks"
import Logo from "./Logo"
import Refresh from "../assets/refresh.svg"

interface TopBarProps {
	isMeasuring?: boolean
	durationSeconds?: number
	onRefresh?: () => void
}

const TopBar: React.FC<TopBarProps> = ({ isMeasuring = false, durationSeconds = 60, onRefresh }) => {
	const seconds = useTimer(isMeasuring, durationSeconds)
	const formatMinutes = useCallback((seconds: number) => ("0" + Math.floor(seconds / 60)).slice(-2), [])
	const formatSeconds = useCallback((seconds: number) => ("0" + (seconds % 60)).slice(-2), [])

	return (
		<div className="fixed top-0 left-0 right-0 w-full flex justify-between items-center h-[60px] z-[2] shadow-md bg-[#2d5016] transition-all duration-300 px-4 md:relative md:pl-[100px] md:pr-6">
			<div className="flex items-center gap-2">
				<Logo />
			</div>
			{/* Right side section */}
			<div className="flex items-center justify-end">
				{isMeasuring ? (
					<div className="text-base text-white font-medium md:text-lg">
						Duration: {formatMinutes(seconds)}:{formatSeconds(seconds)}
					</div>
				) : (
					onRefresh && (
						<button
							onClick={onRefresh}
						
							aria-label="Refresh session"
						>
							<img
								src={Refresh}
								alt="Refresh"
								className="h-[60px] w-[60px] object-contain cursor-pointer"
							/>
						</button>
					)
				)}
			</div>
		</div>
	)
}

export default TopBar
