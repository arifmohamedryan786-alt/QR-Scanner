import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Studio – Free Client-Side QR Code Scanner & Generator",
  description:
    "Scan and generate QR codes 100% client-side with no backend, no database, and no server uploads. Features live rear-camera scanning, drag-and-drop image decoding, Wi-Fi / Email / Phone QR generation, SVG/PNG export, and dark mode.",
  keywords: [
    "QR code scanner",
    "QR code generator",
    "WiFi QR code",
    "client-side QR",
    "SVG QR code",
    "mobile QR reader",
    "private QR scanner",
  ],
  authors: [{ name: "QR Studio" }],
  creator: "QR Studio",
  openGraph: {
    title: "QR Studio – Free Client-Side QR Code Scanner & Generator",
    description:
      "Instant, private, device-local QR code scanner and generator. Works on any smartphone or desktop browser.",
    url: "https://qrstudio.app",
    siteName: "QR Studio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Studio – Free Client-Side QR Code Scanner & Generator",
    description:
      "Instant, private, device-local QR code scanner and generator with live camera and image drop support.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('qr_studio_theme_v1');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}

