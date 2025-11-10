import React from "react"

import settings from "../assets/settings-hamburger.svg"
import { cn } from "../lib/utils"

interface SettingsButtonProps {
	onClick: () => void
	disable: boolean
}

const SettingsButton = ({ onClick, disable }: SettingsButtonProps) => {
	return (
		<img
			id="settingsButton"
			src={settings}
			onClick={onClick}
			className={cn(
				"h-[17px] w-[22px] mx-2 p-[13px]",
				disable && "invisible"
			)}
			alt="Settings"
		/>
	)
}

export default SettingsButton
