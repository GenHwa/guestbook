/**
 * db/schema.sql 을 순서대로 실행한다.
 *   node --env-file=.env.local db/migrate.mjs
 * 이미 적용된 구문(중복 컬럼/인덱스/테이블)은 건너뛴다.
 */
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const SKIPPABLE = new Set([
  "ER_DUP_FIELDNAME",   // 컬럼 이미 있음
  "ER_DUP_KEYNAME",     // 인덱스/제약 이미 있음
  "ER_TABLE_EXISTS_ERROR",
]);

const sql = await readFile(new URL("./schema.sql", import.meta.url), "utf8");

// 줄 주석 제거 후 세미콜론으로 분리
const statements = sql
  .split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

const conn = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: false,
});

let applied = 0;
let skipped = 0;

for (const stmt of statements) {
  const label = stmt.split("\n")[0].slice(0, 70);
  try {
    await conn.query(stmt);
    console.log(`  ✓ ${label}`);
    applied++;
  } catch (err) {
    if (SKIPPABLE.has(err.code)) {
      console.log(`  · ${label}  (이미 적용됨: ${err.code})`);
      skipped++;
    } else {
      console.error(`  ✗ ${label}\n    ${err.code}: ${err.message}`);
      await conn.end();
      process.exit(1);
    }
  }
}

console.log(`\n적용 ${applied}건, 건너뜀 ${skipped}건`);
await conn.end();
