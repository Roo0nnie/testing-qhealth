import { MeasurementResults } from "../../types"
import { APIAdapter, SessionInfo, SessionStatus } from "../../types/api"

/**
 * LocalStorage adapter for storing and retrieving measurement results
 * Used for client-side storage - enables desktop/mobile workflow:
 * - Desktop shows QR code with session ID
 * - Mobile scans QR, completes measurement, stores results here
 * - Desktop polls this storage to get results
 */
export class LocalStorageAdapter implements APIAdapter {
	private readonly SESSION_PREFIX = "qhealth-session-"
	private readonly SESSION_INFO_PREFIX = "qhealth-session-info-"
	private readonly SESSION_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

	async storeResults(sessionId: string, results: MeasurementResults): Promise<void> {
		try {
			// Store measurement results
			const data = {
				sessionId: results.sessionId,
				vitalSigns: results.vitalSigns,
				timestamp: results.timestamp,
			}
			localStorage.setItem(`${this.SESSION_PREFIX}${sessionId}`, JSON.stringify(data))

			// Update session info
			const sessionInfo = await this.getSessionInfo(sessionId)
			if (sessionInfo) {
				await this.updateSessionInfo(sessionId, {
					status: SessionStatus.COMPLETED,
					lastMeasurementAt: results.timestamp,
					measurementCount: sessionInfo.measurementCount + 1,
				})
			} else {
				// Create new session info if it doesn't exist
				await this.updateSessionInfo(sessionId, {
					status: SessionStatus.COMPLETED,
					createdAt: results.timestamp - 60000, // Estimate
					lastMeasurementAt: results.timestamp,
					measurementCount: 1,
					expiresAt: results.timestamp + this.SESSION_EXPIRY_MS,
				})
			}
		} catch (error) {
			throw new Error(
				`Failed to store results: ${error instanceof Error ? error.message : "Unknown error"}`
			)
		}
	}

	async getResults(sessionId: string): Promise<MeasurementResults | null> {
		try {
			const stored = localStorage.getItem(`${this.SESSION_PREFIX}${sessionId}`)

			if (!stored) {
				return null
			}

			const data = JSON.parse(stored)

			// Check if expired (older than 1 hour)
			const oneHourAgo = Date.now() - this.SESSION_EXPIRY_MS
			if (data.timestamp < oneHourAgo) {
				localStorage.removeItem(`${this.SESSION_PREFIX}${sessionId}`)
				return null
			}

			return {
				sessionId: data.sessionId,
				vitalSigns: data.vitalSigns,
				timestamp: data.timestamp,
			}
		} catch (error) {
			console.error("Error getting results:", error)
			return null
		}
	}

	async getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
		try {
			const stored = localStorage.getItem(`${this.SESSION_INFO_PREFIX}${sessionId}`)
			if (!stored) {
				// Try to create from session data if it doesn't exist
				const results = await this.getResults(sessionId)
				if (results) {
					return {
						sessionId,
						status: SessionStatus.COMPLETED,
						createdAt: results.timestamp - 60000, // Estimate
						lastMeasurementAt: results.timestamp,
						measurementCount: 1,
						expiresAt: results.timestamp + this.SESSION_EXPIRY_MS,
					}
				}
				return null
			}

			const data = JSON.parse(stored)
			const now = Date.now()

			// Check if expired
			if (data.expiresAt && data.expiresAt < now) {
				localStorage.removeItem(`${this.SESSION_INFO_PREFIX}${sessionId}`)
				localStorage.removeItem(`${this.SESSION_PREFIX}${sessionId}`)
				return {
					...data,
					status: SessionStatus.EXPIRED,
				}
			}

			return data
		} catch (error) {
			console.error("Error getting session info:", error)
			return null
		}
	}

	async updateSessionInfo(sessionId: string, updates: Partial<SessionInfo>): Promise<void> {
		try {
			const existing = await this.getSessionInfo(sessionId)
			const updated: SessionInfo = {
				sessionId,
				status: SessionStatus.ACTIVE,
				createdAt: Date.now(),
				measurementCount: 0,
				expiresAt: Date.now() + this.SESSION_EXPIRY_MS,
				...existing,
				...updates,
			}

			localStorage.setItem(`${this.SESSION_INFO_PREFIX}${sessionId}`, JSON.stringify(updated))
		} catch (error) {
			throw new Error(
				`Failed to update session info: ${error instanceof Error ? error.message : "Unknown error"}`
			)
		}
	}

	async listSessions(): Promise<SessionInfo[]> {
		try {
			const sessions: SessionInfo[] = []
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i)
				if (key?.startsWith(this.SESSION_INFO_PREFIX)) {
					const sessionId = key.replace(this.SESSION_INFO_PREFIX, "")
					const sessionInfo = await this.getSessionInfo(sessionId)
					if (sessionInfo && sessionInfo.status !== SessionStatus.EXPIRED) {
						sessions.push(sessionInfo)
					}
				}
			}
			return sessions
		} catch (error) {
			console.error("Error listing sessions:", error)
			return []
		}
	}
}
