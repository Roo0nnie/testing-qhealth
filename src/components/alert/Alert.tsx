import React, { useEffect, useRef } from "react"
import { toast } from "sonner"

interface AlertProps {
	error?: string
	warning?: string
	info?: string
}

const Alert = ({ error, warning, info }: AlertProps) => {
	const prevError = useRef<string | undefined>()
	const prevWarning = useRef<string | undefined>()
	const prevInfo = useRef<string | undefined>()

	// Handle error messages
	useEffect(() => {
		if (error && error !== prevError.current) {
			toast.error(error)
			prevError.current = error
		} else if (!error) {
			prevError.current = undefined
		}
	}, [error])

	// Handle warning messages
	useEffect(() => {
		if (warning && warning !== prevWarning.current) {
			toast.warning(warning)
			prevWarning.current = warning
		} else if (!warning) {
			prevWarning.current = undefined
		}
	}, [warning])

	// Handle info messages
	useEffect(() => {
		if (info && info !== prevInfo.current) {
			toast.info(info)
			prevInfo.current = info
		} else if (!info) {
			prevInfo.current = undefined
		}
	}, [info])

	return null
}

export default Alert

