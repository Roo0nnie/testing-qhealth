import styled from 'styled-components';
import React, { useCallback, useEffect, useState } from 'react';
import CloseButton from './shared/CloseButton';
import SettingsDropDown from './SettingsDropDown';
import { Flex } from './shared/Flex';
import media from '../style/media';

const SideBar = styled(Flex)<{ reverseAnimation }>`
  position: absolute;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100%;
  top: 0;
  left: 0;
  background-color: ${({ theme }) => theme.colors.background.primary};
  overflow: hidden;
  z-index: 1;
  animation-name: ${({ reverseAnimation }) =>
    reverseAnimation ? 'slide-reverse' : 'slide'};
  animation-duration: 300ms;
  animation-timing-function: ease-in-out;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  transition: background-color ${({ theme }) => theme.transitions.normal};
  @keyframes slide {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
  @keyframes slide-reverse {
    from {
      width: 100%;
    }
    to {
      width: 0;
    }
  }
  ${media.tablet`
    width: 400px;
    box-shadow: ${({ theme }) => theme.shadows.md};
    @keyframes slide {
      from {
        width: 0;
      }
      to {
        width: 400px;
      }
    }
    @keyframes slide-reverse {
      from {
        width: 400px;
      }
      to {
        width: 0;
      }
    }
`}
`;

const Wrapper = styled(Flex)`
  flex-direction: column;
  margin-top: 80px;
  width: 340px;
  box-sizing: border-box;
`;

const CloseWrapper = styled(Flex)`
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  margin-bottom: 15px;
`;

const CameraDropDown = styled.div`
  display: none;
  ${media.tablet`
    margin-top: 15px;
    display: block;
  `}
`;

const Title = styled.h3`
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 19px;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 6px;
  transition: color ${({ theme }) => theme.transitions.normal};
`;

const SettingsBars = ({ open, onClose, cameras, isLicenseValid }) => {
  const [cameraId, setCameraId] = useState<string>();
  const [isClosing, setIsClosing] = useState<boolean>();

  const mapCamerasToDropDown = useCallback(
    (cameras) =>
      cameras?.map(({ deviceId, label }) => ({ value: deviceId, name: label })),
    [],
  );

  const handleCameraSelected = useCallback((cameraId) => {
    setCameraId(cameraId);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose({ cameraId });
      setIsClosing(false);
    }, 200);
  }, [cameraId]);


  useEffect(() => {
    cameras?.length && setCameraId(cameras[0].deviceId);
  }, [cameras]);

  return (
    <div id="settingsBars">
      {open && (
        <SideBar reverseAnimation={!!isClosing}>
          <Wrapper>
            <CloseWrapper>
              <CloseButton onClick={handleClose} />
            </CloseWrapper>
            <CameraDropDown>
              <Title>Camera</Title>
              <SettingsDropDown
                onSelect={handleCameraSelected}
                options={mapCamerasToDropDown(cameras)}
              />
            </CameraDropDown>
          </Wrapper>
        </SideBar>
      )}
    </div>
  );
};

export default SettingsBars;
