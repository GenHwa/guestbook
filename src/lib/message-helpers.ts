import { CURRENT_USER, type Message, type Paper } from "@/lib/data";

const MAX_MESSAGE_LENGTH = 300;
const MAX_COMMENT_LENGTH = 500;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const VALID_PAPERS = new Set<Paper>([
  "plain",
  "hanji",
  "celadon",
  "dawn",
  "plum",
  "moss",
  "ink",
]);

export type MessageInput = {
  text: string;
  paper: Paper;
  image?: File | null;
};

export type CommentInput = {
  text: string;
};

export type MessageRecord = {
  id: number;
  userid?: number;
  author: string;
  handle: string;
  color: string;
  text: string;
  imageUrl?: string | null;
  paper: Paper;
  likes: number;
  created_at: Date | string;
};

export type CommentRecord = {
  id: number;
  messageId: number;
  author: string;
  color: string;
  text: string;
  created_at: Date | string;
};

export function validateMessageInput(input: MessageInput) {
  const text = input.text.trim();

  if (!text) {
    throw new Error("내용을 입력해 주세요.");
  }

  if (text.length > MAX_MESSAGE_LENGTH) {
    throw new Error(`내용은 ${MAX_MESSAGE_LENGTH}자 이하로 입력해 주세요.`);
  }

  if (!VALID_PAPERS.has(input.paper)) {
    throw new Error("지원하지 않는 편지지입니다.");
  }

  return { text, paper: input.paper };
}

export function validateCommentInput(input: CommentInput) {
  const text = input.text.trim();

  if (!text) {
    throw new Error("댓글 내용을 입력해 주세요.");
  }

  if (text.length > MAX_COMMENT_LENGTH) {
    throw new Error(`댓글은 ${MAX_COMMENT_LENGTH}자 이하로 입력해 주세요.`);
  }

  return { text };
}

export function validateImageFile(file: File | null | undefined) {
  if (!file || file.size === 0) return null;

  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("이미지는 JPG, PNG, WebP, GIF만 업로드할 수 있어요.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("이미지는 5MB 이하로 업로드해 주세요.");
  }

  return file;
}

export function formatRelativeTime(value: Date | string, now = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = now.getTime() - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (!Number.isFinite(date.getTime()) || diffMs < minute) return "방금";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}분 전`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`;
  if (diffMs < 2 * day) return "어제";
  return `${Math.floor(diffMs / day)}일 전`;
}

export function recordToMessage(
  record: MessageRecord,
  index = 0,
  currentUserId?: number
): Message {
  return {
    id: String(record.id),
    no: record.id,
    userid: record.userid,
    author: record.author,
    handle: record.handle,
    color: record.color,
    verified: index === 0 && record.handle !== CURRENT_USER.handle,
    canEdit: currentUserId !== undefined && record.userid === currentUserId,
    time: formatRelativeTime(record.created_at),
    text: record.text,
    imageUrl: record.imageUrl ?? null,
    paper: record.paper,
    likes: record.likes,
    liked: false,
    saved: false,
    comments: [],
  };
}

export function recordToComment(record: CommentRecord) {
  return {
    id: String(record.id),
    author: record.author,
    color: record.color,
    text: record.text,
    time: formatRelativeTime(record.created_at),
  };
}
