import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import type { RowDataPacket } from "mysql2";
import mysql from "mysql2/promise";

async function cleanupTestMessages() {
  const envPath = path.join(process.cwd(), ".env.local");
  const entries = Object.fromEntries(
    fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.trimStart().startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
  const connection = await mysql.createConnection({
    host: entries.MYSQL_HOST,
    port: Number(entries.MYSQL_PORT ?? 3306),
    database: entries.MYSQL_DATABASE,
    user: entries.MYSQL_USER,
    password: entries.MYSQL_PASSWORD,
  });

  const userId = Number(entries.TEMP_USER_ID ?? 3);
  const [rows] = await connection.execute<RowDataPacket[]>(
    "SELECT image_url FROM messages WHERE userid = ? AND content LIKE ?",
    [userId, "e2e %"]
  );

  for (const row of rows) {
    if (typeof row.image_url !== "string" || !row.image_url.startsWith("/uploads/")) {
      continue;
    }

    const uploadPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      path.basename(row.image_url)
    );
    if (fs.existsSync(uploadPath)) {
      fs.unlinkSync(uploadPath);
    }
  }

  await connection.execute(
    `
      DELETE c
      FROM comments c
      JOIN messages m ON m.msgid = c.msgid
      WHERE m.userid = ? AND m.content LIKE ?
    `,
    [userId, "e2e %"]
  );
  await connection.execute(
    "DELETE FROM messages WHERE userid = ? AND content LIKE ?",
    [userId, "e2e %"]
  );
  await connection.end();
}

test("writes, edits, and deletes a guestbook message", async ({ page }) => {
  const suffix = Date.now();
  const text = `e2e 저장 테스트 ${suffix}`;
  const updatedText = `e2e 수정 테스트 ${suffix}`;
  const imageBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64"
  );

  await cleanupTestMessages();
  await page.goto("/");

  await page.getByPlaceholder("여기에 남기고 싶은 말을 적어 주세요.").first().fill(text);
  await page.locator('input[type="file"]').first().setInputFiles({
    name: "e2e-upload.png",
    mimeType: "image/png",
    buffer: imageBuffer,
  });
  await page.getByRole("button", { name: "남기기" }).first().click();
  const article = page.locator("article").filter({ hasText: text }).first();
  await expect(article).toBeVisible();
  await expect(article.locator("img")).toBeVisible();

  await article.getByPlaceholder("댓글 남기기…").fill(`e2e 댓글 ${suffix}`);
  await article.getByRole("button", { name: "등록" }).click();
  await expect(article.getByText(`e2e 댓글 ${suffix}`)).toBeVisible();

  await article.getByRole("button", { name: "더보기" }).click();
  await article.getByRole("button", { name: "수정" }).click();
  await article.locator("textarea").fill(updatedText);
  await page.getByRole("button", { name: "저장" }).click();
  const updatedArticle = page.locator("article").filter({ hasText: updatedText }).first();
  await expect(updatedArticle).toBeVisible();

  await updatedArticle.getByRole("button", { name: "더보기" }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await updatedArticle.getByRole("button", { name: "삭제" }).click();
  await expect(page.getByText(updatedText)).toHaveCount(0);
  await cleanupTestMessages();
});
