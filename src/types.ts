export enum AppErrorCode {
  MEASUREMENT_CODE_FACE_UNDETECTED_ERROR = 80001,
}

export enum InfoType {
  NONE,
  INSTRUCTION,
  SUCCESS,
}

export interface InfoData {
  type: InfoType;
  message?: string;
}

export enum VideoReadyState {
  HAVE_ENOUGH_DATA = 4,
}

export interface VitalSign<T> {
  value: T;
  isEnabled: boolean;
}

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

export interface VitalSigns {
  pulseRate: VitalSign<number>;
  respirationRate: VitalSign<number>;
  stress: VitalSign<number>;
  hrvSdnn: VitalSign<number>;
  spo2: VitalSign<number>;
  bloodPressure: VitalSign<BloodPressureValue>;
}

export interface MeasurementResults {
  sessionId: string;
  vitalSigns: VitalSigns;
  timestamp: number;
}

export interface SessionData {
  sessionId: string;
  createdAt: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
