# MyMoneyApp — คู่มือโปรเจกต์

> อ่านเอกสารนี้ก่อนทุกครั้งก่อนแก้ไขหรือพัฒนาต่อ
> อัปเดตล่าสุด: พฤษภาคม 2569

---

## 1. ภาพรวมโปรเจกต์

**ชื่อ:** MyMoneyApp (Pocket Money Tracker)
**Platform:** iOS และ Android ผ่าน Expo Go (React Native)
**ภาษา:** TypeScript
**สถานะ:** MVP ด้าน UI สมบูรณ์แล้ว รอเชื่อมต่อ Supabase backend จริง

### เป้าหมาย
แอปบันทึกรายรับ-รายจ่ายส่วนตัว รองรับ:
- เข้าสู่ระบบด้วย Google (OAuth via Supabase)
- บันทึก / ลบ รายการธุรกรรม
- ดูสรุปรายเดือนและประวัติทั้งหมด
- ทำงานออฟไลน์ได้ (Queue ไว้ sync เมื่อกลับมา online)
- โหมด Demo สำหรับทดลองใช้โดยไม่ต้องล็อกอิน

---

## 2. Tech Stack

| ไลบรารี | เวอร์ชัน | ใช้ทำอะไร |
|---|---|---|
| **Expo SDK** | ~54 | Runtime หลักของแอป จัดการ native APIs |
| **React Native** | 0.81.5 | Framework สร้าง UI บนมือถือ |
| **expo-router** | ~6 | File-based navigation (เหมือน Next.js แต่บนมือถือ) |
| **TypeScript** | ~5.9 | Type safety ทั้งโปรเจกต์ |
| **Supabase JS** | ^2.105 | Auth + PostgreSQL database |
| **@tanstack/react-query** | ^5 | จัดการ server state, caching, refetch อัตโนมัติ |
| **Zustand** | ^5 | Client state (auth, ภาษา, UI filters) |
| **expo-linear-gradient** | ~15 | Gradient background สำหรับ Header และ Button |
| **expo-blur** | ~15 | Native blur สำหรับ glassmorphism (GlassCard, tab bar) |
| **expo-font** | ~14 | โหลด custom font ก่อน render |
| **@expo-google-fonts/kanit** | latest | Font Kanit — ภาษาไทยไม่มีหัว (น้ำหนัก 300–800) |
| **@expo/vector-icons (Ionicons)** | ^15 | ไอคอน |
| **expo-haptics** | ~15 | Haptic feedback เมื่อกดปุ่ม |
| **expo-auth-session** | ~7 | จัดการ OAuth flow (Google login) |
| **expo-web-browser** | ~15 | เปิด browser สำหรับ OAuth |
| **AsyncStorage** | 2.2.0 | เก็บ offline cache และ language preference |
| **@react-native-community/netinfo** | 11.4.1 | ตรวจสอบสถานะ network |
| **react-native-safe-area-context** | ~5.6 | จัดการ safe area (notch, home indicator) |
| **babel-preset-expo** | ~54 | Babel config หลัก |

---

## 3. โครงสร้างโฟลเดอร์

> **คำอธิบายสัญลักษณ์**
> - `[FE]` = Frontend เท่านั้น — UI, component, navigation, styling
> - `[BE]` = Backend / Integration — เชื่อมต่อ Supabase, จัดการ network, offline cache
> - `[FE+BE]` = มีทั้งสองส่วน — logic ฝั่ง client + เรียก API

```
MyMoneyApp/
│
│  ── FRONTEND (UI / Screens / Components) ──────────────────────────────────
│
├── app/                          [FE+BE]  หน้าจอทั้งหมด (expo-router routing)
│   ├── _layout.tsx               [FE+BE]  Root layout: auth guard, font load, language init
│   ├── (auth)/
│   │   ├── _layout.tsx           [FE]     Auth group layout (Stack wrapper เฉยๆ)
│   │   └── login.tsx             [FE+BE]  Login UI + Google OAuth flow + Demo mode
│   └── (tabs)/
│       ├── _layout.tsx           [FE]     Custom tab bar (glass card + FAB)
│       ├── index.tsx             [FE+BE]  Dashboard: balance, categories, recent + avatar dropdown
│       ├── add.tsx               [FE+BE]  Form เพิ่มรายการ + บันทึกลง Supabase / offline cache
│       ├── history.tsx           [FE+BE]  ประวัติ + filter + ดึงข้อมูลจาก Supabase
│       └── settings.tsx          [FE]     ตั้งค่าภาษา, sign out, about (UI เท่านั้น)
│
├── components/                   [FE]     UI Components ที่ใช้ซ้ำทั่วแอป
│   ├── ui/                       [FE]     Design System primitives
│   │   ├── AppText.tsx           [FE]     Text component (Kanit font + design tokens)
│   │   ├── Button.tsx            [FE]     Animated button (press feedback + haptic)
│   │   ├── GlassCard.tsx         [FE]     Frosted glass card (BlurView / fallback)
│   │   └── index.ts              [FE]     Barrel export
│   ├── CategoryPicker.tsx        [FE]     Horizontal scroll เลือกหมวดหมู่
│   ├── DatePickerModal.tsx       [FE]     Calendar modal เลือกวัน/เดือน (i18n-aware)
│   ├── ErrorBoundary.tsx         [FE]     React error boundary
│   ├── OfflineBanner.tsx         [FE+BE]  Banner เมื่อ offline (ใช้ useNetworkStatus)
│   └── TransactionCard.tsx       [FE]     การ์ดแสดงรายการธุรกรรม
│
├── constants/                    [FE]     ค่าคงที่ / ข้อมูล static
│   ├── categories.ts             [FE]     รายการหมวดหมู่ (label ไทย + อังกฤษ, icon, color)
│   ├── demoTransactions.ts       [FE]     Mock data สำหรับ Demo mode
│   ├── i18n.ts                   [FE]     ข้อความ UI ทั้งหมด (en + th)
│   └── theme.ts                  [FE]     Design tokens (สี, font, spacing, shadow, radius)
│
│  ── BACKEND / INTEGRATION ────────────────────────────────────────────────
│
├── services/                     [BE]     เชื่อมต่อ external services
│   ├── supabase.ts               [BE]     Supabase client instance (Auth + Database)
│   └── sync.ts                   [BE]     Sync offline queue → Supabase เมื่อ online
│
├── utils/                        [BE]     Helper ฝั่ง data / storage
│   └── offlineCache.ts           [BE]     AsyncStorage CRUD สำหรับ pending transactions
│
│  ── STATE MANAGEMENT ──────────────────────────────────────────────────────
│
├── stores/                       [FE+BE]  Global state (Zustand)
│   ├── authStore.ts              [FE+BE]  Auth state: session, user, isDemo, signOut
│   ├── languageStore.ts          [FE]     Language state + AsyncStorage persistence
│   └── transactionStore.ts       [FE]     UI filter state: selectedMonth, selectedCategory
│
│  ── SHARED / CROSS-CUTTING ────────────────────────────────────────────────
│
├── hooks/                        [FE+BE]  Custom React Hooks
│   ├── useNetworkStatus.ts       [BE]     ตรวจสอบ online/offline ผ่าน NetInfo
│   ├── useTransactions.ts        [FE+BE]  React Query hooks: fetch, add, delete transactions
│   └── useTranslation.ts         [FE]     คืน { t, language, setLanguage, locale }
│
├── types/                        [FE+BE]  TypeScript type definitions
│   └── index.ts                  [FE+BE]  Transaction, Category, PendingTransaction, etc.
│
│  ── STATIC ASSETS / CONFIG ─────────────────────────────────────────────────
│
├── assets/                       [FE]     รูปภาพและไอคอน
│   ├── icon.png                  [FE]     App icon (1024×1024)
│   ├── adaptive-icon.png         [FE]     Android adaptive icon
│   ├── splash-icon.png           [FE]     Splash screen
│   └── favicon.png               [FE]     Web favicon
│
├── .env                          [BE]     ⚠️ Supabase URL + ANON KEY (อย่า commit)
├── app.json                      [FE+BE]  Expo config (ชื่อแอป, scheme, version)
├── babel.config.js               [FE]     Babel preset (expo เท่านั้น)
├── metro.config.js               [FE]     Metro bundler config
├── tsconfig.json                 [FE+BE]  TypeScript config
└── package.json                  [FE+BE]  Dependencies + scripts
```

### สรุปว่าจะแก้อะไรต้องไปที่ไหน

| ต้องการแก้ | ไปที่ |
|---|---|
| UI หน้าจอ / layout | `app/(tabs)/*.tsx` หรือ `app/(auth)/*.tsx` |
| Component ที่ใช้ซ้ำ (card, text, button) | `components/ui/` |
| สี / font / spacing / shadow ทั้งแอป | `constants/theme.ts` |
| ข้อความ UI / คำแปล | `constants/i18n.ts` |
| หมวดหมู่รายการ | `constants/categories.ts` |
| เชื่อมต่อ Supabase / auth | `services/supabase.ts` |
| sync offline → online | `services/sync.ts` |
| เก็บรายการรอ sync | `utils/offlineCache.ts` |
| Auth state (login/logout) | `stores/authStore.ts` |
| ภาษาแอป | `stores/languageStore.ts` + `constants/i18n.ts` |
| ดึง/เพิ่ม/ลบ transaction | `hooks/useTransactions.ts` |
| Navigation / tab bar | `app/(tabs)/_layout.tsx` |
| TypeScript types | `types/index.ts` |

---

## 4. รายละเอียดแต่ละไฟล์

---

### 4.1 `app/_layout.tsx` — Root Layout (จุดเริ่มต้นของแอป)

**บทบาท:** ไฟล์แรกที่รันเมื่อเปิดแอป ทำหน้าที่ setup ทุกอย่าง

**สิ่งที่ทำ:**
1. โหลด Font Kanit ทุก weight ผ่าน `useFonts` ก่อน render
2. `AuthGuard` component:
   - เรียก `supabase.auth.getSession()` ตอนเปิดแอป (timeout 3 วินาที)
   - Subscribe `onAuthStateChange` รับ session updates realtime
   - Redirect อัตโนมัติ: ไม่มี session → `/(auth)/login`, มี session → `/(tabs)`
   - เมื่อ online + มี session → เรียก `syncPendingTransactions()` อัตโนมัติ
3. `SplashLoading` component: แสดง loading screen ระหว่างตรวจสอบ session
4. เรียก `useLanguageStore().initialize()` เพื่อโหลดภาษาที่บันทึกไว้จาก AsyncStorage

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม global provider ใหม่
- เปลี่ยน font weights ที่ต้องการโหลด
- แก้ไข auth redirect logic

---

### 4.2 `app/(auth)/_layout.tsx` — Auth Group Layout

**บทบาท:** Layout wrapper สำหรับหน้าที่ไม่ต้อง login
ไม่มี logic พิเศษ แค่ render `<Stack />` ของ expo-router

---

### 4.3 `app/(auth)/login.tsx` — หน้า Login

**บทบาท:** หน้าแรกที่เห็นเมื่อยังไม่ได้เข้าสู่ระบบ

**ฟีเจอร์:**
- ปุ่ม **"Login with Google"** — ใช้ `expo-auth-session` + `expo-web-browser` + `supabase.auth.signInWithOAuth`
- ปุ่ม **"Try Demo"** — เรียก `enterDemo()` จาก authStore แล้ว navigate ไป `/(tabs)`

**flow Google Login:**
```
กด Login
→ makeRedirectUri(scheme: 'mymoneyapp')
→ supabase.signInWithOAuth
→ WebBrowser.openAuthSessionAsync
→ รับ URL callback
→ parse access_token + refresh_token จาก URL hash
→ supabase.auth.setSession()
→ onAuthStateChange trigger
→ redirect อัตโนมัติไป /(tabs)
```

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน UI หน้า login
- เพิ่ม login method อื่น (เช่น email/password)
- แก้ไข feature badge หรือ copy text

---

### 4.4 `app/(tabs)/_layout.tsx` — Custom Tab Bar Layout

**บทบาท:** กำหนดหน้าตาและ config ของ Bottom Navigation

**รูปแบบ Tab Bar:**
```
┌─────────────────────────────────────┐
│                 [+]                 │  ← FAB โผล่ขึ้นมา 18px เหนือการ์ด
│  ┌──────────────────────────────┐   │
│  │  Overview  │      │  History │   │  ← การ์ดกระจกใบเดียว
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

- FAB (ปุ่ม Add วงกลม gradient) ลอยอยู่กึ่งกลาง โผล่ขึ้นมาเหนือการ์ด 18px
- การ์ดกระจกใบเดียวครอบทั้ง 3 เมนู (Overview | [Add slot] | History)
- ค่า `paddingTop: PROTRUDE` ใน wrapper เปิดพื้นที่ให้ FAB โผล่
- FAB ถูก absolute-position ไว้ที่ `top: 0` ใน wrapper = ลอยเหนือการ์ดพอดี

**Tabs ที่ลงทะเบียน:**
| ชื่อ | ไฟล์ | ตำแหน่ง |
|---|---|---|
| Overview | `index.tsx` | ซ้ายในการ์ด |
| Add | `add.tsx` | กลาง (FAB ลอย) |
| History | `history.tsx` | ขวาในการ์ด |
| Settings | `settings.tsx` | ซ่อน (`href: null`) — เข้าผ่าน avatar dropdown บน Home |

**Glass background ตาม platform:**
- iOS → `BlurView` intensity 80
- Web → `backdropFilter: blur(22px)` + semi-opaque
- Android → opaque fallback `rgba(250,246,239,0.96)`

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยนขนาด FAB หรือ tab bar height (`FAB_SIZE`, `TAB_H`, `PROTRUDE`)
- เพิ่ม/ลด tab ใน navigation
- เปลี่ยนไอคอนหรือสีของแต่ละ tab
- แก้ไข glass effect ของ tab bar

---

### 4.5 `app/(tabs)/index.tsx` — หน้าหลัก (Dashboard)

**บทบาท:** หน้า overview แสดงสรุปรายเดือนและรายการล่าสุด

**ฟีเจอร์:**
- Top bar: แสดงเดือน, ชื่อผู้ใช้, ปุ่ม Avatar
- **ปุ่ม Avatar (มุมขวาบน)** → เปิด dropdown modal แบบ glass มี 2 ตัวเลือก:
  - **Settings** → navigate ไป `/(tabs)/settings`
  - **Sign Out** → แสดง confirmation alert แล้ว sign out
- Balance card (LinearGradient): แสดง รายรับ / รายจ่าย / ยอดสุทธิ
- หมวดหมู่รายจ่ายสูงสุด 5 อันดับ (horizontal scroll)
- รายการล่าสุด 5 รายการ (TransactionCard)
- ปุ่ม Quick Add (shortcut ไปหน้า add)

**ข้อมูล:** ใช้ `useTransactions(selectedMonth)` hook

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน layout หรือ content ของ Dashboard
- แก้ dropdown menu ที่เปิดจาก avatar (เพิ่ม/ลด menu item)
- เปลี่ยน Balance card design
- แก้ logic sign out

---

### 4.6 `app/(tabs)/add.tsx` — หน้าเพิ่มรายการ

**บทบาท:** Form บันทึกรายการใหม่

**ฟีเจอร์:**
- Header gradient เปลี่ยนตาม type (รายจ่าย = pastel coral, รายรับ = pastel sage)
- แสดงจำนวนเงินขนาดใหญ่ (44px) — hidden TextInput รับ input จาก keyboard
- Toggle รายจ่าย / รายรับ ใน header
- `CategoryPicker` เลือกหมวดหมู่แบบ horizontal scroll
- TextInput ใส่หมายเหตุ (GlassCard)
- `DatePickerModal` (mode="date") เลือกวันที่
- บันทึกผ่าน `useAddTransaction()` hook

**โหมด Demo:** throw error `DEMO_NO_SAVE` → แสดง Alert แทนการบันทึกจริง

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม field ใหม่ในฟอร์ม (เช่น tags, ภาพถ่าย)
- เปลี่ยน validation logic
- แก้ UI ของ header หรือ amount display

---

### 4.7 `app/(tabs)/history.tsx` — หน้าประวัติรายการ

**บทบาท:** แสดงรายการทั้งหมดพร้อม filter

**ฟีเจอร์:**
- เลือกเดือน → เปิด `DatePickerModal` (mode="month")
- Filter ประเภท: ทั้งหมด / รายจ่าย / รายรับ (TypeChip)
- Filter หมวดหมู่ → bottom sheet dropdown
- Summary chips แสดงยอดรวมที่ filter แล้ว (GlassCard)
- FlatList แสดงรายการ filter แล้ว
- Pull to refresh

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม filter ใหม่ (เช่น filter ตามช่วงจำนวนเงิน)
- เปลี่ยน UI ของ filter bar หรือ summary chips
- เพิ่ม feature เช่น swipe to delete

---

### 4.8 `app/(tabs)/settings.tsx` — หน้าตั้งค่า

**บทบาท:** จัดการการตั้งค่าแอป
**การเข้าถึง:** ไม่แสดงใน tab bar → เปิดจาก avatar dropdown บนหน้า Home เท่านั้น

**Sections:**
- **Language:** Toggle ภาษาอังกฤษ 🇺🇸 / ภาษาไทย 🇹🇭 (บันทึกลง AsyncStorage ผ่าน languageStore)
- **Account:** แสดงสถานะ user/demo + ปุ่ม Sign Out
- **About:** แสดงเวอร์ชันแอป

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม setting ใหม่ (เช่น notification, theme, currency)
- แก้ไข account section
- เพิ่มภาษาใหม่

---

## 5. Components

---

### `components/ui/AppText.tsx` — Text Component หลัก

**บทบาท:** แทนที่ `<Text>` ทั่วไป บังคับใช้ Font Kanit และ design system

**Props:**
| Prop | ค่าที่รับได้ |
|---|---|
| `variant` | `display` / `title` / `h1` / `h2` / `h3` / `bodyMd` / `body` / `caption` / `micro` |
| `weight` | `light` / `regular` / `medium` / `semibold` / `bold` / `extrabold` |
| `tone` | `primary` / `secondary` / `tertiary` / `inverse` / `brand` / `success` / `danger` |
| `align` | `left` / `center` / `right` |

**ตัวอย่าง:**
```tsx
<AppText variant="h2" weight="bold" tone="brand">ยอดคงเหลือ</AppText>
<AppText variant="caption" tone="tertiary">หมายเหตุ</AppText>
```

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม variant ใหม่
- เปลี่ยน mapping ระหว่าง variant กับ font size
- เพิ่ม tone ใหม่

---

### `components/ui/GlassCard.tsx` — การ์ดกระจก

**บทบาท:** surface แบบ frosted glass สำหรับ card ต่างๆ ทั่วแอป

**วิธีทำงานตาม platform:**
- iOS → `BlurView` (native blur)
- Web → CSS `backdropFilter: blur()`
- Android → translucent background (fallback)

**Props:**
| Prop | ค่าที่รับได้ |
|---|---|
| `tone` | `light` (การ์ดทั่วไป) / `tint` (สีอ่อนกว่า) / `dark` (gradient header) |
| `intensity` | `subtle` / `regular` / `strong` / `ultra` |
| `radius` | key จาก `radii` (`sm`, `md`, `lg`, `xl`, `2xl`, ...) |
| `shadow` | key จาก `shadows` (`xs`, `sm`, `md`, `lg`) |
| `withBorder` | `true` (default) เพิ่ม hairline border |

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน opacity ของ glass effect
- แก้ blur intensity
- เพิ่ม tone ใหม่

---

### `components/ui/Button.tsx` — ปุ่มกด

**บทบาท:** ปุ่ม reusable ที่มี press animation และ haptic feedback
ใช้ React Native built-in `Animated` API สำหรับ scale animation เมื่อกด

**Props:**
| Prop | ค่าที่รับได้ |
|---|---|
| `variant` | `primary` (gradient) / `secondary` / `ghost` / `danger` (gradient แดง) |
| `size` | `sm` / `md` / `lg` |
| `loading` | boolean → แสดง ActivityIndicator |
| `iconLeft` / `iconRight` | Ionicons icon name |
| `haptic` | boolean (default true) |
| `fullWidth` | boolean |

---

### `components/CategoryPicker.tsx` — เลือกหมวดหมู่

**บทบาท:** Horizontal scroll list สำหรับเลือก category
**Props:** `categories`, `selected` (id), `onSelect`

**รายละเอียด:**
- อ่าน `locale` จาก `useTranslation()` เพื่อแสดง `cat.label` (ไทย) หรือ `cat.labelEn` (อังกฤษ)
- Haptic feedback เมื่อเลือก

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน style ของ chip
- เพิ่มการแสดงผลพิเศษสำหรับ category ที่เลือก

---

### `components/DatePickerModal.tsx` — Calendar Modal

**บทบาท:** Modal เลือกวันที่หรือเดือน ใช้ร่วมกันทั้งหน้า Add และหน้า History

**Props:**
| Prop | Type | ความหมาย |
|---|---|---|
| `mode` | `'date'` \| `'month'` | เลือกวันเต็มหรือแค่เดือน |
| `value` | `string \| null` | YYYY-MM-DD (date) หรือ YYYY-MM (month) |
| `onSelect` | `(v: string) => void` | callback เมื่อเลือก |
| `onClose` | `() => void` | callback เมื่อปิด |
| `accentColor` | `string?` | สีไฮไลท์ |
| `title` | `string?` | หัวข้อ modal |

**flow mode="date":** เลือกเดือน → เลือกปี → grid วันในปฏิทิน → ยืนยัน
**flow mode="month":** grid 12 เดือน → ยืนยัน

**ชื่อเดือน/วัน:** ดึงจาก `useTranslation()` → รองรับทั้งภาษาไทยและอังกฤษ

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน style ของ calendar
- แก้ logic การเลือกวันที่
- เพิ่ม mode ใหม่

---

### `components/TransactionCard.tsx` — การ์ดรายการ

**บทบาท:** แสดงรายการธุรกรรม 1 รายการ

**รายละเอียด:**
- Left accent bar: สีแดง (รายจ่าย) หรือสีเขียว (รายรับ)
- แสดงหมวดหมู่ icon + ชื่อ (ไทย/อังกฤษ ตาม locale) + หมายเหตุ
- แสดงจำนวนเงิน + วันที่ (format ตาม locale)

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน layout ของการ์ด
- เพิ่ม swipe-to-delete
- เพิ่ม field ใหม่ที่แสดง

---

### `components/OfflineBanner.tsx` — Banner ออฟไลน์

**บทบาท:** แสดง banner เตือนเมื่อไม่มี internet
ใช้ `useNetworkStatus()` → render `null` เมื่อ online

---

### `components/ErrorBoundary.tsx` — Error Boundary

**บทบาท:** ดัก unhandled React error ไม่ให้แอป crash
แสดง error UI พร้อมปุ่ม retry

---

## 6. Constants

---

### `constants/theme.ts` — Design Tokens ⭐

**บทบาท:** Single source of truth สำหรับ token ทุกอย่าง
**ห้ามใส่สี / ขนาด / shadow / radius เป็น hardcode ใน component** ให้ import จาก theme เสมอ

**สี (Earth-tone palette, base = `#F3EAD8`):**

| Token | ความหมาย |
|---|---|
| `colors.brand[50..900]` | สีหลักแบบ warm tan (brand.500 ≈ ดินสีน้ำตาลอ่อน) |
| `colors.surface.base` | พื้นหลังหน้าจอ (`#FAF6EF`) |
| `colors.surface.raised` | พื้นหลัง card ที่นูนขึ้นมา |
| `colors.surface.glass` | พื้นหลัง glass card (opacity ต่ำ) |
| `colors.surface.overlay` | overlay สำหรับ modal backdrop |
| `colors.surface.white` | สีขาวบริสุทธิ์ |
| `colors.text.primary` | สีข้อความหลัก |
| `colors.text.secondary` | สีข้อความรอง |
| `colors.text.tertiary` | สีข้อความอ่อน (hint, label) |
| `colors.text.inverse` | ข้อความบนพื้นเข้ม |
| `colors.border.subtle` | เส้นขอบอ่อนมาก |
| `colors.border.glass` | เส้นขอบของ glass card |
| `colors.semantic.danger` | สีแดง (รายจ่าย) |
| `colors.semantic.success` | สีเขียว (รายรับ) |
| `colors.semantic.warning` | สีเหลือง |
| `colors.semantic.dangerSoft` | พื้นหลังสีแดงอ่อน |
| `colors.gradient.brand` | gradient หลักของแอป |
| `colors.gradient.header` | gradient สำหรับ balance card |
| `colors.gradient.expense` | gradient header หน้า Add (รายจ่าย) |
| `colors.gradient.income` | gradient header หน้า Add (รายรับ) |

**Typography (Kanit font):**

| Token | ค่า |
|---|---|
| `typography.family.light` | Kanit_300Light |
| `typography.family.regular` | Kanit_400Regular |
| `typography.family.medium` | Kanit_500Medium |
| `typography.family.semibold` | Kanit_600SemiBold |
| `typography.family.bold` | Kanit_700Bold |
| `typography.family.extrabold` | Kanit_800ExtraBold |
| `typography.size.xs` | 11 |
| `typography.size.sm` | 12 |
| `typography.size.base` | 14 |
| `typography.size.md` | 15 |
| `typography.size.lg` | 17 |
| `typography.size.xl` | 20 |
| `typography.size.2xl` | 24 |
| `typography.size.3xl` | 28 |
| `typography.size.4xl` | 34 |
| `typography.size.5xl` | 42 |

**Spacing (4px scale):**
`spacing['1'] = 4`, `spacing['2'] = 8`, `spacing['3'] = 12`, `spacing['4'] = 16`, `spacing['5'] = 20`, `spacing['6'] = 24` ...

**Radii:**
`radii.sm = 8`, `radii.md = 10`, `radii.lg = 14`, `radii.xl = 18`, `radii['2xl'] = 24`, `radii['3xl'] = 32`, `radii.pill = 999`

**Shadows:** `shadows.xs`, `shadows.sm`, `shadows.md`, `shadows.lg`, `shadows.brand`

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยนสี theme ทั้งแอป
- เพิ่ม gradient ใหม่
- แก้ไข spacing หรือ radius ที่ใช้ทั่วแอป

---

### `constants/categories.ts` — หมวดหมู่

**Exports:**
- `CATEGORIES: Category[]` — รายการหมวดหมู่ทั้งหมด 9 หมวด
- `EXPENSE_CATEGORIES` — filter เฉพาะหมวดรายจ่าย
- `INCOME_CATEGORIES` — filter เฉพาะหมวดรายรับ
- `getCategoryById(id)` — helper คืน category จาก id (fallback = other)

**หมวดหมู่ที่มี:**
| id | label (ไทย) | labelEn (อังกฤษ) | ประเภท |
|---|---|---|---|
| food | อาหาร | Food | รายจ่าย |
| transport | เดินทาง | Transport | รายจ่าย |
| shopping | ช้อปปิ้ง | Shopping | รายจ่าย |
| entertainment | บันเทิง | Entertainment | รายจ่าย |
| health | สุขภาพ | Health | รายจ่าย |
| education | การศึกษา | Education | รายจ่าย |
| bills | ค่าบิล | Bills | รายจ่าย |
| income | รายรับ | Income | รายรับ |
| other | อื่นๆ | Other | รายจ่าย |

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม/ลบ/เปลี่ยนชื่อหมวดหมู่
- เปลี่ยนไอคอนหรือสีของหมวดหมู่

---

### `constants/i18n.ts` — ข้อความ UI ทุกภาษา

**บทบาท:** เก็บ string ทุก string ที่แสดงใน UI ไว้ที่เดียว
**ห้ามใส่ข้อความ hardcode ใน component** ให้ใช้ `useTranslation()` เสมอ

**โครงสร้าง:**
```ts
export const en = {
  nav: { overview, history, add, settings },
  home: { greeting, balance, expenses, income, ... },
  add: { title, expense, income, category, note, date, save, ... },
  history: { title, expenses, income, items, ... },
  settings: { title, language, english, thai, signOut, ... },
  datePicker: { monthsShort, monthsFull, days, yearFmt },
  offline: '...',
  common: { error, cancel, confirm },
  ...
}
export const th = { ... } // โครงสร้างเดียวกัน
```

**แก้ไขที่นี่เมื่อ:**
- แก้คำแปลหรือข้อความ UI
- เพิ่ม key ใหม่สำหรับ feature ใหม่
- เพิ่มภาษาใหม่ (เพิ่ม object ใหม่และ update `Language` type)

---

### `constants/demoTransactions.ts` — ข้อมูล Demo

**บทบาท:** Mock data สำหรับโหมด Demo
**Exports:**
- `DEMO_USER_ID` — UUID สมมติสำหรับ demo user
- `getDemoTransactionsForMonth(month)` — คืน 5 รายการสำหรับเดือนที่ระบุ
- `getAllDemoTransactions()` — คืนรายการทั้งหมดย้อนหลัง 3 เดือน

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม/แก้ข้อมูลตัวอย่างใน Demo mode

---

## 7. Hooks

---

### `hooks/useTranslation.ts` — Translation Hook

**บทบาท:** Hook หลักสำหรับเข้าถึงข้อความ UI ในภาษาปัจจุบัน

```ts
const { t, language, setLanguage, locale } = useTranslation();
// t          → object ข้อความภาษาปัจจุบัน (จาก i18n.ts)
// language   → 'en' หรือ 'th'
// setLanguage → ฟังก์ชันเปลี่ยนภาษา (บันทึกลง AsyncStorage)
// locale     → 'en-US' หรือ 'th-TH' (ใช้กับ toLocaleString)
```

**ใช้ในทุก component ที่มีข้อความแสดงใน UI**

---

### `hooks/useTransactions.ts` — Data Fetching Hooks

**บทบาท:** Data layer ครอบ React Query สำหรับจัดการ transactions

| Hook | ความหมาย |
|---|---|
| `useTransactions(month)` | ดึงรายการของเดือนที่ระบุ |
| `useAddTransaction()` | Mutation เพิ่มรายการใหม่ |
| `useDeleteTransaction()` | Mutation ลบรายการ |

**Logic:**
- `isDemo = true` → ดึง mock data จาก `demoTransactions.ts`
- `isOnline = false` → อ่าน/เขียน `offlineCache` แทน Supabase
- `queryKey` รวม userId เพื่อแยก cache ระหว่าง user จริงกับ demo

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม query ใหม่ (เช่น ดึงรายการทั้งหมด ไม่แบ่งเดือน)
- แก้ offline logic
- เพิ่ม mutation ใหม่ (เช่น edit transaction)

---

### `hooks/useNetworkStatus.ts` — Network Status Hook

**บทบาท:** Subscribe NetInfo events คืน `{ isOnline: boolean }`

**ใช้ใน:** `OfflineBanner`, `AuthGuard`, `useAddTransaction`, `useDeleteTransaction`

---

## 8. Services

---

### `services/supabase.ts` — Supabase Client

**บทบาท:** สร้าง Supabase client instance ที่ใช้ทั้งแอป

**Config สำคัญ:**
- `storage: AsyncStorage` → persist session บน device
- `autoRefreshToken: true` → refresh JWT อัตโนมัติ
- `persistSession: true` → จำ session ข้าม app restart
- `detectSessionInUrl: false` → React Native ไม่ใช้ URL

**Environment variables ที่ต้องตั้ง (ใน `.env`):**
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**แก้ไขที่นี่เมื่อ:**
- เปลี่ยน Supabase project
- แก้ config ของ client (เช่น timeout)

---

### `services/sync.ts` — Offline Sync Service

**บทบาท:** Sync รายการที่ค้างใน offline queue ขึ้น Supabase เมื่อกลับมา online

**Trigger:** เรียกจาก `AuthGuard` เมื่อ `isOnline` เปลี่ยนจาก false → true

**Flow:**
```
isOnline กลับมา true
→ syncPendingTransactions(userId)
→ getPendingTransactions() จาก AsyncStorage
→ loop: insert หรือ delete แต่ละรายการ
→ สำเร็จ: removePendingTransaction()
→ ล้มเหลว: รายการยังอยู่ใน queue รอ retry ครั้งหน้า
```

---

## 9. Stores (Zustand)

---

### `stores/authStore.ts` — Auth State

**State:**
| Field | Type | ความหมาย |
|---|---|---|
| `session` | `Session \| null` | Supabase session object |
| `user` | `User \| null` | ข้อมูล user (id, email) |
| `isDemo` | `boolean` | กำลังอยู่ใน Demo mode |
| `isLoading` | `boolean` | กำลังตรวจสอบ session อยู่ |

**Actions:**
| Action | ความหมาย |
|---|---|
| `setSession(s)` | อัปเดต session + user + isLoading=false |
| `setLoading(b)` | toggle loading state |
| `enterDemo()` | เปิด Demo mode (isDemo=true, session=null) |
| `signOut()` | ล้าง session, user, isDemo ทั้งหมด |

---

### `stores/languageStore.ts` — Language State

**State:**
| Field | ความหมาย |
|---|---|
| `language` | `'en'` หรือ `'th'` (default: `'en'`) |
| `initialized` | โหลดจาก AsyncStorage แล้วหรือยัง |

**Actions:**
| Action | ความหมาย |
|---|---|
| `setLanguage(code)` | เปลี่ยนภาษา + บันทึกลง AsyncStorage |
| `initialize()` | โหลดภาษาที่บันทึกไว้จาก AsyncStorage (เรียกตอน app start) |

---

### `stores/transactionStore.ts` — UI Filter State

**State:**
| Field | ความหมาย |
|---|---|
| `selectedMonth` | YYYY-MM เดือนที่กำลัง filter อยู่ |
| `selectedCategory` | category id หรือ null |

ใช้ใน `index.tsx` (เลือกเดือน) และ `history.tsx` (filter เดือน + หมวด)

---

## 10. Types (`types/index.ts`)

```typescript
type TransactionType = 'expense' | 'income'

interface Transaction {
  id: string           // UUID
  user_id: string      // Supabase user id
  amount: number       // จำนวนเงิน
  category: string     // category id เช่น 'food', 'transport'
  note: string         // หมายเหตุ
  date: string         // YYYY-MM-DD
  type: TransactionType
  created_at: string   // ISO datetime
  updated_at: string   // ISO datetime
}

// Transaction ใหม่ (ไม่มี id, user_id, timestamp)
type NewTransaction = Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>

interface Category {
  id: string
  label: string        // ชื่อภาษาไทย
  labelEn: string      // ชื่อภาษาอังกฤษ ← เพิ่มสำหรับ i18n
  emoji: string
  icon: string         // Ionicons icon name
  color: string        // hex color
}

interface PendingTransaction {
  id: string
  data: NewTransaction
  action: 'insert' | 'delete'
  timestamp: number    // Date.now()
}
```

**แก้ไขที่นี่เมื่อ:**
- เพิ่ม field ใน Transaction (ต้องอัปเดต Supabase schema ด้วย)
- เพิ่ม type ใหม่สำหรับ feature ใหม่

---

## 11. Utils

### `utils/offlineCache.ts` — Offline Queue

**บทบาท:** CRUD รายการที่รอ sync ใน AsyncStorage
**Key:** `@pending_transactions`

| Function | ความหมาย |
|---|---|
| `getPendingTransactions()` | อ่าน queue ทั้งหมด |
| `addPendingTransaction(data, action, id?)` | เพิ่มรายการเข้า queue |
| `removePendingTransaction(id)` | ลบออกหลัง sync สำเร็จ |
| `clearPendingTransactions()` | ล้าง queue ทั้งหมด |

---

## 12. Config Files

### `.env` — Environment Variables
```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
> ดูค่าจาก Supabase Dashboard → Project Settings → API

---

### `app.json` — Expo Config
```json
{
  "expo": {
    "name": "MyMoneyApp",
    "slug": "mymoneyapp",
    "scheme": "mymoneyapp",
    "version": "1.0.0"
  }
}
```
`scheme: "mymoneyapp"` สำคัญมาก — ใช้เป็น deep link สำหรับ Google OAuth callback

---

### `babel.config.js`
```js
module.exports = function(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
```

---

### `metro.config.js`
Expo default Metro config ไม่มีการแก้ไขพิเศษ

---

## 13. Data Flow

```
User Action
    │
    ▼
Screen (app/tabs/*.tsx)
    │
    ├── อ่านข้อมูล → useTransactions() [React Query]
    │       │
    │       ├── isDemo? → mock data จาก demoTransactions.ts
    │       └── isOnline? → supabase.from('transactions').select()
    │
    ├── เพิ่ม/ลบ → useAddTransaction() / useDeleteTransaction()
    │       │
    │       ├── isDemo? → throw Error('DEMO_NO_SAVE')
    │       ├── isOnline? → supabase.from('transactions').insert/delete()
    │       └── offline? → offlineCache.addPendingTransaction()
    │
    └── Auth → authStore (Zustand)
            │
            ├── session? → supabase.auth.getSession()
            ├── demo? → enterDemo()
            └── signOut? → supabase.auth.signOut() + signOut()
```

---

## 14. สิ่งที่ต้องทำ (To-Do)

### ⚠️ ต้องทำก่อนใช้งานจริง (Backend)
- [ ] สร้าง Supabase project และกรอก `.env`
- [ ] สร้าง table `transactions` ใน Supabase:
  ```sql
  CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    note TEXT DEFAULT '',
    date DATE NOT NULL,
    type TEXT CHECK (type IN ('expense','income')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can CRUD own transactions"
    ON transactions FOR ALL USING (auth.uid() = user_id);
  ```
- [ ] เปิด Google OAuth ใน Supabase → Authentication → Providers
- [ ] เพิ่ม Redirect URL `mymoneyapp://` ใน Supabase
- [ ] ทดสอบ Google Login จริง

### ✨ Features ในอนาคต
- [ ] แก้ไขรายการ (ตอนนี้มีแค่เพิ่ม + ลบ)
- [ ] Export ข้อมูลเป็น PDF / CSV
- [ ] กราฟแสดงสถิติ
- [ ] ตั้งงบประมาณรายหมวด
- [ ] Push notification เตือนรายจ่าย
- [ ] Dark mode
- [ ] รองรับหลายสกุลเงิน

---

## 15. วิธีรันโปรเจกต์

```bash
# 1. ติดตั้ง dependencies
npm install --legacy-peer-deps

# 2. ตั้งค่า environment variables
# สร้างไฟล์ .env และใส่ค่า Supabase:
# EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# 3. เริ่ม dev server
npx expo start --clear

# 4. สแกน QR code ด้วยแอป Expo Go
# กด 'a' สำหรับ Android emulator
# กด 'i' สำหรับ iOS simulator
```

> **ยังไม่มี Supabase project?** แอปทำงานได้เต็มรูปแบบใน **Demo mode** — กด "ทดลองใช้งาน" บนหน้า Login

---

## 16. Architecture Decisions (เหตุผลที่เลือกแบบนี้)

1. **ไม่ใช้ `react-native-reanimated`** — ลบออกเพื่อให้รันใน Expo Go SDK 54 ได้ ใช้ React Native `Animated` API แทน

2. **i18n ผ่าน Zustand + AsyncStorage** — ภาษาเก็บ global ใน `languageStore` บันทึกบน device ทุก component ใช้ `useTranslation()` ไม่ต้อง prop drilling

3. **Settings ซ่อนจาก tab bar (`href: null`)** — รักษา bottom nav ให้มี 3 เมนูสมมาตร เข้า Settings ผ่าน avatar dropdown บน Home

4. **Single glass card tab bar** — การ์ดใบเดียวครอบ 3 เมนู FAB ลอยโผล่ขึ้นมาจากกึ่งกลาง ทำให้ดูกลมกลืนกว่าแบบแยก pill

5. **Demo mode เป็น client-only** — ไม่มีการเรียก server เลย ข้อมูลทั้งหมดสร้างจาก local ทดสอบ UI ได้โดยไม่ต้อง backend

6. **Offline queue ใน AsyncStorage** — รอดจาก app restart รายการที่ยังไม่ sync จะยังอยู่ครบ

7. **React Query `staleTime: 60s`** — ป้องกัน API calls ซ้ำเมื่อ switch tab เร็วๆ

8. **GlassCard cross-platform** — iOS ใช้ `BlurView` (native), Web ใช้ CSS `backdropFilter`, Android ใช้ translucent color fallback

9. **Design tokens ทั้งหมดอยู่ใน `constants/theme.ts`** — ห้าม hardcode สี / font size / spacing / shadow / radius ใน component เด็ดขาด

10. **Category มี `label` (ไทย) และ `labelEn` (อังกฤษ)** — ทุก component อ่าน `locale` จาก `useTranslation()` แล้วเลือก field ที่ถูกต้อง

---

*MyMoneyApp — อัปเดตล่าสุด พฤษภาคม 2569*

local run for test ui don't remember that

1.create .env
2.paste this ----> EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
