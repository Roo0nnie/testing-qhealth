// @ts-ignore - @vercel/node types may not be available in all environments
import { VercelRequest, VercelResponse } from "@vercel/node"

import { setResult } from "./shared-storage"

export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Handle CORS - set headers before any returns
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")

	if (req.method === "OPTIONS") {
		return res.status(200).end()
	}

	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" })
	}

	try {
		const { sessionId, vitalSigns } = req.body

		// Validate sessionId
		if (!sessionId || typeof sessionId !== "string") {
			return res.status(400).json({
				error: "sessionId is required and must be a string",
			})
		}

		// Validate sessionId format (should be UUID)
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
		if (!uuidRegex.test(sessionId)) {
			return res.status(400).json({
				error: "Invalid sessionId format",
			})
		}

		// Validate vitalSigns
		if (!vitalSigns || typeof vitalSigns !== "object") {
			return res.status(400).json({
				error: "vitalSigns is required and must be an object",
			})
		}

		// Store results
		setResult(sessionId, vitalSigns)

		return res.status(200).json({
			success: true,
			sessionId,
			message: "Results stored successfully",
		})
	} catch (error) {
		console.error("Error storing results:", error)
		return res.status(500).json({
			error: "Internal server error",
			message: error instanceof Error ? error.message : "Unknown error",
		})
	}
}
