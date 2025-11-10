import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"

import { lightTheme, Theme } from "../style/theme"

type ThemeMode = "light" | "dark"

interface ThemeContextType {
	theme: Theme
	themeMode: ThemeMode
	setThemeMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
	const context = useContext(ThemeContext)
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}
	return context
}

interface ThemeProviderProps {
	children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	// Always use light mode by default
	const [themeMode, setThemeModeState] = useState<ThemeMode>("light")

	// Apply theme class to document root
	useEffect(() => {
		const root = document.documentElement
		if (themeMode === "dark") {
			root.classList.add("dark")
		} else {
			root.classList.remove("dark")
		}
	}, [themeMode])

	const setThemeMode = (mode: ThemeMode) => {
		setThemeModeState(mode)
	}

	const theme = lightTheme // Always use light theme for programmatic access

	const value: ThemeContextType = {
		theme,
		themeMode,
		setThemeMode,
	}

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
