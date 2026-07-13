import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata = {
  title: 'Resume Mill | Free ATS-Friendly Resume Builder & Portfolio Generator',
  description: 'Create a recruiter-approved, ATS-friendly resume using Gemini AI for free. Preview elegant templates and download your complete personal portfolio website as a ZIP.',
  keywords: 'free ats resume builder, ai resume builder free, ats friendly resume templates, portfolio website generator free, gemini ai resume maker, developer portfolio zip template',
  metadataBase: new URL('https://resumemill.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Resume Mill | Free ATS-Friendly Resume Builder & Portfolio Generator',
    description: 'Create a recruiter-approved, ATS-friendly resume using Gemini AI for free. Preview elegant templates and download your complete personal portfolio website as a ZIP.',
    url: 'https://resumemill.vercel.app',
    siteName: 'Resume Mill',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Mill | Free ATS-Friendly Resume Builder & Portfolio Generator',
    description: 'Create a recruiter-approved, ATS-friendly resume using Gemini AI for free. Preview elegant templates and download your complete personal portfolio website as a ZIP.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  // We embed the JSON-LD schema markup directly for search engine snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Resume Mill',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'All',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
    },
    'description': 'Create a recruiter-approved, ATS-friendly resume using Gemini AI for free. Preview templates and download your personal portfolio website as a ZIP.',
  };

  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Dynamic privacy-first GA4 Loader */}
        <GoogleAnalytics />

        {/* Global Nav Header */}
        <Header />

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Compliance Cookie Banner */}
        <CookieBanner />
      </body>
    </html>
  );
}
