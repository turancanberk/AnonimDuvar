import type { Metadata } from 'next';
import { Inter, Caveat } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Font configurations
const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800'],
});

const caveat = Caveat({
    subsets: ['latin'],
    variable: '--font-caveat',
    display: 'swap',
});

export const metadata: Metadata = {
    title: 'Anonim Duvar | Anonim İtiraf ve Paylaşım Platformu',
    description: 'İnsanların söyleyemedikleri şeyleri anonim olarak paylaşabilecekleri güvenli platform. İçini dök, rahatla, özgürleş. Kimse bilmeden paylaş.',
    keywords: ['anonim duvar', 'itiraf', 'anonim mesaj', 'sır', 'paylaşım', 'duygular', 'itiraf duvarı', 'anonim platform'],
    authors: [{ name: 'Anonim Duvar' }],
    icons: {
        icon: '/images/logo-notopya.png',
        apple: '/images/logo-notopya.png',
    },
    openGraph: {
        title: 'Anonim Duvar | Anonim İtiraf Platformu',
        description: 'Sırrın bizimle güvende. Kimse bilmeden anlat, rahatla. %100 anonim ve güvenli.',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className={`${inter.variable} ${caveat.variable} dark`} suppressHydrationWarning>
            <body className="font-display antialiased bg-background-dark text-white transition-colors duration-300" suppressHydrationWarning>
                <ThemeProvider>
                    <SessionProvider>{children}</SessionProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
