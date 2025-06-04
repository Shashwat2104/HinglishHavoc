"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "bot";
  content: string;
  context?: "professional" | "personal";
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
  const [chatContext, setChatContext] = useState<"professional" | "personal">(
    "personal"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      context: chatContext,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending request to API with:", {
        userInput: input,
        chatHistory: messages.slice(-3),
        context: chatContext,
      });

      const response = await fetch("/api/generate-persona", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug": "true",
        },
        body: JSON.stringify({
          userInput: input,
          chatHistory: messages.slice(-3),
          context: chatContext,
        }),
      });

      console.log("Received response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Details:", errorData);

        // Handle specific error cases from the enhanced route
        if (errorData.error === "Chat data configuration error") {
          throw new Error("Configuration issue: " + errorData.solution);
        }
        if (errorData.error === "Chat data processing error") {
          throw new Error("Couldn't process Riza's chat style data");
        }
        if (errorData.error === "Method not allowed. Please use POST.") {
          throw new Error("Technical issue with request method");
        }
        if (
          errorData.error ===
          "Invalid request format. Please provide valid JSON data."
        ) {
          throw new Error("Request formatting error");
        }
        if (errorData.error?.includes("userInput")) {
          throw new Error("Message validation failed");
        }
        if (errorData.error?.includes("context")) {
          throw new Error("Context validation failed");
        }

        throw new Error(
          errorData.error ||
            errorData.message ||
            errorData.details ||
            `Server responded with ${response.status}`
        );
      }

      const data = await response.json();
      console.log("API Response Data:", data);

      if (!data?.response) {
        throw new Error("Invalid response format from server");
      }

      const botMessage: Message = {
        role: "bot",
        content: data.response,
        context: chatContext,
      };
      setMessages((prev) => [...prev, botMessage]);

      // Log metadata if available for debugging
      if (data.metadata) {
        console.log("Response metadata:", data.metadata);
      }
    } catch (error) {
      console.error("Chat Error:", {
        error,
        input,
        chatContext,
        timestamp: new Date().toISOString(),
      });

      const errorMessage: Message = {
        role: "bot",
        content: getEnhancedErrorMessage(error),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced error message handler combining both approaches
  const getEnhancedErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      // Handle specific configuration and processing errors
      if (error.message.includes("Configuration issue")) {
        return `Setup issue! ${
          error.message.split(":")[1]
        }. Please contact support to fix the chat data configuration. 🛠️`;
      }
      if (error.message.includes("Couldn't process")) {
        return "Having trouble accessing my chat history... Try again later? 📚";
      }

      // Handle API-specific errors
      if (error.message.includes("Failed to generate authentic response")) {
        return "Oops! I'm having trouble channeling Riza right now. Try asking differently? 😅";
      }
      if (error.message.includes("Technical issue with request method")) {
        return "Technical hiccup! Please refresh the page and try again. 🔄";
      }
      if (error.message.includes("Request formatting error")) {
        return "Something went wrong with the message format. Please try again! 📝";
      }
      if (error.message.includes("Message validation failed")) {
        return "Please make sure your message isn't empty and try again! ✍️";
      }
      if (error.message.includes("Context validation failed")) {
        return "Context switch issue! Try toggling between Personal/Professional mode. 🔄";
      }

      // Handle network and server errors
      if (
        error.message.includes("network") ||
        error.message.includes("NetworkError")
      ) {
        return "Network issue! Check your connection and try again 🌐";
      }
      if (
        error.message.includes("500") ||
        error.message.includes("Internal server error")
      ) {
        return "Server's feeling shy today... Try again later? 🛠️";
      }
      if (error.message.includes("400")) {
        return "Something about your request needs fixing. Try rephrasing? 🤔";
      }
      if (error.message.includes("404")) {
        return "Couldn't find the chat service. Please contact support! 🔍";
      }
      if (error.message.includes("timeout")) {
        return "Request took too long... Maybe try a shorter message? ⏰";
      }

      // Generic error with Riza's style
      return `Kuch toh gadbad hai... (${error.message}) 🤷‍♀️`;
    }

    return "Something unexpected happened! Please try again. 🤨";
  };

  // Toggle between professional/personal context
  const toggleContext = () => {
    const newContext =
      chatContext === "professional" ? "personal" : "professional";
    setChatContext(newContext);

    const contextMessage: Message = {
      role: "bot",
      content:
        newContext === "professional"
          ? "Switched to professional mode! Ask about my work experience, education, or research 💼"
          : "Switched to personal chat mode. Let's talk casually! 😊",
      context: newContext,
    };
    setMessages((prev) => [...prev, contextMessage]);

    console.log("Context changed to:", newContext);
  };

  return (
    <motion.div
      className="flex flex-col h-screen max-w-2xl mx-auto p-2 sm:p-4 bg-gradient-to-b from-gray-50 to-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Enhanced Context Toggle Button */}
      <motion.button
        onClick={toggleContext}
        className={`self-end mb-2 px-3 py-1 text-xs sm:text-sm rounded-full transition-all duration-200 ${
          chatContext === "professional"
            ? "bg-blue-200 hover:bg-blue-300 text-blue-800"
            : "bg-green-200 hover:bg-green-300 text-green-800"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isLoading}
      >
        {chatContext === "professional" ? "👔 Professional" : "😊 Personal"}{" "}
        Mode
        {isLoading && " (switching...)"}
      </motion.button>

      {/* Chat Messages Container */}
      <motion.div
        className="flex-1 overflow-y-auto p-2 sm:p-4 bg-white rounded-lg shadow-lg"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`mb-3 p-3 rounded-lg transition-colors duration-200 ${
              message.role === "user"
                ? "bg-blue-100 ml-auto max-w-[90%] md:max-w-[80%]"
                : "bg-gray-100 mr-auto max-w-[90%] md:max-w-[80%]"
            } ${
              message.context === "professional"
                ? "border-l-4 border-blue-500"
                : message.role === "bot" && chatContext === "personal"
                ? "border-l-4 border-green-400"
                : ""
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
            {message.context && (
              <div
                className={`text-xs mt-1 ${
                  message.context === "professional"
                    ? "text-blue-600"
                    : "text-green-600"
                }`}
              >
                {message.context === "professional"
                  ? "👔 Professional Mode"
                  : "😊 Personal Mode"}
              </div>
            )}
          </motion.div>
        ))}

        {/* Enhanced Loading State */}
        {isLoading && (
          <motion.div
            className="mb-3 p-3 rounded-lg bg-gray-200 mr-auto max-w-[90%] md:max-w-[80%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 text-gray-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`h-4 w-4 border-2 rounded-full ${
                  chatContext === "professional"
                    ? "border-blue-500 border-t-transparent"
                    : "border-green-500 border-t-transparent"
                }`}
              />
              {chatContext === "professional"
                ? "Checking my professional notes..."
                : "Riza-style javab dhund raha hoon..."}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Enhanced Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="mt-3 sm:mt-4 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            chatContext === "professional"
              ? "Ask about my professional background, education, or research..."
              : "Riza se baat karo... (Chat with Riza in her style!)"
          }
          className={`flex-1 p-2 text-sm sm:text-base border rounded-lg resize-none transition-all duration-200 focus:ring-2 disabled:opacity-50 ${
            chatContext === "professional"
              ? "focus:ring-blue-300 border-blue-200"
              : "focus:ring-green-300 border-green-200"
          }`}
          rows={3}
          disabled={isLoading}
          maxLength={500} // Reasonable limit
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              handleSubmit(e);
            }
          }}
        />
        <motion.button
          type="submit"
          disabled={isLoading || !input.trim()}
          className={`px-4 py-2 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
            chatContext === "professional"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
            />
          ) : (
            <>{chatContext === "professional" ? "Send" : "Bhijvao"} 📤</>
          )}
        </motion.button>
      </motion.form>

      {/* Character count indicator */}
      <div className="text-xs text-gray-500 mt-1 text-right">
        {input.length}/500 characters
        {input.length > 0 && (
          <span className="ml-2 text-gray-400">
            {chatContext === "professional" ? "Ctrl+Enter" : "Ctrl+Enter"} to
            send
          </span>
        )}
      </div>
    </motion.div>
  );
}
