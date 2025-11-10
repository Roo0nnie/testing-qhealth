import React, { useState } from "react"
import styled from "styled-components"

import Visibility from "../assets/visibility.svg"

const Container = styled.div`
	display: flex;
	position: relative;
	align-items: center;
	width: 340px;
	height: 36px;
`

const Input = styled.input<{ inValid: boolean }>`
	padding-left: 10px;
	padding-right: 35px;
	box-sizing: border-box;
	border-radius: 8px;
	background-color: #ffffff;
	width: inherit;
	height: inherit;
	color: #2d2d2d;
	border: 1px solid #d4d4d0;
	transition: all 300ms ease-in-out;
	font-size: 14px;

	&:focus {
		border-width: 2px;
		outline: none;
		border-color: ${({ inValid }) => (inValid ? "#c33" : "#4a7c2a")};
		box-shadow: 0 0 0 3px
			${({ inValid }) => (inValid ? "rgba(204, 51, 51, 0.1)" : "rgba(74, 124, 42, 0.1)")};
	}

	&:hover {
		border-color: ${({ inValid }) => (inValid ? "#c33" : "#8b8b8b")};
	}
`

const ImageWrapper = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	position: absolute;
	right: 0;
	padding: 0 10px;
	height: inherit;
`

interface PasswordInputProps {
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	onBlur: (e: React.FocusEvent<HTMLInputElement>) => void
	value: string
	isValid?: boolean
}

const PasswordInput = ({ onChange, onBlur, value, isValid = true }: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState<boolean>(false)

	return (
		<Container>
			<Input
				type={showPassword ? "string" : "password"}
				onChange={onChange}
				onBlur={onBlur}
				value={value}
				inValid={!isValid}
			/>
			<ImageWrapper onClick={() => setShowPassword(!showPassword)}>
				<img src={Visibility} alt="" />
			</ImageWrapper>
		</Container>
	)
}

export default PasswordInput
