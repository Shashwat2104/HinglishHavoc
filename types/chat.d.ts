interface Message {
  role: "user" | "bot";
  content: string;
  timestamp?: number;
}

interface ChatHistory {
  messages: Message[];
  context: "professional" | "personal";
}
