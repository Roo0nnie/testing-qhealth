import React, { useCallback } from "react"

interface SettingsDropDownProps {
	options: Array<{ value: string; name: string }>
	onSelect: (value: string) => void
}

const SettingsDropDown = ({ options, onSelect }: SettingsDropDownProps) => {
	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLSelectElement>) => onSelect(event.target.value),
		[onSelect]
	)

	return (
		<select
			onChange={handleChange}
			className="pl-[10px] border border-black box-border rounded-[5px] bg-[#f1f4f9] w-[340px] h-9 text-[#3e3c3c]"
		>
			{options?.map(({ value, name }: { value: string; name: string }) => (
				<option key={value} value={value} className="font-normal text-sm leading-[17px] text-[#3e3c3c]">
					{name}
				</option>
			))}
		</select>
	)
}

export default SettingsDropDown
