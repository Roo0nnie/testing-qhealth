import React from "react"

import logo from "../assets/gaia.svg"

const Logo = () => {
	return (
		<div>
			<img src={logo} alt="Logo" className="h-[50px] pt-[9px] pointer-events-none" />
		</div>
	)
}

export default Logo
