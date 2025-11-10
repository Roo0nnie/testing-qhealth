import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import BiosenseSignalMonitor from './BiosenseSignalMonitor';
import SettingsBars from './SettingsBars';
import DesktopFallback from './DesktopFallback';
import { Flex } from './shared/Flex';
import { useCameras, useDisableZoom } from '../hooks';
import useDeviceDetection from '../hooks/useDeviceDetection';
import useSession from '../hooks/useSession';

const Container = styled(Flex)<{ isSettingsOpen: boolean }>`
  height: 100%;
  width: 100%;
  position: relative;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  background-color: ${({ isSettingsOpen }) =>
    isSettingsOpen && 'rgba(0, 0, 0, 0.5)'};
`;

const App = () => {
  const { isMobile, isDesktop } = useDeviceDetection();
  const session = useSession(isDesktop);
  const cameras = useCameras();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cameraId, setCameraId] = useState<string>();
  const [isLicenseValid, setIsLicenseValid] = useState(false);
  useDisableZoom();

  // Desktop: Show QR code fallback
  if (isDesktop && session) {
    return <DesktopFallback sessionId={session.sessionId} />;
  }

  const onSettingsClickedHandler = useCallback((event) => {
    const settingsBars = document.getElementById('settingsBars');
    const isSettingsButtonClicked = event.target.id === 'settingsButton';

    const isInsideSettingsClicked =
      settingsBars.contains(event.target as Node) || isSettingsButtonClicked;

    if (!isInsideSettingsClicked) {
      setIsSettingsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', onSettingsClickedHandler);
    return () => {
      document.removeEventListener('click', onSettingsClickedHandler);
    };
  }, []);

  const updateLicenseStatus = useCallback((valid) => {
    setIsLicenseValid(valid);
  }, []);

  const toggleSettingsClick = useCallback(() => {
    setIsSettingsOpen(!isSettingsOpen);
  }, [isSettingsOpen]);

  const handleCloseSettings = useCallback(({ cameraId }) => {
    setCameraId(cameraId);
    setIsSettingsOpen(false);
  }, []);

  useEffect(() => {
    if (!cameras?.length) return;
    setCameraId(cameras[0].deviceId);
  }, [cameras]);

  return (
    <Container isSettingsOpen={isSettingsOpen}>
      <BiosenseSignalMonitor
        showMonitor={!(isMobile && isSettingsOpen)}
        cameraId={cameraId}
        onLicenseStatus={updateLicenseStatus}
        onSettingsClick={toggleSettingsClick}
        isSettingsOpen={isSettingsOpen}
        sessionId={session?.sessionId}
      />
      <SettingsBars
        open={isSettingsOpen}
        onClose={handleCloseSettings}
        cameras={cameras}
        isLicenseValid={isLicenseValid}
      />
    </Container>
  );
};

export default App;
