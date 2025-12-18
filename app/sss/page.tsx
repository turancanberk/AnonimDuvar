/**
 * SSS (Sıkça Sorulan Sorular) Sayfası
 * 
 * Platform hakkında bilgi, amaç ve sık sorulan sorular.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface FAQItem {
    question: string;
    answer: string;
    icon?: string;
}

const faqData: FAQItem[] = [
    {
        question: "Bu site neden var? Amacı ne?",
        answer: "Herkesin içinde biriktirdiği, kimseye söyleyemediği şeyler vardır. Bu platform, insanların yargılanma korkusu olmadan duygularını ifade edebilecekleri güvenli bir alan sunmak için oluşturuldu. Bazen sadece yazmak bile rahatlatıcıdır. Burada kimse seni tanımıyor, kimse seni yargılamıyor. Sadece anlat ve yükünü hafiflet.",
        icon: "🎯"
    },
    {
        question: "Gerçekten anonim mi? Kimliğim gizli mi?",
        answer: "Evet, %100 anonim. IP adresini kaydetmiyoruz, takip etmiyoruz. Rumuz kullanmayı seçsen bile gerçek kimliğinle ilişkilendirmiyoruz. Gönderdiğin mesajlar sadece içerikten ibaret - kim olduğunu biz bile bilmiyoruz. Bu, senin için güvenli bir alan yaratmak adına bilinçli bir tercih.",
        icon: "🔒"
    },
    {
        question: "Mesajlarım neden hemen görünmüyor?",
        answer: "Tüm mesajlar yayınlanmadan önce moderasyon sürecinden geçer. Bu, platformun güvenli ve saygılı bir ortam olarak kalmasını sağlamak içindir. Nefret söylemi, hakaret, kişisel bilgi paylaşımı gibi içerikler onaylanmaz. Genellikle mesajlar birkaç saat içinde değerlendirilir.",
        icon: "⏳"
    },
    {
        question: "Ne tür şeyler paylaşabilirim?",
        answer: "İçini rahatsız eden her şeyi paylaşabilirsin: Pişmanlıklar, itiraflar, söyleyemediklerin, korkuların, hayallerin, sırların... Tek şart, başkalarına zarar vermemek. Kişisel bilgi (telefon, adres vb.), nefret söylemi veya yasadışı içerik paylaşamazsın.",
        icon: "💭"
    },
    {
        question: "Neden bir rumuz kullanayım?",
        answer: "Rumuz kullanmak tamamen isteğe bağlı. Bazı insanlar tamamen anonim kalmayı tercih ederken, bazıları kendilerini temsil eden bir takma isim kullanmak ister. '@AşkTanesi' veya '@KayıpRuh' gibi rumuzlar, kimliğini gizli tutarken sana bir karakter verir. Her iki seçenek de tamamen güvenli.",
        icon: "🎭"
    },
    {
        question: "Bu bir terapi yerine geçer mi?",
        answer: "Hayır, kesinlikle hayır. Bu platform profesyonel psikolojik destek yerine geçmez. Ciddi ruh sağlığı sorunları yaşıyorsan, lütfen bir uzmana başvur. Biz sadece günlük hayatta içinde biriktirdiklerini dökmek için güvenli bir alan sunuyoruz. Kriz anında mutlaka profesyonel yardım al.",
        icon: "⚕️"
    },
    {
        question: "Başkalarının itiraflarına yorum yapabilir miyim?",
        answer: "Şu an için yorum özelliği bulunmuyor. Bunun bir nedeni var: Yargısız bir ortam yaratmak istiyoruz. Yorumlar bazen destek verici olsa da, bazen de zarar verici olabiliyor. Belki gelecekte kontrollü bir destek sistemi ekleyebiliriz, ama şimdilik sadece 'okumak ve anlamak' üzerine kuruluyuz.",
        icon: "💬"
    },
    {
        question: "Mesajımı gönderdikten sonra silebilir miyim?",
        answer: "Anonim olduğun için mesajını sana ait olduğunu kanıtlaman mümkün değil. Bu yüzden gönderilen mesajlar geri alınamaz. Göndermeden önce bir kez daha düşün. Ancak içeriğin kurallara aykırıysa veya pişman olduysan, iletişim formu üzerinden moderatörlere ulaşabilirsin.",
        icon: "🗑️"
    },
    {
        question: "Bu platformdan para kazanıyor musunuz?",
        answer: "Hayır. Bu tamamen kişisel bir proje ve topluluk hizmeti olarak geliştirildi. Reklam yok, premium üyelik yok, veri satışı yok. Tek amacımız insanlara içlerini dökebilecekleri güvenli bir alan sunmak. Sunucu maliyetleri kişisel olarak karşılanıyor.",
        icon: "💚"
    },
    {
        question: "Nasıl katkıda bulunabilirim?",
        answer: "En değerli katkın, platformu saygılı bir şekilde kullanmak ve ihtiyacı olan birine bu alanı tanıtmak. Ayrıca geri bildirimlerini bizimle paylaşabilirsin. Her öneri, platformu daha iyi hale getirmemize yardımcı oluyor.",
        icon: "🤝"
    }
];

const FAQAccordion: React.FC<{ item: FAQItem; index: number }> = ({ item, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-[#282e39] rounded-xl overflow-hidden bg-[#1b1f27]/50 hover:bg-[#1b1f27]/80 transition-colors"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
            >
                <div className="flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="text-white font-medium text-base md:text-lg">{item.question}</h3>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-5 pt-0">
                            <div className="pl-12 text-gray-400 text-sm md:text-base leading-relaxed">
                                {item.answer}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default function SSSPage() {
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
                        <Link className="text-white font-medium border-b-2 border-primary py-1 text-sm" href="/sss">
                            SSS
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/kurallar">
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
                <div className="max-w-3xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Sıkça Sorulan Sorular
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 neon-text-shadow">
                            Merak Ettiklerin
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto leading-relaxed">
                            Platform hakkında, güvenlik politikalarımız ve amaçlarımız hakkında
                            sık sorulan soruların cevapları burada.
                        </p>
                    </motion.div>

                    {/* Mission Statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-8 mb-12"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-2xl">💜</span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-3">Misyonumuz</h2>
                                <p className="text-gray-300 leading-relaxed">
                                    Herkesin içinde söyleyemediği şeyler vardır. Ailene, arkadaşlarına,
                                    hatta kendine bile itiraf edemediğin düşünceler... Bu platform,
                                    o düşünceleri güvenle bırakabileceğin bir alan olarak tasarlandı.
                                    <span className="text-white font-medium"> Çünkü bazen sadece yazmak bile iyileştirir.</span>
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* FAQ List */}
                    <div className="space-y-3">
                        {faqData.map((item, index) => (
                            <FAQAccordion key={index} item={item} index={index} />
                        ))}
                    </div>

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center"
                    >
                        <div className="bg-[#1b1f27]/50 border border-[#282e39] rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-white mb-3">Başka Sorun mu Var?</h3>
                            <p className="text-gray-400 mb-6">
                                Burada cevabını bulamadıysan, bize ulaşmaktan çekinme.
                            </p>
                            <a
                                href="mailto:iletisim@vera.com"
                                className="inline-flex items-center gap-2 bg-[#282e39] hover:bg-[#3b4354] text-white font-medium py-3 px-6 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Bize Ulaş
                            </a>
                        </div>
                    </motion.div>

                    {/* Crisis Resources */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-red-400 font-semibold mb-2">Kriz Anında Yardım</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Eğer kendine zarar verme düşünceler i yaşıyorsan veya kriz anındaysan,
                                    lütfen profesyonel yardım al. Türkiye&apos;de 7/24 ücretsiz destek hattı:
                                    <a href="tel:182" className="text-white font-bold ml-1 hover:text-red-400 transition-colors">
                                        182 (İntihar Önleme Hattı)
                                    </a>
                                </p>
                            </div>
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
                        <Link href="/sss" className="hover:text-white transition-colors text-white">SSS</Link>
                        <Link href="/kurallar" className="hover:text-white transition-colors">Kurallar</Link>
                        <span className="text-gray-600">© 2025 Anonim Duvar</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
