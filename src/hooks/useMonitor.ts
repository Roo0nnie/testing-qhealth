import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
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
} from '@biosensesignal/web-sdk';
import { InfoType, InfoData } from '../types';

const useMonitor = (
  video: MutableRefObject<HTMLVideoElement>,
  cameraId: string,
  processingTime: number,
  licenseKey: string,
  productId: string,
  startMeasuring: boolean,
) => {
  const [session, setSession] = useState<HealthMonitorSession>();
  const [sessionState, setSessionState] = useState<SessionState>();
  const [isMonitorReady, setIsMonitorReady] = useState<boolean>();
  const [enabledVitalSigns, setEnabledVitalSigns] = useState<
    EnabledVitalSigns
  >();
  const [offlineMeasurements, setOfflineMeasurements] = useState<
    OfflineMeasurements
  >();
  const [vitalSigns, setVitalSigns] = useState<VitalSigns | null>();

  const [error, setError] = useState<AlertData>({ code: -1 });
  const [warning, setWarning] = useState<AlertData>({ code: -1 });
  const [info, setInfo] = useState<InfoData>({ type: InfoType.NONE });
  const isDismissing = useRef<boolean>(false);

  const setInfoWithDismiss = useCallback(
    (info: InfoData, seconds?: number) => {
      if (!isDismissing.current) {
        setInfo(info);
        if (seconds) {
          isDismissing.current = true;
          setTimeout(() => {
            setInfo({ type: InfoType.NONE });
            isDismissing.current = false;
          }, seconds * 1000);
        }
      }
    },
    [InfoType, setInfo, info, isDismissing, isDismissing.current],
  );

  const updateVitalSigns = useCallback((vitalSigns) => {
    setVitalSigns((prev) => ({
      ...prev,
      ...vitalSigns,
    }));
  }, []);

  const onVitalSign = useCallback((vitalSign: VitalSigns) => {
    // Log SDK structure to inspect available properties
    if (vitalSign && Object.keys(vitalSign).length > 0) {
      console.log('SDK VitalSigns object structure:', Object.keys(vitalSign));
      console.log('SDK VitalSigns full object:', vitalSign);
    }
    updateVitalSigns(vitalSign);
  }, []);

  const onFinalResults = useCallback((vitalSignsResults: VitalSignsResults) => {
    // Log final results structure to inspect all available properties
    if (vitalSignsResults?.results) {
      console.log('SDK Final Results structure:', Object.keys(vitalSignsResults.results));
      console.log('SDK Final Results full object:', vitalSignsResults.results);
    }
    setVitalSigns(null);
    updateVitalSigns(vitalSignsResults.results);
  }, []);

  const onError = (errorData: AlertData) => {
    setError(errorData);
  };

  const onWarning = (warningData: AlertData) => {
    if (
      warningData.code ===
      HealthMonitorCodes.MEASUREMENT_CODE_MISDETECTION_DURATION_EXCEEDS_LIMIT_WARNING
    ) {
      setVitalSigns(null);
    }
    setWarning(warningData);
  };

  const onStateChange = useCallback((state: SessionState) => {
    setSessionState(state);
    if (state === SessionState.MEASURING) {
      setVitalSigns(null);
    }
  }, []);

  const onEnabledVitalSigns = useCallback((vitalSigns: EnabledVitalSigns) => {
    setEnabledVitalSigns(vitalSigns);
  }, []);

  const onOfflineMeasurement = useCallback(
    (offlineMeasurements: OfflineMeasurements) => {
      setOfflineMeasurements(offlineMeasurements);
    },
    [],
  );

  const onActivation = useCallback((activationId: string) => {
    // the device has been activated with activationId
  }, []);

  const onImageData = useCallback((imageValidity: ImageValidity) => {
    let message: string;
    if (imageValidity != ImageValidity.VALID) {
      switch (imageValidity) {
        case ImageValidity.INVALID_DEVICE_ORIENTATION:
          message = 'Unsupported Orientation';
          break;
        case ImageValidity.TILTED_HEAD:
          message = 'Head Tilted';
          break;
        case ImageValidity.FACE_TOO_FAR: // Placeholder, currently not supported
          message = 'You Are Too Far';
          break;
        case ImageValidity.UNEVEN_LIGHT:
          message = 'Uneven Lighting';
          break;
        case ImageValidity.INVALID_ROI:
        default:
          message = 'Face Not Detected';
      }
      setInfo({
        type: InfoType.INSTRUCTION,
        message: message,
      });
    } else {
      setInfoWithDismiss({ type: InfoType.NONE });
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await monitor.initialize({
          licenseKey,
          licenseInfo: {
            onEnabledVitalSigns,
            onOfflineMeasurement,
            onActivation,
          },
        });
        console.log(`Initialized monitor`);
        setIsMonitorReady(true);
        setError({ code: -1 });
      } catch (e) {
        console.error('Error initializing HealthMonitor', e);
        setIsMonitorReady(false);
        setError({ code: e.errorCode });
      }
    })();
  }, [licenseKey, productId]);

  useEffect(() => {
    (async () => {
      try {
        if (!isMonitorReady || !processingTime || !video.current) {
          return;
        }

        sessionState === SessionState.ACTIVE && session.terminate();

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
          // isAnalyticsEnabled: true,
          /*******************************************************************************
           * For accurate vital signs calculation the user's parameters should be provided.
           * The following is an example of how the parameters are passed to the SDK:
           *
           * subjectDemographic: {sex: Sex.MALE, age: 35, weight: 75, height: 165}
           *
           * When measuring a new user then a new session must be created using the
           * new user's parameters
           * The parameters are used locally on the device only for the vital sign
           * calculation, and deleted when the session is terminated.
           *******************************************************************************/
        };

        const faceSession = await monitor.createFaceSession(options);
        console.log(`Session created`);
        setSession(faceSession);
        setError({ code: -1 });
      } catch (e) {
        setError({ code: e.errorCode });
        console.error('Error creating a session', e);
      }
    })();
  }, [processingTime, isMonitorReady]);

  useEffect(() => {
    if (startMeasuring) {
      if (sessionState === SessionState.ACTIVE) {
        session.start();
        setError({ code: -1 });
      }
    } else {
      sessionState === SessionState.MEASURING && session.stop();
    }
  }, [startMeasuring]);

  // Helper function to safely extract value and enabled state
  const getVitalSign = useCallback((
    sdkProperty: string,
    enabledProperty?: string,
    defaultValue: any = null
  ) => {
    const sdkVitalSigns = vitalSigns as any;
    const vitalSignObj = sdkVitalSigns?.[sdkProperty];
    const value = vitalSignObj?.value ?? defaultValue;
    const confidenceLevel = vitalSignObj?.confidenceLevel;
    const enabledVitalSignsObj = enabledVitalSigns as any;
    const isEnabled = enabledProperty 
      ? enabledVitalSignsObj?.[enabledProperty] ?? false
      : value !== null && value !== undefined;
    
    return { value, isEnabled, confidenceLevel };
  }, [vitalSigns, enabledVitalSigns]);

  return {
    sessionState,
    vitalSigns: {
      // Basic Vital Signs
      pulseRate: getVitalSign('pulseRate', 'isEnabledPulseRate'),
      respirationRate: getVitalSign('respirationRate', 'isEnabledRespirationRate'),
      spo2: getVitalSign('spo2', 'isEnabledSpo2', null),
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
      wellnessLevel: getVitalSign('wellnessLevel', 'isEnabledWellnessLevel'),
      
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
      ascvdRiskLevel: getVitalSign('ascvdRiskLevel', 'isEnabledAscvdRiskLevel'),
      highBloodPressureRisk: getVitalSign('highBloodPressureRisk', 'isEnabledHighBloodPressureRisk'),
      highFastingGlucoseRisk: getVitalSign('highFastingGlucoseRisk', 'isEnabledHighFastingGlucoseRisk'),
      highHemoglobinA1CRisk: getVitalSign('highHemoglobinA1CRisk', 'isEnabledHighHemoglobinA1CRisk'), // SDK uses 'highHemoglobinA1CRisk'
      highTotalCholesterolRisk: getVitalSign('highTotalCholesterolRisk', 'isEnabledHighTotalCholesterolRisk'),
      lowHemoglobinRisk: getVitalSign('lowHemoglobinRisk', 'isEnabledLowHemoglobinRisk'),
    },
    offlineMeasurements,
    error,
    warning,
    info,
  };
};

export default useMonitor;
