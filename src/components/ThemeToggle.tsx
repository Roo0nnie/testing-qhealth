import React from "react"

import { useTheme } from "../context/ThemeContext"

const ThemeToggle: React.FC = () => {
	const { themeMode, setThemeMode } = useTheme()
	const isDark = themeMode === "dark"

	const toggleTheme = () => {
		setThemeMode(isDark ? "light" : "dark")
	}

	return (
		<div
			className="flex items-center gap-2 cursor-pointer select-none"
			onClick={toggleTheme}
			title={`Switch to ${isDark ? "light" : "dark"} mode`}
		>
			<div
				className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer mr-[10px] ${
					isDark ? "bg-[#6b8e23]" : "bg-[#d4d4d0]"
				}`}
			>
				<div
					className={`absolute top-0.5 w-5 h-5 bg-card rounded-full transition-all duration-300 shadow-md ${
						isDark ? "left-[26px]" : "left-0.5"
					}`}
				/>
			</div>
		</div>
	)
}

export default ThemeToggle
