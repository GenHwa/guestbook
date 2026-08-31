import { describe, expect, it } from "vitest";
import {
  formatRelativeTime,
  recordToMessage,
  validateCommentInput,
  validateMessageInput,
} from "@/lib/message-helpers";

describe("validateMessageInput", () => {
  it("trims message text and keeps the selected paper", () => {
    expect(validateMessageInput({ text: "  안녕하세요  ", paper: "hanji" })).toEqual({
      text: "안녕하세요",
      paper: "hanji",
    });
  });

  it("rejects empty and oversized messages", () => {
    expect(() => validateMessageInput({ text: "   ", paper: "plain" })).toThrow(
      "내용을 입력해 주세요."
    );
    expect(() =>
      validateMessageInput({ text: "가".repeat(301), paper: "plain" })
    ).toThrow("내용은 300자 이하로 입력해 주세요.");
  });
});

describe("validateCommentInput", () => {
  it("trims comment text", () => {
    expect(validateCommentInput({ text: "  반가워요  " })).toEqual({
      text: "반가워요",
    });
  });

  it("rejects empty and oversized comments", () => {
    expect(() => validateCommentInput({ text: " " })).toThrow(
      "댓글 내용을 입력해 주세요."
    );
    expect(() => validateCommentInput({ text: "가".repeat(501) })).toThrow(
      "댓글은 500자 이하로 입력해 주세요."
    );
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-28T12:00:00.000Z");

  it("formats recent Korean relative labels", () => {
    expect(formatRelativeTime("2026-08-28T11:59:45.000Z", now)).toBe("방금");
    expect(formatRelativeTime("2026-08-28T11:45:00.000Z", now)).toBe("15분 전");
    expect(formatRelativeTime("2026-08-28T09:00:00.000Z", now)).toBe("3시간 전");
    expect(formatRelativeTime("2026-08-27T12:00:00.000Z", now)).toBe("어제");
    expect(formatRelativeTime("2026-08-25T12:00:00.000Z", now)).toBe("3일 전");
  });
});

describe("recordToMessage", () => {
  it("maps a database record to the UI message shape", () => {
    expect(
      recordToMessage({
        id: 42,
        userid: 3,
        author: "나",
        handle: "me",
        color: "#6a7889",
        text: "저장된 글",
        paper: "plain",
        likes: 0,
        created_at: "2026-08-28T12:00:00.000Z",
      })
    ).toMatchObject({
      id: "42",
      no: 42,
      userid: 3,
      author: "나",
      handle: "me",
      text: "저장된 글",
      paper: "plain",
      comments: [],
    });
  });
});
