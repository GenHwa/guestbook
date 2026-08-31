import GuestbookClient from "@/app/GuestbookClient";
import { getMessages } from "@/lib/messages";

export default async function Page() {
  const messages = await getMessages();

  return <GuestbookClient initialMessages={messages} />;
}
