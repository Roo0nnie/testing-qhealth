import React from "react"

// @ts-ignore
import { ReactComponent as SpinnerBase } from "../assets/no-stats.svg"

const Spinner = () => (
	<div className="w-fit animate-spin opacity-80 mt-[13px] md:mt-0 md:mr-[30px]">
		<SpinnerBase />
	</div>
)

export default Spinner
