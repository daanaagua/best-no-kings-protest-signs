import type { Metadata } from "next";
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
