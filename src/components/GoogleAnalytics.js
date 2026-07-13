'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics() {
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const hasConsent = localStorage.getItem('cookie-consent') === 'true';
    setConsent(hasConsent);

    // Listen for custom event triggered when user clicks "Yes"
    const handleConsentChange = () => {
      setConsent(localStorage.getItem('cookie-consent') === 'true');
    };
    
    window.addEventListener('cookie-consent-updated', handleConsentChange);
    return () => {
      window.removeEventListener('cookie-consent-updated', handleConsentChange);
    };
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!consent || !gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}
