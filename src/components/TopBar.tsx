import React from "react"
import Logo from "./Logo"

interface TopBarProps {
	isMeasuring?: boolean
	durationSeconds?: number
	remainingSeconds?: number | null
	onRefresh?: () => void
	isRefreshing?: boolean
}

const TopBar: React.FC<TopBarProps> = ({
	isMeasuring = false,
	durationSeconds = 60,
	remainingSeconds,
	onRefresh,
	isRefreshing = false,
}) => {
	return (
		<div className="fixed top-0 left-0 right-0 w-full flex justify-between items-center h-[60px] z-[2] shadow-md bg-[#2d5016] transition-all duration-300 px-4 md:relative md:pl-[100px] md:pr-6">
			<div className="flex items-center gap-2">
				<Logo />
			</div>
			{/* Right side section */}
			<div className="flex items-center justify-end" />
		</div>
	)
}

export default TopBar
