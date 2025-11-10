import { useEffect, useState } from "react"

const usePageVisibility = () => {
	const [visible, setVisible] = useState<boolean>(true)

	useEffect(() => {
		const focused = () => {
			if (!visible) {
				setVisible(true)
			}
		}

		const unfocused = () => {
			if (visible) {
				setVisible(false)
			}
		}

		// Standards:
		if ("hidden" in document) {
			setVisible(!document.hidden)
			document.addEventListener("visibilitychange", function () {
				;(document.hidden ? unfocused : focused)()
			})
		}
		if ("mozHidden" in document) {
			setVisible(!(document as any)["mozHidden"])
			// @ts-ignore
			document.addEventListener("mozvisibilitychange", function () {
				;((document as any)["mozHidden"] ? unfocused : focused)()
			})
		}
		if ("webkitHidden" in document) {
			setVisible(!(document as any)["webkitHidden"])
			// @ts-ignore
			document.addEventListener("webkitvisibilitychange", function () {
				;((document as any)["webkitHidden"] ? unfocused : focused)()
			})
		}
		if ("msHidden" in document) {
			setVisible(!(document as any)["msHidden"])
			// @ts-ignore
			document.addEventListener("msvisibilitychange", function () {
				;((document as any)["msHidden"] ? unfocused : focused)()
			})
		}
		// IE 9 and lower:
		if ("onfocusin" in document) {
			// @ts-ignore
			document.onfocusin = focused
			// @ts-ignore
			document.onfocusout = unfocused
		}
		// All others:
		window.onpageshow = window.onfocus = focused
		window.onpagehide = window.onblur = unfocused
	})

	return visible
}
export default usePageVisibility
