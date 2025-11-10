import React from "react"
import styled from "styled-components"

import { MeasurementResults, VitalSigns } from "../types"
import { Flex } from "./shared/Flex"
import Stats from "./Stats"
import { Spinner } from "./ui/spinner"

const Container = styled(Flex)`
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 24px;
	padding: 40px;
	width: 100%;
`

const ResultsWrapper = styled.div`
	width: 100%;
	max-width: 800px;
	position: relative;
	min-height: 400px;
`

const SuccessMessage = styled.div`
	text-align: center;
	margin-bottom: 24px;
`

const Title = styled.h2`
	font-size: 28px;
	font-weight: 600;
	color: #333;
	margin-bottom: 8px;
`

const Subtitle = styled.p`
	font-size: 16px;
	color: #666;
`

const Timestamp = styled.div`
	font-size: 14px;
	color: #999;
	text-align: center;
	margin-top: 24px;
`

const ErrorMessage = styled.div`
	text-align: center;
	padding: 20px;
	background-color: #fee;
	border: 1px solid #fcc;
	border-radius: 12px;
	color: #c33;
	max-width: 500px;
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -1px rgba(0, 0, 0, 0.06);
`

const LoadingMessage = styled.div`
	text-align: center;
	padding: 20px;
	color: #666;
`

interface DesktopResultsProps {
	results: MeasurementResults | null
	isLoading: boolean
	error: string | null
	isPolling: boolean
}

/**
 * Component to display measurement results on desktop
 * Shows loading state, error state, or results
 */
const DesktopResults: React.FC<DesktopResultsProps> = ({
	results,
	isLoading,
	error,
	isPolling,
}) => {
	if (error && !isPolling) {
		return (
			<Container>
				<ErrorMessage>
					<strong>Error:</strong> {error}
				</ErrorMessage>
			</Container>
		)
	}

	if (isLoading || isPolling) {
		return (
			<Container>
				<LoadingMessage>
					<Spinner size={32} />
					<p style={{ marginTop: "16px" }}>
						Waiting for measurement results...
						<br />
						<small>Please complete the measurement on your phone</small>
					</p>
				</LoadingMessage>
			</Container>
		)
	}

	if (!results) {
		return null
	}

	const formattedDate = new Date(results.timestamp).toLocaleString()

	return (
		<Container>
			<SuccessMessage>
				<Title>Measurement Complete!</Title>
				<Subtitle>Your vital signs have been measured successfully.</Subtitle>
			</SuccessMessage>
			<ResultsWrapper>
				<Stats vitalSigns={results.vitalSigns} />
			</ResultsWrapper>
			<Timestamp>Measured at: {formattedDate}</Timestamp>
		</Container>
	)
}

export default DesktopResults
