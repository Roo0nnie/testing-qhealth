/**
 * QHealth Client Integration Example
 *
 * This file demonstrates how to integrate the QHealth app into your application
 * and receive measurement results.
 */

class QHealthClient {
	/**
	 * @param {HTMLIFrameElement} iframeElement - The iframe element containing the QHealth app
	 * @param {string} allowedOrigin - The allowed origin for postMessage communication
	 */
	constructor(iframeElement, allowedOrigin) {
		this.iframe = iframeElement
		this.allowedOrigin = allowedOrigin
		this.pendingRequests = new Map()
		this.eventHandlers = new Map()

		// Store bound handler so it can be properly removed later
		this.boundHandleMessage = this.handleMessage.bind(this)

		// Set up message listener
		window.addEventListener("message", this.boundHandleMessage)
	}

	/**
	 * Generate UUID for request correlation
	 * @returns {string} A UUID string
	 */
	generateUUID() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
			const r = (Math.random() * 16) | 0
			const v = c === "x" ? r : (r & 0x3) | 0x8
			return v.toString(16)
		})
	}

	/**
	 * Handle incoming messages from iframe
	 * @param {MessageEvent} event - The message event from the iframe
	 */
	handleMessage(event) {
		// Validate origin
		if (event.origin !== this.allowedOrigin) {
			return
		}

		const { type, event: eventType, payload, requestId, success, data, error } = event.data

		// Handle events
		if (type === "QHEALTH_EVENT") {
			this.handleEvent(eventType, payload)
		}

		// Handle responses
		if (type === "QHEALTH_RESPONSE") {
			this.handleResponse(requestId, { success, data, error })
		}
	}

	/**
	 * Handle events
	 * @param {string} eventType - The type of event
	 * @param {any} payload - The event payload
	 */
	handleEvent(eventType, payload) {
		const handlers = this.eventHandlers.get(eventType) || []
		handlers.forEach(
			/** @type {function(any): void} */ handler => {
				try {
					handler(payload)
				} catch (error) {
					console.error(`Error in event handler for ${eventType}:`, error)
				}
			}
		)
	}

	/**
	 * Handle response
	 * @param {string} requestId - The request ID to correlate with pending request
	 * @param {Object} response - The response object
	 * @param {boolean} response.success - Whether the request was successful
	 * @param {any} [response.data] - The response data
	 * @param {{message?: string}} [response.error] - The error object if request failed
	 */
	handleResponse(requestId, { success, data, error }) {
		const pending = this.pendingRequests.get(requestId)
		if (pending) {
			clearTimeout(pending.timeout)
			this.pendingRequests.delete(requestId)
			if (success) {
				pending.resolve(data)
			} else {
				pending.reject(new Error(error?.message || "Request failed"))
			}
		}
	}

	/**
	 * Send request to QHealth app
	 * @param {string} method - The API method to call
	 * @param {Object} [params={}] - The method parameters
	 * @returns {Promise<any>} A promise that resolves with the response data
	 */
	sendRequest(method, params = {}) {
		return new Promise((resolve, reject) => {
			const requestId = this.generateUUID()
			const request = {
				type: "QHEALTH_REQUEST",
				requestId,
				method,
				params,
				version: "1.0.0",
				timestamp: Date.now(),
			}

			// Store pending request
			const timeout = setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					this.pendingRequests.delete(requestId)
					reject(new Error("Request timeout"))
				}
			}, 5000)

			this.pendingRequests.set(requestId, { resolve, reject, timeout })

			// Send request
			if (this.iframe.contentWindow) {
				this.iframe.contentWindow.postMessage(request, this.allowedOrigin)
			} else {
				reject(new Error("Iframe contentWindow is not available"))
			}
		})
	}

	/**
	 * Subscribe to events
	 * @param {string} eventType - The event type to subscribe to
	 * @param {function(any): void} handler - The event handler function
	 */
	on(eventType, handler) {
		if (!this.eventHandlers.has(eventType)) {
			this.eventHandlers.set(eventType, [])
		}
		this.eventHandlers.get(eventType).push(handler)
	}

	/**
	 * Unsubscribe from events
	 * @param {string} eventType - The event type to unsubscribe from
	 * @param {function(any): void} handler - The event handler function to remove
	 */
	off(eventType, handler) {
		const handlers = this.eventHandlers.get(eventType)
		if (handlers) {
			const index = handlers.indexOf(handler)
			if (index > -1) {
				handlers.splice(index, 1)
			}
		}
	}

	/**
	 * Get latest measurement results
	 * @param {string} sessionId - The session ID
	 * @returns {Promise<any>} A promise that resolves with the latest results
	 */
	async getLatestResults(sessionId) {
		return await this.sendRequest("GET_LATEST_RESULTS", { sessionId })
	}

	/**
	 * Get session info
	 * @returns {Promise<any>} A promise that resolves with the session info
	 */
	async getSessionInfo() {
		return await this.sendRequest("GET_SESSION_INFO")
	}

	/**
	 * Get session status
	 * @param {string} sessionId - The session ID
	 * @returns {Promise<any>} A promise that resolves with the session status
	 */
	async getSessionStatus(sessionId) {
		return await this.sendRequest("GET_SESSION_STATUS", { sessionId })
	}

	/**
	 * List all sessions
	 * @returns {Promise<any>} A promise that resolves with the list of sessions
	 */
	async listSessions() {
		return await this.sendRequest("LIST_SESSIONS")
	}

	/**
	 * Ping (health check)
	 * @returns {Promise<any>} A promise that resolves with the ping response
	 */
	async ping() {
		return await this.sendRequest("PING")
	}

	/**
	 * Cleanup
	 */
	destroy() {
		window.removeEventListener("message", this.boundHandleMessage)
		this.pendingRequests.clear()
		this.eventHandlers.clear()
	}
}

// Usage example
document.addEventListener("DOMContentLoaded", () => {
	const iframe = document.getElementById("qhealth-iframe")
	if (!iframe || !(iframe instanceof HTMLIFrameElement)) {
		console.error("QHealth iframe element not found or is not an iframe")
		return
	}

	const ALLOWED_ORIGIN = "https://your-qhealth-app.com"

	// Create client
	const client = new QHealthClient(iframe, ALLOWED_ORIGIN)

	// Subscribe to events
	client.on("MEASUREMENT_STARTED", payload => {
		console.log("Measurement started:", payload)
		// Update UI to show measurement in progress
		const statusEl = document.getElementById("status")
		if (statusEl) {
			statusEl.textContent = "Measurement in progress..."
		}
	})

	client.on("MEASUREMENT_COMPLETE", payload => {
		console.log("Measurement complete:", payload)
		// Update UI to show results
		const statusEl = document.getElementById("status")
		const resultsEl = document.getElementById("results")
		if (statusEl) {
			statusEl.textContent = "Measurement complete!"
		}
		if (resultsEl) {
			resultsEl.textContent = JSON.stringify(payload, null, 2)
		}

		// Save results to your backend
		fetch("/api/measurements", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then(response => {
				if (response.ok) {
					console.log("Results saved to backend")
				}
			})
			.catch(error => {
				console.error("Failed to save results:", error)
			})
	})

	client.on("MEASUREMENT_FAILED", payload => {
		console.error("Measurement failed:", payload)
		const statusEl = document.getElementById("status")
		if (statusEl) {
			statusEl.textContent = `Measurement failed: ${payload.error}`
		}
	})

	client.on("SESSION_CREATED", payload => {
		console.log("Session created:", payload)
	})

	client.on("ERROR", payload => {
		console.error("Error:", payload)
		const statusEl = document.getElementById("status")
		if (statusEl) {
			statusEl.textContent = `Error: ${payload.message}`
		}
	})

	// Query for session status periodically
	// Note: You'll need to provide a sessionId when calling getSessionStatus
	// This is just an example - replace with actual sessionId from your app
	setInterval(async () => {
		try {
			// Example: const status = await client.getSessionStatus(sessionId)
			// console.log("Session status:", status)
		} catch (error) {
			console.error("Failed to get session status:", error)
		}
	}, 5000)

	// Cleanup on page unload
	window.addEventListener("beforeunload", () => {
		client.destroy()
	})
})
