# 📝 Anonim Duvar (Anonymous Wall)

> Söyleyemediklerini anonim olarak paylaş

## 🎯 Proje Hakkında

İnsanların bir kişiye söyleyemedikleri şeyleri, içlerinden atmak için **anonim olarak** yazabildikleri modern bir web uygulaması.

### ✨ Özellikler

- ✅ **Tamamen Anonim**: Kayıt/giriş yok
- ✅ **Opsiyonel İsim**: İstersen ismini ekle, istersen anonim kal
- ✅ **Renkli Sticky Note'lar**: Pastel renk paleti ile duygunu ifade et
- ✅ **Moderasyon Sistemi**: Admin onayı ile güvenli içerik
- ✅ **Modern Tasarım**: Duygusal ama minimal arayüz
- ✅ **Responsive**: Mobil, tablet ve desktop uyumlu
- ✅ **Rate Limiting**: Spam koruması
- ✅ **CSRF Protection**: Güvenlik önlemleri

## 🛠️ Teknoloji Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

### Backend
- **Next.js API Routes**
- **Firebase Firestore**
- **NextAuth.js** (Admin authentication)

### Deployment
- **Vercel**

## 🏗️ Mimari

Bu proje **Clean Architecture** prensipleri ile geliştirilmiştir:

- **Domain Layer**: Entities, Interfaces
- **Application Layer**: Services, Validators
- **Infrastructure Layer**: Repositories, External Services
- **Presentation Layer**: Components, Pages

Detaylı mimari bilgisi için: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- Firebase hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/yourusername/sticky-note-app.git
cd sticky-note-app
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin ve Firebase + NextAuth bilgilerinizi ekleyin.

4. **Development server'ı başlatın**
```bash
npm run dev
```

Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## 📁 Proje Yapısı

```
sticky-note-app/
├── app/              # Next.js App Router
├── components/       # React bileşenleri
├── lib/             # Business logic & infrastructure
│   ├── domain/      # Entities & interfaces
│   ├── application/ # Services
│   └── infrastructure/ # Repositories & external services
├── constants/       # Sabitler
├── config/          # Konfigürasyonlar
└── public/          # Static dosyalar
```

## 🎨 Design System

### Renk Paleti
- **Pastel Yellow**: `#FFF9C4`
- **Pastel Pink**: `#F8BBD0`
- **Pastel Blue**: `#BBDEFB`
- **Pastel Green**: `#C8E6C9`
- **Pastel Purple**: `#E1BEE7`
- **Pastel Orange**: `#FFE0B2`

### Fontlar
- **Sans**: Inter
- **Handwriting**: Caveat

## 🔐 Admin Paneli

Admin paneline erişim için:

1. Kullanıcı adı ve şifre ile giriş yapın
2. Email adresiniz whitelist'te olmalı (`.env.local` içinde `ADMIN_EMAILS`)

## 📝 Geliştirme Prensipleri

- ✅ **SOLID** prensipleri
- ✅ **Clean Code**
- ✅ **Clean Architecture**
- ✅ **Separation of Concerns**
- ✅ **No Hard-coding**
- ✅ **Type Safety** (TypeScript)
- ✅ **Responsive Design**
- ✅ **Security Best Practices**

## 🧪 Test

```bash
npm run test        # Unit tests
npm run test:run    # Run tests once
npm run test:coverage # Coverage report
```

## 📦 Build & Deploy

```bash
npm run build       # Production build
npm run start       # Production server
```

Vercel'e deploy için:
```bash
vercel
```

## 🔒 Güvenlik

- CSRF koruması
- Rate limiting (5 mesaj/saat)
- IP-based fingerprinting
- Admin authentication
- Environment variable validation

Detaylı güvenlik bilgisi için: [SECURITY_FIXES.md](./SECURITY_FIXES.md)

## 📊 Roadmap

Proje ilerleyişi için: [roadmap.md](./roadmap.md)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License

---

**Not**: Bu proje Clean Architecture, SOLID prensipleri ve modern web development best practices kullanılarak geliştirilmiştir.

