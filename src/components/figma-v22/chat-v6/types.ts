import type { MobileChatAnswer } from "@/lib/mobile/chatEngine";

export interface ChatReply {
  title?: string;
  summary: string;
  observations?: string[];
  action?: string;
  suggestions?: string[];
  sourceAnswer?: MobileChatAnswer;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text?: string;
  reply?: ChatReply;
  questionText?: string;
  status: "sent" | "loading" | "done" | "error";
  ts: number;
}

export interface PersonFact {
  id: string;
  name: string;
  birthday: string;
  birthTime: string;
  birthTimeAccuracy: "exact" | "approximate" | "unknown";
  birthPlace: string;
  avatarColor: string;
  avatarChar?: string;
}
