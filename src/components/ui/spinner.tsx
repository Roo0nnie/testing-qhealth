import React from "react"
import { Loader2Icon } from "lucide-react"

import { cn } from "../../lib/utils"

interface SpinnerProps extends Omit<React.ComponentProps<"svg">, "ref"> {
	size?: number
}

function Spinner({ size = 16, className, ...props }: SpinnerProps) {
	return (
		<div className={cn("inline-flex items-center justify-center", className)}>
			<Loader2Icon
				role="status"
				aria-label="Loading"
				style={{ width: size, height: size }}
				className="animate-spin"
				{...props}
			/>
		</div>
	)
}

export { Spinner }
