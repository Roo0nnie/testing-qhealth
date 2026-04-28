import React, { useEffect } from "react"

import { useDisableZoom } from "../hooks"
import useDeviceDetection from "../hooks/useDeviceDetection"
import useSession from "../hooks/useSession"
import { getQHealthAPI, initializeAPIFromURL } from "../services/qhealthClientAPI"
import { SessionStatus } from "../types/api"
import InsightGenieMonitor from "./InsightGenieMonitor"
import { Toaster } from "./ui/sonner"

const App = () => {
	const { isDesktop } = useDeviceDetection()
	const { session, refreshSession } = useSession(isDesktop)
	useDisableZoom()

	useEffect(() => {
		initializeAPIFromURL()
	}, [])

	useEffect(() => {
		if (!session) return
		const api = getQHealthAPI()
		api.setSessionInfo({
			sessionId: session.sessionId,
			status: SessionStatus.ACTIVE,
			createdAt: session.createdAt,
			measurementCount: 0,
			expiresAt: session.createdAt + 60 * 60 * 1000,
		})

		api
			.updateSessionStatus(session.sessionId, SessionStatus.ACTIVE, {
				createdAt: session.createdAt,
				expiresAt: session.createdAt + 60 * 60 * 1000,
			})
			.catch(err => {
				console.error("Failed to update session info:", err)
			})

		api.broadcastEvent("SESSION_CREATED", {
			sessionId: session.sessionId,
			createdAt: session.createdAt,
		})
	}, [session])

	return (
		<div className="relative flex h-screen w-full flex-col items-center justify-start overflow-hidden max-h-screen">
			<InsightGenieMonitor
				showMonitor={true}
				sessionId={session?.sessionId}
				onRefreshSession={refreshSession}
			/>
			<Toaster />
		</div>
	)
}

export default App
