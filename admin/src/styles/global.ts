import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    background: ${({ theme }:any) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', 'Apple Color Emoji', 'Segoe UI Emoji';
  }
  * { box-sizing: border-box; }
`;