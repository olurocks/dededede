import type { Metadata } from "next";
import Providers from "./providers";
import "./global.css";

// import "global.css";



export const metadata: Metadata = {
  title: "AppKit in Next.js + wagmi",
  description: "AppKit example dApp",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
