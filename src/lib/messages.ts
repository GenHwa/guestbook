import "server-only";

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import type { Paper } from "@/lib/data";
import { db } from "@/lib/db";
import {
  recordToComment,
  recordToMessage,
  validateCommentInput,
  validateImageFile,
  validateMessageInput,
  type CommentInput,
  type MessageInput,
} from "@/lib/message-helpers";

const TEMP_USER_ID = Number(process.env.TEMP_USER_ID ?? 3);

type MessageRow = RowDataPacket & {
  id: number;
  userid: number;
  author: string;
  handle: string;
  color: string;
  text: string;
  imageUrl: string | null;
  paper: Paper;
  likes: number;
  verified: number | boolean;
  liked: number | boolean;
  saved: number | boolean;
  created_at: Date | string;
};

type CommentRow = RowDataPacket & {
  id: number;
  messageId: number;
  author: string;
  color: string;
  text: string;
  created_at: Date | string;
};

let schemaReady: Promise<void> | undefined;

export async function ensureMessagesTable() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await db.query(`
        SELECT 1
        FROM messages
        LIMIT 1
      `);
      await ensureImageColumn();
    })();
  }

  return schemaReady;
}

export async function getMessages() {
  await ensureMessagesTable();

  const [rows] = await db.query<MessageRow[]>(
    `
      SELECT
        m.msgid AS id,
        m.userid,
        u.display_name AS author,
        u.username AS handle,
        u.color,
        u.is_owner AS verified,
        m.content AS text,
        m.image_url AS imageUrl,
        m.paper,
        COUNT(ml.userid) AS likes,
        EXISTS(
          SELECT 1
          FROM message_likes liked
          WHERE liked.msgid = m.msgid AND liked.userid = :userid
        ) AS liked,
        EXISTS(
          SELECT 1
          FROM message_saves saved
          WHERE saved.msgid = m.msgid AND saved.userid = :userid
        ) AS saved,
        m.created_at
      FROM messages m
      JOIN users u ON u.userid = m.userid
      LEFT JOIN message_likes ml ON ml.msgid = m.msgid
      GROUP BY
        m.msgid,
        m.userid,
        u.display_name,
        u.username,
        u.color,
        u.is_owner,
        m.content,
        m.image_url,
        m.paper,
        m.created_at
      ORDER BY m.msgid DESC
      LIMIT 100
    `,
    { userid: TEMP_USER_ID }
  );

  const messages = rows.map((row, index) => ({
    ...recordToMessage(row, index, TEMP_USER_ID),
    verified: Boolean(row.verified),
    liked: Boolean(row.liked),
    saved: Boolean(row.saved),
  }));

  const comments = await getCommentsForMessages(rows.map((row) => row.id));

  return messages.map((message) => ({
    ...message,
    comments: comments.get(Number(message.id)) ?? [],
  }));
}

export async function createMessage(input: MessageInput) {
  const { text, paper } = validateMessageInput(input);
  const imageUrl = await saveImageFile(validateImageFile(input.image));

  await ensureMessagesTable();

  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO messages (userid, content, paper, image_url)
      VALUES (:userid, :content, :paper, :imageUrl)
    `,
    {
      userid: TEMP_USER_ID,
      content: text,
      paper,
      imageUrl,
    }
  );

  return getMessageById(String(result.insertId));
}

export async function updateMessage(id: string, input: MessageInput) {
  const { text, paper } = validateMessageInput(input);

  await ensureMessagesTable();

  const [result] = await db.execute<ResultSetHeader>(
    `
      UPDATE messages
      SET content = :content, paper = :paper
      WHERE msgid = :id AND userid = :userid
    `,
    { id, userid: TEMP_USER_ID, content: text, paper }
  );

  if (result.affectedRows === 0) {
    throw new Error("수정할 수 있는 글을 찾지 못했어요.");
  }

  return getMessageById(id);
}

export async function deleteMessage(id: string) {
  await ensureMessagesTable();

  const [messageRows] = await db.execute<RowDataPacket[]>(
    `
      SELECT msgid, image_url
      FROM messages
      WHERE msgid = :id AND userid = :userid
      LIMIT 1
    `,
    { id, userid: TEMP_USER_ID }
  );

  if (!messageRows[0]) {
    throw new Error("삭제할 수 있는 글을 찾지 못했어요.");
  }

  await db.execute(
    `
      DELETE FROM comments
      WHERE msgid = :id
    `,
    { id }
  );

  await db.execute(
    `
      DELETE FROM message_likes
      WHERE msgid = :id
    `,
    { id }
  );

  await db.execute(
    `
      DELETE FROM message_saves
      WHERE msgid = :id
    `,
    { id }
  );

  const [result] = await db.execute<ResultSetHeader>(
    `
      DELETE FROM messages
      WHERE msgid = :id AND userid = :userid
    `,
    { id, userid: TEMP_USER_ID }
  );

  if (result.affectedRows === 0) {
    throw new Error("삭제할 수 있는 글을 찾지 못했어요.");
  }

  const imageUrl = typeof messageRows[0].image_url === "string"
    ? messageRows[0].image_url
    : null;
  await deleteUploadedImage(imageUrl);
}

export async function createComment(messageId: string, input: CommentInput) {
  const { text } = validateCommentInput(input);

  await ensureMessagesTable();

  const [messageRows] = await db.execute<RowDataPacket[]>(
    `
      SELECT msgid
      FROM messages
      WHERE msgid = :messageId
      LIMIT 1
    `,
    { messageId }
  );

  if (!messageRows[0]) {
    throw new Error("댓글을 남길 글을 찾지 못했어요.");
  }

  const [result] = await db.execute<ResultSetHeader>(
    `
      INSERT INTO comments (msgid, userid, content)
      VALUES (:messageId, :userid, :content)
    `,
    { messageId, userid: TEMP_USER_ID, content: text }
  );

  return getCommentById(String(result.insertId));
}

async function getCommentsForMessages(messageIds: number[]) {
  const grouped = new Map<number, ReturnType<typeof recordToComment>[]>();

  if (messageIds.length === 0) {
    return grouped;
  }

  const [rows] = await db.query<CommentRow[]>(
    `
      SELECT
        c.commentid AS id,
        c.msgid AS messageId,
        u.display_name AS author,
        u.color,
        c.content AS text,
        c.created_at
      FROM comments c
      JOIN users u ON u.userid = c.userid
      WHERE c.msgid IN (?)
      ORDER BY c.commentid ASC
    `,
    [messageIds]
  );

  for (const row of rows) {
    const list = grouped.get(row.messageId) ?? [];
    list.push(recordToComment(row));
    grouped.set(row.messageId, list);
  }

  return grouped;
}

async function getCommentById(id: string) {
  const [rows] = await db.execute<CommentRow[]>(
    `
      SELECT
        c.commentid AS id,
        c.msgid AS messageId,
        u.display_name AS author,
        u.color,
        c.content AS text,
        c.created_at
      FROM comments c
      JOIN users u ON u.userid = c.userid
      WHERE c.commentid = :id
      LIMIT 1
    `,
    { id }
  );

  const row = rows[0];
  if (!row) {
    throw new Error("댓글을 찾지 못했어요.");
  }

  return recordToComment(row);
}

async function getMessageById(id: string) {
  const [rows] = await db.execute<MessageRow[]>(
    `
      SELECT
        m.msgid AS id,
        m.userid,
        u.display_name AS author,
        u.username AS handle,
        u.color,
        u.is_owner AS verified,
        m.content AS text,
        m.image_url AS imageUrl,
        m.paper,
        (
          SELECT COUNT(*)
          FROM message_likes ml
          WHERE ml.msgid = m.msgid
        ) AS likes,
        EXISTS(
          SELECT 1
          FROM message_likes liked
          WHERE liked.msgid = m.msgid AND liked.userid = :userid
        ) AS liked,
        EXISTS(
          SELECT 1
          FROM message_saves saved
          WHERE saved.msgid = m.msgid AND saved.userid = :userid
        ) AS saved,
        m.created_at
      FROM messages m
      JOIN users u ON u.userid = m.userid
      WHERE m.msgid = :id
      LIMIT 1
    `,
    { id, userid: TEMP_USER_ID }
  );

  const row = rows[0];
  if (!row) {
    throw new Error("글을 찾지 못했어요.");
  }

  return {
    ...recordToMessage(row, 0, TEMP_USER_ID),
    verified: Boolean(row.verified),
    liked: Boolean(row.liked),
    saved: Boolean(row.saved),
  };
}

async function ensureImageColumn() {
  const [columns] = await db.execute<RowDataPacket[]>(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'messages'
        AND COLUMN_NAME = 'image_url'
      LIMIT 1
    `
  );

  if (columns[0]) return;

  await db.execute(`
    ALTER TABLE messages
    ADD COLUMN image_url VARCHAR(255) NULL AFTER content
  `);
}

async function saveImageFile(file: File | null) {
  if (!file) return null;

  const extension = extensionFromMime(file.type);
  const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  const uploadPath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(uploadPath, bytes);

  return `/uploads/${fileName}`;
}

function extensionFromMime(mime: string) {
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "image/gif") return ".gif";
  return ".jpg";
}

async function deleteUploadedImage(imageUrl: string | null) {
  if (!imageUrl?.startsWith("/uploads/")) return;

  const fileName = path.basename(imageUrl);
  const uploadPath = path.join(process.cwd(), "public", "uploads", fileName);
  await fs.rm(uploadPath, { force: true });
}
