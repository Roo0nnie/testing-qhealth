import React, { useEffect, useRef } from "react"

import { cn } from "../lib/utils"

interface OverlayCanvasProps {
	faceRect?: any
	width: number
	height: number
	isReport: boolean
}

const OverlayCanvas = ({ faceRect, width, height, isReport }: OverlayCanvasProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	useEffect(() => {
		const context = canvasRef.current?.getContext("2d")
		if (!context) return
		context.clearRect(0, 0, width, height)
		if (!faceRect) return
		context.strokeStyle = "#0653F4"
		context.lineWidth = 1
		if (!isReport) {
			context.strokeRect(faceRect.x, faceRect.y, faceRect.width, faceRect.height)
		}
	}, [faceRect, isReport, width, height])

	return (
		<canvas
			width={width}
			height={height}
			ref={canvasRef}
			className={cn(
				"absolute top-0 left-0 scale-x-[-1]",
				isReport ? "bg-[rgba(0,0,0,0.4)]" : "bg-transparent",
				"md:bg-transparent"
			)}
		/>
	)
}

export default OverlayCanvas
