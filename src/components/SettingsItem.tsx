import React from "react"

import { cn } from "../lib/utils"
import PasswordInput from "./PasswordInput"

interface SettingsItemProps {
	title: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
	type: string
	value: string
	isValid?: boolean
}

const SettingsItem = ({
	title,
	onChange,
	onBlur,
	type,
	value,
	isValid = true,
}: SettingsItemProps) => {
	return (
		<div>
			<h3 className="font-normal font-medium text-sm leading-[19px] text-foreground mb-1.5 transition-colors duration-300">
				{title}
			</h3>
			{type === "password" ? (
				<PasswordInput onChange={onChange} onBlur={onBlur} value={value} isValid={isValid} />
			) : (
				<input
					type={type}
					onChange={onChange}
					onBlur={onBlur}
					value={value}
					className={cn(
						"pl-[10px] box-border rounded-md bg-card w-[340px] h-9 text-foreground border transition-all duration-300 text-sm",
						"focus:border-2 focus:outline-none focus:shadow-[0_0_0_3px]",
						isValid
							? "border-border-medium focus:border-link focus:shadow-[rgba(74,124,42,0.2)] hover:border-border-dark"
							: "border-border-medium focus:border-destructive focus:shadow-[rgba(204,51,51,0.2)] hover:border-destructive"
					)}
				/>
			)}
		</div>
	)
}

export default SettingsItem
