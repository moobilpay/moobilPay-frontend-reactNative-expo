import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=1, user-scalable=no"
        />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: webStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const webStyles = `
  *, *::before, *::after {
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow-x: hidden;
    background-color: #1a1a2e;
  }

  body {
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }

  #root {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    min-height: 100vh;
    height: 100%;
    margin: 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #f8fafc;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.15);
    position: relative;
  }

  /* Force all RN Views to respect container width */
  #root > div, #root > div > div {
    max-width: 100%;
    overflow-x: hidden;
  }

  /* Reset text input outline on web */
  input, textarea {
    outline: none;
    border: none;
  }

  /* Hide scrollbar for horizontal ScrollViews */
  ::-webkit-scrollbar {
    width: 4px;
    height: 0px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }

  /* Ensure images don't overflow */
  img {
    max-width: 100%;
  }

  /* Fix horizontal scroll containers on web */
  [data-testid="horizontal-scroll"],
  [role="list"] {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  [data-testid="horizontal-scroll"]::-webkit-scrollbar,
  [role="list"]::-webkit-scrollbar {
    display: none;
  }
`;
