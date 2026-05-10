# 🖼️ Assets & Image Guide — MyMoneyApp

รายการรูปภาพที่ต้องเตรียมเพื่อให้แอปดูดีขึ้นเต็มรูปแบบ

---

## 1. App Icons & Splash (Required)

| ไฟล์ | ขนาด | รายละเอียด |
|------|------|-----------|
| `assets/icon.png` | 1024×1024 px | App icon บน Home Screen |
| `assets/adaptive-icon.png` | 1024×1024 px | Android Adaptive Icon foreground |
| `assets/splash-icon.png` | 1024×1024 px | Splash icon ตอนเปิดแอป |
| `assets/favicon.png` | 1024×1024 px | Web/PWA favicon (ใช้รูปเดียวกับ app icon เพื่อให้ brand ตรงกัน) |

**ปัจจุบัน:** ใช้ไอคอนถุงเงินสีขาวบนพื้น gradient ครีม-ส้ม earth tone ให้เข้ากับ theme หลัก `#F3EAD8`

> ถ้าเปลี่ยน icon อีกครั้ง ให้ใช้ไฟล์ PNG 1024×1024 แล้ววางทับชื่อเดิมทั้ง 4 ไฟล์ เพื่อให้ตรงกับ `app.json`

---

## 2. Category Icons (Optional — ใช้แทน emoji)

วางไว้ที่ `assets/icons/categories/` ขนาด **64×64 px** PNG พื้นหลังโปร่งใส

| ไฟล์ | หมวด |
|------|------|
| `food.png` | 🍜 อาหาร |
| `transport.png` | 🚗 เดินทาง |
| `shopping.png` | 🛍️ ช้อปปิ้ง |
| `entertainment.png` | 🎬 บันเทิง |
| `health.png` | 💊 สุขภาพ |
| `education.png` | 📚 การศึกษา |
| `bills.png` | 💡 ค่าใช้จ่าย |
| `income.png` | 💰 รายรับ |
| `other.png` | 📦 อื่นๆ |

**แหล่งโหลดฟรี (ลายเส้นเดียวกัน/Flat style):**
- [Flaticon](https://www.flaticon.com) — ค้นหา "money category icon set"
- [Icons8](https://icons8.com) — มี Thai-friendly, ใช้ style "Fluent"
- [Phosphor Icons](https://phosphoricons.com) — open-source, export เป็น PNG ได้
- [Lordicon](https://lordicon.com) — animated Lottie icons (จ่ายเงิน)

---

## 3. Hero Image (Login Screen)

| ไฟล์ | ขนาด | รายละเอียด |
|------|------|-----------|
| `assets/images/hero-login.png` | 400×320 px | รูปประกอบหน้า Login เช่น คนถือกระเป๋าเงิน/กราฟการเงิน |

**แหล่งฟรี:**
- [unDraw](https://undraw.co) — ค้น "savings", "finance", "wallet" — ดาวน์โหลด SVG แล้ว export PNG
- [Storyset](https://storyset.com) — สไตล์ animation-friendly

---

## 4. Empty State Illustrations

วางไว้ที่ `assets/images/` ขนาด **280×220 px** PNG

| ไฟล์ | ใช้ตรงไหน |
|------|-----------|
| `empty-transactions.png` | หน้าหลัก ยังไม่มีรายการ |
| `empty-search.png` | หน้าประวัติ กรองแล้วไม่มีผล |

---

## 5. Fonts (แนะนำ — ทำให้หน้าตาดีขึ้นมาก)

ปัจจุบัน Expo ใช้ฟอนต์ระบบ (San Francisco / Roboto) ถ้าต้องการฟอนต์ภาษาไทยที่สวยขึ้น:

| ฟอนต์ | วิธีติดตั้ง | หมายเหตุ |
|-------|-----------|---------|
| **Noto Sans Thai** | `npx expo install expo-font` + `@expo-google-fonts/noto-sans-thai` | แนะนำ — สวย อ่านง่าย |
| **IBM Plex Sans Thai** | `@expo-google-fonts/ibm-plex-sans-thai` | ดูเป็นมืออาชีพ |
| **Sarabun** | `@expo-google-fonts/sarabun` | ใช้กันในไทยมาก |

**ขั้นตอนเพิ่มฟอนต์ (เมื่อพร้อม):**
```bash
npx expo install expo-font @expo-google-fonts/noto-sans-thai
```
แล้วใช้ใน `app/_layout.tsx`:
```tsx
import { useFonts, NotoSansThai_400Regular, NotoSansThai_700Bold } from '@expo-google-fonts/noto-sans-thai';
```

---

## 6. ไอคอนที่ใช้อยู่ปัจจุบัน (Ionicons)

ตอนนี้แอปใช้ **@expo/vector-icons → Ionicons** แทน emoji แล้ว (ไม่ต้องเตรียมรูป)
ดู icon ทั้งหมดได้ที่: https://ionic.io/ionicons

---

## สรุปลำดับความสำคัญ

```
🔴 ต้องมี (ทำก่อน)
  └── assets/icon.png
  └── assets/adaptive-icon.png
  └── assets/splash-icon.png

🟡 ควรมี (ทำหลัง)
  └── assets/images/hero-login.png
  └── assets/images/empty-transactions.png
  └── ฟอนต์ภาษาไทย

🟢 เพิ่มเติม (เมื่อพร้อม)
  └── assets/icons/categories/*.png
  └── assets/images/empty-search.png
```
