import React from "react"
import ReactDOM from "react-dom"

import App from "./components/App"
import { ThemeProvider } from "./context/ThemeContext"
import "./index.css"

ReactDOM.render(
	<ThemeProvider>
		<div className="w-full h-full overflow-hidden">
			<App />
		</div>
	</ThemeProvider>,
	document.getElementById("root")
)
