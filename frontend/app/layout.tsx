import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Foreseen — On-chain Rock Paper Scissors",
  description:
    "A psychological mind-sport on Celo. Commit-reveal Rock Paper Scissors with on-chain stats, ranked play and Soulbound ranks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
