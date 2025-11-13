import { useEffect, useState } from "react"

export interface Demographics {
	session?: string
	sex?: "male" | "female"
	age?: number
	height?: number
	weight?: number
	smoking?: boolean
}

/**
 * Hook to parse demographic data from URL query parameters
 * Format: ?sessionId=abc123&sex=male&age=24&height=160&weight=60&smoking=false
 */
export function useDemographics(): Demographics {
	const [demographics, setDemographics] = useState<Demographics>(() => {
		if (typeof window === "undefined") {
			return {}
		}

		const params = new URLSearchParams(window.location.search)
		const session = params.get("sessionId") || params.get("session") || undefined
		const sexParam = params.get("sex")
		const ageParam = params.get("age")
		const heightParam = params.get("height")
		const weightParam = params.get("weight")
		const smokingParam = params.get("smoking")

		return {
			session,
			sex: sexParam === "male" || sexParam === "female" ? sexParam : undefined,
			age: ageParam ? parseInt(ageParam, 10) : undefined,
			height: heightParam ? parseFloat(heightParam) : undefined,
			weight: weightParam ? parseFloat(weightParam) : undefined,
			smoking: smokingParam === "true" || smokingParam === "1",
		}
	})

	useEffect(() => {
		if (typeof window === "undefined") {
			return
		}

		const params = new URLSearchParams(window.location.search)
		const session = params.get("sessionId") || params.get("session") || undefined
		const sexParam = params.get("sex")
		const ageParam = params.get("age")
		const heightParam = params.get("height")
		const weightParam = params.get("weight")
		const smokingParam = params.get("smoking")

		setDemographics({
			session,
			sex: sexParam === "male" || sexParam === "female" ? sexParam : undefined,
			age: ageParam ? parseInt(ageParam, 10) : undefined,
			height: heightParam ? parseFloat(heightParam) : undefined,
			weight: weightParam ? parseFloat(weightParam) : undefined,
			smoking: smokingParam === "true" || smokingParam === "1",
		})
	}, [])

	return demographics
}

export default useDemographics

