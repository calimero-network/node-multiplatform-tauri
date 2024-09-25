import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Reset styles */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* Reset HTML5 display-role for older browsers */
  article, aside, details, figcaption, figure, 
  footer, header, hgroup, main, menu, nav, section {
    display: block;
  }

  /* Set base font and styles */
  html, body {
    height: 100%;
    overflow: hidden;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 16px;
    line-height: 1.5; 
    color: #333;
  }

  #root {
    height: 100%;
  }

  /* Typography styles */
  h1, h2, h3, h4, h5, h6 { 
    font-weight: 600;
    line-height: 1.2;
  }

  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.75rem; }

  p {
    margin-bottom: 1rem;
  }

  /* Remove list styles */
  ol, ul {
    list-style: none;
  }

  /* Remove default styles from links */
  a {
    text-decoration: none;
    color: inherit;
  }

  /* Make images responsive */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* Remove quotes from blockquotes */
  blockquote, q {
    quotes: none;
    &:before, &:after {
      content: '';
      content: none;
    }
  }

  /* Reset form elements */
  button, input, select, textarea {
    font-family: inherit;
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
  }

  /* Button styles */
  button {
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }

  /* Remove default table spacing */
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  /* Additional resets */
  address {
    font-style: normal;
  }

  pre, code {
    font-family: monospace;
  }

  fieldset {
    border: none;
  }

  legend {
    padding: 0;
  }

  hr {
    border: 0;
    border-top: 1px solid;
  }

  /* Improve text rendering */
  html {
    -webkit-text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
  }
`;
