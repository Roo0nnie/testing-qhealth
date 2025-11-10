import { MeasurementResults } from "../../types"
import { APIAdapter, APIError, APIErrorCode, SessionInfo } from "../../types/api"

/**
 * HTTP adapter for backend API integration
 * Ready for production use with a backend server
 */
export class HTTPAdapter implements APIAdapter {
	private baseURL: string
	private apiKey?: string
	private timeout: number

	constructor(baseURL: string, apiKey?: string, timeout: number = 10000) {
		this.baseURL = baseURL.replace(/\/$/, "") // Remove trailing slash
		this.apiKey = apiKey
		this.timeout = timeout
	}

	private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${this.baseURL}${endpoint}`
		const headers: Record<string, string> = {
			"Content-Type": "application/json",
			...(options.headers as Record<string, string>),
		}

		if (this.apiKey) {
			headers["Authorization"] = `Bearer ${this.apiKey}`
		}

		const controller = new AbortController()
		const timeoutId = setTimeout(() => controller.abort(), this.timeout)

		try {
			const response = await fetch(url, {
				...options,
				headers,
				signal: controller.signal,
			})

			clearTimeout(timeoutId)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}))
				throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
			}

			return await response.json()
		} catch (error) {
			clearTimeout(timeoutId)
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Request timeout")
			}
			throw error
		}
	}

	async storeResults(sessionId: string, results: MeasurementResults): Promise<void> {
		await this.request(`/api/v1/sessions/${sessionId}/measurements`, {
			method: "POST",
			body: JSON.stringify(results),
		})
	}

	async getResults(sessionId: string): Promise<MeasurementResults | null> {
		try {
			return await this.request<MeasurementResults>(
				`/api/v1/sessions/${sessionId}/measurements/latest`
			)
		} catch (error) {
			if (error instanceof Error && error.message.includes("404")) {
				return null
			}
			throw error
		}
	}

	async getSessionInfo(sessionId: string): Promise<SessionInfo | null> {
		try {
			return await this.request<SessionInfo>(`/api/v1/sessions/${sessionId}`)
		} catch (error) {
			if (error instanceof Error && error.message.includes("404")) {
				return null
			}
			throw error
		}
	}

	async updateSessionInfo(sessionId: string, updates: Partial<SessionInfo>): Promise<void> {
		await this.request(`/api/v1/sessions/${sessionId}`, {
			method: "PATCH",
			body: JSON.stringify(updates),
		})
	}

	async listSessions(): Promise<SessionInfo[]> {
		return await this.request<SessionInfo[]>("/api/v1/sessions")
	}
}
