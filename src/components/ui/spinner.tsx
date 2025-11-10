import React from "react"
import { Loader2Icon } from "lucide-react"
import styled, { keyframes } from "styled-components"

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const SpinnerWrapper = styled.div<{ size?: number }>`
	display: inline-flex;
	align-items: center;
	justify-content: center;

	svg {
		width: ${({ size }) => size || 16}px;
		height: ${({ size }) => size || 16}px;
		animation: ${spin} 1s linear infinite;
	}
`

interface SpinnerProps extends Omit<React.ComponentProps<"svg">, "ref"> {
	size?: number
}

function Spinner({ size = 16, className, ...props }: SpinnerProps) {
	return (
		<SpinnerWrapper size={size} className={className}>
			<Loader2Icon role="status" aria-label="Loading" {...props} />
		</SpinnerWrapper>
	)
}

export { Spinner }
