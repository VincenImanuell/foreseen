import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Foreseen — the Rock Paper Scissors mind-sport",
  description:
    "A skill-based mind-sport on Celo mainnet. Matchmake, scout your opponent's on-chain history, then commit blind. A game of reading, not luck — not gambling.",
  icons: { icon: "/foreseen-eye.svg" },
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
