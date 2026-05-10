# คู่มือเชื่อมต่อ Supabase สำหรับ MyMoneyApp

> ขั้นตอนการ setup Supabase ตั้งแต่ 0 จนแอปเชื่อมต่อจริงได้
> เวลารวม ~30 นาที (ไม่รวมรอ provisioning)

---

## ภาพรวม 5 ขั้นตอน

| ขั้นตอน | เนื้อหา | เวลา |
|---|---|---|
| 1️⃣ | สร้าง Supabase project | 5 นาที |
| 2️⃣ | สร้าง Database schema (table + RLS) | 2 นาที |
| 3️⃣ | กรอก `.env` ในโปรเจกต์ | 1 นาที |
| 4️⃣ | ตั้งค่า Google OAuth | 15 นาที |
| 5️⃣ | ทดสอบการใช้งานจริง | 5 นาที |

> **Tip:** ถ้ายังไม่อยาก setup Google OAuth ก็ข้าม Step 4 ไปได้ — แอปจะ login ด้วย Google ไม่ได้ แต่ใช้ **Demo mode** ทดสอบได้ทุก feature

---

## 🟢 Step 1 — สร้าง Supabase Project

### 1.1 สมัคร / Login Supabase

1. ไปที่ [supabase.com](https://supabase.com)
2. กด **Start your project** (มุมขวาบน)
3. Sign in ด้วย GitHub หรือ Google (แนะนำ GitHub เพราะ feature เยอะกว่า)

### 1.2 สร้าง Project ใหม่

1. หน้า Dashboard → กด **New project**
2. ถ้ายังไม่มี Organization → สร้างใหม่ก่อน (ตั้งชื่อตามใจ เช่น `personal`)
3. กรอกฟอร์ม:

   | ช่อง | ค่าที่ใส่ |
   |---|---|
   | **Project name** | `mymoneyapp` |
   | **Database Password** | ตั้ง password แข็งแรง (บันทึกไว้ที่ปลอดภัย — **ใช้ตอน connect DB ตรงๆ**) |
   | **Region** | `Southeast Asia (Singapore)` ← ใกล้ไทยสุด ความเร็วดีที่สุด |
   | **Pricing Plan** | `Free` (เพียงพอสำหรับการพัฒนา) |

4. กด **Create new project**
5. รอประมาณ 2 นาที ให้ Supabase provision database เสร็จ
   - หน้าจะแสดง progress: "Setting up project..."
   - เมื่อเสร็จจะเข้าหน้า Project home อัตโนมัติ

### ✅ เช็คว่าสำเร็จ

หน้า Dashboard ของ project แสดงข้อความ "**Project is ready**" และเห็นเมนูซ้ายมือ:
- 🏠 Home
- 📊 Table Editor
- 🔧 SQL Editor
- 🔐 Authentication
- 📦 Storage
- ⚙️ Project Settings

---

## 🟢 Step 2 — สร้าง Database Schema

### 2.1 เปิด SQL Editor

1. เมนูซ้ายมือ → กด **SQL Editor** (ไอคอน 🔧)
2. กด **+ New query** มุมขวาบน

### 2.2 รัน SQL Migration

1. **เปิดไฟล์** `supabase/migrations/0001_init.sql` ในโปรเจกต์ (ผมเตรียมไว้ให้แล้ว)
2. **Copy ทั้งหมด** ไปวางใน SQL Editor
3. กด **Run** (มุมขวาล่าง) หรือ Ctrl/Cmd + Enter

### 2.3 ยืนยันผล

ควรเห็นข้อความสำเร็จด้านล่าง เช่น:
```
Success. No rows returned
```

### ✅ เช็คว่าสำเร็จ

1. ไป **Table Editor** (เมนูซ้าย)
2. ต้องเห็น table ชื่อ `transactions` ในรายการ
3. คลิกเข้าไป → ต้องเห็น column ครบ 9 อัน:
   - `id` (uuid, PK)
   - `user_id` (uuid, FK → auth.users)
   - `amount` (numeric)
   - `category` (text)
   - `note` (text)
   - `date` (date)
   - `type` (text — expense/income)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

4. ดูที่แท็บ **Authentication** ของ table → ต้องเห็น RLS = **Enabled** และ policy 4 ตัว (SELECT, INSERT, UPDATE, DELETE)

---

## 🟢 Step 3 — กรอก `.env` ในโปรเจกต์

### 3.1 หา URL + ANON KEY

1. Supabase Dashboard → เมนูซ้าย → **Project Settings** (ไอคอน ⚙️ ล่างสุด)
2. ในหน้า settings → กด **API** (เมนูย่อย)
3. ในหน้า API จะมี 2 ส่วนที่ต้องใช้:

   | ช่อง | ใช้ทำอะไร |
   |---|---|
   | **Project URL** | URL ของ Supabase API (เช่น `https://abcdxyz.supabase.co`) |
   | **Project API keys → `anon` `public`** | Public API key — ใส่ในแอปได้ปลอดภัย เพราะ RLS protect ข้อมูล |

   > ⚠️ **อย่าใช้ `service_role` key ในแอป** — เป็น admin key ห้าม expose ให้ client เด็ดขาด

### 3.2 สร้างไฟล์ `.env`

1. เปิด root ของโปรเจกต์ — ที่ `c:\Users\tonka\OneDrive\Desktop\MyMoneyApp\`
2. ถ้ามี `.env` อยู่แล้ว → เปิดมาแก้
   ถ้าไม่มี → copy `.env.example` เป็น `.env` (ผมเตรียมไว้ให้แล้ว)
3. กรอกค่า:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
```

> ⚠️ **`.env` ถูก gitignore แล้ว** จะไม่ถูก commit ขึ้น Git ปลอดภัย ✓

### ✅ เช็คว่าสำเร็จ

```bash
# รัน app ใหม่
npx expo start --clear
```

แอปไม่ crash ตอน startup → เชื่อมต่อ Supabase ได้แล้ว
(ยังเข้า login ไม่ได้ถ้ายังไม่ทำ Step 4 — แต่ Demo mode ใช้ได้เลย)

---

## 🟢 Step 4 — ตั้งค่า Google OAuth

> ขั้นตอนนี้ยาว แต่ทำตามตามลำดับจะไม่หลง
> ต้องไป 2 ที่: **Google Cloud Console** + **Supabase Dashboard**

### 4.1 สร้าง Google Cloud Project

1. ไปที่ [console.cloud.google.com](https://console.cloud.google.com)
2. login ด้วย Google account
3. มุมซ้ายบน → กด project selector → **New project**
4. ตั้งชื่อ `MyMoneyApp` → กด **Create**
5. รอ 30 วินาที — เมื่อสร้างเสร็จเลือก project นี้

### 4.2 ตั้งค่า OAuth Consent Screen

1. เมนูซ้าย → **APIs & Services** → **OAuth consent screen**
2. เลือก **User Type:** `External` → กด **Create**
3. กรอกฟอร์ม:

   | ช่อง | ค่า |
   |---|---|
   | **App name** | `MyMoneyApp` |
   | **User support email** | email ของคุณ |
   | **Developer contact** | email ของคุณ |

   ส่วนอื่นเว้นว่างได้
4. กด **Save and Continue**
5. หน้า **Scopes** → ไม่ต้องเพิ่มอะไร → กด **Save and Continue**
6. หน้า **Test users** → กด **+ Add Users** → ใส่ email ของตัวเอง (ที่จะใช้ login ทดสอบ) → **Save and Continue**
7. หน้า **Summary** → กด **Back to Dashboard**

### 4.3 สร้าง OAuth Client ID

1. เมนูซ้าย → **APIs & Services** → **Credentials**
2. กด **+ Create Credentials** → เลือก **OAuth client ID**
3. **Application type:** เลือก `Web application`
4. **Name:** ตั้งว่า `Supabase OAuth Client`
5. **Authorized JavaScript origins:** เว้นว่าง
6. **Authorized redirect URIs:** กด **+ Add URI**
   - ใส่: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
   - **YOUR-PROJECT-REF** = ดูจาก URL ของ Supabase project เช่น `abcdxyz`
   - ตัวอย่างจริง: `https://abcdxyz.supabase.co/auth/v1/callback`
7. กด **Create**
8. **Popup จะแสดง Client ID + Client Secret** → **Copy เก็บไว้ทั้งคู่** (ใช้ใน Step 4.4)

### 4.4 เปิด Google Provider ใน Supabase

1. กลับไป **Supabase Dashboard** → project ของคุณ
2. เมนูซ้าย → **Authentication** → **Providers**
3. หา **Google** ในรายการ → คลิก
4. เลื่อน toggle **Enable Google provider** เป็น ON
5. กรอก:
   - **Client ID (for OAuth):** paste Client ID ที่ copy จาก Step 4.3
   - **Client Secret (for OAuth):** paste Client Secret ที่ copy จาก Step 4.3
6. กด **Save**

### 4.5 เพิ่ม Redirect URL ของแอป

1. ใน Supabase → **Authentication** → **URL Configuration**
2. **Site URL:** ใส่ `mymoneyapp://` (จาก `app.json` field `scheme`)
3. **Redirect URLs:** กด **Add URL** → ใส่:
   - `mymoneyapp://`
   - `mymoneyapp://auth/callback`
   - `mymoneyapp://**` (เผื่อบาง path)
4. กด **Save**

> หมายเหตุ: Google OAuth บน iOS ผ่าน **Expo Go** อาจไม่ redirect กลับเข้าแอป เพราะ Expo Go ใช้ scheme `exp://` ซึ่งเป็นข้อจำกัดของ container app ไม่ใช่ config ของ Supabase หรือ Google ที่ผิด Flow นี้ควรทดสอบด้วย development build / production build ที่มี scheme `mymoneyapp://` เป็นของแอปจริง

### ✅ เช็คว่าสำเร็จ

ทดสอบจริงใน Step 5 ด้านล่าง

---

## 🟢 Step 5 — ทดสอบการใช้งานจริง

### 5.1 รันแอป

```bash
cd c:\Users\tonka\OneDrive\Desktop\MyMoneyApp
npx expo start --clear
```

สแกน QR code ด้วย Expo Go เพื่อทดสอบ UI และ Demo mode ได้ตามปกติ (หรือกด `a` สำหรับ Android emulator, `i` สำหรับ iOS simulator)

### 5.2 ทดสอบ Google Login

> บน iOS physical device ผ่าน Expo Go อาจค้างหลังเลือกบัญชี Google ได้ ให้ทดสอบ Google OAuth ด้วย development build หรือ production build แทน

1. หน้า login → กด **Login with Google**
2. browser จะเปิดให้เลือก Google account
3. หลัง consent → browser ปิดเอง → แอปจะ redirect เข้า `/(tabs)` อัตโนมัติ

### 5.3 ทดสอบเพิ่มรายการ

1. กดปุ่ม **+** (FAB ตรงกลาง tab bar)
2. กรอกข้อมูล: จำนวน, หมวดหมู่, หมายเหตุ, วันที่
3. กด **Save**
4. ควร redirect กลับ `/(tabs)` → เห็นรายการใน Recent Transactions

### 5.4 ยืนยันใน Supabase

1. กลับไป Supabase Dashboard → **Table Editor** → `transactions`
2. ควรเห็น row ใหม่ที่เพิ่งบันทึก ✅

### 5.5 ทดสอบ Sign Out + Login กลับ

1. กดที่ avatar (มุมขวาบนหน้า Home) → **Sign Out**
2. ยืนยัน → กลับสู่หน้า Login
3. Login กลับด้วย Google account เดิม
4. ควรเห็นรายการเดิมที่บันทึกไว้ ✅

---

## 🚨 Troubleshooting

### ❌ Login Google แล้ว browser ค้างไม่ redirect กลับแอป

**สาเหตุที่เป็นไปได้:**
- `scheme` ใน `app.json` ไม่ตรงกับ Redirect URL ใน Supabase
- ใช้ Expo Go บน iOS physical device ซึ่งมีข้อจำกัดกับ OAuth redirect (`exp://`) และ ASWebAuthenticationSession

**วิธีแก้:**
1. เช็ค `app.json` → field `scheme` ต้องเป็น `mymoneyapp`
2. เช็ค Supabase **URL Configuration** → ต้องมี `mymoneyapp://auth/callback` ใน Redirect URLs
3. ถ้าใช้ iPhone จริง ให้ทดสอบด้วย development build / production build แทน Expo Go
4. ระหว่างพัฒนาใน Expo Go ให้ใช้ Demo mode หรือเพิ่ม Email/Password login สำหรับ dev ถ้าต้องทดสอบ auth จริง

### ❌ "Invalid login credentials" หลัง Google consent

**สาเหตุ:** Client ID หรือ Client Secret ใน Supabase ผิด

**วิธีแก้:**
1. Google Cloud Console → Credentials → คลิก OAuth client → ดู Client ID + Secret
2. Supabase → Authentication → Providers → Google → paste ใหม่ → Save

### ❌ บันทึกรายการแล้ว error "new row violates row-level security policy"

**สาเหตุ:** RLS policy ไม่ถูก setup หรือ `user_id` ไม่ตรงกับ JWT

**วิธีแก้:**
1. SQL Editor → รัน:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'transactions';
   ```
2. ต้องเห็น policy 4 ตัว — ถ้าไม่ครบ → รัน `0001_init.sql` ใหม่
3. เช็คว่า `user_id` ใน insert ตรงกับ `auth.uid()` ของ session ปัจจุบัน

### ❌ "supabaseUrl is required" ตอน start app

**สาเหตุ:** ไม่ได้ load `.env` หรือชื่อ env var ผิด

**วิธีแก้:**
1. เช็คชื่อ var ต้องขึ้นต้นด้วย `EXPO_PUBLIC_` เท่านั้น (ตามมาตรฐาน Expo)
2. ต้องเป็น `EXPO_PUBLIC_SUPABASE_URL` และ `EXPO_PUBLIC_SUPABASE_ANON_KEY` พอดี
3. รัน `npx expo start --clear` (ต้อง clear cache หลังแก้ `.env`)

### ❌ ดูว่า request ถึง Supabase ไหม?

```js
// ใน services/supabase.ts ชั่วคราว เพิ่มบรรทัด debug
import { supabase } from './services/supabase';
supabase.from('transactions').select('count').then(console.log);
```

ถ้าได้ data กลับมา = เชื่อมต่อสำเร็จ
ถ้า error = เช็ค URL/KEY อีกครั้ง

---

## 📝 หลังจาก Setup เสร็จ

ตอนนี้แอปพร้อมใช้งานจริงแล้ว ✨ — มี:

- ✅ Database จริงบน cloud (PostgreSQL)
- ✅ Auth จริง (Google OAuth)
- ✅ Row-level security (แต่ละ user เห็นเฉพาะข้อมูลตัวเอง)
- ✅ Auto-sync เมื่อ online
- ✅ Offline queue เก็บไว้ใน device รอ sync

### Next Steps (ถ้าจะ deploy production)

1. **Verify domain** ใน Google OAuth Consent Screen → submit สำหรับ production
2. **Custom SMTP** ใน Supabase สำหรับ email verification (แต่ Google OAuth ไม่ต้อง)
3. **Database backup** ใน Supabase (Free plan มี 7 day retention)
4. **Build production app** ด้วย `eas build` (ต้องมี Expo account)

### iOS build แบบไม่เสียเงิน ทำได้แค่ไหน?

- **Expo Go:** ฟรี ใช้พัฒนา UI/Demo mode ได้ แต่ Google OAuth บน iOS อาจ redirect กลับแอปไม่ได้
- **iOS Simulator build:** ฟรีถ้ามี Mac/Xcode แต่ไม่ได้ติดตั้งบน iPhone จริง
- **ติดตั้งบน iPhone ด้วย Apple ID ฟรี:** ทำได้ผ่าน Xcode บน Mac สำหรับเครื่องตัวเองเท่านั้น ใบเซ็นมักหมดอายุภายในไม่กี่วัน เหมาะกับทดสอบ ไม่เหมาะกับใช้งานจริง
- **TestFlight / App Store / internal distribution สำหรับ iPhone จริง:** ต้องมี Apple Developer Program ของ Apple (มีค่าใช้จ่ายรายปี)

สรุป: ถ้าต้องการ "โหลดมาใช้จริงบน iPhone" แบบ native app และ login Google ทำงานครบ ต้องใช้ development/production build ที่เซ็นด้วย Apple Developer account ส่วนที่ฟรีจริงคือ Expo Go, simulator, หรือ web/PWA ไม่ใช่ native iOS distribution

---

*คู่มือ Supabase Setup สำหรับ MyMoneyApp — พฤษภาคม 2569*
