import { useEffect, useState } from "react"

const useTimer = (started: boolean, durationSeconds: number) => {
	const [seconds, setSeconds] = useState(durationSeconds)

	useEffect(() => {
		if (started) {
			setSeconds(durationSeconds)
			const intervalId = setInterval(() => {
				setSeconds(seconds => {
					if (seconds <= 1) {
						clearInterval(intervalId)
						return 0
					}
					return seconds - 1
				})
			}, 1000)

			return () => {
				clearInterval(intervalId)
			}
		} else {
			setSeconds(durationSeconds)
		}
	}, [started, durationSeconds])

	return seconds
}
export default useTimer
