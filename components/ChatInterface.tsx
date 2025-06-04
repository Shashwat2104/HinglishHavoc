"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTheme } from "next-themes";

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Hey! I'm RizaBot 👋 Ready to chat in Riza's unique style! Ask me anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: input,
          chatHistory: messages.slice(-3),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      if (!data?.response) {
        throw new Error("Invalid response format from server");
      }

      const botMessage: Message = {
        role: "bot",
        content: data.response,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        role: "bot",
        content: "Oops! Something went wrong. Please try again! 🤔",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      className="flex flex-col h-screen max-w-2xl mx-auto p-2 sm:p-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Theme Toggle Button */}
      <motion.button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="self-end mb-2 px-4 py-2 text-sm rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="flex items-center gap-2">
          {theme === "dark" ? "🌞 Light" : "🌙 Dark"} Mode
        </span>
      </motion.button>

      {/* Chat Messages Container */}
      <motion.div
        className="flex-1 overflow-y-auto p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: theme === "dark" ? "#4B5563" : "#9CA3AF",
        }}
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`mb-4 p-4 rounded-2xl transition-all duration-300 shadow-md ${
              message.role === "user"
                ? "bg-blue-500/10 dark:bg-blue-500/20 ml-auto max-w-[90%] md:max-w-[80%]"
                : "bg-gray-100/80 dark:bg-gray-700/80 mr-auto max-w-[90%] md:max-w-[80%]"
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </motion.div>
        ))}

        {/* Loading State */}
        {isLoading && (
          <motion.div
            className="mb-4 p-4 rounded-2xl bg-gray-200/80 dark:bg-gray-700/80 mr-auto max-w-[90%] md:max-w-[80%] shadow-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="h-5 w-5 border-3 border-gray-600 dark:border-gray-300 border-t-transparent rounded-full"
              />
              <span className="text-sm">Thinking...</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="mt-4 flex gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Chat with Riza..."
          className="flex-1 p-3 text-sm sm:text-base border-2 rounded-xl resize-none transition-all duration-300 focus:ring-2 disabled:opacity-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-blue-300 dark:focus:ring-blue-700"
          rows={3}
          disabled={isLoading}
          maxLength={500}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <motion.button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          whileHover={{ scale: isLoading ? 1 : 1.05, y: -2 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="h-5 w-5 border-3 border-white border-t-transparent rounded-full"
            />
          ) : (
            <span className="flex items-center gap-2">Send 📤</span>
          )}
        </motion.button>
      </motion.form>

      {/* Character count indicator */}
      <motion.div
        className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className={`${input.length > 450 ? "text-red-500" : ""}`}>
          {input.length}/500 characters
        </span>
        {input.length > 0 && (
          <span className="ml-2 text-gray-400 dark:text-gray-500">
            Ctrl+Enter to send
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
