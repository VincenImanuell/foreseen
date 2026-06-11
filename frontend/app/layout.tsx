import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Foreseen — the Rock Paper Scissors mind-sport",
  description:
    "A skill-based mind-sport on Celo mainnet. Matchmake, scout your opponent's on-chain history, then commit blind. A game of reading, not luck — not gambling.",
  icons: { icon: "/foreseen-eye.jpg" },
  other: {
    "talentapp:project_verification":
      "3c9a7c6f8b2b452cc43e9747638a3a2bf2d89c1bf79c1edd7cd40de285d851501d1271adc668cea4cebe5ab8526ad7cf1571a3e4cb114bbf54ed5685b5723035",
  },
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
