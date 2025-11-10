import React, { useMemo } from 'react';
import styled from 'styled-components';
// @ts-ignore - qrcode.react doesn't have full TypeScript support
import { QRCodeSVG } from 'qrcode.react';
import { Flex } from './shared/Flex';

const Container = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
`;

const QRCodeWrapper = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: background-color ${({ theme }) => theme.transitions.normal},
    box-shadow ${({ theme }) => theme.transitions.normal};
`;

const Instructions = styled.div`
  text-align: center;
  max-width: 400px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: color ${({ theme }) => theme.transitions.normal};
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
  margin-bottom: 12px;
  transition: color ${({ theme }) => theme.transitions.normal};
`;

const SessionIdText = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  font-family: monospace;
  margin-top: 12px;
  word-break: break-all;
  transition: color ${({ theme }) => theme.transitions.normal};
`;

interface QRCodeDisplayProps {
  sessionId: string;
  mobileUrl?: string;
}

/**
 * QR Code display component
 * Generates QR code with mobile URL + session ID
 * Uses current window origin if mobileUrl is not provided
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  sessionId,
  mobileUrl,
}) => {
  // Use current origin if mobileUrl not provided, fallback to default
  const baseUrl = useMemo(() => {
    if (mobileUrl) {
      return mobileUrl;
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://testing-qhealth-lcwz2m2vf-ro0nnies-projects.vercel.app';
  }, [mobileUrl]);

  const qrCodeUrl = `${baseUrl}?session=${sessionId}`;

  return (
    <Container>
      <Instructions>
        <Title>Scan with Your Phone</Title>
        <Description>
          This feature requires a mobile phone camera. Please scan the QR code
          below with your phone to continue with the measurement.
        </Description>
      </Instructions>
      <QRCodeWrapper>
        <QRCodeSVG value={qrCodeUrl} size={256} level="M" />
      </QRCodeWrapper>
      <SessionIdText>Session: {sessionId}</SessionIdText>
    </Container>
  );
};

export default QRCodeDisplay;
