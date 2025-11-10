import React, { useState } from "react"

import Visibility from "../assets/visibility.svg"
import { cn } from "../lib/utils"

interface PasswordInputProps {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
	value: string
	isValid?: boolean
}

const PasswordInput = ({ onChange, onBlur, value, isValid = true }: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)

	return (
		<div className="flex relative items-center w-[340px] h-9">
			<input
				type={showPassword ? "text" : "password"}
				onChange={onChange}
				onBlur={onBlur}
				value={value}
				className={cn(
					"pl-[10px] pr-[35px] box-border rounded-lg bg-white w-full h-full text-foreground border transition-all duration-300 text-sm",
					"focus:border-2 focus:outline-none focus:shadow-[0_0_0_3px]",
					isValid
						? "border-[#d4d4d0] focus:border-[#4a7c2a] focus:shadow-[#4a7c2a33] hover:border-[#8b8b8b]"
						: "border-[#d4d4d0] focus:border-[#c33] focus:shadow-[#c33333] hover:border-[#c33]"
				)}
			/>
			<div
				className="flex justify-center items-center cursor-pointer absolute right-0 px-[10px] h-full"
				onClick={() => setShowPassword(!showPassword)}
			>
				<img src={Visibility} alt="" />
			</div>
		</div>
	)
}

export default PasswordInput
