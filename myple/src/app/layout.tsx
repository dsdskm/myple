"use client"

import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import StyledComponentsRegistry from "./lib/StyledComponentsRegistry";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <StyledComponentsRegistry>
          <TDSMobileAITProvider>
            {children}
          </TDSMobileAITProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
