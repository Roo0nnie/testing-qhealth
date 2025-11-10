import React from "react"
import styled from "styled-components"

import settings from "../assets/settings-hamburger.svg"

const Img = styled.img<{ disable: boolean }>`
	height: 17px;
	width: 22px;
	margin: 0 8px;
	padding: 13px;
	visibility: ${({ disable }) => disable && "hidden"};
`

interface SettingsButtonProps {
	onClick: () => void
	disable: boolean
}

const SettingsButton = ({ onClick, disable }: SettingsButtonProps) => {
	return <Img id="settingsButton" disable={disable} src={settings} onClick={onClick} />
}

export default SettingsButton
