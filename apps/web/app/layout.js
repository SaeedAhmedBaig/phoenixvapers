import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeInitScript } from "@/components/theme/theme-init-script";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Display face (§22.1) — Bricolage Grotesque: a modern editorial grotesque
// that reads premium and current for the vaping category, where the previous
// literary serif felt boutique/apothecary. Variable font: the full weight
// range is included so headings can use medium→semibold from one download.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Phoenix Vapers",
    template: "%s · Phoenix Vapers",
  },
  description:
    "Phoenix Vapers — UK-made, batch-tested vaping products from a compliance-first retailer.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${inter.variable} ${bricolage.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeInitScript />
      </head>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
