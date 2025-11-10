import React, { useEffect, useRef } from "react"
import styled from "styled-components"

import media from "../style/media"
import { mirror } from "../style/mirror"

const Canvas = styled.canvas<{ height: number; dim: boolean }>`
	position: absolute;
	top: 0;
	left: 0;
	background-color: ${({ dim }) => (dim ? "rgba(0, 0, 0, 0.4)" : "transparent")};
	${media.tablet`
    background-color: transparent;
  `}
	${mirror}
`

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
		!isReport && context.strokeRect(faceRect.x, faceRect.y, faceRect.width, faceRect.height)
	}, [faceRect, isReport])

	return <Canvas width={width} height={height} ref={canvasRef} dim={isReport} />
}

export default OverlayCanvas
