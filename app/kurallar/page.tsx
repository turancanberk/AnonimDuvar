/**
 * Kurallar (Topluluk Kuralları) Sayfası
 * 
 * Platform kullanım kuralları ve topluluk standartları.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface RuleItem {
    title: string;
    description: string;
    icon: string;
    isProhibited?: boolean;
}

const rulesData: RuleItem[] = [
    {
        title: "Saygılı Ol",
        description: "Herkesin hikayesi değerlidir. Başkalarının duygularına, deneyimlerine ve itiraflarına saygı göster. Burada yargılama yok, sadece anlayış var.",
        icon: "💜"
    },
    {
        title: "Anonim Kal",
        description: "Kendi anonimliğini koru, başkalarının anonimliğine de saygı göster. Gerçek isimler, telefon numaraları veya adresler gibi kişisel bilgiler paylaşma.",
        icon: "🎭"
    },
    {
        title: "Nefret Söylemi Yasak",
        description: "Irk, din, cinsiyet, cinsel yönelim veya herhangi bir kimlik özelliği üzerinden nefret söylemi, ayrımcılık veya hakaret kesinlikle yasaktır.",
        icon: "🚫",
        isProhibited: true
    },
    {
        title: "Şiddet İçerik Yasak",
        description: "Şiddet tehditleri, kendine veya başkalarına zarar verme teşviki, terör propagandası ve benzeri içerikler kesinlikle yasaktır ve derhal kaldırılır.",
        icon: "⛔",
        isProhibited: true
    },
    {
        title: "Kişisel Bilgi Paylaşma",
        description: "Kendin dahil hiç kimsenin kişisel bilgilerini (telefon, adres, iş yeri, okul vb.) paylaşma. Bu hem senin hem de başkalarının güvenliği için kritik.",
        icon: "🔐"
    },
    {
        title: "Spam ve Reklam Yasak",
        description: "Platform itiraf paylaşmak için var. Ticari reklamlar, spam içerikler, tekrarlayan mesajlar veya link paylaşımları kabul edilmez.",
        icon: "📵",
        isProhibited: true
    },
    {
        title: "Yasadışı İçerik Yasak",
        description: "Yasadışı faaliyetleri teşvik eden, suç işlemeye yönlendiren veya yasa dışı içerik barındıran mesajlar yayınlanmaz ve gerekirse yetkili makamlara bildirilir.",
        icon: "⚖️",
        isProhibited: true
    },
    {
        title: "18+ İçerik Sınırlı",
        description: "Cinsel içerikli veya çok grafik itiraflar dikkatli bir şekilde değerlendirilir. Pornografik içerik, çocuk istismarı veya benzeri içerikler kesinlikle yasaktır.",
        icon: "🔞",
        isProhibited: true
    },
    {
        title: "Dürüst Ol",
        description: "İtirafların gerçek olması gerekmiyor - hayal ürünü de olabilir. Ancak başkalarını manipüle etmek veya kandırmak amaçlı içerikler kabul edilmez.",
        icon: "✨"
    },
    {
        title: "Moderasyona Saygı",
        description: "Tüm mesajlar yayınlanmadan önce moderasyon sürecinden geçer. Reddedilen mesajların tekrar tekrar gönderilmesi hesabınızın engellenmesine yol açabilir.",
        icon: "👁️"
    }
];

const consequencesData = [
    {
        level: "Hafif İhlal",
        description: "İçerik silinir, uyarı verilmez",
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20"
    },
    {
        level: "Orta İhlal",
        description: "İçerik silinir, IP geçici olarak engellenir",
        color: "text-orange-400",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/20"
    },
    {
        level: "Ağır İhlal",
        description: "İçerik silinir, IP kalıcı olarak engellenir, gerekirse yetkililere bildirilir",
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20"
    }
];

export default function KurallarPage() {
    return (
        <div className="min-h-screen bg-background-dark text-white">
            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border-dark h-16">
                <div className="w-full h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <div className="relative size-16">
                            <Image
                                src="/images/logo.png"
                                alt="Anonim Duvar Logo"
                                width={64}
                                height={64}
                                className="object-contain w-full h-full"
                            />
                        </div>
                        <h1 className="text-white text-xl font-bold tracking-tight hidden md:block neon-text-shadow">Anonim Duvar</h1>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/">
                            Ana Sayfa
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/motivasyon">
                            Neden Yazmalısın?
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/sss">
                            SSS
                        </Link>
                        <Link className="text-white font-medium border-b-2 border-primary py-1 text-sm" href="/kurallar">
                            Kurallar
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">İtiraf Yaz</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="pt-24 pb-16 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Topluluk Kuralları
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text-shadow">
                            Güvenli Alan Kuralları
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            Bu platform herkesin kendini güvende hissedeceği bir alan olmayı hedefliyor.
                            Aşağıdaki kurallar, bu güvenli ortamı korumak için var.
                        </p>
                    </motion.div>

                    {/* Introduction Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-8 mb-12"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">📜</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-3">Neden Kurallar Var?</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Anonim Duvar, insanların içlerini dökebildiği özgür ama <span className="text-white font-medium">güvenli</span> bir alan.
                                    Bu özgürlük, birbirimize saygı gösterdiğimiz sürece var olmaya devam edebilir.
                                    Kurallarımız seni kısıtlamak için değil, herkesin kendini rahat hissetmesi için var.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Rules Grid */}
                    <div className="grid gap-4 md:grid-cols-2 mb-12">
                        {rulesData.map((rule, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                className={`border rounded-xl p-6 transition-all hover:scale-[1.02] ${rule.isProhibited
                                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                                    : 'bg-[#1b1f27]/50 border-[#282e39] hover:border-primary/40'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${rule.isProhibited ? 'bg-red-500/10' : 'bg-primary/10'
                                        }`}>
                                        <span className="text-2xl">{rule.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold mb-2 ${rule.isProhibited ? 'text-red-400' : 'text-white'
                                            }`}>
                                            {rule.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {rule.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Consequences Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Kural İhlallerinin Sonuçları</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {consequencesData.map((consequence, index) => (
                                <div
                                    key={index}
                                    className={`${consequence.bgColor} border ${consequence.borderColor} rounded-xl p-6 text-center`}
                                >
                                    <h3 className={`font-semibold mb-2 ${consequence.color}`}>
                                        {consequence.level}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        {consequence.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Important Note */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-12"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-amber-400 font-semibold mb-2">Önemli Not</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Bu kurallar değişebilir. Platformu kullanmaya devam ederek, güncel kurallara uymayı kabul etmiş olursun.
                                    Ciddi ihlaller için yasal işlem başlatma hakkımız saklıdır.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="text-center"
                    >
                        <div className="bg-[#1b1f27]/50 border border-[#282e39] rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-3">Bir İhlal mi Gördün?</h3>
                            <p className="text-gray-400 mb-6">
                                Kurallara aykırı bir içerik gördüysen, lütfen bize bildir.
                            </p>
                            <a
                                href="mailto:iletisim@notopya.com"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                İhlal Bildir
                            </a>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border-dark py-6 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Tamamen anonim</span>
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600">Sevgiyle yapıldı 💜</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <Link href="/sss" className="hover:text-white transition-colors">SSS</Link>
                        <Link href="/kurallar" className="hover:text-white transition-colors text-white">Kurallar</Link>
                        <span className="text-gray-600">© 2025 Anonim Duvar</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
