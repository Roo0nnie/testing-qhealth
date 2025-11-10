import React from "react"
import styled from "styled-components"

import { Flex } from "../shared/Flex"

const Wrapper = styled(Flex)`
	position: absolute;
	left: 0;
	bottom: 0;
	height: 70px;
	width: 100%;
	justify-content: center;
	align-items: center;
	background-color: rgba(45, 80, 22, 0.9);
	box-shadow:
		0 -4px 6px -1px rgba(0, 0, 0, 0.1),
		0 -2px 4px -1px rgba(0, 0, 0, 0.06);
`

const Message = styled.div`
	padding: 5px;
	font-size: 14px;
	color: #ffffff;
	text-align: center;
`

interface WarningAlertProps {
	message?: string
}

const WarningAlert = ({ message }: WarningAlertProps) => {
	if (!message) {
		return null
	}

	return (
		<Wrapper>
			<Message>{message}</Message>
		</Wrapper>
	)
}
export default WarningAlert
