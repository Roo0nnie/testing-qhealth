import React from "react"
import styled from "styled-components"

import PasswordInput from "./PasswordInput"

const Wrapper = styled.div``
const Title = styled.h3`
	font-style: normal;
	font-weight: 500;
	font-size: 14px;
	line-height: 19px;
	color: ${({ theme }) => theme.colors.text.primary};
	margin-bottom: 6px;
	transition: color ${({ theme }) => theme.transitions.normal};
`

const Input = styled.input<{ inValid: boolean }>`
	padding-left: 10px;
	box-sizing: border-box;
	border-radius: ${({ theme }) => theme.borderRadius.md};
	background-color: ${({ theme }) => theme.colors.background.secondary};
	width: 340px;
	height: 36px;
	color: ${({ theme }) => theme.colors.text.primary};
	border: 1px solid ${({ theme }) => theme.colors.border.medium};
	transition: all ${({ theme }) => theme.transitions.normal};
	font-size: 14px;

	&:focus {
		border-width: 2px;
		outline: none;
		border-color: ${({ theme, inValid }) =>
			inValid ? theme.colors.status.error : theme.colors.text.link};
		box-shadow: 0 0 0 3px
			${({ theme, inValid }) =>
				inValid ? `${theme.colors.status.error}33` : `${theme.colors.text.link}33`};
	}

	&:hover {
		border-color: ${({ theme, inValid }) =>
			inValid ? theme.colors.status.error : theme.colors.border.dark};
	}
`

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
		<Wrapper>
			<Title>{title}</Title>
			{type === "password" ? (
				<PasswordInput onChange={onChange} onBlur={onBlur} value={value} isValid={isValid} />
			) : (
				<Input type={type} onChange={onChange} onBlur={onBlur} value={value} inValid={!isValid} />
			)}
		</Wrapper>
	)
}
export default SettingsItem
