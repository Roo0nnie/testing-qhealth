import React from "react"
import styled from "styled-components"

import { FlexSpace } from "./shared/FlexSpace"

const Box = styled(FlexSpace)`
	flex-direction: column;
	align-items: center;
	gap: 5px;
	height: 40px;
`

const Title = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	text-align: center;
	align-items: center;
	color: ${({ theme }) => theme.colors.text.primary};
	font-size: 14px;
	font-weight: 600;
	line-height: 16px;
	transition: color ${({ theme }) => theme.transitions.normal};
`

const Value = styled.div`
	font-size: 14px;
	color: ${({ theme }) => theme.colors.primary.main};
	font-weight: 700;
	transition: color ${({ theme }) => theme.transitions.normal};
`

const ValueWrapper = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
`

const StatsBox = ({ title, value }: any) => {
	return (
		<Box>
			<Title>{title}</Title>
			<ValueWrapper>{value && <Value>{value}</Value>}</ValueWrapper>
		</Box>
	)
}

export default StatsBox
