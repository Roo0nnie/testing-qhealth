import { MutableRefObject, useCallback, useEffect, useRef, useState } from "react"
import monitor, {
	AlertData,
	DeviceOrientation,
	EnabledVitalSigns,
	FaceSessionOptions,
	HealthMonitorCodes,
	HealthMonitorSession,
	ImageValidity,
	OfflineMeasurements,
	SessionState,
	VitalSigns,
	VitalSignsResults,
	Sex,
	SmokingStatus,
} from "@biosensesignal/web-sdk"

import { InfoData, InfoType } from "../types"
import { useDemographics } from "./useDemographics"

const useMonitor = (
	video: MutableRefObject<HTMLVideoElement>,
	cameraId: string,
	processingTime: number,
	licenseKey: string,
	productId: string,
	startMeasuring: boolean
) => {
	// Get demographics from URL, with static fallback for testing
	const urlDemographics = useDemographics()
	
	// Static fallback demographics for testing when URL params are missing
	const staticDemographics = {
		age: 24,
		height: 160, // cm
		weight: 60, // kg
		sex: "male" as const,
		smoking: false,
	}
	
	// Use URL demographics if available, otherwise use static fallback
	const demographics = {
		age: urlDemographics.age ?? staticDemographics.age,
		height: urlDemographics.height ?? staticDemographics.height,
		weight: urlDemographics.weight ?? staticDemographics.weight,
		sex: urlDemographics.sex ?? staticDemographics.sex,
		smoking: urlDemographics.smoking ?? staticDemographics.smoking,
	}
	
	const [session, setSession] = useState<HealthMonitorSession>()
	const [sessionState, setSessionState] = useState<SessionState>()
	const [isMonitorReady, setIsMonitorReady] = useState<boolean>()
	const [enabledVitalSigns, setEnabledVitalSigns] = useState<EnabledVitalSigns>()
	const [offlineMeasurements, setOfflineMeasurements] = useState<OfflineMeasurements>()
	const [vitalSigns, setVitalSigns] = useState<VitalSigns | null>()

	const [error, setError] = useState<AlertData>({ code: -1 })
	const [warning, setWarning] = useState<AlertData>({ code: -1 })
	const [info, setInfo] = useState<InfoData>({ type: InfoType.NONE })
	const isDismissing = useRef<boolean>(false)

	const setInfoWithDismiss = useCallback(
		(info: InfoData, seconds?: number) => {
			if (!isDismissing.current) {
				setInfo(info)
				if (seconds) {
					isDismissing.current = true
					setTimeout(() => {
						setInfo({ type: InfoType.NONE })
						isDismissing.current = false
					}, seconds * 1000)
				}
			}
		},
		[]
	)

	const updateVitalSigns = useCallback(vitalSigns => {
		setVitalSigns(prev => ({
			...prev,
			...vitalSigns,
		}))
	}, [])

	const onVitalSign = useCallback((vitalSign: VitalSigns) => {
		
		updateVitalSigns(vitalSign);
	}, [updateVitalSigns]);

	const onFinalResults = useCallback((vitalSignsResults: VitalSignsResults) => {
		// Log the raw input object first (before any type assumptions)
		console.log('🔍 Raw vitalSignsResults object (runtime structure):', vitalSignsResults);
		console.log('🔍 Raw vitalSignsResults type:', typeof vitalSignsResults);
		console.log('🔍 Raw vitalSignsResults keys:', Object.keys(vitalSignsResults));
		
		// Get the results object directly from runtime (not from types)
		const rawResults = (vitalSignsResults as any).results;
		console.log('🔍 Raw results object:', rawResults);
		console.log('🔍 Raw results type:', typeof rawResults);
		
		// Get all keys dynamically from the actual runtime object
		// Use both Object.keys() and Object.getOwnPropertyNames() to catch all properties
		const allKeys = Object.keys(rawResults || {});
		const allPropertyNames = Object.getOwnPropertyNames(rawResults || {});
		
		console.log('📊 Final results received with', allKeys.length, 'vital signs (enumerable keys)');
		console.log('🔑 All enumerable keys:', allKeys);
		console.log('🔑 All property names (including non-enumerable):', allPropertyNames);
		
		// Print all vital sign keys and values for debugging
		console.log('📋 Complete vital signs structure (from runtime):');
		if (rawResults) {
			for (const key of allKeys) {
				const vitalSign = rawResults[key];
				const formattedValue = Array.isArray(vitalSign?.value)
					? `(${vitalSign.value.length} items)`
					: vitalSign?.value?.toString() ?? 'null';
				console.log(`  - ${key}: ${formattedValue}`, vitalSign);
			}
		}
		
		// Also log as a clean object for easier inspection
		console.log('📦 All vital signs as object (runtime):', rawResults);
		
		// Log as formatted JSON for easy copy-paste (shows actual runtime structure)
		console.log('📄 All vital signs as JSON (runtime):', JSON.stringify(rawResults, null, 2));
		
		// Log the entire vitalSignsResults structure
		console.log('📄 Complete vitalSignsResults as JSON:', JSON.stringify(vitalSignsResults, null, 2));
		
		setVitalSigns(null);
		updateVitalSigns(vitalSignsResults.results);
	}, [updateVitalSigns]);

	const onError = (errorData: AlertData) => {
		setError(errorData)
	}

	const onWarning = (warningData: AlertData) => {
		if (
			warningData.code ===
			HealthMonitorCodes.MEASUREMENT_CODE_MISDETECTION_DURATION_EXCEEDS_LIMIT_WARNING
		) {
			setVitalSigns(null)
		}
		setWarning(warningData)
	}

	const onStateChange = useCallback((state: SessionState) => {
		setSessionState(state)
		if (state === SessionState.MEASURING) {
			setVitalSigns(null)
		}
	}, [])

	const onEnabledVitalSigns = useCallback((vitalSigns: EnabledVitalSigns) => {
		setEnabledVitalSigns(vitalSigns)
	}, [])

	const onOfflineMeasurement = useCallback((offlineMeasurements: OfflineMeasurements) => {
		setOfflineMeasurements(offlineMeasurements)
	}, [])

	const onActivation = useCallback((activationId: string) => {
		// the device has been activated with activationId
	}, [])

	const onImageData = useCallback((imageValidity: ImageValidity) => {
		let message: string
		if (imageValidity != ImageValidity.VALID) {
			switch (imageValidity) {
				case ImageValidity.INVALID_DEVICE_ORIENTATION:
					message = "Unsupported Orientation"
					break
				case ImageValidity.TILTED_HEAD:
					message = "Head Tilted"
					break
				case ImageValidity.FACE_TOO_FAR: // Placeholder, currently not supported
					message = "You Are Too Far"
					break
				case ImageValidity.UNEVEN_LIGHT:
					message = "Uneven Lighting"
					break
				case ImageValidity.INVALID_ROI:
				default:
					message = "Face Not Detected"
			}
			setInfo({
				type: InfoType.INSTRUCTION,
				message: message,
			})
		} else {
			setInfoWithDismiss({ type: InfoType.NONE })
		}
	}, [])

	useEffect(() => {
		;(async () => {
			try {
				await monitor.initialize({
					licenseKey,
					licenseInfo: {
						onEnabledVitalSigns,
						onOfflineMeasurement,
						onActivation,
					},
				})
				// console.log(`Initialized monitor`)
				setIsMonitorReady(true)
				setError({ code: -1 })
			} catch (e: unknown) {
				// console.error("Error initializing HealthMonitor", e)
				setIsMonitorReady(false)
				setError({ code: (e as any).errorCode })
			}
		})()
	}, [licenseKey, productId])

	useEffect(() => {
		;(async () => {
			try {
				if (!isMonitorReady || !processingTime || !video.current) {
					return
				}

				sessionState === SessionState.ACTIVE && session?.terminate()

				const userInformation = {
					sex: demographics.sex === "male" ? Sex.MALE : Sex.FEMALE,
					age: demographics.age,
					weight: demographics.weight,
					height: demographics.height,
					smokingStatus: demographics.smoking ? SmokingStatus.SMOKER : SmokingStatus.NON_SMOKER,
				}

				const options: FaceSessionOptions = {
					input: video.current,
					cameraDeviceId: cameraId,
					processingTime,
					onVitalSign,
					onFinalResults,
					onError,
					onWarning,
					onStateChange,
					orientation: DeviceOrientation.PORTRAIT,
					onImageData,
					userInformation,
				
				}

				const faceSession = await monitor.createFaceSession(options)
				// console.log(`Session created`)
				setSession(faceSession)
				setError({ code: -1 })
			} catch (e: unknown) {
				setError({ code: (e as any).errorCode })
				// console.error("Error creating a session", e)
			}
		})()
	}, [processingTime, isMonitorReady, demographics.age, demographics.height, demographics.weight, demographics.sex, demographics.smoking])

	useEffect(() => {
		if (startMeasuring) {
			if (sessionState === SessionState.ACTIVE) {
				session?.start()
				setError({ code: -1 })
			}
		} else {
			sessionState === SessionState.MEASURING && session?.stop()
		}
	}, [startMeasuring])

	// Helper function to safely extract value and enabled state
	const getVitalSign = useCallback((
		sdkProperty: string,
		enabledProperty?: string,
		defaultValue: any = null,
		allowValueWithoutEnabled: boolean = false
	) => {
		const sdkVitalSigns = vitalSigns as any;
		// console.log('sdkVitalSigns getVitalSign', sdkVitalSigns);
		const vitalSignObj = sdkVitalSigns?.[sdkProperty];
		const value = vitalSignObj?.value ?? defaultValue;
		const confidenceLevel = vitalSignObj?.confidenceLevel;
		const enabledVitalSignsObj = enabledVitalSigns as any;
		let isEnabled = enabledProperty 
			? enabledVitalSignsObj?.[enabledProperty] ?? false
			: value !== null && value !== undefined;
		
		// Special handling for spo2: if value exists but enabled flag is false/undefined,
		// still allow the value to be used (fallback for SDK compatibility)
		if (allowValueWithoutEnabled && value !== null && value !== undefined && !isEnabled) {
			isEnabled = true;
		}
		
		return { value, isEnabled, confidenceLevel };
	}, [vitalSigns, enabledVitalSigns]);

	// Helper function to get SpO2 value with fallback to check multiple possible property names
	const getSpO2Value = useCallback(() => {
		const sdkVitalSigns = vitalSigns as any;

		const enabledVitalSignsObj = enabledVitalSigns as any;
		
		// Try multiple possible property names in order of likelihood
		const possiblePropertyNames = ['spo2', 'oxygenSaturation', 'spO2', 'o2Sat', 'oxygenSat'];
		let vitalSignObj: any = null;
		let propertyName: string = 'none';
		
		for (const propName of possiblePropertyNames) {
			const candidate = sdkVitalSigns?.[propName];
			if (candidate && (candidate.value !== null && candidate.value !== undefined)) {
				vitalSignObj = candidate;
				propertyName = propName;
				break;
			}
		}
		
		// If no value found, still check if the property exists (even if value is null)
		if (!vitalSignObj) {
			for (const propName of possiblePropertyNames) {
				if (sdkVitalSigns?.[propName]) {
					vitalSignObj = sdkVitalSigns[propName];
					propertyName = propName;
					break;
				}
			}
		}
		
		const value = vitalSignObj?.value ?? null;
		const confidenceLevel = vitalSignObj?.confidenceLevel;
		
		let isEnabled = enabledVitalSignsObj?.isEnabledSpo2 ?? false;
		if (!isEnabled) {
		
			isEnabled = enabledVitalSignsObj?.isEnabledOxygenSaturation ?? 
			             enabledVitalSignsObj?.isEnabledSpO2 ?? false;
		}
		
		if (value !== null && value !== undefined && !isEnabled) {
			isEnabled = true;
		}
		
	
		
		return { value, isEnabled, confidenceLevel };
	}, [vitalSigns, enabledVitalSigns]);

	return {
		sessionState,
		vitalSigns: {
		// Basic Vital Signs
		pulseRate: getVitalSign('pulseRate', 'isEnabledPulseRate'),
		respirationRate: getVitalSign('respirationRate', 'isEnabledRespirationRate'),
		// spo2: getSpO2Value(),
		oxygenSaturation: getSpO2Value(),
			bloodPressure: {
				value: vitalSigns?.bloodPressure?.value ?? null,
				isEnabled: enabledVitalSigns?.isEnabledBloodPressure ?? false,
			},
			
			// HRV Metrics
			sdnn: getVitalSign('sdnn', 'isEnabledSdnn'),
			rmssd: getVitalSign('rmssd', 'isEnabledRmssd'),
			sd1: getVitalSign('sd1', 'isEnabledSd1'),
			sd2: getVitalSign('sd2', 'isEnabledSd2'),
			meanRri: getVitalSign('meanRri', 'isEnabledMeanRri'),
			rri: getVitalSign('rri', 'isEnabledRri'),
			lfhf: getVitalSign('lfhf', 'isEnabledLfhf'), // SDK uses 'lfhf' not 'lfHfRatio'
			
			// Stress & Wellness
			stressLevel: getVitalSign('stressLevel', 'isEnabledStressLevel'),
			stressIndex: getVitalSign('stressIndex', 'isEnabledStressIndex'),
			normalizedStressIndex: getVitalSign('normalizedStressIndex', 'isEnabledNormalizedStressIndex'),
			wellnessIndex: getVitalSign('wellnessIndex', 'isEnabledWellnessIndex'),
			// wellnessLevel: getVitalSign('wellnessLevel', 'isEnabledWellnessLevel'),
			
			// Nervous System
			snsIndex: getVitalSign('snsIndex', 'isEnabledSnsIndex'),
			snsZone: getVitalSign('snsZone', 'isEnabledSnsZone'),
			pnsIndex: getVitalSign('pnsIndex', 'isEnabledPnsIndex'),
			pnsZone: getVitalSign('pnsZone', 'isEnabledPnsZone'),
			
			// Other Metrics
			prq: getVitalSign('prq', 'isEnabledPrq'),
			heartAge: getVitalSign('heartAge', 'isEnabledHeartAge'),
			hemoglobin: getVitalSign('hemoglobin', 'isEnabledHemoglobin'),
			hemoglobinA1c: getVitalSign('hemoglobinA1c', 'isEnabledHemoglobinA1c'),
			cardiacWorkload: getVitalSign('cardiacWorkload', 'isEnabledCardiacWorkload'),
			meanArterialPressure: getVitalSign('meanArterialPressure', 'isEnabledMeanArterialPressure'),
			pulsePressure: getVitalSign('pulsePressure', 'isEnabledPulsePressure'),
			
			// Risk Indicators
			ascvdRisk: getVitalSign('ascvdRisk', 'isEnabledAscvdRisk'),
			// ascvdRiskLevel: getVitalSign('ascvdRiskLevel', 'isEnabledAscvdRiskLevel'),
			highBloodPressureRisk: getVitalSign('highBloodPressureRisk', 'isEnabledHighBloodPressureRisk'),
			highFastingGlucoseRisk: getVitalSign('highFastingGlucoseRisk', 'isEnabledHighFastingGlucoseRisk'),
			highHemoglobinA1CRisk: getVitalSign('highHemoglobinA1CRisk', 'isEnabledHighHemoglobinA1CRisk'), 
			highTotalCholesterolRisk: getVitalSign('highTotalCholesterolRisk', 'isEnabledHighTotalCholesterolRisk'),
			lowHemoglobinRisk: getVitalSign('lowHemoglobinRisk', 'isEnabledLowHemoglobinRisk'),
		},
		offlineMeasurements,
		error,
		warning,
		info,
	};
}

export default useMonitor
