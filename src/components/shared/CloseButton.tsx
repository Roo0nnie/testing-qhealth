import React from "react"
import styled from "styled-components"

import Cancel from "../../assets/cancel.svg"

const Img = styled.img`
	height: 17px;
	width: 17px;
	padding: 5px;
`

interface CloseButtonProps {
	onClick: () => void
}

const CloseButton = ({ onClick }: CloseButtonProps) => {
	return <Img src={Cancel} onClick={onClick} />
}

export default CloseButton
