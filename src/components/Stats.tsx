import React from "react"
import { isMobile } from "@biosensesignal/web-sdk"
import styled from "styled-components"

import { VitalSigns, BloodPressureValue } from "../types"
import { Flex } from "./shared/Flex"
import StatsBox from "./StatsBox"

const Wrapper = styled(Flex)`
	display: flex;
	position: absolute;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 80px;
	background-color: ${({ theme }) => {
		// Convert hex to rgba with 0.95 opacity
		const hex = theme.colors.background.secondary
		const r = parseInt(hex.slice(1, 3), 16)
		const g = parseInt(hex.slice(3, 5), 16)
		const b = parseInt(hex.slice(5, 7), 16)
		return `rgba(${r}, ${g}, ${b}, 0.95)`
	}};
	border-radius: 3px;
	padding: 13px 50px;
	bottom: 30px;
	box-sizing: border-box;
	transition: background-color ${({ theme }) => theme.transitions.normal};
`

const BoxesWrapper = styled(Flex)`
	gap: 30px;
`

interface IStats {
	/**
	 *  Object - contains health stats info
	 */
	vitalSigns: VitalSigns
}

const Stats = ({ vitalSigns }: IStats) => {
	const bloodPressureToDisplay =
		vitalSigns.bloodPressure.value?.systolic && vitalSigns.bloodPressure.value?.diastolic
			? vitalSigns.bloodPressure.value.systolic + "/" + vitalSigns.bloodPressure.value.diastolic
			: "--"

	return (
		<Wrapper>
			<BoxesWrapper>
				<StatsBox
					title={"PR"}
					value={vitalSigns.pulseRate.isEnabled ? vitalSigns.pulseRate.value || "--" : "N/A"}
				/>
				<StatsBox
					title={"RR"}
					value={
						vitalSigns.respirationRate.isEnabled ? vitalSigns.respirationRate.value || "--" : "N/A"
					}
				/>
				<StatsBox
					title={"SL"}
					value={vitalSigns.stress.isEnabled ? vitalSigns.stress.value || "--" : "N/A"}
				/>
				<StatsBox
					title={"SDNN"}
					value={vitalSigns.hrvSdnn.isEnabled ? vitalSigns.hrvSdnn.value || "--" : "N/A"}
				/>
				{isMobile() && (
					<StatsBox
						title={"BP"}
						value={vitalSigns.bloodPressure.isEnabled ? bloodPressureToDisplay : "N/A"}
					/>
				)}
			</BoxesWrapper>
		</Wrapper>
	)
}

export default Stats
