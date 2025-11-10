import { useEffect, useMemo, useState } from "react"
import { v4 as uuidv4 } from "uuid"

import { SessionData } from "../types"

/**
 * Session management hook
 * - On desktop: Generates a new session ID
 * - On mobile: Parses session ID from URL query parameter
 */
const useSession = (isDesktop: boolean): SessionData | null => {
	const [session, setSession] = useState<SessionData | null>(() => {
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
			const sessionId = params.get("session")

			if (sessionId) {
				return {
					sessionId,
					createdAt: Date.now(),
				}
			}

			return null
		}
	})

	// Clean up session when component unmounts (optional)
	useEffect(() => {
		return () => {
			// Session cleanup if needed
		}
	}, [])

	return session
}

export default useSession
