import type { Metadata } from "next";
import Script from 'next/script'
import "./globals.css";

import { SiteFooter } from '@/src/components/layout/site-footer'
import { SiteHeader } from '@/src/components/layout/site-header'
import { siteConfig } from '@/src/data/site'
import { buildHomeMetadata } from '@/src/lib/signs/metadata'

const homeMetadata = buildHomeMetadata()

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: homeMetadata.title,
  description: homeMetadata.description,
  applicationName: siteConfig.name,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-mark.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: homeMetadata.title,
    description: homeMetadata.description,
    siteName: siteConfig.name,
    type: 'website',
    url: siteConfig.url,
    images: [
      {
        url: '/logo-wordmark.svg',
        width: 1600,
        height: 900,
        alt: `${siteConfig.name} wordmark`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeMetadata.title,
    description: homeMetadata.description,
    images: ['/logo-wordmark.svg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="site-body">
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-N6ES6BGB70" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', 'G-N6ES6BGB70');`}
        </Script>
        <div className="site-shell">
          <SiteHeader />
          <main className="site-main" id="main-content">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
