# Sticky Note Wall - Clean Architecture Structure

## 📁 Klasör Yapısı

```
sticky-note-app/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx             # Anasayfa
│   │   └── layout.tsx           # Public layout
│   ├── (admin)/                  # Admin routes
│   │   ├── admin/
│   │   │   ├── page.tsx         # Admin dashboard
│   │   │   └── layout.tsx       # Admin layout
│   │   └── login/
│   │       └── page.tsx         # Login sayfası
│   ├── api/                      # API Routes (Controller Layer)
│   │   ├── messages/
│   │   │   └── route.ts         # POST, GET /api/messages
│   │   ├── admin/
│   │   │   └── messages/
│   │   │       ├── route.ts     # GET /api/admin/messages
│   │   │       └── [id]/
│   │   │           └── route.ts # PATCH /api/admin/messages/:id
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts     # NextAuth handler
│   ├── globals.css
│   └── layout.tsx               # Root layout
│
├── components/                   # Presentation Layer
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   └── Toast.tsx
│   ├── features/                # Feature-specific components
│   │   ├── message-form/
│   │   │   ├── MessageForm.tsx
│   │   │   └── ColorPicker.tsx
│   │   ├── sticky-note/
│   │   │   ├── StickyNote.tsx
│   │   │   └── StickyNoteWall.tsx
│   │   └── admin/
│   │       ├── MessageList.tsx
│   │       ├── MessageCard.tsx
│   │       └── StatusBadge.tsx
│   └── layout/                  # Layout components
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── AdminNav.tsx
│
├── lib/                         # Business Logic & Infrastructure
│   ├── domain/                  # Domain Layer (Entities & Interfaces)
│   │   ├── entities/
│   │   │   └── Message.ts       # Message entity
│   │   ├── interfaces/
│   │   │   ├── IMessageRepository.ts
│   │   │   └── IMessageService.ts
│   │   └── types/
│   │       └── index.ts         # Shared types
│   │
│   ├── application/             # Application Layer (Services)
│   │   ├── services/
│   │   │   └── MessageService.ts
│   │   └── validators/
│   │       └── messageValidator.ts
│   │
│   ├── infrastructure/          # Infrastructure Layer (External services)
│   │   ├── repositories/
│   │   │   └── FirebaseMessageRepository.ts
│   │   ├── firebase/
│   │   │   ├── clientApp.ts     # Firebase client config
│   │   │   └── adminApp.ts      # Firebase admin config
│   │   └── auth/
│   │       └── nextAuthOptions.ts
│   │
│   └── utils/                   # Utility functions
│       ├── constants.ts
│       └── helpers.ts
│
├── constants/                   # Application constants
│   ├── colors.ts               # Color palette
│   ├── messageStatus.ts        # Message status enum
│   └── validation.ts           # Validation rules
│
├── config/                      # Configuration files
│   ├── ui.ts                   # UI configuration
│   └── animations.ts           # Animation settings
│
├── types/                       # Global TypeScript types
│   └── index.ts
│
├── public/                      # Static assets
│   ├── fonts/
│   └── images/
│
├── .env.example
├── .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 🏗️ Katman Açıklaması

### 1. **Domain Layer** (`lib/domain/`)
- **Entities**: İş mantığının temel varlıkları (Message)
- **Interfaces**: Repository ve Service sözleşmeleri
- **Types**: Domain-specific tipler
- **Bağımlılık**: YOK (en içteki katman)

### 2. **Application Layer** (`lib/application/`)
- **Services**: İş mantığı implementasyonları
- **Validators**: Veri validasyon kuralları
- **Bağımlılık**: Sadece Domain Layer

### 3. **Infrastructure Layer** (`lib/infrastructure/`)
- **Repositories**: Veri erişim implementasyonları (Firebase)
- **External Services**: Firebase, NextAuth vb.
- **Bağımlılık**: Domain ve Application Layer

### 4. **Presentation Layer** (`app/`, `components/`)
- **Pages**: Next.js sayfaları
- **Components**: React bileşenleri
- **API Routes**: Controller katmanı
- **Bağımlılık**: Tüm katmanlar

## ✅ SOLID Prensipleri

- **S**ingle Responsibility: Her dosya tek bir sorumluluğa sahip
- **O**pen/Closed: Interface'ler ile genişletilebilir
- **L**iskov Substitution: Repository implementasyonları değiştirilebilir
- **I**nterface Segregation: Küçük, spesifik interface'ler
- **D**ependency Inversion: Üst katmanlar interface'lere bağımlı
