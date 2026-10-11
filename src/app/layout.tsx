import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = 'https://rad-marigold-ff55c6.netlify.app';
const siteDescription =
  'Özel ders öğretmenleri, öğrenciler ve veliler için şeffaf ders takibi, ödev yönetimi, akıllı kütüphane ve TYT/AYT net analizi sunan modern eğitim platformu.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dersly | Özel Ders ve Öğrenci Yönetim Platformu',
    template: '%s | Dersly',
  },
  description: siteDescription,
  applicationName: 'Dersly',
  authors: [{ name: 'Dersly Team' }],
  keywords: [
    'özel ders yönetimi',
    'özel ders takip',
    'YKS hazırlık',
    'öğrenci koçluğu',
    'veli bilgilendirme sistemi',
    'ders takvimi',
    'ödev takibi',
    'dersly',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Dersly | Özel Ders ve Öğrenci Yönetim Platformu',
    description: siteDescription,
    url: siteUrl,
    siteName: 'Dersly',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Dersly Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dersly | Özel Ders ve Öğrenci Yönetim Platformu',
    description: siteDescription,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      'name': 'Dersly',
      'applicationCategory': 'EducationalApplication',
      'operatingSystem': 'Web, iOS, Android',
      'offers': {
        '@type': 'Offer',
        'price': '50.00',
        'priceCurrency': 'TRY',
        'priceSpecification': {
          '@type': 'UnitPriceSpecification',
          'price': '50.00',
          'priceCurrency': 'TRY',
          'unitText': 'MONTH',
        },
      },
      'description': siteDescription,
      'url': siteUrl,
    },
    {
      '@type': 'EducationalOrganization',
      'name': 'Dersly',
      'url': siteUrl,
      'logo': `${siteUrl}/og-image.png`,
      'sameAs': [siteUrl],
      'description':
        'Birebir özel ders süreçlerini şeffaf, ölçülebilir ve dijital hale getiren yeni nesil eğitim yönetim platformu.',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        {/* Skip Navigation Link for WCAG 2.2 AA Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:p-4 focus:bg-white focus:text-slate-900 focus:font-bold focus:shadow-2xl focus:rounded-xl focus:z-[9999] focus:ring-2 focus:ring-indigo-600 focus:outline-none"
        >
          İçeriğe Atla
        </a>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
