# Deploy My Money เป็น PWA (ฟรี)

คู่มือนี้สรุปวิธี build และ deploy `My Money` ขึ้นเว็บ พร้อมใช้งานแบบ
"Add to Home Screen" บน iOS / Android ได้เลย โดยไม่เสียเงินสักบาท

---

## 1. ทดสอบ Local ก่อน Deploy

```powershell
npm run build:web      # build dist/ + ฝัง PWA meta tags อัตโนมัติ
npm run preview:web    # เปิด http://localhost:3000
```

เปิดด้วย Chrome / Edge → กด F12 → แท็บ **Application → Manifest**
จะเห็น icons / theme color ครบ ถือว่า PWA พร้อม

---

## 2. Push code ขึ้น GitHub (ถ้ายังไม่ได้ทำ)

```powershell
git add .
git commit -m "feat(web): add pwa manifest and web export config"
git push origin main
```

> ระวัง: `.env` และ `dist/` ถูก ignore แล้วจะไม่ถูก push (ตรวจจาก `.gitignore`)

---

## 3. Deploy ไป Vercel (แนะนำ - ฟรีและง่ายที่สุด)

### 3.1 Sign up
1. ไป <https://vercel.com/signup> → **Continue with GitHub**
2. Authorize Vercel ให้เข้าถึง repo

### 3.2 Import project
1. กด **Add New… → Project**
2. เลือก repo `MyMoneyApp` → **Import**
3. หน้า Configure Project:
   - **Framework Preset**: เลือก `Other` (Vercel จะอ่าน `vercel.json` ของเราเอง)
   - **Build Command**: ปล่อยว่าง (ถูก override ใน vercel.json แล้ว)
   - **Output Directory**: ปล่อยว่าง

### 3.3 Environment Variables (สำคัญมาก!)
ใน section **Environment Variables** ใส่ 2 ตัวนี้ (เอามาจาก `.env`):

| Name                              | Value                                            |
| --------------------------------- | ------------------------------------------------ |
| `EXPO_PUBLIC_SUPABASE_URL`        | `https://ybwcufkcfclmpfyokbgx.supabase.co`       |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`   | `sb_publishable_...`                             |

> ค่าเหล่านี้ถูก inline เข้า bundle ตอน build จึงต้องตั้งใน Vercel ก่อน deploy

กด **Deploy** → รอ 1-2 นาที จะได้ URL เช่น
`https://my-money-app-xxxx.vercel.app`

---

## 4. ตั้ง Supabase Redirect URLs

หลังได้ Vercel URL แล้ว ต้องบอก Supabase ว่า OAuth callback กลับมาที่นี่

1. เปิด <https://supabase.com/dashboard> → Project ของคุณ
2. **Authentication → URL Configuration**
3. **Site URL**: `https://my-money-app-xxxx.vercel.app`
4. **Redirect URLs** เพิ่ม:
   ```
   https://my-money-app-xxxx.vercel.app/**
   https://my-money-app-xxxx.vercel.app/auth/callback
   ```
5. กด **Save**

---

## 5. ตั้ง Google Cloud Authorized URIs

OAuth provider ฝั่ง Google ก็ต้องอนุญาต origin ใหม่

1. <https://console.cloud.google.com/apis/credentials>
2. คลิก OAuth 2.0 Client ID ของแอป
3. **Authorized JavaScript origins** เพิ่ม:
   ```
   https://my-money-app-xxxx.vercel.app
   ```
4. **Authorized redirect URIs** ต้องมี (อันนี้คือ Supabase callback อยู่แล้ว):
   ```
   https://ybwcufkcfclmpfyokbgx.supabase.co/auth/v1/callback
   ```
5. **Save**

---

## 6. ทดสอบจริง

1. เปิด `https://my-money-app-xxxx.vercel.app` บน Safari (iOS) / Chrome (Android)
2. ทดสอบ Login ด้วย Google → ควรกลับมาที่ Overview ปกติ
3. **Add to Home Screen**:
   - **iOS Safari**: กดปุ่ม Share (สี่เหลี่ยมลูกศรขึ้น) → เลือก "Add to Home Screen"
   - **Android Chrome**: เมนู 3 จุด → "Add to Home screen" หรือ "Install app"
4. แอปจะมี icon บน Home Screen เปิดแบบ standalone (ไม่มี URL bar)

---

## 7. อัปเดตในอนาคต

ทุกครั้งที่ push commit ใหม่ขึ้น `main` → Vercel จะ auto-deploy ให้
ถ้า PWA cache ใน device ค้างของเก่า → กด refresh / ปิดเปิด app ใหม่

---

## ทางเลือกอื่น (ถ้าไม่อยากใช้ Vercel)

| Host         | ฟรี | Custom domain | จุดเด่น                           |
| ------------ | --- | ------------- | --------------------------------- |
| **Vercel**   | ✓   | ✓ (5 sites)   | Auto-deploy from git, ดีที่สุด   |
| **Netlify**  | ✓   | ✓             | คล้าย Vercel ใช้ `netlify.toml`   |
| **Cloudflare Pages** | ✓   | ✓             | CDN ใหญ่ แต่ setup ยุ่งกว่า       |
| **GitHub Pages** | ✓ | ✓             | ฟรี แต่ต้อง config 404 → index.html ด้วย |

ผมเลือก Vercel เพราะ:
- รองรับ SPA rewrites ผ่าน `vercel.json` ที่เราเตรียมไว้
- Env vars จัดการง่ายผ่าน UI
- Auto preview deployment ทุก PR
