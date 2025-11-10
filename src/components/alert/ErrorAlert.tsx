import React from "react"
import styled from "styled-components"

import ErrorIcon from "../../assets/error-icon.svg"
import { Flex } from "../shared/Flex"

const Wrapper = styled(Flex)`
	position: absolute;
	bottom: 0;
	height: 120px;
	width: 100%;
	justify-content: start;
	align-items: center;
	background-color: #ffffff;
	box-shadow:
		0 -4px 6px -1px rgba(0, 0, 0, 0.1),
		0 -2px 4px -1px rgba(0, 0, 0, 0.06);
`

const Message = styled.div`
	padding: 0 20px 0 10px;
	font-size: 14px;
	color: #2d2d2d;
	text-align: left;
`

const Icon = styled.img`
	margin-left: 30px;
`

interface ErrorAlertProps {
	message?: string
}

const ErrorAlert = ({ message }: ErrorAlertProps) => {
	if (!message) {
		return null
	}

	return (
		<Wrapper>
			<Icon src={ErrorIcon} />
			<Message>{message}</Message>
		</Wrapper>
	)
}
export default ErrorAlert
