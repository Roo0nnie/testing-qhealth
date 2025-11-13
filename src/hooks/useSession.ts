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
			// Parse session ID from URL on mobile
			const params = new URLSearchParams(window.location.search)
			let sessionId = params.get("session") || params.get("sessionId")

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
			const existingSessionId = params.get("session") || params.get("sessionId")

			// If URL doesn't have sessionId, update it
			if (!existingSessionId || existingSessionId !== sessionId.sessionId) {
				params.set("sessionId", sessionId.sessionId)
				
				// Preserve other URL parameters and update the URL
				const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
				window.history.replaceState({}, "", newUrl)
			}
		}
	}, [isDesktop, sessionId])

	// Refresh session function - generates new sessionId and updates URL
	const refreshSession = useCallback(() => {
		const newSessionId = uuidv4()
		const newSession: SessionData = {
			sessionId: newSessionId,
			createdAt: Date.now(),
		}

		setSession(newSession)

		// Update URL on mobile (preserving other params)
		if (!isDesktop) {
			const params = new URLSearchParams(window.location.search)
			params.set("sessionId", newSessionId)
			
			// Preserve other URL parameters and update the URL
			const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`
			window.history.replaceState({}, "", newUrl)
		}
	}, [isDesktop])

	return { session: sessionId, refreshSession }
}

export default useSession
