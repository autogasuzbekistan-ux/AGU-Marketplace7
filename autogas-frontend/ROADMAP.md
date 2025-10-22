# Auto Gas Uzbekistan - Loyiha Yo'l Xaritasi

Ushbu hujjat "Auto Gas Uzbekistan" e-tijorat platformasining rivojlanish bosqichlari, hozirgi holati va kelajakdagi rejalarini o'zida aks ettiradi.

## 1. Loyiha Umumiy Ko'rinishi

Bu metan va propan gaz uskunalari ehtiyot qismlarini sotishga mo'ljallangan onlayn-do'kon (marketplace). Loyiha uchta asosiy qismdan iborat:

- **Mijozlar uchun sayt (`index.html`):** Mahsulotlarni ko'rish, qidirish, saralash, savatga qo'shish va xarid qilish imkoniyatini beradi.
- **Ma'muriyat paneli (`admin.html`):** Mahsulotlar, foydalanuvchilar, buyurtmalar va sharhlarni boshqarish uchun mo'ljallangan.
- **Backend API (Laravel):** Sayt va ma'muriyat panelining barcha funksiyalarini ma'lumotlar bazasi bilan bog'laydigan server qismi.

---

## 2. Texnologiyalar Steki

- **Frontend:** HTML, CSS, TailwindCSS, JavaScript (ES6+), GSAP (animatsiyalar uchun).
- **Backend:** PHP, Laravel Framework.
- **Ma'lumotlar bazasi:** (Taxminan) MySQL yoki PostgreSQL.
- **Server:** (Taxminan) Nginx/Apache.

---

## 3. Bajarilgan Ishlar (Hozirgi Holat)

Quyida loyihaning hozirda ishlab turgan va yakunlangan qismlari keltirilgan.

### ✅ Frontend (Mijozlar uchun sayt)
- [x] **Asosiy Sahifalar:** Saytning barcha bo'limlari (`Hero`, `Products`, `Categories`, `About`, `Partners`, `FAQ`, `Contact`, `Footer`) HTML strukturasi yaratilgan va dizayn qilingan.
- [x] **Adaptiv Dizayn (Responsive):** Sayt mobil va desktop qurilmalar uchun to'liq moslashtirilgan.
- [x] **Animatsiyalar:**
    - [x] Sayt yuklanish animatsiyasi (Loading Screen).
    - [x] Elementlarning sahifada paydo bo'lish animatsiyasi (Fade-in on scroll).
    - [x] Interaktiv elementlar uchun hover effektlari (GSAP).
- [x] **Autentifikatsiya:**
    - [x] Ro'yxatdan o'tish (Register) modali va funksiyasi.
    - [x] Tizimga kirish (Login) modali va funksiyasi.
    - [x] Tizimdan chiqish (Logout).
- [x] **Mahsulotlar:**
    - [x] Mahsulotlarni backenddan yuklab ko'rsatish.
    - [x] Mahsulotlarni qidirish (Search).
    - [x] Mahsulotlarni narx bo'yicha saralash (Sort).
    - [x] Mahsulot kartasini bosganda batafsil ma'lumot modalini ochish.
    - [x] Paginatsiya (sahifalarga bo'lish).
- [x] **Savat (Cart):**
    - [x] Mahsulotni savatga qo'shish.
    - [x] Savat tarkibini ko'rsatuvchi yon panel (Sidebar).
    - [x] Savatdagi mahsulotlar sonini header'da ko'rsatish.
- [x] **Buyurtma Berish (Checkout):**
    - [x] Savatdan buyurtmani rasmiylashtirishga o'tish.
    - [x] Mijoz ma'lumotlarini (ism, telefon, manzil, viloyat) kiritish formasi.
    - [x] Buyurtmani backendga yuborish.
- [x] **Foydalanuvchi Profili:**
    - [x] Shaxsiy ma'lumotlarni (ism, email) o'zgartirish.
    - [x] Parolni yangilash.
- [x] **Sharhlar (Reviews):**
    - [x] Mahsulot uchun yozilgan sharhlarni ko'rish.
    - [x] Mahsulotni sotib olgan foydalanuvchilar uchun sharh yozish formasi.

### ✅ Backend (API)
- [x] **Autentifikatsiya:** `register`, `login`, `logout` uchun API endpointlar mavjud.
- [x] **Mahsulotlarni Boshqarish (CRUD):** Mahsulotlarni olish, yaratish, tahrirlash va o'chirish uchun to'liq API.
- [x] **Buyurtmalar:** Mijoz tomonidan buyurtma yaratish va admin tomonidan barcha buyurtmalarni ko'rish uchun API.
- [x] **Foydalanuvchi Profili:** Foydalanuvchi ma'lumotlari va parolini yangilash uchun API.
- [x] **Sharhlar:** Sharhlarni olish va qo'shish uchun API.
- [x] **Rollar (Roles):** `owner`, `admin`, `operator`, `customer` rollari uchun middleware orqali huquqlarni cheklash.

### ✅ Ma'muriyat Paneli (Admin Panel)
- [x] **Kirish Huquqi:** Faqat `owner`, `admin`, `operator` rollari kira oladi.
- [x] **Dashboard:** Umumiy statistika (mahsulotlar, foydalanuvchilar, buyurtmalar soni) paneli.
- [x] **Mahsulotlarni Boshqarish:** Mahsulotlarni qo'shish, tahrirlash, o'chirish va ro'yxatini ko'rish.
- [x] **Foydalanuvchilarni Boshqarish:** Foydalanuvchilar ro'yxatini ko'rish, ularni bloklash va blokdan chiqarish.
- [x] **Buyurtmalarni Boshqarish:**
    - [x] Barcha buyurtmalar ro'yxatini ko'rish.
    - [x] Buyurtma statusini (`yangi`, `bajarildi`, `bekor qilindi`) o'zgartirish.
    - [x] Operatorlar faqat o'z viloyatidagi buyurtmalarni ko'ra oladi.

---

## 4. Qilinishi Kerak Bo'lgan Ishlar (Kelajakdagi Qadamlar)

Quyida loyihani yanada takomillashtirish va to'liq yakunlash uchun bajarilishi kerak bo'lgan vazifalar ro'yxati keltirilgan.
 
### 🟡 Backend (API) - Keyingi Qadamlar
- [x] **Savatni Backendda Saqlash:** Savatni ma'lumotlar bazasida saqlash uchun `CartController`, modellar va migratsiyalar yaratildi. API to'liq ishga tushirildi.
    - [x] `GET /api/cart` - Foydalanuvchi savatini olish.
    - [x] `POST /api/cart/items` - Savatga mahsulot qo'shish.
    - [x] `PUT /api/cart/items/{product}` - Mahsulot sonini o'zgartirish.
    - [x] `DELETE /api/cart/items/{product}` - Mahsulotni o'chirish.
- [x] **Admin Panel uchun API'larni Yakunlash:**
    - [x] `admin.js` da ishlatilgan `/admin/reviews` va `/admin/reviews/{id}` (o'chirish) uchun API yo'llarini `api.php` ga qo'shish. (Bajarilgan)
    - [x] Mahsulot stok holatini o'zgartirish uchun alohida API yaratish (`/products/{id}/toggle-stock`). (Bajarilgan)
- [x] **Excel'dan Import:** `admin.js` da boshlangan Excel'dan mahsulotlarni import qilish funksiyasi uchun backend API yaratildi va integratsiya qilindi.
- [ ] **Testlar Yozish:** API'ning barqaror ishlashini ta'minlash uchun `Unit` va `Feature` testlarini yozish. (Boshlandi)

### 🟡 Frontend (Mijozlar uchun sayt) - Keyingi Qadamlar
- [x] **Savat Integratsiyasi:** `script.js` dagi savat bilan bog'liq barcha funksiyalar (`addToCart`, `updateCartItemQuantity` va hokazo) `sessionStorage` o'rniga to'liq API bilan ishlashga o'tkazildi.
- [x] **Xatoliklarni Yaxshiroq Boshqarish:** Serverdan 404, 500 kabi xatoliklar kelganda foydalanuvchiga tushunarli xabarlar ko'rsatish uchun `Toast` bildirishnomalari qo'shildi.
- [x] **Kategoriyalar Bo'yicha Filtrlash:** Kategoriya kartalarini bosganda mahsulotlarni filtrlash funksiyasi to'liq qo'shildi.
- [x] **"Sevimlilar" (Favorites/Wishlist) Bo'limi:** Foydalanuvchilar uchun sevimlilar ro'yxatini yaratish, ko'rish, qo'shish va o'chirish funksiyasi to'liq qo'shildi.
- [x] **Buyurtmalar Tarixi:** Foydalanuvchi o'z profilida avvalgi buyurtmalarini va ularning statusini ko'ra oladigan "Buyurtmalar tarixi" modal oynasi qo'shildi.

### 🟡 Ma'muriyat Paneli (Admin Panel) - Keyingi Qadamlar
- [ ] **Dashboard'ni Kengaytirish:**
- [x] **Dashboard'ni Kengaytirish:**
    - [x] Sotuvlar bo'yicha grafiklar (kunlik, haftalik, oylik) qo'shish. (Kunlik sotuvlar grafigi qo'shildi)
    - [x] Eng ko'p sotilayotgan mahsulotlar ro'yxatini chiqarish. (Bajarildi)
    - [x] Eng aktiv mijozlar ro'yxatini chiqarish. (Bajarildi)
- [x] **Xatoliklarni Yaxshiroq Boshqarish:** `admin.js` dagi `alert`lar `Toast` bildirishnomalariga almashtirildi.
- [x] **Sharhlarni Boshqarish:** `admin.js` da sharhlarni o'chirish funksiyasi to'liq integratsiya qilindi.
- [x] **Excel'dan Import Integratsiyasi:** Backend API yaratildi va `admin.js` bilan to'liq integratsiya qilindi.

### 🟡 Umumiy va Yakuniy Ishlar
- [x] **Kodni Tozalash (Refactoring):** `script.js` fayli to'liq modullarga (`auth.js`, `cart.js`, `product.js`, `ui.js`, `main.js`) ajratildi.
- [ ] **Xavfsizlikni Kuchaytirish:** Barcha kiritilayotgan ma'lumotlarni frontend va backendda tekshirish (validation).
- [ ] **SEO (Search Engine Optimization):** Qidiruv tizimlari uchun `meta` teglar, `sitemap.xml`, `robots.txt` kabi elementlarni optimallashtirish.
- [ ] **Deployment (Saytni Internetga Joylash):** Loyihani serverga joylashtirish va domen nomiga ulash bo'yicha ishlarni amalga oshirish.

---

Ushbu xarita loyihani tizimli ravishda rivojlantirish uchun asos bo'lib xizmat qiladi. Vazifalarni ustuvorlik darajasiga qarab belgilab, bosqichma-bosqich bajarish tavsiya etiladi.