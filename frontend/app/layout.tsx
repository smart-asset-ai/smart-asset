import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ChatBot from "@/components/ChatBot";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWAInstallBanner from "@/components/PWAInstallBanner";

export const metadata: Metadata = {
  title: "Smart Asset AI | 地元の職人と直接つながる小規模修繕プラットフォーム",
  description:
    "外壁塗装・屋根修繕・防水工事など1000万円以下の小規模修繕に特化。オーナー登録・利用は無料でAI診断・地元業者検索・案件掲載が可能。99%AI運営だから安い。",
  keywords: "小規模修繕, 外壁塗装, 屋根修繕, 防水工事, 地元業者, 塗装屋, 足場屋, AI診断, 不動産修繕, 大家, アパート修繕",
  openGraph: {
    title: "Smart Asset AI | 地元の職人と直接つながる修繕プラットフォーム",
    description: "外壁塗装・屋根修繕など小規模修繕に特化。オーナー無料・地元職人と直接つながる。",
    url: "https://smart-asset.ai",
    siteName: "Smart Asset AI",
    type: "website",
    images: [{ url: "https://smart-asset.ai/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Asset AI | 地元の職人と直接つながる修繕プラットフォーム",
    description: "外壁塗装・屋根修繕など小規模修繕に特化。オーナー無料・地元職人と直接つながる。",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://smart-asset.ai" },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Smart Asset AI" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <svg style={{ display: "none" }} aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="lg-distort" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves={4} seed={3} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={5} xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <filter id="lg-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>

        <Header />
        <main>{children}</main>
        <Footer />
        <ChatBot />
        <PWAInstallBanner />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }`
          }}
        />

        <Script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js" strategy="beforeInteractive" />

        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
