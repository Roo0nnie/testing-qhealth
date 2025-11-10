import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import GlobalStyle from './style/global';
import { ThemeProvider } from './context/ThemeContext';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

ReactDOM.render(
  <ThemeProvider>
    <Wrapper>
      <GlobalStyle />
      <App />
    </Wrapper>
  </ThemeProvider>,
  document.getElementById('root'),
);
