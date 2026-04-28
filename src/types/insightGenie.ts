export interface FaceScanRequest {
	clientId: string
	age?: number
	gender?: string
	showResults?: string
	noDesign?: boolean
	faceOutline?: boolean
	buttonBgColor?: string
	buttonTextColor?: string
	isVoiceAnalysisOn?: boolean
	voiceAnalysisType?: string
	forceFrontCamera?: boolean
	diabetesHypertensionParameters?: {
		height?: number
		weight?: number
		smoker?: boolean
		hypertension?: boolean
		bpMedication?: boolean
		diabetic?: number
		waistCircumference?: number
		heartDisease?: boolean
		depression?: boolean
		totalCholesterol?: number
		hdl?: number
		parentalHypertension?: number
		physicalActivity?: boolean
		healthyDiet?: boolean
		antiHypertensive?: boolean
		historyBloodGlucose?: boolean
		historyFamilyDiabetes?: number
	}
	language?: string
	showDisclaimer?: boolean
}

export interface FaceScanResponse {
	success: boolean
	videoIframeUrl: string
}

export interface InsightGenieAuthResponse {
	token: string
}

export type InsightGenieAction =
	| "onAnalysisStart"
	| "onHealthAnalysisFinished"
	| "onVoiceAnalysisFinished"
	| "failedToGetResults"
	| "failedToGetHealthAnalysisResult"
	| "failedToGetVoiceAnalysisResult"
	| "failedToLoadPage"
	| "conditionStatus"
	| "scanTimeRemaining"
	| "videoElementDimensions"

export interface InsightGenieMessage {
	action: InsightGenieAction | string
	[key: string]: any
}

export type ScanState =
	| "idle"
	| "authenticating"
	| "positioning"
	| "analyzing"
	| "complete"
	| "error"

export type ResultStatus = "Good" | "Average" | "Poor"
export type ResultColor = "green" | "orange" | "red"
export type ResultCategory =
	| "cardiovascular"
	| "heart"
	| "hrv"
	| "blood"
	| "other"

export interface HealthResult {
	title: string
	value: string
	score: number
	status: ResultStatus
	color: ResultColor
	category: ResultCategory
	normalRange?: string
}
