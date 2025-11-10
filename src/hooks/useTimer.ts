import { useEffect, useState } from "react"

const useTimer = (started: boolean, durationSeconds: number) => {
	const [seconds, setSeconds] = useState(1)

	useEffect(() => {
		if (started) {
			setSeconds(1)
			const intervalId = setInterval(() => {
				setSeconds(seconds => {
					if (seconds >= durationSeconds - 1) {
						clearInterval(intervalId)
						return durationSeconds
					}
					return seconds + 1
				})
			}, 1000)

			return () => {
				clearInterval(intervalId)
			}
		} else {
			setSeconds(1)
		}
	}, [started, durationSeconds])

	return seconds
}
export default useTimer
