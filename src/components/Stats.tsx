import React, { useMemo } from 'react';
import styled from 'styled-components';
import StatsBox from './StatsBox';
import { Flex } from './shared/Flex';
import { VitalSigns } from '../types';
import media from '../style/media';

const Wrapper = styled(Flex)<{ isMobile?: boolean }>`
  display: flex;
  position: ${({ isMobile }) => (isMobile ? 'relative' : 'absolute')};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  max-height: ${({ isMobile }) => (isMobile ? 'none' : '400px')};
  overflow-y: auto;
  background-color: ${({ theme }) => {
    // Convert hex to rgba with 0.95 opacity
    const hex = theme.colors.background.secondary;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, 0.95)`;
  }};
  border-radius: 3px;
  padding: 20px;
  bottom: ${({ isMobile }) => (isMobile ? 'auto' : '30px')};
  box-sizing: border-box;
  transition: background-color ${({ theme }) => theme.transitions.normal};
  width: 100%;
  ${media.tablet`
    max-height: 500px;
    padding: 24px;
  `}
`;

const BoxesWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  ${media.tablet`
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  `}
  ${media.desktop`
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  `}
`;

interface IStats {
  /**
   *  Object - contains health stats info
   */
  vitalSigns: VitalSigns;
  /**
   *  Whether this is displayed in mobile results section (below button)
   */
  isMobile?: boolean;
}

// Helper function to format different value types
const formatValue = (value: any, type: string): string => {
  if (value === null || value === undefined) {
    return '--';
  }

  switch (type) {
    case 'bloodPressure':
      if (value?.systolic && value?.diastolic) {
        return `${value.systolic}/${value.diastolic}`;
      }
      return '--';
    case 'rriArray':
      // RRI is an array of RRIValue objects
      if (Array.isArray(value) && value.length > 0) {
        return `${value.length} values`;
      }
      return '--';
    case 'percentage':
      return typeof value === 'number' ? `${value}%` : String(value);
    case 'risk':
      if (typeof value === 'number') {
        return `${value}%`;
      }
      return String(value);
    case 'zone':
      return String(value);
    case 'number':
    default:
      return typeof value === 'number' ? String(value) : String(value);
  }
};

// Configuration for all vital signs with display names and formatting
const vitalSignsConfig = [
  // Basic Vital Signs
  { key: 'pulseRate', title: 'PR', type: 'number' },
  { key: 'respirationRate', title: 'RR', type: 'number' },
  { key: 'spo2', title: 'SpO₂', type: 'number' },
  { key: 'bloodPressure', title: 'BP', type: 'bloodPressure' },
  
  // HRV Metrics
  { key: 'sdnn', title: 'SDNN', type: 'number' },
  { key: 'rmssd', title: 'RMSSD', type: 'number' },
  { key: 'sd1', title: 'SD1', type: 'number' },
  { key: 'sd2', title: 'SD2', type: 'number' },
  { key: 'meanRri', title: 'Mean RRi', type: 'number' },
  { key: 'rri', title: 'RRi', type: 'rriArray' }, // Array type
  { key: 'lfhf', title: 'LF/HF Ratio', type: 'number' },
  
  // Stress & Wellness
  { key: 'stressLevel', title: 'SL', type: 'number' },
  { key: 'stressIndex', title: 'Stress Index', type: 'number' },
  { key: 'normalizedStressIndex', title: 'NSI', type: 'number' },
  { key: 'wellnessIndex', title: 'Wellness Index', type: 'number' },
  { key: 'wellnessLevel', title: 'Wellness Level', type: 'number' },
  
  // Nervous System
  { key: 'snsIndex', title: 'SNS Index', type: 'number' },
  { key: 'snsZone', title: 'SNS Zone', type: 'zone' },
  { key: 'pnsIndex', title: 'PNS Index', type: 'number' },
  { key: 'pnsZone', title: 'PNS Zone', type: 'zone' },
  
  // Other Metrics
  { key: 'prq', title: 'PRQ', type: 'number' },
  { key: 'heartAge', title: 'Heart Age', type: 'number' },
  { key: 'hemoglobin', title: 'Hemoglobin', type: 'number' },
  { key: 'hemoglobinA1c', title: 'HbA1c', type: 'number' },
  { key: 'cardiacWorkload', title: 'Cardiac Workload', type: 'number' },
  { key: 'meanArterialPressure', title: 'Mean Arterial Pressure', type: 'number' },
  { key: 'pulsePressure', title: 'Pulse Pressure', type: 'number' },
  
  // Risk Indicators
  { key: 'ascvdRisk', title: 'ASCVD Risk', type: 'risk' },
  { key: 'ascvdRiskLevel', title: 'ASCVD Risk Level', type: 'risk' },
  { key: 'highBloodPressureRisk', title: 'High BP Risk', type: 'risk' },
  { key: 'highFastingGlucoseRisk', title: 'High Glucose Risk', type: 'risk' },
  { key: 'highHemoglobinA1CRisk', title: 'High HbA1c Risk', type: 'risk' },
  { key: 'highTotalCholesterolRisk', title: 'High Cholesterol Risk', type: 'risk' },
  { key: 'lowHemoglobinRisk', title: 'Low Hemoglobin Risk', type: 'risk' },
];

const Stats = ({ vitalSigns, isMobile = false }: IStats) => {
  const statsToDisplay = useMemo(() => {
    return vitalSignsConfig.map((config) => {
      const vitalSign = vitalSigns[config.key as keyof VitalSigns];
      
      // If vital sign doesn't exist, show it as disabled
      if (!vitalSign) {
        return {
          ...config,
          value: 'N/A',
          isEnabled: false,
        };
      }

      const displayValue = vitalSign.isEnabled
        ? formatValue(vitalSign.value, config.type)
        : 'N/A';

      return {
        ...config,
        value: displayValue,
        isEnabled: vitalSign.isEnabled,
      };
    });
  }, [vitalSigns]);

  return (
    <Wrapper isMobile={isMobile}>
      <BoxesWrapper>
        {statsToDisplay.map((stat) => (
          <StatsBox
            key={stat.key}
            title={stat.title}
            value={stat.value}
          />
        ))}
      </BoxesWrapper>
    </Wrapper>
  );
};

export default Stats;
