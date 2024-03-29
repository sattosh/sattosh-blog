import './global.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Script from 'next/script';
import Footer from '@/components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sattosh Blog',
  description: 'Sattosh Blog',
  manifest: 'favicon/site.webmanifest',
};

export default function RootLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="flex justify-center flex-col max-w-screen-lg m-auto">{children}</div>
        <Footer />
        <Script
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "d196fee4e915413a88677b8493ee6e51"}'
          strategy="beforeInteractive"
        ></Script>
      </body>
    </html>
  );
}
