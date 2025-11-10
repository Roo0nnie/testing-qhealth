import React from "react"
import ReactDOM from "react-dom"
import styled from "styled-components"

import App from "./components/App"
import { ThemeProvider } from "./context/ThemeContext"
import GlobalStyle from "./style/global"

const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`

ReactDOM.render(
	<ThemeProvider>
		<Wrapper>
			<GlobalStyle />
			<App />
		</Wrapper>
	</ThemeProvider>,
	document.getElementById("root")
)
