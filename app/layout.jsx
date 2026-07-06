import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://phoenixeliquid.co.uk"),
  title: {
    default: "Phoenix Vapers | UK E-Liquids, Vape Kits & CBD",
    template: "%s | Phoenix Vapers",
  },
  description:
    "Regulated UK vape retail: UK-made e-liquids, authentic vape hardware, coils, CBD, loyalty rewards, tracked delivery, and age-aware checkout.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Phoenix Vapers | UK E-Liquids, Vape Kits & CBD",
    description:
      "Regulated UK vape retail with fast faceted browsing, age-aware checkout, loyalty rewards, and tracked delivery.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
