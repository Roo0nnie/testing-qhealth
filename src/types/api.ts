import { MeasurementResults, SessionData } from "../types"

// Error Codes
export enum APIErrorCode {
	// Client errors (4xx)
	INVALID_REQUEST = "INVALID_REQUEST",
	UNAUTHORIZED = "UNAUTHORIZED",
	FORBIDDEN = "FORBIDDEN",
	NOT_FOUND = "NOT_FOUND",
	SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
	SESSION_EXPIRED = "SESSION_EXPIRED",
	INVALID_SESSION_ID = "INVALID_SESSION_ID",
	RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

	// Server errors (5xx)
	INTERNAL_ERROR = "INTERNAL_ERROR",
	SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
	TIMEOUT = "TIMEOUT",

	// Measurement errors
	MEASUREMENT_NOT_COMPLETE = "MEASUREMENT_NOT_COMPLETE",
	MEASUREMENT_IN_PROGRESS = "MEASUREMENT_IN_PROGRESS",
	MEASUREMENT_FAILED = "MEASUREMENT_FAILED",
}

export interface APIError {
	code: APIErrorCode
	message: string
	details?: Record<string, any>
	timestamp: number
}

// Session States
export enum SessionStatus {
	ACTIVE = "ACTIVE", // Session created, ready for measurement
	MEASURING = "MEASURING", // Measurement in progress
	COMPLETED = "COMPLETED", // Measurement completed successfully
	FAILED = "FAILED", // Measurement failed
	EXPIRED = "EXPIRED", // Session expired
}

export interface SessionInfo {
	sessionId: string
	status: SessionStatus
	createdAt: number
	lastMeasurementAt?: number
	measurementCount: number
	expiresAt?: number
}

// API Methods
export type APIMethod =
	| "GET_LATEST_RESULTS"
	| "GET_RESULTS_BY_SESSION_ID"
	| "GET_SESSION_INFO"
	| "GET_SESSION_STATUS"
	| "LIST_SESSIONS"
	| "PING"

// API Events
export type APIEventType =
	| "MEASUREMENT_STARTED"
	| "MEASUREMENT_COMPLETE"
	| "MEASUREMENT_FAILED"
	| "SESSION_CREATED"
	| "SESSION_EXPIRED"
	| "ERROR"

// Message Types
export interface APIRequest<TParams = any> {
	type: "QHEALTH_REQUEST"
	requestId: string // UUID for correlation
	method: APIMethod
	params?: TParams
	version: string // API version: '1.0.0'
	timestamp: number
}

export interface APIResponse<TData = any> {
	type: "QHEALTH_RESPONSE"
	requestId: string // Matches request
	method: APIMethod
	success: boolean
	data?: TData
	error?: APIError
	version: string
	timestamp: number
}

export interface APIEvent<TPayload = any> {
	type: "QHEALTH_EVENT"
	event: APIEventType
	payload: TPayload
	version: string
	timestamp: number
	sessionId?: string
}

// API Adapter Interface
export interface APIAdapter {
	storeResults(sessionId: string, results: MeasurementResults): Promise<void>
	getResults(sessionId: string): Promise<MeasurementResults | null>
	getSessionInfo(sessionId: string): Promise<SessionInfo | null>
	updateSessionInfo(sessionId: string, updates: Partial<SessionInfo>): Promise<void>
	listSessions(): Promise<SessionInfo[]>
}
