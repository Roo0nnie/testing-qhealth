import React from "react"
import styled from "styled-components"

import logo from "../assets/gaia.svg"

const Img = styled.img`
	height: 50px;
	padding-top: 9px;
	pointer-events: none;
`

const Logo = () => {
	return (
		<div>
			<Img src={logo} />
		</div>
	)
}

export default Logo
