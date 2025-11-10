import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../context/ThemeContext';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const ToggleSwitch = styled.div<{ isDark: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  background-color: ${({ theme, isDark }) =>
    isDark ? theme.colors.primary.main : theme.colors.border.medium};
  border-radius: 12px;
  transition: background-color ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  margin-right: 10px;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ isDark }) => (isDark ? '26px' : '2px')};
    width: 20px;
    height: 20px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    border-radius: 50%;
    transition: left ${({ theme }) => theme.transitions.normal},
      background-color ${({ theme }) => theme.transitions.normal};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    
  }
`;


const ThemeToggle: React.FC = () => {
  const { themeMode } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <ToggleContainer title={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <ToggleSwitch isDark={isDark} />
    </ToggleContainer>
  );
};

export default ThemeToggle;

