"use server";

import { revalidatePath } from "next/cache";
import {
  createComment,
  createMessage,
  deleteMessage,
  updateMessage,
} from "@/lib/messages";
import type { CommentInput, MessageInput } from "@/lib/message-helpers";

export async function createGuestbookMessage(formData: FormData) {
  const message = await createMessage({
    text: String(formData.get("text") ?? ""),
    paper: formData.get("paper") as MessageInput["paper"],
    image: formData.get("image") as File | null,
  });
  revalidatePath("/");
  return message;
}

export async function updateGuestbookMessage(id: string, input: MessageInput) {
  const message = await updateMessage(id, input);
  revalidatePath("/");
  return message;
}

export async function deleteGuestbookMessage(id: string) {
  await deleteMessage(id);
  revalidatePath("/");
  return id;
}

export async function createGuestbookComment(
  messageId: string,
  input: CommentInput
) {
  const comment = await createComment(messageId, input);
  revalidatePath("/");
  return comment;
}
