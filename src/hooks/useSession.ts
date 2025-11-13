import { useCallback, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import { SessionData } from "../types"

/**
 * Session management hook
 * - On desktop: Generates a new session ID
 * - On mobile: Parses session ID from URL query parameter, or generates a new one if missing
 *   and updates the URL to include it
 */
const useSession = (
	isDesktop: boolean
): { session: SessionData | null; refreshSession: () => void } => {
	const [sessionId, setSession] = useState<SessionData | null>(() => {
		if (isDesktop) {
			// Generate new session ID for desktop
			const sessionId = uuidv4()
			return {
				sessionId,
				createdAt: Date.now(),
			}
		} else {
			// Parse session ID from URL on mobile (prefer "sessionId" over "session")
			const params = new URLSearchParams(window.location.search)
			let sessionId = params.get("sessionId") || params.get("session")

			// If no sessionId exists, generate a new one
			if (!sessionId) {
				sessionId = uuidv4()
			}

			return {
				sessionId,
				createdAt: Date.now(),
			}
		}
	})

		// Update URL if sessionId was generated (mobile only)
	useEffect(() => {
		if (!isDesktop && sessionId) {
			const params = new URLSearchParams(window.location.search)
			const existingSessionId = params.get("sessionId") || params.get("session")

			// If URL doesn't have sessionId, update it
			if (!existingSessionId || existingSessionId !== sessionId.sessionId) {
				// Remove old session parameter if it exists
				params.delete("session")
				// Set sessionId parameter (preferred format)
				params.set("sessionId", sessionId.sessionId)
				
				// Add default demographics if not present
				if (!params.has("sex")) {
					params.set("sex", "male")
				}
				if (!params.has("age")) {
					params.set("age", "24")
				}
				if (!params.has("height")) {
					params.set("height", "160")
				}
				if (!params.has("weight")) {
					params.set("weight", "60")
				}
				if (!params.has("smoking")) {
					params.set("smoking", "false")
				}
				
				const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
				window.history.replaceState({}, "", newUrl)
			} else {
				let needsUpdate = false
				if (!params.has("sex")) {
					params.set("sex", "male")
					needsUpdate = true
				}
				if (!params.has("age")) {
					params.set("age", "24")
					needsUpdate = true
				}
				if (!params.has("height")) {
					params.set("height", "160")
					needsUpdate = true
				}
				if (!params.has("weight")) {
					params.set("weight", "60")
					needsUpdate = true
				}
				if (!params.has("smoking")) {
					params.set("smoking", "false")
					needsUpdate = true
				}
				
				if (needsUpdate) {
					params.delete("session")
					params.set("sessionId", sessionId.sessionId)
					const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
					window.history.replaceState({}, "", newUrl)
				}
			}
		}
	}, [isDesktop, sessionId])

	const refreshSession = useCallback(() => {
		const newSessionId = uuidv4()
		const newSession: SessionData = {
			sessionId: newSessionId,
			createdAt: Date.now(),
		}

		setSession(newSession)

		if (!isDesktop) {
			const params = new URLSearchParams(window.location.search)
			params.delete("session")
			params.set("sessionId", newSessionId)
			
			// Add default demographics if not present
			if (!params.has("sex")) {
				params.set("sex", "male")
			}
			if (!params.has("age")) {
				params.set("age", "24")
			}
			if (!params.has("height")) {
				params.set("height", "160")
			}
			if (!params.has("weight")) {
				params.set("weight", "60")
			}
			if (!params.has("smoking")) {
				params.set("smoking", "false")
			}
			
			// Preserve other URL parameters and update the URL
			const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
			window.history.replaceState({}, "", newUrl)
		}
	}, [isDesktop])

	return { session: sessionId, refreshSession }
}

export default useSession
