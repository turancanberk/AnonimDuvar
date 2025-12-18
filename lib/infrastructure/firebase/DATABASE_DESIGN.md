# 🔥 Firestore Database Yapısı

## 📊 Collections

### 1. **messages** Collection

Her doküman bir sticky note mesajını temsil eder.

#### Document Structure

```typescript
{
  id: string;                    // Auto-generated document ID
  content: string;               // Mesaj içeriği (max 500 karakter)
  color: string;                 // Sticky note rengi (hex code)
  authorName?: string;           // Opsiyonel: Gönderen kişinin adı
  status: 'PENDING' | 'APPROVED' | 'REJECTED';  // Moderasyon durumu
  createdAt: Timestamp;          // Oluşturulma zamanı
  updatedAt: Timestamp;          // Güncellenme zamanı
  moderatedAt?: Timestamp;       // Moderasyon zamanı
  moderatedBy?: string;          // Moderatör email
  rejectionReason?: string;      // Red nedeni (opsiyonel)
  metadata: {
    ipAddress?: string;          // Güvenlik için (opsiyonel)
    userAgent?: string;          // Güvenlik için (opsiyonel)
  }
}
```

#### Indexes

```
Collection: messages
- status (Ascending) + createdAt (Descending)
- status (Ascending) + updatedAt (Descending)
```

---

## 🔐 Security Rules

### Kurallar

1. **Public (Anonim Kullanıcılar)**:
   - ✅ Yeni mesaj oluşturabilir (status: PENDING)
   - ✅ Sadece APPROVED mesajları okuyabilir
   - ❌ Mesajları güncelleyemez
   - ❌ Mesajları silemez

2. **Admin (Authenticated)**:
   - ✅ Tüm mesajları okuyabilir
   - ✅ Mesaj durumunu güncelleyebilir
   - ✅ Mesajları silebilir
   - ❌ Yeni mesaj oluşturamaz (public endpoint kullanmalı)

### Security Rules Kodu

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in [
               // Admin emails will be validated via NextAuth
               // This is a backup security layer
             ];
    }
    
    // Messages collection
    match /messages/{messageId} {
      
      // Anyone can read APPROVED messages
      allow read: if resource.data.status == 'APPROVED';
      
      // Anyone can create a message (with restrictions)
      allow create: if 
        request.resource.data.status == 'PENDING' &&
        request.resource.data.content is string &&
        request.resource.data.content.size() > 0 &&
        request.resource.data.content.size() <= 500 &&
        request.resource.data.color is string &&
        request.resource.data.color.matches('^#[0-9A-Fa-f]{6}$') &&
        request.resource.data.createdAt == request.time &&
        request.resource.data.updatedAt == request.time;
      
      // Only admins can read all messages
      allow read: if isAdmin();
      
      // Only admins can update message status
      allow update: if isAdmin() &&
        request.resource.data.status in ['APPROVED', 'REJECTED'] &&
        request.resource.data.moderatedAt == request.time;
      
      // Only admins can delete messages
      allow delete: if isAdmin();
    }
  }
}
```

---

## 📈 Veri Akışı

### 1. Mesaj Gönderme (Public)
```
User → MessageForm → POST /api/messages → FirebaseMessageRepository.create()
→ Firestore (status: PENDING)
```

### 2. Mesajları Listeleme (Public)
```
User → StickyNoteWall → GET /api/messages → FirebaseMessageRepository.findApproved()
→ Firestore (where status == APPROVED)
```

### 3. Admin Moderasyon
```
Admin → Admin Panel → GET /api/admin/messages → FirebaseMessageRepository.findAll()
→ Firestore (all messages)

Admin → Approve/Reject → PATCH /api/admin/messages/:id → FirebaseMessageRepository.updateStatus()
→ Firestore (update status, moderatedAt, moderatedBy)
```

---

## 🔄 Migration Strategy

### İlk Kurulum
1. Firestore Console'da "messages" collection oluştur
2. Security Rules'u deploy et
3. Test dokümanı ekle (manuel)

### Seed Data (Opsiyonel)
```typescript
// Test için örnek mesajlar
const seedMessages = [
  {
    content: "Bu harika bir proje!",
    color: "#FFF9C4",
    authorName: "Anonim",
    status: "APPROVED",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... daha fazla
];
```

---

## 📊 Performans Optimizasyonu

### Caching Strategy
- **Client-side**: React Query / SWR ile cache
- **Server-side**: Next.js Route Handlers ile revalidation
- **Firestore**: Composite indexes ile hızlı sorgular

### Pagination
- `limit()` ve `startAfter()` kullan
- Sayfa başına 20-30 mesaj

### Real-time Updates (Opsiyonel)
- Admin panel için `onSnapshot()`
- Public için polling (her 30 saniye)

---

## 🛡️ Güvenlik Önlemleri

1. **Rate Limiting**: Vercel Edge Functions ile
2. **Content Validation**: Server-side validation (MessageService)
3. **IP Tracking**: Spam önleme için (opsiyonel)
4. **Profanity Filter**: Gelecekte eklenebilir
5. **Admin Whitelist**: NextAuth + Environment variables
