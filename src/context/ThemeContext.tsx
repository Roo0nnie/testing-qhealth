import React, { createContext, ReactNode, useContext, useState } from "react"
import { ThemeProvider as StyledThemeProvider } from "styled-components"

import { lightTheme, Theme } from "../style/theme"

type ThemeMode = "light" | "dark"

interface ThemeContextType {
	theme: Theme
	themeMode: ThemeMode
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
	// Always use light mode
	const [themeMode] = useState<ThemeMode>("light")

	// Removed localStorage logic since we always use light mode

	const theme = lightTheme // Always use light theme

	const value: ThemeContextType = {
		theme,
		themeMode,
	}

	return (
		<ThemeContext.Provider value={value}>
			<StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
		</ThemeContext.Provider>
	)
}
