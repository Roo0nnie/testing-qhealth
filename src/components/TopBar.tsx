import React, { useCallback } from "react"
import styled from "styled-components"

import { useTimer } from "../hooks"
import media from "../style/media"
import Logo from "./Logo"
import { Flex } from "./shared/Flex"

const Wrapper = styled(Flex)`
	width: 100%;
	position: relative;
	justify-content: space-between;
	align-items: center;
	min-height: 60px;
	z-index: 2;
	box-shadow: ${({ theme }) => theme.shadows.md};
	background: ${({ theme }) => theme.colors.primary.main};
	transition:
		background-color ${({ theme }) => theme.transitions.normal},
		box-shadow ${({ theme }) => theme.transitions.normal};
	padding: 0 16px;
	${media.tablet`
    padding-left: 100px;
    padding-right: 24px;
  `}
`

const LeftSection = styled(Flex)`
	align-items: center;
	gap: 8px;
`

const RightSection = styled(Flex)`
	margin-right: 10px;
	align-items: center;
`

const DurationDisplay = styled.div`
	font-size: 16px;
	color: ${({ theme }) => theme.colors.text.inverse};
	font-weight: 500;
	${media.tablet`
    font-size: 18px;
  `}
`

interface TopBarProps {
	isMeasuring?: boolean
	durationSeconds?: number
}

const TopBar: React.FC<TopBarProps> = ({ isMeasuring = false, durationSeconds = 60 }) => {
	const seconds = useTimer(isMeasuring, durationSeconds)
	const formatMinutes = useCallback(seconds => ("0" + Math.floor(seconds / 60)).slice(-2), [])
	const formatSeconds = useCallback(seconds => ("0" + (seconds % 60)).slice(-2), [])

	return (
		<Wrapper>
			<LeftSection>
				<Logo />
			</LeftSection>
			<RightSection>
				{isMeasuring && (
					<DurationDisplay>
						Duration: {formatMinutes(seconds)}:{formatSeconds(seconds)}
					</DurationDisplay>
				)}
			</RightSection>
		</Wrapper>
	)
}

export default TopBar
