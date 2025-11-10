import React, { useCallback, useEffect, useState } from "react"

import { cn } from "../lib/utils"
import SettingsDropDown from "./SettingsDropDown"
import CloseButton from "./shared/CloseButton"

interface SettingsBarsProps {
	open: boolean
	onClose: (data: { cameraId?: string }) => void
	cameras: Array<{ deviceId: string; label: string }>
	isLicenseValid: boolean
}

const SettingsBars = ({ open, onClose, cameras, isLicenseValid }: SettingsBarsProps) => {
	const [cameraId, setCameraId] = useState<string>()
	const [isClosing, setIsClosing] = useState<boolean>(false)
	const [shouldRender, setShouldRender] = useState<boolean>(false)

	const mapCamerasToDropDown = useCallback(
		(cameras: Array<{ deviceId: string; label: string }>) =>
			cameras?.map(({ deviceId, label }) => ({ value: deviceId, name: label })),
		[]
	)

	const handleCameraSelected = useCallback((cameraId: string) => {
		setCameraId(cameraId)
	}, [])

	const handleClose = useCallback(() => {
		setIsClosing(true)
		setTimeout(() => {
			onClose({ cameraId })
			setIsClosing(false)
			setShouldRender(false)
		}, 300)
	}, [cameraId, onClose])

	useEffect(() => {
		if (cameras?.length) {
			setCameraId(cameras[0]?.deviceId)
		}
	}, [cameras])

	useEffect(() => {
		if (open) {
			setShouldRender(true)
			setIsClosing(false)
		}
	}, [open])

	if (!shouldRender && !isClosing) {
		return null
	}

	return (
		<div id="settingsBars">
			<div
				className={cn(
					"absolute flex flex-col items-center h-screen top-0 left-0 bg-background overflow-hidden z-[1] shadow-lg transition-all duration-300 ease-in-out",
					"md:w-[400px] md:shadow-md"
				)}
				style={{
					width: isClosing ? "0" : "100%",
				}}
			>
				<div className="flex flex-col mt-20 w-[340px] box-border min-w-[340px]">
					<div className="flex justify-end items-center w-full mb-4">
						<CloseButton onClick={handleClose} />
					</div>
					<div className="hidden md:block md:mt-4">
						<h3 className="font-normal font-medium text-sm leading-[19px] text-foreground mb-1.5 transition-colors duration-300">
							Camera
						</h3>
						<SettingsDropDown
							onSelect={handleCameraSelected}
							options={mapCamerasToDropDown(cameras)}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default SettingsBars
