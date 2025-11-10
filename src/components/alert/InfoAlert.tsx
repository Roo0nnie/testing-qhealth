import React from 'react';
import styled from 'styled-components';
import { Flex } from '../shared/Flex';

const Wrapper = styled(Flex)`
  position: absolute;
  top: 10px;
  height: 70px;
  width: 90%;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.95);
  padding: 13px 50px;
  box-sizing: border-box;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Message = styled.div`
  padding: 5px;
  font-size: 14px;
  color: #c33;
  text-align: center;
`;

const InfoAlert = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <Wrapper>
      <Message>{message}</Message>
    </Wrapper>
  );
};
export default InfoAlert;
