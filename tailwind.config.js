/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: ["./src/**/*.{ts,tsx}"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		screens: {
			sm: "680px", // mobile
			md: "1000px", // tablet
			lg: "1280px", // desktop
			xl: "1600px", // wide
			"2xl": "1600px",
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
					main: "#2d5016",
					light: "#4a7c2a",
					dark: "#1a3009",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
					main: "#8b6f47",
					light: "#a68b6b",
					dark: "#6b5535",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
					main: "#6b8e23",
					light: "#9ab855",
					dark: "#4a5f18",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				warning: {
					DEFAULT: "#f59e0b",
					foreground: "hsl(var(--warning-foreground))",
				},
				info: {
					DEFAULT: "#3b82f6",
					foreground: "hsl(var(--info-foreground))",
				},
				success: {
					DEFAULT: "#4a7c2a",
					foreground: "hsl(var(--success-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				none: "0",
				custom: {
					sm: "4px",
					md: "8px",
					lg: "12px",
					xl: "16px",
					full: "9999px",
				},
			},
			fontFamily: {
				primary: [
					'Rubik',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'sans-serif',
				],
				secondary: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'sans-serif',
				],
				sans: [
					'Rubik',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'sans-serif',
				],
			},
			fontSize: {
				xs: "12px",
				sm: "14px",
				base: "16px",
				lg: "18px",
				xl: "20px",
				"2xl": "24px",
				"3xl": "28px",
				"4xl": "32px",
				"5xl": "36px",
			},
			spacing: {
				xs: "4px",
				sm: "8px",
				md: "16px",
				lg: "24px",
				xl: "32px",
				"2xl": "48px",
				"3xl": "64px",
			},
			boxShadow: {
				sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
				xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
			},
			transitionDuration: {
				fast: "150ms",
				normal: "300ms",
				slow: "500ms",
			},
			transitionTimingFunction: {
				"ease-in-out": "ease-in-out",
			},
			zIndex: {
				base: "1",
				dropdown: "1000",
				overlay: "2000",
				modal: "3000",
				tooltip: "4000",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				"slide-in": {
					from: { width: "0" },
					to: { width: "100%" },
				},
				"slide-out": {
					from: { width: "100%" },
					to: { width: "0" },
				},
				"slide-in-md": {
					from: { width: "0" },
					to: { width: "400px" },
				},
				"slide-out-md": {
					from: { width: "400px" },
					to: { width: "0" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"slide-in": "slide-in 300ms ease-in-out",
				"slide-out": "slide-out 300ms ease-in-out",
				"slide-in-md": "slide-in-md 300ms ease-in-out",
				"slide-out-md": "slide-out-md 300ms ease-in-out",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
}

