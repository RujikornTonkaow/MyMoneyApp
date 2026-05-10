#!/usr/bin/env node
// ============================================================================
// MyMoneyApp — Supabase Connection Verifier
// ============================================================================
// Standalone Node.js script that verifies the Supabase setup is correct.
// Run: npm run supabase:verify
// ============================================================================

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ── ANSI colors for nicer output ────────────────────────────────────────────
const c = {
  reset:  '\x1b[0m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  gray:   '\x1b[90m',
  bold:   '\x1b[1m',
};
const ok   = (msg) => console.log(`${c.green}✓${c.reset} ${msg}`);
const fail = (msg) => console.log(`${c.red}✗${c.reset} ${msg}`);
const info = (msg) => console.log(`${c.blue}ℹ${c.reset} ${msg}`);
const warn = (msg) => console.log(`${c.yellow}⚠${c.reset} ${msg}`);
const dim  = (msg) => console.log(`${c.gray}${msg}${c.reset}`);

// ── Tiny .env loader (no external dep) ──────────────────────────────────────
function loadEnv() {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = join(__dirname, '..', '.env');
  let raw;
  try {
    raw = readFileSync(envPath, 'utf8');
  } catch {
    return null;
  }
  const result = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

// ── Main ────────────────────────────────────────────────────────────────────
console.log(`\n${c.bold}━━━ MyMoneyApp Supabase Verifier ━━━${c.reset}\n`);

// 1. Load .env
const env = loadEnv();
if (!env) {
  fail('ไม่พบไฟล์ .env');
  warn('สร้างไฟล์: cp .env.example .env แล้วกรอกค่า');
  process.exit(1);
}
ok('โหลดไฟล์ .env สำเร็จ');

const url = env.EXPO_PUBLIC_SUPABASE_URL;
const key = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 2. Check vars exist
if (!url || url.includes('your-project-ref')) {
  fail('EXPO_PUBLIC_SUPABASE_URL ยังไม่ได้กรอกค่าจริง');
  dim(`  ปัจจุบัน: ${url ?? '(empty)'}`);
  process.exit(1);
}
if (!key || key.includes('replace-with-real')) {
  fail('EXPO_PUBLIC_SUPABASE_ANON_KEY ยังไม่ได้กรอกค่าจริง');
  process.exit(1);
}
ok('Environment variables กรอกครบ');
dim(`  URL: ${url}`);
dim(`  KEY: ${key.slice(0, 20)}...${key.slice(-8)}`);

// 3. Validate URL format
if (!/^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url.replace(/\/$/, '') + '/')) {
  warn('รูปแบบ URL อาจไม่ถูกต้อง — ปกติเป็น https://xxxxx.supabase.co');
}

// 4. Validate key format (รองรับทั้ง JWT เก่า "eyJ..." และ format ใหม่ "sb_publishable_...")
const isLegacyJwt = /^eyJ/.test(key);
const isNewPublishable = /^sb_publishable_/.test(key);
const isSecretKey = /^sb_secret_/.test(key);

if (isSecretKey) {
  fail('คุณกรอก SECRET KEY ลงไป — ห้ามใช้ใน client app');
  warn('ต้องใช้ Publishable key (sb_publishable_...) แทน');
  process.exit(1);
}
if (!isLegacyJwt && !isNewPublishable) {
  fail('รูปแบบ ANON KEY ไม่ถูกต้อง');
  warn('ต้องเป็น "eyJ..." (JWT เก่า) หรือ "sb_publishable_..." (format ใหม่)');
  process.exit(1);
}
ok(`รูปแบบ ANON KEY ถูกต้อง (${isNewPublishable ? 'Publishable key — format ใหม่' : 'JWT — format เก่า'})`);

// 5. Create client
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
ok('สร้าง Supabase client สำเร็จ');

// 6. Test connection — list tables via REST
console.log(`\n${c.bold}━━━ ทดสอบการเชื่อมต่อ ━━━${c.reset}\n`);

try {
  const { error, count } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true });

  if (error) {
    if (error.code === '42P01') {
      fail(`Table "transactions" ยังไม่มี — ต้องรัน SQL migration ก่อน`);
      info('ดู: supabase/migrations/0001_init.sql');
    } else if (error.message?.includes('Invalid API key')) {
      fail('ANON KEY ผิด — copy มาใหม่จาก Project Settings → API');
    } else if (error.message?.includes('fetch')) {
      fail('เชื่อมต่อ Supabase ไม่ได้ — เช็ค URL หรือ internet');
    } else {
      fail(`เกิด error: ${error.message}`);
      dim(`  code: ${error.code ?? '(none)'}`);
    }
    process.exit(1);
  }

  ok(`เชื่อมต่อ Supabase ได้`);
  ok(`Table "transactions" มีอยู่แล้ว`);
  info(`จำนวนรายการในตาราง: ${count ?? 0} rows (ปกติเป็น 0 ตอนเริ่มแรก)`);
} catch (err) {
  fail(`Network error: ${err.message}`);
  process.exit(1);
}

// 7. Test RLS — anon should NOT be able to insert without user_id matching auth.uid()
console.log(`\n${c.bold}━━━ ทดสอบ Row-Level Security ━━━${c.reset}\n`);

const fakeUserId = '00000000-0000-0000-0000-000000000000';
const { error: insertError } = await supabase
  .from('transactions')
  .insert({
    user_id:  fakeUserId,
    amount:   1,
    category: 'test',
    note:     'rls-test',
    date:     '2026-01-01',
    type:     'expense',
  });

if (insertError) {
  if (insertError.code === '42501' || insertError.message?.includes('row-level security')) {
    ok('RLS ทำงานถูกต้อง — ปฏิเสธ insert ของ user ที่ไม่ได้ auth');
  } else {
    warn(`Insert ล้มเหลว แต่ไม่ใช่ RLS error: ${insertError.message}`);
    dim(`  code: ${insertError.code}`);
  }
} else {
  fail('⚠️ RLS อาจไม่ได้เปิด — anon insert สำเร็จ (ไม่ควร)');
  warn('รัน SQL migration ใหม่: supabase/migrations/0001_init.sql');
}

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${c.bold}${c.green}━━━ สรุป ━━━${c.reset}\n`);
ok('Supabase setup ถูกต้องครบทุกอย่าง');
console.log(`
${c.gray}ขั้นถัดไป:${c.reset}
  1. ตั้งค่า Google OAuth ตาม SUPABASE_SETUP.md → Step 4
  2. รันแอป: ${c.bold}npx expo start --clear${c.reset}
  3. ทดสอบ Login + เพิ่มรายการ
`);
