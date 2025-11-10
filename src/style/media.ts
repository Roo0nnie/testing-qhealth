import { css, CSSObject, FlattenSimpleInterpolation } from "styled-components"

type MediaQueryFunction = (
	first: TemplateStringsArray | CSSObject,
	...interpolations: any[]
) => FlattenSimpleInterpolation

export interface Media {
	mobile: MediaQueryFunction
	tablet: MediaQueryFunction
	desktop: MediaQueryFunction
	wide: MediaQueryFunction
}

export const defaultMediaBreakpoints: Record<string, string> = {
	mobile: "680px",
	tablet: "1000px",
	desktop: "1280px",
	wide: "1600px",
}

const media = Object.keys(defaultMediaBreakpoints).reduce(
	(memo: Record<string, MediaQueryFunction>, val: string) => {
		memo[val] = (first: any, ...interpolations: any[]) => css`
			@media (min-width: ${defaultMediaBreakpoints[val]}) {
				${css(first, ...interpolations)};
			}
		`
		return memo
	},
	{} as Record<string, MediaQueryFunction>
)

export default media as unknown as Media
