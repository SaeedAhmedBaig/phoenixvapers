import "./globals.css";

export const metadata = {
  title: "Phoenix Vapers | UK E-Liquids, Vape Kits & CBD",
  description:
    "Phoenix Vapers landing page for UK-made e-liquids, authentic vape hardware, CBD, coils, loyalty rewards, and trusted UK delivery.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
