import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  isMobile,
  isTablet,
  isIos,
  HealthMonitorCodes,
  SessionState,
} from '@biosensesignal/web-sdk';
import { useMediaPredicate } from 'react-media-hook';
import {
  useError,
  useLicenseKey,
  useMonitor,
  usePageVisibility,
  usePrevious,
  useWarning,
} from '../hooks';
import { DEFAULT_MEASUREMENT_DURATION } from '../hooks/useLicenseDetails';
import Stats from './Stats';
import StartButton from './StartButton';
import { mirror } from '../style/mirror';
import { Flex } from './shared/Flex';
import media from '../style/media';
import { ErrorAlert, InfoAlert, WarningAlert } from './alert';
// import Loader from './Loader';
import { VideoReadyState } from '../types';
import TopBar from './TopBar';
import Mask from '../assets/mask.svg';
import { storeResults } from '../services/api';
import { Spinner } from './ui/spinner';

const MonitorWrapper = styled(Flex)`
  flex-direction: column;
  width: 100%;
  justify-content: start;
  align-items: center;
  flex: 1;
  ${media.tablet`
    width: fit-content;
    justify-content: center;
  `}
`;

const MeasurementContentWrapper = styled(Flex)<{ isMobile: boolean }>`
  width: auto;
  height: ${({ isMobile }) => isMobile && '100%'};
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  ${media.mobile`
    margin: 40px 0 60px 0;
  `}
`;

const VideoAndStatsWrapper = styled(Flex)<{ isMobile: boolean }>`
  position: relative;
  justify-content: center;
  width: 100%;
  height: ${({ isMobile }) => isMobile && '100%'};
  ${media.tablet`
    width: 812px;
    height: 609px;
  `} ${media.wide`
    width: 1016px;
    height: 762px;
  `};
`;

const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  z-index: -1;
`;

const Img = styled.img<{ isDesktop: boolean; isReady: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  object-fit: ${({ isDesktop }) => (isDesktop ? 'contain' : 'cover')};
  opacity: ${({ isReady }) => (isReady ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const Video = styled.video<{ isReady: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  ${mirror};
  background-color: ${({ theme }) => theme.colors.background.primary};
  opacity: ${({ isReady }) => (isReady ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const LoadingOverlay = styled(Flex)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  z-index: 2;
  background-color: ${({ theme }) => theme.colors.background.primary};
`;

const ButtonWrapper = styled(Flex)`
  flex: 2;
  z-index: 3;
  width: 100%;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  margin-top: -30px;
  ${media.mobile`
    margin-top: 50px;
  `}
  ${media.tablet`
  padding: 0;
  height: auto;
  width: auto;
  position: absolute;
  right: 0;
  bottom: 42%;
  margin-right: 60px;
  `}
`;

const MobileResultsWrapper = styled(Flex)`
  width: 100%;
  flex-direction: column;
  padding: 20px;
  margin-top: 20px;
  background-color: ${({ theme }) => {
    const hex = theme.colors.background.secondary;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.95)`;
  }};
  border-radius: 8px;
  max-height: 60vh;
  overflow-y: auto;
  display: none;
  ${media.mobile`
    display: flex;
  `}
`;

const InfoBarWrapper = styled.div`
  height: 25px;
  width: 100%;
  display: flex;
  align-items: flex-end;
  ${media.mobile`
    flex: 0.45;
  `}
`;

const BiosenseSignalMonitor = ({
  showMonitor,
  cameraId,
  onLicenseStatus,
  sessionId,
}) => {
  if (!showMonitor) {
    return null;
  }

  const video = useRef<HTMLVideoElement>(null);
  const [isMeasurementEnabled, setIsMeasurementEnabled] = useState<boolean>(
    false,
  );
  const [startMeasuring, setStartMeasuring] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTimeoutPromise, setLoadingTimeoutPromise] = useState<number>();
  const isPageVisible = usePageVisibility();
  const isMediaTablet = useMediaPredicate('(min-width: 1000px)');
  const processingTime = DEFAULT_MEASUREMENT_DURATION;
  const [licenseKey] = useLicenseKey();
  const {
    sessionState,
    vitalSigns,
    offlineMeasurements,
    error,
    warning,
    info,
  } = useMonitor(
    video,
    cameraId,
    processingTime,
    licenseKey,
    null,
    startMeasuring,
  );
  const prevSessionState = usePrevious(sessionState);
  const errorMessage = useError(error);
  const warningMessage = useWarning(warning);
  const [hasSentResults, setHasSentResults] = useState(false);

  const isMeasuring = useCallback(
    () => sessionState === SessionState.MEASURING,
    [sessionState],
  );

  const isVideoReady = useCallback(
    () => video.current?.readyState === VideoReadyState.HAVE_ENOUGH_DATA,
    [],
  );

  const handleButtonClick = useCallback(() => {
    setIsLoading(true);
    if (sessionState === SessionState.ACTIVE) {
      setStartMeasuring(true);
      setLoadingTimeoutPromise(
        window.setTimeout(() => setIsLoading(true), processingTime * 1000),
      );
    } else if (isMeasuring()) {
      clearTimeout(loadingTimeoutPromise);
      setStartMeasuring(false);
    }
  }, [sessionState, setIsLoading, processingTime]);

  // Send results to API when measurement completes on mobile with session ID
  useEffect(() => {
    const sendResultsToAPI = async () => {
      if (
        !isMobile() ||
        !sessionId ||
        sessionState !== SessionState.TERMINATED ||
        prevSessionState !== SessionState.MEASURING ||
        !vitalSigns ||
        hasSentResults
      ) {
        return;
      }

      try {
        const result = await storeResults(sessionId, vitalSigns);
        if (result.success) {
          setHasSentResults(true);
          console.log('Results sent successfully to API');
        } else {
          console.error('Failed to send results:', result.error);
        }
      } catch (err) {
        console.error('Error sending results to API:', err);
      }
    };

    sendResultsToAPI();
  }, [
    sessionState,
    prevSessionState,
    sessionId,
    vitalSigns,
    hasSentResults,
  ]);

  useEffect(() => {
    if (isMeasuring()) {
      setIsLoading(false);
      if (errorMessage) {
        setIsMeasurementEnabled(false);
      } else {
        setIsMeasurementEnabled(true);
      }
      !isPageVisible && setStartMeasuring(false);
    } else if (
      (sessionState === SessionState.ACTIVE ||
        sessionState === SessionState.TERMINATED) &&
      errorMessage
    ) {
      setIsMeasurementEnabled(false);
    }
    if (
      sessionState === SessionState.TERMINATED &&
      prevSessionState === SessionState.MEASURING &&
      vitalSigns &&
      !errorMessage
    ) {
      setIsMeasurementEnabled(true);
      setIsLoading(false);
    }
    if (
      sessionState === SessionState.ACTIVE &&
      prevSessionState !== sessionState
    ) {
      setStartMeasuring(false);
      setIsLoading(false);
    }
  }, [errorMessage, sessionState, prevSessionState, isPageVisible, vitalSigns]);

  useEffect(() => {
    onLicenseStatus(!(error?.code in HealthMonitorCodes));
  }, [error]);

  const mobile = useMemo(() => isMobile(), []);
  const desktop = useMemo(() => !isTablet() && !isMobile(), []);

  return (
    <>
      <TopBar isMeasuring={isMeasuring()} durationSeconds={processingTime} />
      <MonitorWrapper>
        <MeasurementContentWrapper isMobile={mobile}>
          <VideoAndStatsWrapper isMobile={mobile}>
            <VideoWrapper>
              <Img src={Mask} isDesktop={desktop} isReady={isVideoReady()} />
              <Video 
                ref={video} 
                id="video" 
                muted={true} 
                playsInline={true}
                isReady={isVideoReady()}
              />
            </VideoWrapper>
            {(isMeasuring()
              ? !errorMessage && !warningMessage
              : !errorMessage) &&
              isMeasurementEnabled && !mobile && vitalSigns && <Stats vitalSigns={vitalSigns} />}
            <ErrorAlert message={errorMessage} />
            {isMeasuring() && <WarningAlert message={warningMessage} />}
            {isMeasuring() && <InfoAlert message={info.message} />}
            {!isVideoReady() && licenseKey && (
              <LoadingOverlay>
                <Spinner size={48} />
              </LoadingOverlay>
            )}
          </VideoAndStatsWrapper>
          {isVideoReady() && (
            <ButtonWrapper>
              <StartButton
                isLoading={isLoading}
                isMeasuring={isMeasuring()}
                onClick={handleButtonClick}
              />
            </ButtonWrapper>
          )}
          {mobile && vitalSigns && isMeasurementEnabled && (
            <MobileResultsWrapper>
              <Stats vitalSigns={vitalSigns} isMobile={true} />
            </MobileResultsWrapper>
          )}
        </MeasurementContentWrapper>
      </MonitorWrapper>
    </>
  );
};

export default BiosenseSignalMonitor;


