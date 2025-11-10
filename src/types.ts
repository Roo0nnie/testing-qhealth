export enum AppErrorCode {
	MEASUREMENT_CODE_FACE_UNDETECTED_ERROR = 80001,
}

export enum InfoType {
	NONE,
	INSTRUCTION,
	SUCCESS,
}

export interface InfoData {
	type: InfoType
	message?: string
}

export enum VideoReadyState {
	HAVE_ENOUGH_DATA = 4,
}

export interface VitalSign<T> {
	value: T | null
	isEnabled: boolean
}

export interface BloodPressureValue {
	systolic: number
	diastolic: number
}

// Risk level types
export type RiskLevel = 'Low' | 'Medium' | 'High' | number;
export type Zone = number | string;
export type StressLevel = number | string;
export type WellnessLevel = number | string;

export interface VitalSignWithConfidence<T> extends VitalSign<T> {
  confidenceLevel?: string | number;
}

export interface VitalSigns {
	// Basic Vital Signs
	pulseRate: VitalSignWithConfidence<number>;
	respirationRate: VitalSignWithConfidence<number>;
	spo2: VitalSign<number>;
	bloodPressure: VitalSign<BloodPressureValue>;
	
	// HRV Metrics
	sdnn: VitalSignWithConfidence<number>;
	rmssd: VitalSign<number>;
	sd1: VitalSign<number>;
	sd2: VitalSign<number>;
	meanRri: VitalSignWithConfidence<number>;
	rri: VitalSignWithConfidence<number[] | any>; // RRIValue[] array
	lfhf: VitalSign<number>; // Note: SDK uses 'lfhf', not 'lfHfRatio'
	
	// Stress & Wellness
	stressLevel: VitalSign<StressLevel>;
	stressIndex: VitalSign<number>;
	normalizedStressIndex: VitalSign<number>;
	wellnessIndex: VitalSign<number>;
	wellnessLevel: VitalSign<WellnessLevel>;
	
	// Nervous System
	snsIndex: VitalSign<number>;
	snsZone: VitalSign<Zone>;
	pnsIndex: VitalSign<number>;
	pnsZone: VitalSign<Zone>;
	
	// Other Metrics
	prq: VitalSignWithConfidence<number>;
	heartAge?: VitalSign<number>;
	hemoglobin: VitalSign<number>;
	hemoglobinA1c: VitalSign<number>;
	cardiacWorkload: VitalSign<number>;
	meanArterialPressure: VitalSign<number>;
	pulsePressure: VitalSign<number>;
	
	// Risk Indicators
	ascvdRisk?: VitalSign<number>;
	ascvdRiskLevel?: VitalSign<string | number>;
	highBloodPressureRisk: VitalSign<RiskLevel>;
	highFastingGlucoseRisk: VitalSign<RiskLevel>;
	highHemoglobinA1CRisk: VitalSign<RiskLevel>; // Note: SDK uses 'highHemoglobinA1CRisk'
	highTotalCholesterolRisk: VitalSign<RiskLevel>;
	lowHemoglobinRisk: VitalSign<RiskLevel>;
}

export interface MeasurementResults {
	sessionId: string
	vitalSigns: VitalSigns
	timestamp: number
}

export interface SessionData {
	sessionId: string
	createdAt: number
}

export interface ApiResponse<T> {
	success: boolean
	data?: T
	error?: string
	message?: string
}
