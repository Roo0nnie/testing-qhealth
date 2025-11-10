import React from 'react';
import styled from 'styled-components';
import QRCodeDisplay from './QRCodeDisplay';
import DesktopResults from './DesktopResults';
import useResultsPolling from '../hooks/useResultsPolling';
import { Flex } from './shared/Flex';

const Container = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  padding: 40px 20px;
  background: ${({ theme }) => theme.colors.background.primary};
  transition: background-color ${({ theme }) => theme.transitions.normal};
`;

interface DesktopFallbackProps {
  sessionId: string;
}

/**
 * Desktop fallback component
 * Shows QR code for scanning, polls for results, and displays them when received
 */
const DesktopFallback: React.FC<DesktopFallbackProps> = ({ sessionId }) => {
  const { results, isLoading, error, isPolling } = useResultsPolling(
    sessionId,
    true, // Always enabled for desktop
  );

  // If results are received, show results view
  if (results) {
    return (
      <Container>
        <DesktopResults
          results={results}
          isLoading={isLoading}
          error={error}
          isPolling={isPolling}
        />
      </Container>
    );
  }

  // Otherwise show QR code with polling status
  return (
    <Container>
      <QRCodeDisplay sessionId={sessionId} />
      {/* {isPolling && (
        <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          Waiting for measurement results...
        </div>
      )} */}
      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '12px',
            color: '#c33',
            maxWidth: '500px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          {error}
        </div>
      )}
    </Container>
  );
};

export default DesktopFallback;

