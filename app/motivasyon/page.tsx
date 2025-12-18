/**
 * Motivasyon Sayfası - Neden Yazmalısın?
 * 
 * Kullanıcıları yazmaya teşvik eden, psikolojik rahatlama ve güvenlik odaklı sayfa.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const MotivationPage = () => {
    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white font-display flex flex-col">
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
                        <Link className="text-white font-medium border-b-2 border-primary py-1 text-sm" href="/motivasyon">
                            Neden Yazmalısın?
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/sss">
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
            <main className="flex-1 pt-24 pb-16 px-4 md:px-8 relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-20"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary/20">
                            <span className="animate-pulse">✨</span>
                            <span>İçini Dök, Rahatla</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 py-2 leading-tight">
                            Yazmak Özgürleşmektir.
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
                            Bazen en ağır yük, söylenmemiş sözlerdir. Burada kimse seni tanımaz,
                            kimse seni yargılamaz. Sadece sen ve kelimelerin varsınız.
                        </p>

                        <div className="relative max-w-3xl mx-auto bg-[#1b1f27]/40 border border-[#282e39] rounded-2xl p-8 mb-12">
                            <span className="absolute top-4 right-6 text-6xl text-primary/10 font-serif leading-none">&quot;</span>
                            <blockquote className="relative z-10 text-lg md:text-xl text-gray-300 font-medium italic leading-relaxed">
                                &quot;İfade edilmemiş duygular asla ölmezler. Sadece diri diri gömülürler ve sonradan daha korkunç şekillerde tezahür ederler.&quot;
                            </blockquote>
                            <div className="mt-4 flex items-center justify-center gap-3">
                                <span className="h-px w-8 bg-primary/30"></span>
                                <cite className="text-primary/80 font-semibold not-italic text-sm tracking-wide">Sigmund Freud</cite>
                                <span className="h-px w-8 bg-primary/30"></span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
                    >
                        {/* Card 1 */}
                        <motion.div variants={fadeIn} className="bg-[#1b1f27]/60 backdrop-blur-md border border-[#282e39] p-8 rounded-3xl hover:border-primary/30 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl">🪶</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Yükünü Hafiflet</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Psikolojik araştırmalar, duyguları yazıya dökmenin stresi azalttığını ve zihinsel berraklık sağladığını gösteriyor. İçindekileri tutma, bırak gitsin.
                            </p>
                        </motion.div>

                        {/* Card 2 */}
                        <motion.div variants={fadeIn} className="bg-[#1b1f27]/60 backdrop-blur-md border border-[#282e39] p-8 rounded-3xl hover:border-primary/30 transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-primary/10 px-3 py-1 rounded-bl-xl text-xs font-bold text-primary border-l border-b border-primary/20">
                                %100 GÜVENLİ
                            </div>
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl">🎭</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Tamamen Anonim</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Gerçek kimliğin asla bilinmez. IP adresin kaydedilmez. İstersen bir rumuz kullan, istersen hayalet ol. Burası senin güvenli alanın.
                            </p>
                        </motion.div>

                        {/* Card 3 */}
                        <motion.div variants={fadeIn} className="bg-[#1b1f27]/60 backdrop-blur-md border border-[#282e39] p-8 rounded-3xl hover:border-primary/30 transition-all duration-300 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-3xl">🤝</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-white">Yalnız Değilsin</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Başkalarının itiraflarını okuduğunda göreceksin ki, benzer acıları, benzer sevinçleri yaşayan binlerce insan var. Biz kocaman, sessiz bir aileyiz.
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#1b1f27] to-background-dark border border-[#282e39] p-12 text-center"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>

                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Sırrın Bizimle Güvende</h2>
                        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
                            Hadi, şimdi o ilk adımı at. İçini kemiren o düşünceyi, o anıyı veya o hayali özgür bırak.
                        </p>

                        <Link
                            href="/"
                            className="inline-flex items-center gap-3 bg-primary hover:bg-blue-600 text-white text-lg font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/40 group mb-8"
                        >
                            <span>Hemen Bir İtiraf Yaz</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>

                        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Ücretsiz
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Üyelik Yok
                            </span>
                            <span className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Kayıt Tutulmaz
                            </span>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border-dark py-6 px-4 md:px-8 mt-auto">
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
                        <Link href="/kurallar" className="hover:text-white transition-colors">Kurallar</Link>
                        <span className="text-gray-600">© 2025 Anonim Duvar</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MotivationPage;
