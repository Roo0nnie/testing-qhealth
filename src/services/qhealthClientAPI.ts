import { v4 as uuidv4 } from "uuid"

import { MeasurementResults } from "../types"
import {
	APIAdapter,
	APIError,
	APIErrorCode,
	APIEvent,
	APIEventType,
	APIMethod,
	APIRequest,
	APIResponse,
	SessionInfo,
	SessionStatus,
} from "../types/api"
import { LocalStorageAdapter } from "./adapters/localStorageAdapter"
import { logMeasurementResults } from "./resultsLogger"

interface QHealthAPIConfig {
	allowedOrigins: string[] | "*" // Origin whitelist
	apiVersion: string // '1.0.0'
	enableLogging: boolean
	requestTimeout: number // ms
	maxRequestSize: number // bytes
	adapter?: APIAdapter // Optional adapter (defaults to LocalStorageAdapter)
}

interface PendingRequest {
	resolve: (value: any) => void
	reject: (error: Error) => void
	timeout: NodeJS.Timeout
}

/**
 * QHealth Client API Service
 * Handles two-way communication with embedding clients via postMessage
 * Supports request/response pattern and event broadcasting
 */
export class QHealthClientAPI {
	private config: QHealthAPIConfig
	private sessionInfo: SessionInfo | null = null
	public adapter: APIAdapter // Public so hooks can access it directly
	private pendingRequests: Map<string, PendingRequest> = new Map()
	private eventListeners: Map<APIEventType, Array<(payload: any) => void>> = new Map()
	private isInitialized: boolean = false
	private messageHandler: ((event: MessageEvent) => void) | null = null

	constructor() {
		this.config = {
			allowedOrigins: "*",
			apiVersion: "1.0.0",
			enableLogging: false,
			requestTimeout: 5000,
			maxRequestSize: 1024 * 1024, // 1MB
		}
		this.adapter = new LocalStorageAdapter()
	}

	/**
	 * Initialize the API service
	 */
	initialize(config: Partial<QHealthAPIConfig> = {}): void {
		if (this.isInitialized) {
			console.warn("QHealthClientAPI already initialized")
			return
		}

		// Merge config
		this.config = { ...this.config, ...config }

		// Use provided adapter or default to LocalStorageAdapter
		if (config.adapter) {
			this.adapter = config.adapter
		}

		// Set up message listener for postMessage communication
		if (typeof window !== "undefined") {
			this.messageHandler = (event: MessageEvent) => {
				this.handleIncomingMessage(event)
			}
			window.addEventListener("message", this.messageHandler)
		}

		// Expose Window API if not in iframe
		if (typeof window !== "undefined" && window === window.top) {
			this.exposeWindowAPI()
		}

		this.isInitialized = true

		if (this.config.enableLogging) {
			console.log("QHealthClientAPI initialized", {
				version: this.config.apiVersion,
				allowedOrigins: this.config.allowedOrigins,
			})
		}
	}

	/**
	 * Cleanup and destroy the API service
	 */
	destroy(): void {
		if (this.messageHandler && typeof window !== "undefined") {
			window.removeEventListener("message", this.messageHandler)
			this.messageHandler = null
		}

		// Clear pending requests
		this.pendingRequests.forEach(request => {
			clearTimeout(request.timeout)
		})
		this.pendingRequests.clear()

		// Clear event listeners
		this.eventListeners.clear()

		// Remove window API
		if (typeof window !== "undefined" && (window as any).QHealthAPI) {
			delete (window as any).QHealthAPI
		}

		this.isInitialized = false
	}

	/**
	 * Set current session info
	 */
	setSessionInfo(sessionInfo: SessionInfo): void {
		this.sessionInfo = sessionInfo
		if (this.config.enableLogging) {
			console.log("Session info updated:", sessionInfo)
		}
	}

	/**
	 * Get current session info
	 */
	getSessionInfo(): SessionInfo | null {
		return this.sessionInfo
	}

	/**
	 * Update session status
	 */
	async updateSessionStatus(
		sessionId: string,
		status: SessionStatus,
		updates?: Partial<SessionInfo>
	): Promise<void> {
		try {
			await this.adapter.updateSessionInfo(sessionId, {
				status,
				...updates,
			})

			// Update local session info if it matches
			if (this.sessionInfo?.sessionId === sessionId) {
				this.sessionInfo = {
					...this.sessionInfo,
					status,
					...updates,
				}
			}
		} catch (error) {
			console.error("Failed to update session status:", error)
		}
	}

	/**
	 * Broadcast event to parent window (if in iframe) or window listeners
	 */
	broadcastEvent(event: APIEventType, payload: any, sessionId?: string): void {
		const apiEvent: APIEvent = {
			type: "QHEALTH_EVENT",
			event,
			payload,
			version: this.config.apiVersion,
			timestamp: Date.now(),
			sessionId: sessionId || this.sessionInfo?.sessionId,
		}

		// Send to parent window if in iframe
		if (typeof window !== "undefined" && window.parent !== window) {
			window.parent.postMessage(apiEvent, "*") // Origin validation happens on receiver side
		}

		// Trigger local event listeners
		const listeners = this.eventListeners.get(event) || []
		listeners.forEach(listener => {
			try {
				listener(payload)
			} catch (error) {
				console.error(`Error in event listener for ${event}:`, error)
			}
		})

		// Dispatch custom event for direct embedding
		if (typeof window !== "undefined") {
			window.dispatchEvent(
				new CustomEvent(`qhealth:${event.toLowerCase()}`, {
					detail: payload,
				})
			)
		}

		if (this.config.enableLogging) {
			console.log(`Event broadcast: ${event}`, payload)
		}
	}

	/**
	 * Handle incoming message from parent window
	 */
	private handleIncomingMessage(event: MessageEvent): void {
		// Validate origin
		if (!this.validateOrigin(event.origin)) {
			if (this.config.enableLogging) {
				console.warn("Rejected message from unauthorized origin:", event.origin)
			}
			return
		}

		// Validate message type
		if (!event.data || event.data.type !== "QHEALTH_REQUEST") {
			return
		}

		const request = event.data as APIRequest

		// Validate request
		const validation = this.validateRequest(request)
		if (!validation.valid) {
			this.sendResponse(request.requestId, undefined, validation.error)
			return
		}

		// Handle request
		this.handleRequest(request, event.origin)
	}

	/**
	 * Handle API request
	 */
	private async handleRequest(request: APIRequest, origin: string): Promise<void> {
		try {
			let data: any
			let error: APIError | undefined

			switch (request.method) {
				case "GET_LATEST_RESULTS":
					data = await this.handleGetLatestResults(request.params)
					break

				case "GET_RESULTS_BY_SESSION_ID":
					data = await this.handleGetResultsBySessionId(request.params)
					break

				case "GET_SESSION_INFO":
					data = await this.handleGetSessionInfo()
					break

				case "GET_SESSION_STATUS":
					data = await this.handleGetSessionStatus(request.params)
					break

				case "LIST_SESSIONS":
					data = await this.handleListSessions()
					break

				case "PING":
					data = await this.handlePing()
					break

				default:
					error = this.createError(
						APIErrorCode.INVALID_REQUEST,
						`Unknown method: ${request.method}`
					)
			}

			this.sendResponse(request.requestId, data, error, origin)
		} catch (err) {
			const error = this.createError(
				APIErrorCode.INTERNAL_ERROR,
				err instanceof Error ? err.message : "Internal error",
				{ originalError: err }
			)
			this.sendResponse(request.requestId, undefined, error, origin)
		}
	}

	/**
	 * Send response to client
	 */
	private sendResponse(
		requestId: string,
		data?: any,
		error?: APIError,
		origin: string = "*"
	): void {
		const response: APIResponse = {
			type: "QHEALTH_RESPONSE",
			requestId,
			method: (data as any)?.method || "UNKNOWN",
			success: !error,
			data: error ? undefined : data,
			error,
			version: this.config.apiVersion,
			timestamp: Date.now(),
		}

		// Send to parent window if in iframe
		if (typeof window !== "undefined" && window.parent !== window) {
			window.parent.postMessage(response, origin)
		}

		// Resolve pending request if exists (for Window API)
		const pending = this.pendingRequests.get(requestId)
		if (pending) {
			clearTimeout(pending.timeout)
			this.pendingRequests.delete(requestId)
			if (error) {
				pending.reject(new Error(error.message))
			} else {
				pending.resolve(data)
			}
		}
	}

	/**
	 * Request handlers
	 */
	private async handleGetLatestResults(params?: {
		sessionId?: string
	}): Promise<MeasurementResults> {
		const sessionId = params?.sessionId || this.sessionInfo?.sessionId
		if (!sessionId) {
			throw this.createError(APIErrorCode.SESSION_NOT_FOUND, "No session ID provided")
		}

		const results = await this.adapter.getResults(sessionId)
		if (!results) {
			throw this.createError(
				APIErrorCode.MEASUREMENT_NOT_COMPLETE,
				"No measurement results available"
			)
		}

		return results
	}

	private async handleGetResultsBySessionId(params?: {
		sessionId?: string
	}): Promise<MeasurementResults> {
		if (!params?.sessionId) {
			throw this.createError(APIErrorCode.INVALID_REQUEST, "sessionId is required")
		}

		const results = await this.adapter.getResults(params.sessionId)
		if (!results) {
			throw this.createError(
				APIErrorCode.MEASUREMENT_NOT_COMPLETE,
				"No measurement results available for this session"
			)
		}

		return results
	}

	private async handleGetSessionInfo(): Promise<SessionInfo> {
		if (!this.sessionInfo) {
			throw this.createError(APIErrorCode.SESSION_NOT_FOUND, "No active session")
		}

		// Refresh from adapter
		const sessionInfo = await this.adapter.getSessionInfo(this.sessionInfo.sessionId)
		if (!sessionInfo) {
			throw this.createError(APIErrorCode.SESSION_NOT_FOUND, "Session not found")
		}

		return sessionInfo
	}

	private async handleGetSessionStatus(params?: { sessionId?: string }): Promise<SessionStatus> {
		const sessionId = params?.sessionId || this.sessionInfo?.sessionId
		if (!sessionId) {
			throw this.createError(APIErrorCode.SESSION_NOT_FOUND, "No session ID provided")
		}

		const sessionInfo = await this.adapter.getSessionInfo(sessionId)
		if (!sessionInfo) {
			throw this.createError(APIErrorCode.SESSION_NOT_FOUND, "Session not found")
		}

		return sessionInfo.status
	}

	private async handleListSessions(): Promise<SessionInfo[]> {
		return await this.adapter.listSessions()
	}

	private async handlePing(): Promise<{ status: string; timestamp: number }> {
		return {
			status: "ok",
			timestamp: Date.now(),
		}
	}

	/**
	 * Validate origin
	 */
	private validateOrigin(origin: string): boolean {
		if (this.config.allowedOrigins === "*") {
			return true
		}

		if (Array.isArray(this.config.allowedOrigins)) {
			return this.config.allowedOrigins.includes(origin)
		}

		return false
	}

	/**
	 * Validate request
	 */
	private validateRequest(request: APIRequest): { valid: boolean; error?: APIError } {
		// Check request type
		if (request.type !== "QHEALTH_REQUEST") {
			return {
				valid: false,
				error: this.createError(APIErrorCode.INVALID_REQUEST, "Invalid request type"),
			}
		}

		// Check version
		if (request.version !== this.config.apiVersion) {
			return {
				valid: false,
				error: this.createError(
					APIErrorCode.INVALID_REQUEST,
					`Version mismatch: expected ${this.config.apiVersion}, got ${request.version}`
				),
			}
		}

		// Check method
		const validMethods: APIMethod[] = [
			"GET_LATEST_RESULTS",
			"GET_RESULTS_BY_SESSION_ID",
			"GET_SESSION_INFO",
			"GET_SESSION_STATUS",
			"LIST_SESSIONS",
			"PING",
		]
		if (!validMethods.includes(request.method)) {
			return {
				valid: false,
				error: this.createError(APIErrorCode.INVALID_REQUEST, `Invalid method: ${request.method}`),
			}
		}

		// Check request size (approximate)
		const requestSize = JSON.stringify(request).length
		if (requestSize > this.config.maxRequestSize) {
			return {
				valid: false,
				error: this.createError(
					APIErrorCode.INVALID_REQUEST,
					`Request too large: ${requestSize} bytes`
				),
			}
		}

		return { valid: true }
	}

	/**
	 * Create error object
	 */
	private createError(
		code: APIErrorCode,
		message: string,
		details?: Record<string, any>
	): APIError {
		return {
			code,
			message,
			details,
			timestamp: Date.now(),
		}
	}

	/**
	 * Expose Window API for direct embedding
	 */
	private exposeWindowAPI(): void {
		if (typeof window === "undefined") {
			return
		}

		const api = {
			// Event listeners
			on: (event: APIEventType, callback: (payload: any) => void) => {
				if (!this.eventListeners.has(event)) {
					this.eventListeners.set(event, [])
				}
				this.eventListeners.get(event)!.push(callback)
			},

			off: (event: APIEventType, callback: (payload: any) => void) => {
				const listeners = this.eventListeners.get(event)
				if (listeners) {
					const index = listeners.indexOf(callback)
					if (index > -1) {
						listeners.splice(index, 1)
					}
				}
			},

			// API methods
			getLatestResults: async (sessionId?: string): Promise<MeasurementResults> => {
				return await this.handleGetLatestResults({ sessionId })
			},

			getResultsBySessionId: async (sessionId: string): Promise<MeasurementResults> => {
				return await this.handleGetResultsBySessionId({ sessionId })
			},

			getSessionInfo: async (): Promise<SessionInfo> => {
				return await this.handleGetSessionInfo()
			},

			getSessionStatus: async (sessionId?: string): Promise<SessionStatus> => {
				return await this.handleGetSessionStatus({ sessionId })
			},

			listSessions: async (): Promise<SessionInfo[]> => {
				return await this.handleListSessions()
			},

			ping: async (): Promise<{ status: string; timestamp: number }> => {
				return await this.handlePing()
			},
		}

		;(window as any).QHealthAPI = api
	}

	/**
	 * Store measurement results and broadcast event
	 */
	async storeMeasurementResults(sessionId: string, results: MeasurementResults): Promise<void> {
		try {
			// Store results via adapter
			await this.adapter.storeResults(sessionId, results)

			// Update session info
			const sessionInfo = await this.adapter.getSessionInfo(sessionId)
			if (sessionInfo) {
				this.setSessionInfo(sessionInfo)
			}

			// Log results if enabled
			if (this.config.enableLogging) {
				logMeasurementResults(results, {
					enabled: true,
					format: "detailed",
				})
			}

			// Broadcast MEASUREMENT_COMPLETE event
			this.broadcastEvent("MEASUREMENT_COMPLETE", results, sessionId)
		} catch (error) {
			console.error("Failed to store measurement results:", error)
			this.broadcastEvent(
				"ERROR",
				{
					code: "STORAGE_ERROR",
					message: error instanceof Error ? error.message : "Failed to store results",
				},
				sessionId
			)
		}
	}
}

// Singleton instance
let apiInstance: QHealthClientAPI | null = null

/**
 * Get or create API instance
 */
export function getQHealthAPI(): QHealthClientAPI {
	if (!apiInstance) {
		apiInstance = new QHealthClientAPI()
	}
	return apiInstance
}

/**
 * Initialize API from URL parameters
 */
export function initializeAPIFromURL(): QHealthClientAPI {
	// Check if window is available (for SSR safety)
	if (typeof window === "undefined") {
		console.warn("QHealthClientAPI: window is not available, skipping initialization")
		return getQHealthAPI()
	}

	const params = new URLSearchParams(window.location.search)

	// Parse allowed origins
	const allowedOriginParam = params.get("allowedOrigin")
	let allowedOrigins: string[] | "*" = "*"
	if (allowedOriginParam) {
		if (allowedOriginParam === "*") {
			allowedOrigins = "*"
		} else {
			allowedOrigins = allowedOriginParam.split(",").map(o => o.trim())
		}
	}

	// Parse enable logging
	const enableLogging = params.get("enableLogging") === "true"

	// Parse API version
	const apiVersion = params.get("apiVersion") || "1.0.0"

	// Get API instance
	const api = getQHealthAPI()

	// Initialize with config
	api.initialize({
		allowedOrigins,
		enableLogging,
		apiVersion,
	})

	return api
}
