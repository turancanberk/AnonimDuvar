#!/usr/bin/env pwsh

# .env.local Doğrulama Scripti

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 .env.local DOĞRULAMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env.local"

if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env.local dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "   Lütfen önce .env.local dosyasını oluştur." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env.local dosyası bulundu" -ForegroundColor Green
Write-Host ""

# Gerekli değişkenleri kontrol et
$requiredVars = @(
    "FIREBASE_ADMIN_PROJECT_ID",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "NEXTAUTH_SECRET",
    "ADMIN_USERNAME",
    "ADMIN_PASSWORD",
    "ADMIN_EMAILS"
)

$content = Get-Content $envFile -Raw
$missing = @()

foreach ($var in $requiredVars) {
    if ($content -match "$var=(.+)") {
        $value = $matches[1].Trim()
        
        # Placeholder kontrolü
        if ($value -match "BURAYA|YOUR|CHANGE|KOPYALA|BELIRLE") {
            Write-Host "⚠️  $var - Placeholder değer, değiştir!" -ForegroundColor Yellow
            $missing += $var
        }
        # Boş kontrolü
        elseif ($value -eq "" -or $value.Length -lt 5) {
            Write-Host "❌ $var - Boş veya çok kısa!" -ForegroundColor Red
            $missing += $var
        }
        # Şifre uzunluk kontrolü
        elseif ($var -eq "ADMIN_PASSWORD" -and $value.Length -lt 12) {
            Write-Host "❌ $var - Minimum 12 karakter olmalı!" -ForegroundColor Red
            $missing += $var
        }
        # Email kontrolü
        elseif ($var -eq "ADMIN_EMAILS" -and $value -notmatch "@") {
            Write-Host "❌ $var - Geçerli email adresi gir!" -ForegroundColor Red
            $missing += $var
        }
        else {
            Write-Host "✅ $var - OK" -ForegroundColor Green
        }
    }
    else {
        Write-Host "❌ $var - Bulunamadı!" -ForegroundColor Red
        $missing += $var
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($missing.Count -eq 0) {
    Write-Host "🎉 TÜM DEĞERLER DOĞRU!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Şimdi uygulamayı yeniden başlat:" -ForegroundColor Yellow
    Write-Host "  1. Ctrl+C ile mevcut npm run dev'i durdur" -ForegroundColor White
    Write-Host "  2. npm run dev ile tekrar başlat" -ForegroundColor White
    Write-Host ""
    Write-Host "Admin panele giriş yap:" -ForegroundColor Yellow
    Write-Host "  http://localhost:3000/admin/login" -ForegroundColor Cyan
}
else {
    Write-Host "⚠️  EKSİK VEYA HATALI DEĞERLER VAR!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Lütfen şu değerleri düzelt:" -ForegroundColor Yellow
    foreach ($var in $missing) {
        Write-Host "  - $var" -ForegroundColor White
    }
}

Write-Host "========================================" -ForegroundColor Cyan
